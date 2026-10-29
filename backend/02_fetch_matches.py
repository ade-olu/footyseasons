"""
02_fetch_matches.py

Loads the 2023/24+ leagues, seasons, clubs and matches from football-data.org.
Safe to re-run: existing matches get their date, status and score updated.
"""

import time
import sqlite3

from common.db import ensure_season, season_label
from common.football_data import SECONDS_BETWEEN_REQUESTS, fetch, load_api_key
from common.leagues import API_SEASONS, LEAGUES


DB_FILE = "football.db"

# Three-letter codes the API gets wrong. club_id -> code
TLA_FIXES = {
    576: "STR",  # Strasbourg, "RC " in the API
}


def fetch_matches(api_key, league_code, start_year):
    data = fetch(
        api_key,
        f"/competitions/{league_code}/matches",
        {"season": start_year},
    )

    matches = data["matches"]
    expected_count = data["resultSet"]["count"]

    # Catch a partial response
    if len(matches) != expected_count:
        raise Exception(
            f"{league_code}: expected {expected_count} matches but got "
            f"{len(matches)}. Response may be incomplete."
        )

    print(f"  Fetched {len(matches)} matches for {league_code}.")
    return matches


def ensure_league(cursor, league_id, league_name, league_code):
    cursor.execute(
        "INSERT OR IGNORE INTO leagues (league_id, name, code) VALUES (?, ?, ?)",
        (league_id, league_name, league_code),
    )


def ensure_clubs(cursor, matches):
    # Keyed by id to de-dupe
    clubs = {}
    for match in matches:
        home = match["homeTeam"]
        away = match["awayTeam"]
        clubs[home["id"]] = home
        clubs[away["id"]] = away

    for club_id, club in clubs.items():
        cursor.execute(
            """INSERT OR IGNORE INTO clubs (club_id, name, short_name, tla, crest_url)
               VALUES (?, ?, ?, ?, ?)""",
            (
                club_id,
                club.get("name"),
                club.get("shortName"),
                TLA_FIXES.get(club_id, club.get("tla")),
                club.get("crest"),
            ),
        )

    print(f"  Inserted/verified {len(clubs)} unique clubs.")


def insert_matches(cursor, matches, season_id):
    inserted = 0
    for match in matches:
        score = match["score"]["fullTime"]

        # Update existing matches too, since fixtures get played and rescheduled
        cursor.execute(
            """INSERT INTO matches
               (match_id, season_id, matchday, utc_date, status,
                home_club_id, away_club_id, home_goals, away_goals, attendance)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT (match_id) DO UPDATE SET
                 matchday = excluded.matchday,
                 utc_date = excluded.utc_date,
                 status = excluded.status,
                 home_goals = excluded.home_goals,
                 away_goals = excluded.away_goals""",
            (
                match["id"],
                season_id,
                match["matchday"],
                match["utcDate"],
                match["status"],
                match["homeTeam"]["id"],
                match["awayTeam"]["id"],
                score.get("home"),
                score.get("away"),
                None,  # Attendance isn't on the free tier
            ),
        )
        inserted += 1

    print(f"  Inserted/updated {inserted} matches.")


def main():
    api_key = load_api_key()

    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    # Seasons in the outer loop so season_ids follow the year
    jobs = [(year, league) for year in API_SEASONS for league in LEAGUES]

    for i, (year, league) in enumerate(jobs, start=1):
        print(
            f"\n[{i}/{len(jobs)}] {league['name']} ({league['code']}) "
            f"{season_label(year)}"
        )

        matches = fetch_matches(api_key, league["code"], year)

        ensure_league(cursor, league["id"], league["name"], league["code"])
        season_id = ensure_season(cursor, league["id"], year)
        ensure_clubs(cursor, matches)
        insert_matches(cursor, matches, season_id)

        # Commit per league so a failure keeps earlier progress
        connection.commit()

        print(f"  season_id = {season_id}")

        if i < len(jobs):
            time.sleep(SECONDS_BETWEEN_REQUESTS)

    connection.close()

    print(
        f"\nDone. Fetched and inserted {len(LEAGUES)} leagues "
        f"x {len(API_SEASONS)} seasons."
    )


if __name__ == "__main__":
    main()
