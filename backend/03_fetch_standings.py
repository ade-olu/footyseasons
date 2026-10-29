"""
03_fetch_standings.py

Loads football-data.org's 2023/24+ tables (total, home and away) into
club_season_stats, and each finished season's champion.
INSERT OR REPLACE wipes 05's columns, so re-run 05 after this.
"""

import time
import sqlite3
from datetime import date

from common.db import get_season_id
from common.football_data import (
    SECONDS_BETWEEN_REQUESTS,
    ensure_club,
    fetch,
    load_api_key,
)
from common.leagues import API_SEASONS, LEAGUES


DB_FILE = "football.db"


def build_club_stats(standings):
    # Merges the three tables into one entry per club_id
    stats = {}

    for block in standings:
        table_type = block.get("type")

        # Skip anything else (e.g. group stages)
        if table_type not in ("TOTAL", "HOME", "AWAY"):
            continue

        for row in block["table"]:
            team = row["team"]
            club_id = team["id"]

            if club_id not in stats:
                stats[club_id] = {"team": team}

            entry = stats[club_id]

            if table_type == "TOTAL":
                entry["position"] = row["position"]
                entry["games_played"] = row["playedGames"]
                entry["wins"] = row["won"]
                entry["draws"] = row["draw"]
                entry["losses"] = row["lost"]
                entry["points"] = row["points"]
                entry["goals_for"] = row["goalsFor"]
                entry["goals_against"] = row["goalsAgainst"]
            elif table_type == "HOME":
                entry["home_points"] = row["points"]
                entry["home_wins"] = row["won"]
                entry["home_draws"] = row["draw"]
                entry["home_losses"] = row["lost"]
                entry["home_goals_for"] = row["goalsFor"]
                entry["home_goals_against"] = row["goalsAgainst"]
            elif table_type == "AWAY":
                entry["away_points"] = row["points"]
                entry["away_wins"] = row["won"]
                entry["away_draws"] = row["draw"]
                entry["away_losses"] = row["lost"]
                entry["away_goals_for"] = row["goalsFor"]
                entry["away_goals_against"] = row["goalsAgainst"]

    return stats


def find_champion_club_id(standings, season):
    # 1st in the TOTAL table, or None until the end date has passed
    # (not playedGames, which leaves out AWARDED matches)
    if date.fromisoformat(season["endDate"]) >= date.today():
        return None

    for block in standings:
        if block.get("type") == "TOTAL":
            for row in block["table"]:
                if row["position"] == 1:
                    return row["team"]["id"]
    return None


def save_club_stats(cursor, stats, season_id):
    saved = 0
    for club_id, entry in stats.items():
        ensure_club(cursor, entry["team"])

        cursor.execute(
            """INSERT OR REPLACE INTO club_season_stats
               (season_id, club_id, position, games_played, wins, draws, losses,
                points, goals_for, goals_against,
                home_points, home_wins, home_draws, home_losses,
                home_goals_for, home_goals_against,
                away_points, away_wins, away_draws, away_losses,
                away_goals_for, away_goals_against)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                season_id,
                club_id,
                entry.get("position"),
                entry.get("games_played"),
                entry.get("wins"),
                entry.get("draws"),
                entry.get("losses"),
                entry.get("points"),
                entry.get("goals_for"),
                entry.get("goals_against"),
                entry.get("home_points"),
                entry.get("home_wins"),
                entry.get("home_draws"),
                entry.get("home_losses"),
                entry.get("home_goals_for"),
                entry.get("home_goals_against"),
                entry.get("away_points"),
                entry.get("away_wins"),
                entry.get("away_draws"),
                entry.get("away_losses"),
                entry.get("away_goals_for"),
                entry.get("away_goals_against"),
            ),
        )
        saved += 1

    print(f"  Saved standings for {saved} clubs.")


def save_champion(cursor, season_id, champion_club_id):
    if champion_club_id is None:
        print("  No champion yet (season likely still in progress).")
        return

    cursor.execute(
        "UPDATE seasons SET champion_club_id = ? WHERE season_id = ?",
        (champion_club_id, season_id),
    )
    print(f"  champion_club_id set to {champion_club_id}.")


def main():
    api_key = load_api_key()

    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    jobs = [(year, league) for year in API_SEASONS for league in LEAGUES]

    for i, (year, league) in enumerate(jobs, start=1):
        print(f"\n[{i}/{len(jobs)}] {league['name']} ({league['code']}) {year}")

        season_id = get_season_id(cursor, league["id"], year)
        # "standings" has TOTAL, HOME and AWAY tables; "season" has the dates
        data = fetch(
            api_key,
            f"/competitions/{league['code']}/standings",
            {"season": year},
        )
        standings = data["standings"]

        club_stats = build_club_stats(standings)
        save_club_stats(cursor, club_stats, season_id)

        champion_club_id = find_champion_club_id(standings, data["season"])
        save_champion(cursor, season_id, champion_club_id)

        connection.commit()

        print(f"  season_id = {season_id}")

        if i < len(jobs):
            time.sleep(SECONDS_BETWEEN_REQUESTS)

    connection.close()

    print(
        f"\nDone. Fetched and saved standings for {len(LEAGUES)} leagues "
        f"x {len(API_SEASONS)} seasons."
    )


if __name__ == "__main__":
    main()
