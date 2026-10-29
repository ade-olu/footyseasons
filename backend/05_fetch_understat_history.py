"""
05_fetch_understat_history.py

Loads 2014/15-2022/23 from understat.com: seasons, missing clubs, matches,
and tables I calculate myself (they match Wikipedia's for all 45 seasons).
Pre-2023 clubs and all matches here get negative ids (-Understat id).
INSERT OR REPLACE wipes 06's columns, so re-run 06 after this.
"""

import time
import sqlite3
from collections import defaultdict

from common.db import ensure_season, find_season_id, get_season_clubs
from common.understat import (
    SECONDS_BETWEEN_REQUESTS,
    fetch_league_data,
    match_club,
)


DB_FILE = "football.db"

# Understat starts in 2014; 2023+ comes from 02-04
SEASONS = list(range(2014, 2023))

# Only used to learn the Understat ids of clubs already in the database
RECENT_SEASONS = [2023, 2024, 2025]

# Copied so each script runs on its own
LEAGUES = [
    {"id": 2021, "name": "Premier League", "code": "PL",  "understat": "EPL"},
    {"id": 2014, "name": "La Liga",         "code": "PD",  "understat": "La_liga"},
    {"id": 2019, "name": "Serie A",         "code": "SA",  "understat": "Serie_A"},
    {"id": 2002, "name": "Bundesliga",      "code": "BL1", "understat": "Bundesliga"},
    {"id": 2015, "name": "Ligue 1",         "code": "FL1", "understat": "Ligue_1"},
]

# Older Understat teams that are the same club. Understat team id -> clubs.name
# (pre-2015 Parma, refounded after going bankrupt)
SAME_CLUB = {
    204: "Parma Calcio 1913",
}

# Clubs that only played before 2023, saved as club_id -(Understat id).
# Understat team id -> (name, short name, TLA)
HISTORIC_CLUBS = {
    # Premier League
    227: ("Cardiff City FC", "Cardiff", "CAR"),
    219: ("Huddersfield Town AFC", "Huddersfield", "HUD"),
    91: ("Hull City AFC", "Hull", "HUL"),
    93: ("Middlesbrough FC", "Middlesbrough", "MID"),
    79: ("Norwich City FC", "Norwich", "NOR"),
    202: ("Queens Park Rangers FC", "QPR", "QPR"),
    85: ("Stoke City FC", "Stoke", "STK"),
    84: ("Swansea City AFC", "Swansea", "SWA"),
    90: ("Watford FC", "Watford", "WAT"),
    76: ("West Bromwich Albion FC", "West Brom", "WBA"),
    # La Liga
    206: ("Córdoba CF", "Córdoba", "COR"),
    139: ("RC Deportivo La Coruña", "Deportivo", "DEP"),
    156: ("SD Eibar", "Eibar", "EIB"),
    137: ("Málaga CF", "Málaga", "MAL"),
    232: ("SD Huesca", "Huesca", "HUE"),
    149: ("Real Sporting de Gijón", "Sporting Gijón", "SPO"),
    # Serie A
    222: ("Benevento Calcio", "Benevento", "BEN"),
    242: ("Brescia Calcio", "Brescia", "BRE"),
    103: ("Carpi FC 1909", "Carpi", "CAR"),
    203: ("AC Cesena", "Cesena", "CES"),
    109: ("AC Chievo Verona", "Chievo", "CHI"),
    115: ("FC Crotone", "Crotone", "CRO"),
    100: ("US Città di Palermo", "Palermo", "PAL"),
    114: ("Delfino Pescara 1936", "Pescara", "PES"),
    221: ("SPAL", "SPAL", "SPA"),
    102: ("UC Sampdoria", "Sampdoria", "SAM"),
    260: ("Spezia Calcio", "Spezia", "SPE"),
    # Bundesliga
    262: ("DSC Arminia Bielefeld", "Bielefeld", "DSC"),
    233: ("Fortuna Düsseldorf", "Düsseldorf", "F95"),
    267: ("SpVgg Greuther Fürth", "Greuther Fürth", "SGF"),
    128: ("Hannover 96", "Hannover", "H96"),
    122: ("Hertha BSC", "Hertha", "BSC"),
    126: ("FC Ingolstadt 04", "Ingolstadt", "FCI"),
    234: ("1. FC Nürnberg", "Nürnberg", "FCN"),
    205: ("SC Paderborn 07", "Paderborn", "SCP"),
    124: ("FC Schalke 04", "Schalke", "S04"),
    # Ligue 1
    274: ("AC Ajaccio", "Ajaccio", "ACA"),
    224: ("Amiens SC", "Amiens", "ASC"),
    176: ("FC Girondins de Bordeaux", "Bordeaux", "BOR"),
    165: ("Stade Malherbe Caen", "Caen", "SMC"),
    181: ("Dijon FCO", "Dijon", "DFC"),
    209: ("Évian Thonon Gaillard FC", "Évian TG", "ETG"),
    173: ("GFC Ajaccio", "GFC Ajaccio", "GFC"),
    169: ("En Avant Guingamp", "Guingamp", "EAG"),
    182: ("AS Nancy-Lorraine", "Nancy", "ASN"),
    235: ("Nîmes Olympique", "Nîmes", "NIM"),
    162: ("SC Bastia", "Bastia", "BAS"),
    172: ("ES Troyes AC", "Troyes", "ETA"),
}

# Awarded results, saved as AWARDED. Understat match id -> (home, away)
RESULT_OVERRIDES = {
    945: (0, 3),    # Sassuolo 2-1 Pescara, 2016/17: ineligible player
    4238: (0, 3),   # Bastia v Lyon, 2016/17: abandoned for crowd trouble
    14117: (3, 0),  # Verona 0-0 Roma, 2020/21: ineligible player
}

# From Wikipedia's tables. (league, year) -> [(team id, pts, GF, GA, reason)]
TABLE_CORRECTIONS = {
    ("PD", 2014): [(208, -3, 0, 0, "Almería docked 3 points for an unpaid transfer fee")],
    ("SA", 2014): [(204, -7, 0, 0, "Parma docked 7 points for unpaid wages")],
    ("SA", 2017): [(96, -1, 0, 0, "Lazio deducted 1 point by the Italian Football Federation")],
    ("SA", 2018): [
        (109, -3, 0, 0, "Chievo deducted 3 points for false accounting"),
        (96, -2, 0, 0, "Lazio deducted 2 points by the Italian Football Federation"),
    ],
    ("SA", 2022): [(98, -10, 0, 0, "Juventus deducted 10 points for capital gain violations")],
    ("FL1", 2016): [
        (178, 0, -3, 0, "Lyon's awarded win at Bastia counts without goals"),
        (162, 0, 0, -3, "Bastia's awarded loss to Lyon counts without goals"),
    ],
    ("FL1", 2021): [
        (178, -1, 0, 0, "Lyon deducted 1 point for crowd trouble (abandoned match v Marseille)"),
        (170, -1, 0, 0, "Nice deducted 1 point for crowd trouble (abandoned match v Marseille)"),
    ],
}

# Head-to-head before goal difference
HEAD_TO_HEAD_LEAGUES = {"PD", "SA"}

# Stopped early (COVID): points per game, then head-to-head
POINTS_PER_GAME_SEASONS = {("FL1", 2019)}


def learn_known_clubs(cursor, league):
    # Understat team id -> club_id, from the 2023+ seasons
    known = {}
    for year in RECENT_SEASONS:
        season_id = find_season_id(cursor, league["id"], year)
        if season_id is None:
            raise Exception(
                f"No {year} season for {league['code']}. Run "
                "02_fetch_matches.py first."
            )

        data = fetch_league_data(league["understat"], year)
        time.sleep(SECONDS_BETWEEN_REQUESTS)
        clubs = get_season_clubs(cursor, season_id)
        for team_id, team in data["teams"].items():
            known[int(team_id)] = match_club(team["title"], clubs)

    return known


def find_club_id_by_name(cursor, name):
    cursor.execute("SELECT club_id FROM clubs WHERE name = ?", (name,))
    row = cursor.fetchone()
    if row is None:
        raise Exception(f'No club named "{name}" in the database')
    return row[0]


def resolve_club(cursor, team_id, title, known):
    # Creates the club first if it's in HISTORIC_CLUBS
    if team_id in known:
        return known[team_id]

    if team_id in SAME_CLUB:
        return find_club_id_by_name(cursor, SAME_CLUB[team_id])

    if team_id in HISTORIC_CLUBS:
        name, short_name, tla = HISTORIC_CLUBS[team_id]
        # 08 fills in crest_url
        cursor.execute(
            """INSERT OR IGNORE INTO clubs (club_id, name, short_name, tla, crest_url)
               VALUES (?, ?, ?, ?, NULL)""",
            (-team_id, name, short_name, tla),
        )
        return -team_id

    raise Exception(
        f'Understat team "{title}" (id {team_id}) isn\'t in the database '
        "or HISTORIC_CLUBS. Add it to HISTORIC_CLUBS."
    )


def build_matches(data, club_ids):
    matches = []
    for match in data["dates"]:
        match_id = int(match["id"])

        if match_id in RESULT_OVERRIDES:
            status = "AWARDED"
            home_goals, away_goals = RESULT_OVERRIDES[match_id]
        elif match["isResult"]:
            status = "FINISHED"
            home_goals = int(match["goals"]["h"])
            away_goals = int(match["goals"]["a"])
        else:
            # Ligue 1 2019/20's unplayed matches (COVID)
            status = "CANCELLED"
            home_goals = away_goals = None

        matches.append({
            "match_id": -match_id,
            # "2014-08-16 12:45:00" -> "2014-08-16T12:45:00Z", as in 02
            "utc_date": match["datetime"].replace(" ", "T") + "Z",
            "status": status,
            "home_club_id": club_ids[int(match["h"]["id"])],
            "away_club_id": club_ids[int(match["a"]["id"])],
            "home_goals": home_goals,
            "away_goals": away_goals,
        })

    return matches


def empty_row():
    row = {"games_played": 0, "wins": 0, "draws": 0, "losses": 0,
           "points": 0, "goals_for": 0, "goals_against": 0}
    for side in ("home", "away"):
        for stat in ("points", "wins", "draws", "losses", "goals_for", "goals_against"):
            row[f"{side}_{stat}"] = 0
    return row


def build_table(matches, only_clubs=None):
    # Total and home/away table; only_clubs gives a head-to-head table
    table = defaultdict(empty_row)

    for match in matches:
        if match["status"] not in ("FINISHED", "AWARDED"):
            continue

        home, away = match["home_club_id"], match["away_club_id"]
        if only_clubs is not None and not (home in only_clubs and away in only_clubs):
            continue

        sides = (
            ("home", home, match["home_goals"], match["away_goals"]),
            ("away", away, match["away_goals"], match["home_goals"]),
        )
        for side, club_id, scored, conceded in sides:
            row = table[club_id]
            if scored > conceded:
                result, points = "wins", 3
            elif scored == conceded:
                result, points = "draws", 1
            else:
                result, points = "losses", 0

            for prefix in ("", f"{side}_"):
                row[f"{prefix}{result}"] += 1
                row[f"{prefix}points"] += points
                row[f"{prefix}goals_for"] += scored
                row[f"{prefix}goals_against"] += conceded
            row["games_played"] += 1

    return table


def calculate_standings(matches, league_code, start_year, corrections):
    # Ranks on points (or per game), then head-to-head where it applies
    # (once the tied clubs have all met twice), then GD, then goals scored
    table = build_table(matches)

    for club_id, points, goals_for, goals_against in corrections:
        table[club_id]["points"] += points
        table[club_id]["goals_for"] += goals_for
        table[club_id]["goals_against"] += goals_against

    per_game = (league_code, start_year) in POINTS_PER_GAME_SEASONS
    use_head_to_head = league_code in HEAD_TO_HEAD_LEAGUES or per_game

    def primary(club_id):
        row = table[club_id]
        return row["points"] / row["games_played"] if per_game else row["points"]

    # Groups clubs level on points, then orders each group
    tied_groups = defaultdict(list)
    for club_id in table:
        tied_groups[primary(club_id)].append(club_id)

    order = []
    for key in sorted(tied_groups, reverse=True):
        group = tied_groups[key]

        mini = None
        if use_head_to_head and len(group) > 1:
            mini = build_table(matches, only_clubs=set(group))
            all_played = all(
                mini[club_id]["games_played"] == 2 * (len(group) - 1)
                for club_id in group
            )
            if not all_played:
                mini = None

        def tie_break(club_id):
            row = table[club_id]
            overall = (-(row["goals_for"] - row["goals_against"]), -row["goals_for"])
            if mini is None:
                return overall
            head_to_head = mini[club_id]
            return (
                -head_to_head["points"],
                -(head_to_head["goals_for"] - head_to_head["goals_against"]),
            ) + overall

        order += sorted(group, key=tie_break)

    for position, club_id in enumerate(order, start=1):
        table[club_id]["position"] = position

    return table, order[0]


def save_matches(cursor, matches, season_id):
    for match in matches:
        cursor.execute(
            """INSERT OR REPLACE INTO matches
               (match_id, season_id, matchday, utc_date, status,
                home_club_id, away_club_id, home_goals, away_goals)
               VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)""",
            (
                match["match_id"],
                season_id,
                match["utc_date"],
                match["status"],
                match["home_club_id"],
                match["away_club_id"],
                match["home_goals"],
                match["away_goals"],
            ),
        )


def save_standings(cursor, table, season_id, champion_club_id):
    columns = [
        "position", "games_played", "wins", "draws", "losses", "points",
        "goals_for", "goals_against",
        "home_points", "home_wins", "home_draws", "home_losses",
        "home_goals_for", "home_goals_against",
        "away_points", "away_wins", "away_draws", "away_losses",
        "away_goals_for", "away_goals_against",
    ]
    placeholders = ", ".join("?" * (len(columns) + 2))

    for club_id, row in table.items():
        cursor.execute(
            f"""INSERT OR REPLACE INTO club_season_stats
                (season_id, club_id, {", ".join(columns)})
                VALUES ({placeholders})""",
            (season_id, club_id, *[row[column] for column in columns]),
        )

    cursor.execute(
        "UPDATE seasons SET champion_club_id = ? WHERE season_id = ?",
        (champion_club_id, season_id),
    )


def main():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    for league in LEAGUES:
        print(f"\n{league['name']} ({league['code']})")
        print("  Matching clubs already in the database to Understat team ids...")
        known = learn_known_clubs(cursor, league)

        for year in SEASONS:
            data = fetch_league_data(league["understat"], year)
            time.sleep(SECONDS_BETWEEN_REQUESTS)

            club_ids = {
                int(team_id): resolve_club(cursor, int(team_id), team["title"], known)
                for team_id, team in data["teams"].items()
            }
            corrections = [
                (club_ids[team_id], points, goals_for, goals_against)
                for team_id, points, goals_for, goals_against, _reason
                in TABLE_CORRECTIONS.get((league["code"], year), [])
            ]

            season_id = ensure_season(cursor, league["id"], year)
            matches = build_matches(data, club_ids)
            table, champion_club_id = calculate_standings(
                matches, league["code"], year, corrections
            )

            save_matches(cursor, matches, season_id)
            save_standings(cursor, table, season_id, champion_club_id)
            connection.commit()

            cursor.execute("SELECT name FROM clubs WHERE club_id = ?", (champion_club_id,))
            print(
                f"  {year}/{str(year + 1)[2:]}: {len(matches)} matches, "
                f"{len(table)} clubs, champion {cursor.fetchone()[0]} "
                f"(season_id = {season_id})"
            )

    connection.close()

    print(
        f"\nDone. Loaded {len(LEAGUES)} leagues x {len(SEASONS)} seasons from "
        "Understat. Now run 06_calculate_aggregates.py, then "
        "07_fetch_understat.py and 08_fetch_crests.py."
    )


if __name__ == "__main__":
    main()
