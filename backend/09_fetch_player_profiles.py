"""
09_fetch_player_profiles.py

Matches Understat players to FotMob (photo) and Transfermarkt (date of
birth, from the CC0 transfermarkt-datasets export) and saves them in
player_profiles. Photos are loaded from FotMob's image server.

FotMob has no official API: this uses the JSON its own site loads, which
could change without warning.

Safe to re-run: the table is rebuilt each time. I cache downloads in
cache/; delete it to refetch everything. Run 06_fetch_understat.py first.
"""

import csv
import gzip
import json
import os
import re
import sqlite3
import time
import unicodedata
from collections import Counter, defaultdict
import requests


DB_FILE = "football.db"
CACHE_DIR = "cache"
TRANSFERMARKT_URL = "https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data"
FOTMOB_URL = "https://www.fotmob.com/api/data"
PHOTO_URL = "https://images.fotmob.com/image_resources/playerimages/{}.png"

SEASONS = list(range(2014, 2026))
# FotMob has no player stats before 2016/17
FOTMOB_FIRST_SEASON = 2016

# League code -> (Transfermarkt competition id, FotMob league id)
LEAGUES = {
    "PL": ("GB1", 47),
    "PD": ("ES1", 87),
    "SA": ("IT1", 55),
    "BL1": ("L1", 54),
    "FL1": ("FR1", 53),
}

# Names that don't match: understat_player_id -> Transfermarkt player_id
TRANSFERMARKT_IDS = {
    965: 15799,  # Santiago Cazorla -> Santi Cazorla
    6120: 207834,  # Bono -> Yassine Bounou
    7947: 207877,  # Ruslan Malinovskiy -> Ruslan Malinovskyi
    8094: 607223,  # Mathis Cherki -> Rayan Cherki
    11866: 193082,  # Álex Grimaldo -> Alejandro Grimaldo
    12030: 523318,  # Tasos Douvikas -> Anastasios Douvikas
}

# Names that don't match: understat_player_id -> FotMob player id
FOTMOB_IDS = {
    7947: 459658,  # Ruslan Malinovskiy -> Ruslan Malinovsky
    8807: 959404,  # Silas Wamangituka -> Silas Katompa Mvumpa
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"
    ),
}
SECONDS_BETWEEN_REQUESTS = 2

# Letters that don't split into a plain letter + accent
EXTRA_LETTERS = str.maketrans(
    {"ø": "o", "Ø": "O", "ı": "i", "ł": "l", "Ł": "L", "ß": "ss", "æ": "ae", "đ": "d"}
)


def name_words(name):
    plain = unicodedata.normalize("NFKD", name.translate(EXTRA_LETTERS))
    plain = plain.encode("ascii", "ignore").decode().lower()
    return tuple(re.findall(r"[a-z0-9]+", plain))


def find_candidates(name, candidates):
    words = name_words(name)
    exact = [pid for pid, other in candidates.items() if name_words(other) == words]
    if exact:
        return exact

    words = set(words)
    return [
        pid
        for pid, other in candidates.items()
        if words <= set(name_words(other)) or set(name_words(other)) <= words
    ]


def index_names(names):
    by_name = defaultdict(set)
    for pid, name in names.items():
        by_name[name_words(name)].add(pid)
    return by_name


def unique(ids):
    return next(iter(ids)) if len(ids) == 1 else None


def match_players(understat_players, season_players, by_name):
    matches = defaultdict(Counter)
    unmatched = []
    club_votes = Counter()

    for key, players in understat_players.items():
        candidates = {pid: name for pid, (name, _) in season_players[key].items()}
        for understat_id, name, clubs in players:
            found = find_candidates(name, candidates)
            if len(found) == 1:
                matches[understat_id][found[0]] += 1
                other_clubs = season_players[key][found[0]][1]
                if len(clubs) == 1 and len(other_clubs) == 1:
                    club_votes[(next(iter(clubs)), next(iter(other_clubs)))] += 1
            else:
                unmatched.append((key, understat_id, name, clubs))

    club_map = {}
    for (club, other_club), votes in club_votes.most_common():
        club_map.setdefault(club, other_club)

    # Retry within the player's club, then by a name unique in the source
    misses = []
    for key, understat_id, name, clubs in unmatched:
        other_clubs = {club_map.get(club) for club in clubs}
        club_candidates = {
            pid: other_name
            for pid, (other_name, played_for) in season_players[key].items()
            if played_for & other_clubs
        }
        found = find_candidates(name, club_candidates)
        pid = found[0] if len(found) == 1 else unique(by_name.get(name_words(name), ()))
        if pid:
            matches[understat_id][pid] += 1
        else:
            misses.append((understat_id, name))

    return matches, misses


def best_ids(matches):
    # Most common id if seasons disagree
    return {uid: ids.most_common(1)[0][0] for uid, ids in matches.items()}


def read_transfermarkt(table):
    path = os.path.join(CACHE_DIR, "transfermarkt", f"{table}.csv.gz")
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print(f"Downloading {table}.csv.gz...")
        response = requests.get(f"{TRANSFERMARKT_URL}/{table}.csv.gz", timeout=300)
        response.raise_for_status()
        with open(path, "wb") as file:
            file.write(response.content)

    with gzip.open(path, "rt", encoding="utf-8") as file:
        yield from csv.DictReader(file)


def load_transfermarkt():
    competitions = {tm_id: code for code, (tm_id, _) in LEAGUES.items()}
    games = {
        game["game_id"]: (competitions[game["competition_id"]], int(game["season"]))
        for game in read_transfermarkt("games")
        if game["competition_id"] in competitions
    }

    season_players = defaultdict(dict)
    for appearance in read_transfermarkt("appearances"):
        key = games.get(appearance["game_id"])
        if key:
            name, clubs = season_players[key].setdefault(
                int(appearance["player_id"]), (appearance["player_name"], set())
            )
            clubs.add(appearance["player_club_id"])

    players = {int(p["player_id"]): p for p in read_transfermarkt("players")}
    return season_players, players


def fotmob_get(url, params=None):
    time.sleep(SECONDS_BETWEEN_REQUESTS)
    response = requests.get(url, params=params, headers=HEADERS, timeout=30)
    response.raise_for_status()
    # Stat lists can arrive still gzipped
    if response.content[:2] == b"\x1f\x8b":
        return json.loads(gzip.decompress(response.content))
    return response.json()


def load_fotmob_season(code, year):
    # The latest season is always refetched
    path = os.path.join(CACHE_DIR, "fotmob", f"{code}-{year}.json")
    if os.path.exists(path) and year != SEASONS[-1]:
        with open(path, encoding="utf-8") as file:
            return json.load(file)

    print(f"  FotMob {code} {year}")
    league = fotmob_get(
        f"{FOTMOB_URL}/leagues",
        {"id": LEAGUES[code][1], "season": f"{year}/{year + 1}"},
    )
    url = next(
        stat["fetchAllUrl"]
        for stat in league["stats"]["players"]
        if stat["fetchAllUrl"].endswith("/mins_played.json")
    )
    players = [
        # "ParticiantId" is FotMob's spelling
        {"id": p["ParticiantId"], "name": p["ParticipantName"], "teamId": p["TeamId"]}
        for p in fotmob_get(url)["TopLists"][0]["StatList"]
    ]

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(players, file)
    return players


def load_fotmob():
    season_players = defaultdict(dict)
    for year in range(FOTMOB_FIRST_SEASON, SEASONS[-1] + 1):
        for code in LEAGUES:
            for p in load_fotmob_season(code, year):
                name, teams = season_players[(code, year)].setdefault(
                    p["id"], (p["name"], set())
                )
                teams.add(p["teamId"])
    return season_players


def search_fotmob(name, cache):
    if name not in cache:
        groups = fotmob_get(f"{FOTMOB_URL}/search/suggest", {"term": name, "lang": "en"})
        cache[name] = [
            {"id": int(s["id"]), "name": s["name"]}
            for group in groups
            if group["title"]["key"] == "players"
            for s in group["suggestions"]
        ]
    return {s["id"] for s in cache[name] if name_words(s["name"]) == name_words(name)}


def load_understat_players(cursor):
    cursor.execute(
        """SELECT l.code, s.start_year, ps.understat_player_id, ps.player_name,
                  GROUP_CONCAT(pc.club_id)
           FROM understat_player_stats ps
           JOIN seasons s ON s.season_id = ps.season_id
           JOIN leagues l ON l.league_id = s.league_id
           JOIN understat_player_clubs pc ON pc.player_stats_id = ps.id
           GROUP BY ps.id"""
    )
    players = defaultdict(list)
    for code, year, understat_id, name, club_ids in cursor.fetchall():
        players[(code, year)].append(
            (understat_id, name, {int(club) for club in club_ids.split(",")})
        )
    return players


def main():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()
    understat_players = load_understat_players(cursor)
    names = {uid: name for ps in understat_players.values() for uid, name, _ in ps}

    print("Matching Transfermarkt...")
    tm_seasons, tm_players = load_transfermarkt()
    tm_by_name = index_names({pid: p["name"] for pid, p in tm_players.items()})
    tm_matches, _ = match_players(understat_players, tm_seasons, tm_by_name)
    tm_ids = best_ids(tm_matches) | TRANSFERMARKT_IDS

    print("Matching FotMob...")
    fm_seasons = load_fotmob()
    fm_by_name = index_names(
        {pid: name for ps in fm_seasons.values() for pid, (name, _) in ps.items()}
    )
    # Players before 2016/17 have no FotMob season list
    fm_matches, _ = match_players(
        {key: ps for key, ps in understat_players.items() if key[1] >= FOTMOB_FIRST_SEASON},
        fm_seasons,
        fm_by_name,
    )
    fm_ids = best_ids(fm_matches) | FOTMOB_IDS

    # The rest: by name across FotMob, with Transfermarkt's spelling too, then search
    search_path = os.path.join(CACHE_DIR, "fotmob", "search.json")
    search_cache = {}
    if os.path.exists(search_path):
        with open(search_path, encoding="utf-8") as file:
            search_cache = json.load(file)

    def spellings(uid):
        if uid in tm_ids:
            return [names[uid], tm_players[tm_ids[uid]]["name"]]
        return [names[uid]]

    for uid in names:
        if uid not in fm_ids:
            for name in spellings(uid):
                pid = unique(fm_by_name.get(name_words(name), ()))
                if pid:
                    fm_ids[uid] = pid
                    break

    missing = [uid for uid in names if uid not in fm_ids]
    print(f"Searching FotMob for {len(missing)} players...")
    for i, uid in enumerate(missing, start=1):
        for name in spellings(uid):
            pid = unique(search_fotmob(name, search_cache))
            if pid:
                fm_ids[uid] = pid
                break
        if i % 100 == 0 or i == len(missing):
            print(f"  {i}/{len(missing)}")
            os.makedirs(os.path.dirname(search_path), exist_ok=True)
            with open(search_path, "w", encoding="utf-8") as file:
                json.dump(search_cache, file)

    cursor.execute("DELETE FROM player_profiles")
    for uid in names:
        if uid not in fm_ids and uid not in tm_ids:
            continue
        tm_player = tm_players.get(tm_ids.get(uid), {})
        cursor.execute(
            """INSERT INTO player_profiles
               (understat_player_id, fotmob_id, photo_url, transfermarkt_id, date_of_birth)
               VALUES (?, ?, ?, ?, ?)""",
            (
                uid,
                fm_ids.get(uid),
                PHOTO_URL.format(fm_ids[uid]) if uid in fm_ids else None,
                tm_ids.get(uid),
                tm_player.get("date_of_birth", "")[:10] or None,
            ),
        )

    connection.commit()
    # Last script in the pipeline: reclaim the space left by the re-inserts
    connection.execute("VACUUM")
    connection.close()

    print(
        f"\nDone. {len(names)} Understat players: {len(fm_ids)} matched on FotMob, "
        f"{len(tm_ids)} on Transfermarkt."
    )
    no_photo = sorted(uid for uid in names if uid not in fm_ids)
    print(f"{len(no_photo)} have no FotMob match. Add them to FOTMOB_IDS:")
    for uid in no_photo[:20]:
        print(f"  {uid}: {names[uid]}")


if __name__ == "__main__":
    main()
