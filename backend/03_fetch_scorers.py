"""
03_fetch_scorers.py

Loads football-data.org's top 100 scorers per league-season into
player_season_stats (legacy: the app uses 07's Understat stats).
Uses INSERT OR IGNORE, so existing rows don't update on a re-run.
"""

import time
import sqlite3

from common.db import get_season_id
from common.football_data import (
    SECONDS_BETWEEN_REQUESTS,
    ensure_club,
    fetch,
    load_api_key,
)


DB_FILE = "football.db"

# Same as 02's, copied so each script runs on its own
SEASONS = [2023, 2024, 2025]

LEAGUES = [
    {"id": 2021, "name": "Premier League", "code": "PL"},
    {"id": 2014, "name": "La Liga",         "code": "PD"},
    {"id": 2019, "name": "Serie A",         "code": "SA"},
    {"id": 2002, "name": "Bundesliga",      "code": "BL1"},
    {"id": 2015, "name": "Ligue 1",         "code": "FL1"},
]

# The API defaults to 10
SCORERS_LIMIT = 100


def fetch_scorers(api_key, league_code, start_year):
    data = fetch(
        api_key,
        f"/competitions/{league_code}/scorers",
        {"season": start_year, "limit": SCORERS_LIMIT},
    )
    scorers = data["scorers"]

    print(f"  Fetched {len(scorers)} scorers for {league_code}.")
    return scorers


def insert_scorers(cursor, scorers, season_id):
    inserted = 0
    for entry in scorers:
        player = entry["player"]
        team = entry["team"]

        ensure_club(cursor, team)

        # The API sends null for no assists
        assists = entry.get("assists")
        if assists is None:
            assists = 0

        cursor.execute(
            """INSERT OR IGNORE INTO player_season_stats
               (season_id, club_id, player_name, goals, assists)
               VALUES (?, ?, ?, ?, ?)""",
            (
                season_id,
                team["id"],
                player["name"],
                entry.get("goals", 0),
                assists,
            ),
        )
        inserted += 1

    print(f"  Inserted/verified {inserted} scorer rows.")


def main():
    api_key = load_api_key()

    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    jobs = [(year, league) for year in SEASONS for league in LEAGUES]

    for i, (year, league) in enumerate(jobs, start=1):
        print(f"\n[{i}/{len(jobs)}] {league['name']} ({league['code']}) {year}")

        season_id = get_season_id(cursor, league["id"], year)
        scorers = fetch_scorers(api_key, league["code"], year)
        insert_scorers(cursor, scorers, season_id)

        connection.commit()

        print(f"  season_id = {season_id}")

        if i < len(jobs):
            time.sleep(SECONDS_BETWEEN_REQUESTS)

    connection.close()

    print(
        f"\nDone. Fetched and inserted scorers for {len(LEAGUES)} leagues "
        f"x {len(SEASONS)} seasons."
    )


if __name__ == "__main__":
    main()
