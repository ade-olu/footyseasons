"""
12_load_lineups.py

Saves league lineups, formations, managers and squad details from
Transfermarkt as counts per club-season. Safe to re-run. Run 09 first.
"""

import bisect
import sqlite3
import time
from collections import Counter, defaultdict

from common.db import DB_FILE, get_season_id
from common.leagues import ALL_SEASONS, LEAGUES
from common.transfermarkt import read_transfermarkt


# Children first, for the foreign keys
TABLES = [
    "squad_players",
    "position_starts",
    "lineup_shapes",
    "club_managers",
    "transfermarkt_players",
]
# Transfermarkt's lineup positions -> short codes
POSITIONS = {
    "Goalkeeper": "GK",
    "Sweeper": "SW",
    "Centre-Back": "CB",
    "Left-Back": "LB",
    "Right-Back": "RB",
    "Defensive Midfield": "DM",
    "Central Midfield": "CM",
    "Left Midfield": "LM",
    "Right Midfield": "RM",
    "Attacking Midfield": "AM",
    "Left Winger": "LW",
    "Right Winger": "RW",
    "Second Striker": "SS",
    "Centre-Forward": "CF",
}


def load_games(cursor):
    leagues = {league["transfermarkt"]: league["id"] for league in LEAGUES}
    games = {}
    for game in read_transfermarkt("games"):
        league_id = leagues.get(game["competition_id"])
        year = int(game["season"])
        if league_id and year in ALL_SEASONS:
            game["season_id"] = get_season_id(cursor, league_id, year)
            games[game["game_id"]] = game
    return games


def map_clubs(cursor, games):
    # Matched by date and score
    cursor.execute(
        """SELECT season_id, substr(utc_date, 1, 10), home_goals, away_goals,
                  home_club_id, away_club_id
           FROM matches"""
    )
    ours = defaultdict(list)
    fixtures = set()
    for season_id, date, home_goals, away_goals, home, away in cursor.fetchall():
        ours[(season_id, date, home_goals, away_goals)].append((home, away))
        fixtures.add((season_id, home, away))

    votes = defaultdict(Counter)
    for game in games.values():
        key = (
            game["season_id"],
            game["date"],
            int(game["home_club_goals"]),
            int(game["away_club_goals"]),
        )
        found = ours.get(key, [])
        if len(found) == 1:
            home, away = found[0]
            votes[(game["season_id"], game["home_club_id"])][home] += 1
            votes[(game["season_id"], game["away_club_id"])][away] += 1

    # A date and score can be shared, so I check every game is our fixture
    clubs = {key: counter.most_common(1)[0][0] for key, counter in votes.items()}

    for game in games.values():
        season_id = game["season_id"]
        home = clubs.get((season_id, game["home_club_id"]))
        away = clubs.get((season_id, game["away_club_id"]))
        if (season_id, home, away) not in fixtures:
            raise Exception(
                f"No match for {game['home_club_name']} vs "
                f"{game['away_club_name']} on {game['date']}"
            )

    for season_id in {season_id for season_id, _ in clubs}:
        mapped = [c for (s, _), c in clubs.items() if s == season_id]
        if len(mapped) != len(set(mapped)):
            raise Exception(f"Two Transfermarkt clubs share a club in {season_id}")
    return clubs


def count_managers(games, clubs):
    managers = {}
    for game in games.values():
        home_goals = int(game["home_club_goals"])
        away_goals = int(game["away_club_goals"])
        for side, scored, conceded in (
            ("home", home_goals, away_goals),
            ("away", away_goals, home_goals),
        ):
            name = game[f"{side}_club_manager_name"]
            if not name:
                continue
            club_id = clubs[(game["season_id"], game[f"{side}_club_id"])]
            record = managers.setdefault(
                (game["season_id"], club_id, name), [0, 0, 0, 0, game["date"]]
            )
            record[0] += 1
            record[1 if scored > conceded else 2 if scored == conceded else 3] += 1
            record[4] = min(record[4], game["date"])
    return managers


def count_lineups(games, clubs):
    numbers = defaultdict(Counter)
    position_starts = Counter()
    starters = defaultdict(list)
    names = {}
    for row in read_transfermarkt("game_lineups"):
        game = games.get(row["game_id"])
        if not game:
            continue
        season_id = game["season_id"]
        club_id = clubs[(season_id, row["club_id"])]
        player = int(row["player_id"])
        names[player] = row["player_name"]

        counter = numbers[(season_id, club_id, player)]
        if row["number"].isdigit():
            counter[int(row["number"])] += 1
        if row["type"] == "starting_lineup":
            if row["position"] not in POSITIONS:
                raise Exception(f"Unknown position {row['position']}: add it to POSITIONS")
            position = POSITIONS[row["position"]]
            position_starts[(season_id, club_id, player, position)] += 1
            starters[(row["game_id"], row["club_id"])].append(position)
    return numbers, position_starts, starters, names


def count_shapes(games, clubs, starters):
    shapes = Counter()
    skipped = 0
    for (game_id, tm_club), positions in starters.items():
        game = games[game_id]
        side = "home" if game["home_club_id"] == tm_club else "away"
        formation = game[f"{side}_club_formation"]
        if not formation or len(positions) != 11:
            skipped += 1
            continue
        club_id = clubs[(game["season_id"], tm_club)]
        key = (game["season_id"], club_id, formation, ",".join(sorted(positions)))
        shapes[key] += 1
    return shapes, skipped


def load_players(names):
    players = {}
    for row in read_transfermarkt("players"):
        player = int(row["player_id"])
        if player in names:
            height = row["height_in_cm"]
            players[player] = (
                row["name"] or names[player],
                row["country_of_citizenship"] or None,
                int(float(height)) if height and float(height) > 0 else None,
                POSITIONS.get(row["sub_position"]),
            )
    for player, name in names.items():
        players.setdefault(player, (name, None, None, None))
    return players


def load_valuations(names):
    valuations = defaultdict(list)
    for row in read_transfermarkt("player_valuations"):
        player = int(row["player_id"])
        if player in names and row["market_value_in_eur"]:
            valuations[player].append((row["date"], int(row["market_value_in_eur"])))
    return {
        player: tuple(zip(*sorted(rows))) for player, rows in valuations.items()
    }


def season_end_value(valuations, player, season_end):
    if player not in valuations:
        return None
    dates, values = valuations[player]
    index = bisect.bisect_right(dates, season_end)
    return values[index - 1] if index else None


def main():
    started = time.time()
    connection = sqlite3.connect(DB_FILE)
    connection.execute("PRAGMA foreign_keys = ON")
    cursor = connection.cursor()

    games = load_games(cursor)
    clubs = map_clubs(cursor, games)
    managers = count_managers(games, clubs)
    numbers, position_starts, starters, names = count_lineups(games, clubs)
    shapes, skipped = count_shapes(games, clubs, starters)
    players = load_players(names)
    valuations = load_valuations(names)

    cursor.execute("SELECT season_id, start_year FROM seasons")
    season_ends = {season_id: f"{year + 1}-06-30" for season_id, year in cursor}

    for table in TABLES:
        cursor.execute(f"DELETE FROM {table}")

    cursor.executemany(
        "INSERT INTO transfermarkt_players VALUES (?, ?, ?, ?, ?)",
        [(player, *details) for player, details in players.items()],
    )
    cursor.executemany(
        "INSERT INTO squad_players VALUES (?, ?, ?, ?, ?)",
        [
            (
                season_id,
                club_id,
                player,
                counter.most_common(1)[0][0] if counter else None,
                season_end_value(valuations, player, season_ends[season_id]),
            )
            for (season_id, club_id, player), counter in numbers.items()
        ],
    )
    cursor.executemany(
        "INSERT INTO position_starts VALUES (?, ?, ?, ?, ?)",
        [(*key, starts) for key, starts in position_starts.items()],
    )
    cursor.executemany(
        "INSERT INTO lineup_shapes VALUES (?, ?, ?, ?, ?)",
        [(*key, starts) for key, starts in shapes.items()],
    )
    cursor.executemany(
        "INSERT INTO club_managers VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [(*key, *record) for key, record in managers.items()],
    )
    connection.commit()

    # Reclaim the space left by the re-inserts
    connection.execute("VACUUM")
    connection.close()

    print(f"\nDone in {time.time() - started:.0f}s.")
    print(f"{len(games)} games, {len(clubs)} club-seasons")
    print(f"{len(players)} players, {len(numbers)} squad rows")
    print(f"{len(position_starts)} position rows, {len(shapes)} lineup shapes")
    print(f"{len(managers)} manager rows")
    print(f"{skipped} lineups without a formation or 11 starters left out")


if __name__ == "__main__":
    main()
