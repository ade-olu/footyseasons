"""
09_load_awards.py

Loads the season awards from the hand-written awards.csv into
season_awards, and counts goalkeepers' and young players' starts and
clean sheets from their Understat match logs (saved counts are reused).

Safe to re-run: the table is rebuilt from the CSV each time. Run
07_fetch_understat.py first.
"""

import csv
import time
import sqlite3
from datetime import date

from common.understat import SECONDS_BETWEEN_REQUESTS, fetch_player_matches


DB_FILE = "football.db"
AWARDS_FILE = "awards.csv"

AWARDS = ["player", "manager", "goalkeeper", "young_player"]

# Awards whose cards show starts or clean sheets from the match log
# (also fetched for any goalkeeper who wins another award)
MATCH_LOG_AWARDS = {"goalkeeper", "young_player"}


def get_season(cursor, league_code, label):
    # (season_id, start_year) for e.g. ("PL", "2025/26")
    cursor.execute(
        """SELECT s.season_id, s.start_year FROM seasons s
           JOIN leagues l ON l.league_id = s.league_id
           WHERE l.code = ? AND s.label = ?""",
        (league_code, label),
    )
    row = cursor.fetchone()

    if row is None:
        raise Exception(f"No {league_code} {label} season in the database.")

    return row


def find_club(cursor, season_id, club_name):
    # club_id of the club with this display name that played this season
    cursor.execute(
        """SELECT c.club_id FROM club_season_stats cs
           JOIN clubs c ON c.club_id = cs.club_id
           WHERE cs.season_id = ? AND COALESCE(c.display_name, c.name) = ?""",
        (season_id, club_name),
    )
    rows = cursor.fetchall()

    if len(rows) != 1:
        raise Exception(f'No single club "{club_name}" in season_id {season_id}.')

    return rows[0][0]


def check_player(cursor, season_id, understat_player_id, club_id, winner):
    # Makes sure the winner played for that club that season; returns his Understat position
    cursor.execute(
        """SELECT ps.position FROM understat_player_stats ps
           JOIN understat_player_clubs pc ON pc.player_stats_id = ps.id
           WHERE ps.season_id = ? AND ps.understat_player_id = ?
             AND pc.club_id = ?""",
        (season_id, understat_player_id, club_id),
    )

    row = cursor.fetchone()
    if row is None:
        raise Exception(
            f"{winner} (Understat id {understat_player_id}) didn't play for "
            f"club_id {club_id} in season_id {season_id}."
        )

    return row[0]


def get_player_club_ids(cursor, season_id, understat_player_id):
    # Every club the player played for that season
    cursor.execute(
        """SELECT pc.club_id FROM understat_player_clubs pc
           JOIN understat_player_stats ps ON ps.id = pc.player_stats_id
           WHERE ps.season_id = ? AND ps.understat_player_id = ?""",
        (season_id, understat_player_id),
    )
    return {row[0] for row in cursor.fetchall()}


def get_club_matches(cursor, season_id, club_ids):
    # (date, home_club_id, away_club_id, home_goals, away_goals) of played matches
    placeholders = ", ".join("?" for _ in club_ids)
    cursor.execute(
        f"""SELECT substr(utc_date, 1, 10), home_club_id, away_club_id,
                   home_goals, away_goals
            FROM matches
            WHERE season_id = ? AND status = 'FINISHED'
              AND (home_club_id IN ({placeholders})
                   OR away_club_id IN ({placeholders}))""",
        (season_id, *club_ids, *club_ids),
    )
    return cursor.fetchall()


def find_match(club_matches, log):
    # The club's match with the log's score, on its date (a day either side, for time zones)
    log_day = date.fromisoformat(log["date"][:10])
    score = (int(log["h_goals"]), int(log["a_goals"]))
    found = [
        match for match in club_matches
        if abs((date.fromisoformat(match[0]) - log_day).days) <= 1
        and (match[3], match[4]) == score
    ]
    return found[0] if len(found) == 1 else None


def count_starts_and_clean_sheets(matches, cursor, season_id, start_year, understat_player_id):
    # Starts and clean sheets in this league-season, from the player's match log
    club_ids = get_player_club_ids(cursor, season_id, understat_player_id)
    club_matches = get_club_matches(cursor, season_id, club_ids)
    starts = 0
    clean_sheets = 0

    for log in matches:
        if log["season"] != str(start_year) or log["position"] == "Sub":
            continue

        # Skips matches from another league (a transfer between leagues)
        match = find_match(club_matches, log)
        if match is None:
            continue

        _, home_club_id, _, home_goals, away_goals = match
        conceded = away_goals if home_club_id in club_ids else home_goals
        starts += 1
        if conceded == 0:
            clean_sheets += 1

    if starts == 0:
        raise Exception(
            f"No starts found for Understat id {understat_player_id} in "
            f"season_id {season_id}."
        )

    return starts, clean_sheets


def get_saved_counts(cursor):
    # (season_id, award, understat_player_id) -> (starts, clean_sheets) from an earlier run
    cursor.execute(
        """SELECT season_id, award, understat_player_id, starts, clean_sheets
           FROM season_awards WHERE starts IS NOT NULL"""
    )
    return {(row[0], row[1], row[2]): (row[3], row[4]) for row in cursor.fetchall()}


def read_awards(cursor):
    # Checks every CSV row against the database before anything is saved
    with open(AWARDS_FILE, encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))

    awards = []
    for row in rows:
        if row["award"] not in AWARDS:
            raise Exception(f'Unknown award "{row["award"]}" for {row["winner"]}.')

        season_id, start_year = get_season(cursor, row["league"], row["season"])
        club_id = find_club(cursor, season_id, row["club"])
        player_id = int(row["understat_player_id"]) if row["understat_player_id"] else None
        position = None

        if row["award"] == "manager":
            if player_id is not None:
                raise Exception(f"Manager {row['winner']} has an Understat id.")
        elif player_id is None:
            raise Exception(f"{row['winner']} has no Understat id.")
        else:
            position = check_player(cursor, season_id, player_id, club_id, row["winner"])

        awards.append({
            **row,
            "season_id": season_id,
            "start_year": start_year,
            "club_id": club_id,
            "understat_player_id": player_id,
            "is_goalkeeper": position is not None and position.startswith("GK"),
        })

    return awards


def main():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    awards = read_awards(cursor)
    print(f"Read {len(awards)} award winners from {AWARDS_FILE}.")

    saved = get_saved_counts(cursor)
    # Player id -> match log, so each player is fetched once per run
    match_cache = {}

    for award in awards:
        award["starts"] = None
        award["clean_sheets"] = None
        if award["award"] not in MATCH_LOG_AWARDS and not award["is_goalkeeper"]:
            continue

        key = (award["season_id"], award["award"], award["understat_player_id"])
        if key in saved:
            award["starts"], award["clean_sheets"] = saved[key]
            continue

        player_id = award["understat_player_id"]
        if player_id not in match_cache:
            print(f"  Fetching match log for {award['winner']}")
            if match_cache:
                time.sleep(SECONDS_BETWEEN_REQUESTS)
            match_cache[player_id] = fetch_player_matches(player_id)

        award["starts"], award["clean_sheets"] = count_starts_and_clean_sheets(
            match_cache[player_id], cursor, award["season_id"],
            award["start_year"], player_id,
        )

    cursor.execute("DELETE FROM season_awards")
    for award in awards:
        cursor.execute(
            """INSERT INTO season_awards
               (season_id, award, winner_name, understat_player_id, club_id,
                awarding_body, source_url, starts, clean_sheets)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                award["season_id"],
                award["award"],
                award["winner"],
                award["understat_player_id"],
                award["club_id"],
                award["awarding_body"],
                award["source"] or None,
                award["starts"],
                award["clean_sheets"],
            ),
        )

    connection.commit()
    connection.close()

    print(
        f"\nDone. Inserted {len(awards)} award winners "
        f"({len(match_cache)} match logs fetched)."
    )


if __name__ == "__main__":
    main()
