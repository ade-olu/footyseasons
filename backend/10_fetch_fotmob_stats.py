"""
10_fetch_fotmob_stats.py

Loads defending and goalkeeping season totals from FotMob's stat lists into
fotmob_player_stats, linked to Understat players through
player_profiles.fotmob_id. FotMob has no player stats before 2016/17.

Safe to re-run: each league-season's rows are replaced. I cache downloads in
cache/fotmob/stats/ and always refetch the latest season. Run 09 first.
"""

import os
import sqlite3
import time

from common.cache import read_json, write_json
from common.db import DB_FILE, get_season_id
from common.fotmob import SECONDS_BETWEEN_REQUESTS, fetch, fetch_league_season
from common.leagues import FOTMOB_FIRST_SEASON, LATEST_SEASON, LEAGUES


CACHE_DIR = os.path.join("cache", "fotmob", "stats")

# FotMob stat list -> (column, field). Per-90 lists keep the season total in
# SubStatValue; the others in StatValue
STATS = {
    "defensive_contributions": ("defensive_actions", "SubStatValue"),
    "total_tackle": ("tackles", "SubStatValue"),
    "interception": ("interceptions", "SubStatValue"),
    "effective_clearance": ("clearances", "SubStatValue"),
    "outfielder_block": ("blocks", "SubStatValue"),
    "ball_recovery": ("recoveries", "SubStatValue"),
    "clean_sheet": ("clean_sheets", "StatValue"),
    "saves": ("saves", "SubStatValue"),
    "goals_conceded": ("goals_conceded", "SubStatValue"),
    "_goals_prevented": ("goals_prevented", "StatValue"),
    "_save_percentage": ("save_percentage", "StatValue"),
}
COLUMNS = [column for column, _ in STATS.values()]
# Kept as decimals; the rest are whole numbers
REAL_COLUMNS = {"goals_prevented", "save_percentage"}


def fotmob_get(fetcher, *args):
    time.sleep(SECONDS_BETWEEN_REQUESTS)
    return fetcher(*args)


def load_stat_lists(league, year):
    # Stat name -> FotMob's player list, for the stats that season has
    folder = os.path.join(CACHE_DIR, f"{league['code']}-{year}")
    index_path = os.path.join(folder, "index.json")
    refetch = year == LATEST_SEASON or not os.path.exists(index_path)

    if refetch:
        page = fotmob_get(fetch_league_season, league, year)
        urls = {
            os.path.basename(stat["fetchAllUrl"]).removesuffix(".json"): stat["fetchAllUrl"]
            for stat in page["stats"]["players"]
        }
        write_json(index_path, {name: urls[name] for name in STATS if name in urls})

    lists = {}
    for name in read_json(index_path):
        path = os.path.join(folder, f"{name}.json")
        if refetch or not os.path.exists(path):
            url = read_json(index_path)[name]
            # "ParticiantId" is FotMob's spelling
            write_json(path, fotmob_get(fetch, url)["TopLists"][0]["StatList"])
        lists[name] = read_json(path)
    return lists


def get_understat_ids(cursor, season_id):
    # FotMob id -> Understat id, for the players in this league-season
    cursor.execute(
        """SELECT pp.fotmob_id, ps.understat_player_id
           FROM understat_player_stats ps
           JOIN player_profiles pp
             ON pp.understat_player_id = ps.understat_player_id
           WHERE ps.season_id = ? AND pp.fotmob_id IS NOT NULL""",
        (season_id,),
    )
    return dict(cursor.fetchall())


def build_rows(lists):
    # FotMob id -> {"name", "minutes", column: value}
    players = {}
    for name, entries in lists.items():
        column, field = STATS[name]
        for entry in entries:
            player = players.setdefault(
                entry["ParticiantId"],
                {"name": entry["ParticipantName"], "minutes": 0},
            )
            player["minutes"] = max(player["minutes"], entry["MinutesPlayed"] or 0)
            value = entry.get(field)
            if value is not None:
                player[column] = value if column in REAL_COLUMNS else round(value)
    return players


def replace_season(cursor, season_id, players, understat_ids):
    cursor.execute("DELETE FROM fotmob_player_stats WHERE season_id = ?", (season_id,))
    unmatched = []
    for fotmob_id, player in players.items():
        understat_id = understat_ids.get(fotmob_id)
        if understat_id is None:
            unmatched.append(player)
            continue
        placeholders = ", ".join("?" for _ in COLUMNS)
        cursor.execute(
            f"""INSERT INTO fotmob_player_stats
                (season_id, understat_player_id, fotmob_id, minutes,
                 {", ".join(COLUMNS)})
                VALUES (?, ?, ?, ?, {placeholders})""",
            (
                season_id,
                understat_id,
                fotmob_id,
                player["minutes"],
                *(player.get(column) for column in COLUMNS),
            ),
        )
    return unmatched


def main():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    seasons = range(FOTMOB_FIRST_SEASON, LATEST_SEASON + 1)
    jobs = [(year, league) for year in seasons for league in LEAGUES]
    missing_stats = []
    all_unmatched = []

    for i, (year, league) in enumerate(jobs, start=1):
        print(f"[{i}/{len(jobs)}] {league['name']} ({league['code']}) {year}")
        season_id = get_season_id(cursor, league["id"], year)
        lists = load_stat_lists(league, year)
        players = build_rows(lists)
        unmatched = replace_season(
            cursor, season_id, players, get_understat_ids(cursor, season_id)
        )
        connection.commit()

        print(f"  {len(players) - len(unmatched)} players, {len(unmatched)} unmatched")
        missing = [name for name in STATS if name not in lists]
        if missing:
            missing_stats.append(f"{league['code']} {year}: {', '.join(missing)}")
        all_unmatched += [(league["code"], year, p) for p in unmatched]

    # Last script in the pipeline: reclaim the space left by the re-inserts
    connection.execute("VACUUM")
    connection.close()

    print(f"\nDone. {len(jobs)} league-seasons.")
    if missing_stats:
        print("Stats FotMob doesn't have:")
        for line in missing_stats:
            print(f"  {line}")
    # Players with the most minutes first: add them to FOTMOB_IDS
    all_unmatched.sort(key=lambda item: -item[2]["minutes"])
    print(f"{len(all_unmatched)} FotMob player-seasons without an Understat match:")
    for code, year, player in all_unmatched[:20]:
        print(f"  {code} {year} {player['name']} ({player['minutes']} min)")


if __name__ == "__main__":
    main()
