"""
07_fetch_understat.py

Loads every player's season stats from understat.com into
understat_player_stats and understat_player_clubs, plus each transferred
player's last match date per club. Understat has no official API, so this
uses the JSON its own pages load. Safe to re-run: each league-season's rows
are replaced. Run 02 and 05 first.
"""

import html
import time
import sqlite3

from common.db import get_season_clubs, get_season_id
from common.understat import (
    SECONDS_BETWEEN_REQUESTS,
    fetch_league_data,
    fetch_player_matches,
    match_club,
)


DB_FILE = "football.db"

# Every season in the database
SEASONS = list(range(2014, 2026))

# Copied so each script runs on its own. "understat" is the URL name
LEAGUES = [
    {"id": 2021, "name": "Premier League", "code": "PL",  "understat": "EPL"},
    {"id": 2014, "name": "La Liga",         "code": "PD",  "understat": "La_liga"},
    {"id": 2019, "name": "Serie A",         "code": "SA",  "understat": "Serie_A"},
    {"id": 2002, "name": "Bundesliga",      "code": "BL1", "understat": "Bundesliga"},
    {"id": 2015, "name": "Ligue 1",         "code": "FL1", "understat": "Ligue_1"},
]

# clubs.display_name is Understat's team name, except these.
# Understat name -> display name
DISPLAY_NAME_FIXES = {
    # Accents
    "Atletico Madrid": "Atlético Madrid",
    "Malaga": "Málaga",
    "Cadiz": "Cádiz",
    "Leganes": "Leganés",
    "Almeria": "Almería",
    "Cordoba": "Córdoba",
    "Sporting Gijon": "Sporting Gijón",
    "Deportivo La Coruna": "Deportivo A Coruña",
    "Saint-Etienne": "Saint-Étienne",
    "Nimes": "Nîmes",
    "Evian Thonon Gaillard": "Évian Thonon Gaillard",
    "Nuernberg": "1. FC Nürnberg",
    "Fortuna Duesseldorf": "Fortuna Düsseldorf",
    "Greuther Fuerth": "Greuther Fürth",
    "Borussia M.Gladbach": "Borussia Mönchengladbach",
    # Odd names
    "FC Cologne": "1. FC Köln",
    "RasenBallsport Leipzig": "RB Leipzig",
    "Paris Saint Germain": "Paris Saint-Germain",
    "SPAL 2013": "SPAL",
    "Parma Calcio 1913": "Parma",
    # FotMob's names
    "Bayern Munich": "Bayern München",
    "Hertha Berlin": "Hertha BSC",
    "Ajaccio": "AC Ajaccio",
    "Alaves": "Deportivo Alavés",
    "Bournemouth": "AFC Bournemouth",
    "Chievo": "Chievo Verona",
    "Verona": "Hellas Verona",
    "AC Milan": "Milan",
    # Full English names
    "West Ham": "West Ham United",
    "Tottenham": "Tottenham Hotspur",
    "Leicester": "Leicester City",
    "Leeds": "Leeds United",
    "Brighton": "Brighton & Hove Albion",
    "Cardiff": "Cardiff City",
    "Hull": "Hull City",
    "Stoke": "Stoke City",
    "Swansea": "Swansea City",
    "Norwich": "Norwich City",
    "Ipswich": "Ipswich Town",
    "Luton": "Luton Town",
    "Huddersfield": "Huddersfield Town",
}


def find_last_match_dates(matches, start_year, team_names):
    # Understat team name -> player's last match date for it this season
    dates = {}
    for match in matches:
        if match["season"] != str(start_year):
            continue

        # Skips a match between two of his clubs (side unknown)
        teams = {match["h_team"], match["a_team"]} & team_names
        if len(teams) != 1:
            continue

        team = teams.pop()
        dates[team] = max(dates.get(team, ""), match["date"][:10])

    return dates


def get_saved_match_dates(cursor, season_id):
    # (understat_player_id, club_id) -> date saved by an earlier run
    cursor.execute(
        """SELECT ps.understat_player_id, pc.club_id, pc.last_match_date
           FROM understat_player_clubs pc
           JOIN understat_player_stats ps ON ps.id = pc.player_stats_id
           WHERE ps.season_id = ? AND pc.last_match_date IS NOT NULL""",
        (season_id,),
    )
    return {(row[0], row[1]): row[2] for row in cursor.fetchall()}


def get_last_match_dates(cursor, players, club_lookup, season_id, start_year, match_cache):
    # (understat_player_id, club_id) -> last match date, transfers only
    saved = get_saved_match_dates(cursor, season_id)
    dates = {}

    for player in players:
        team_names = set(player["team_title"].split(","))
        if len(team_names) < 2:
            continue

        player_id = int(player["id"])
        keys = {team: (player_id, club_lookup[team]) for team in team_names}

        if all(key in saved for key in keys.values()):
            for key in keys.values():
                dates[key] = saved[key]
            continue

        if player_id not in match_cache:
            time.sleep(SECONDS_BETWEEN_REQUESTS)
            match_cache[player_id] = fetch_player_matches(player_id)

        team_dates = find_last_match_dates(match_cache[player_id], start_year, team_names)
        for team, key in keys.items():
            if team in team_dates:
                dates[key] = team_dates[team]

    return dates


def build_club_lookup(data, clubs):
    # Understat team name -> club_id for every team in the response
    lookup = {}
    for team in data["teams"].values():
        lookup[team["title"]] = match_club(team["title"], clubs)
    return lookup


def update_display_names(cursor, club_lookup):
    # Later seasons run last, so a club keeps its latest Understat name
    for team_name, club_id in club_lookup.items():
        cursor.execute(
            "UPDATE clubs SET display_name = ? WHERE club_id = ?",
            (DISPLAY_NAME_FIXES.get(team_name, team_name), club_id),
        )


def replace_players(cursor, players, club_lookup, match_dates, season_id):
    # Clubs first, because of the foreign key
    cursor.execute(
        """DELETE FROM understat_player_clubs WHERE player_stats_id IN
           (SELECT id FROM understat_player_stats WHERE season_id = ?)""",
        (season_id,),
    )
    cursor.execute(
        "DELETE FROM understat_player_stats WHERE season_id = ?",
        (season_id,),
    )

    for player in players:
        cursor.execute(
            """INSERT INTO understat_player_stats
               (season_id, understat_player_id, player_name, position,
                games, minutes, goals, non_penalty_goals, assists, shots,
                key_passes, yellow_cards, red_cards,
                xg, npxg, xa, xg_chain, xg_buildup)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                season_id,
                int(player["id"]),
                html.unescape(player["player_name"]),
                player["position"],
                int(player["games"]),
                int(player["time"]),
                int(player["goals"]),
                int(player["npg"]),
                int(player["assists"]),
                int(player["shots"]),
                int(player["key_passes"]),
                int(player["yellow_cards"]),
                int(player["red_cards"]),
                float(player["xG"]),
                float(player["npxG"]),
                float(player["xA"]),
                float(player["xGChain"]),
                float(player["xGBuildup"]),
            ),
        )
        player_stats_id = cursor.lastrowid

        # A mid-season transfer comes through as "Chelsea,Everton"
        for team_name in player["team_title"].split(","):
            club_id = club_lookup[team_name]
            cursor.execute(
                """INSERT OR IGNORE INTO understat_player_clubs
                   (player_stats_id, club_id, last_match_date) VALUES (?, ?, ?)""",
                (player_stats_id, club_id, match_dates.get((int(player["id"]), club_id))),
            )

    print(f"  Inserted {len(players)} player rows.")


def main():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    jobs = [(year, league) for year in SEASONS for league in LEAGUES]
    # Player id -> match log, so each player is fetched once per run
    match_cache = {}

    for i, (year, league) in enumerate(jobs, start=1):
        print(f"\n[{i}/{len(jobs)}] {league['name']} ({league['code']}) {year}")

        season_id = get_season_id(cursor, league["id"], year)
        data = fetch_league_data(league["understat"], year)
        print(
            f"  Fetched {len(data['players'])} players and "
            f"{len(data['teams'])} teams."
        )

        # Match every team first, so a missing name wipes nothing
        club_lookup = build_club_lookup(data, get_season_clubs(cursor, season_id))
        match_dates = get_last_match_dates(
            cursor, data["players"], club_lookup, season_id, year, match_cache
        )
        replace_players(cursor, data["players"], club_lookup, match_dates, season_id)
        update_display_names(cursor, club_lookup)

        connection.commit()

        print(f"  season_id = {season_id}")

        if i < len(jobs):
            time.sleep(SECONDS_BETWEEN_REQUESTS)

    connection.close()

    print(
        f"\nDone. Fetched and inserted Understat player stats for "
        f"{len(LEAGUES)} leagues x {len(SEASONS)} seasons."
    )


if __name__ == "__main__":
    main()
