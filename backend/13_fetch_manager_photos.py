"""
13_fetch_manager_photos.py

Links each manager in club_managers to FotMob for a photo. Safe to re-run;
downloads are cached in cache/fotmob/. Run 12 first.
"""

import os
import sqlite3
import time
import unicodedata
from collections import Counter, defaultdict

from common import fotmob
from common.cache import read_json, write_json
from common.db import DB_FILE, get_season_id, season_label
from common.leagues import ALL_SEASONS, LEAGUES


CACHE_DIR = os.path.join("cache", "fotmob")
PHOTO_URL = "https://images.fotmob.com/image_resources/playerimages/{}.png"


def cached_fetch(path, url, params, pick):
    data = read_json(path)
    if data is None:
        time.sleep(fotmob.SECONDS_BETWEEN_REQUESTS)
        data = pick(fotmob.fetch(url, params))
        write_json(path, data)
    return data


def surname(name):
    plain = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return plain.lower().split()[-1]


def load_teams(cursor):
    # FotMob team id -> club_id
    teams = {}
    for league in LEAGUES:
        for year in ALL_SEASONS:
            fixtures = cached_fetch(
                os.path.join(CACHE_DIR, "fixtures", f"{league['code']}-{year}.json"),
                f"{fotmob.FOTMOB_URL}/leagues",
                {"id": league["fotmob"], "season": f"{year}/{year + 1}"},
                lambda data: data["fixtures"]["allMatches"],
            )
            cursor.execute(
                """SELECT utc_date, home_goals, away_goals, home_club_id,
                          away_club_id
                   FROM matches WHERE season_id = ?""",
                (get_season_id(cursor, league["id"], year),),
            )
            columns = [c[0] for c in cursor.description]
            matches = [dict(zip(columns, row)) for row in cursor.fetchall()]
            teams.update(fotmob.match_teams(fixtures, matches))
    return teams


def main():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()
    teams = load_teams(cursor)

    # (club_id, season label, FotMob league id) -> coach seasons
    coaches = defaultdict(list)
    for team_id, club_id in teams.items():
        history = cached_fetch(
            os.path.join(CACHE_DIR, "teams", f"{team_id}.json"),
            f"{fotmob.FOTMOB_URL}/teams",
            {"id": team_id},
            lambda data: (data.get("history") or {}).get("coachHistory") or [],
        )
        for coach in history:
            coaches[(club_id, coach["season"], coach["leagueId"])].append(coach)

    cursor.execute(
        """SELECT cm.name, cm.club_id, s.start_year, l.league_id,
                  cm.wins, cm.draws, cm.losses
           FROM club_managers cm
           JOIN seasons s ON s.season_id = cm.season_id
           JOIN leagues l ON l.league_id = s.league_id"""
    )
    fotmob_leagues = {league["id"]: league["fotmob"] for league in LEAGUES}
    ids = defaultdict(Counter)
    unmatched = []
    for name, club_id, year, league_id, wins, draws, losses in cursor.fetchall():
        label = f"{year}/{year + 1}"
        candidates = coaches[(club_id, label, fotmob_leagues[league_id])]
        # Same record first, since names are spelled differently
        found = [
            c for c in candidates
            if (c["win"], c["draw"], c["loss"]) == (wins, draws, losses)
        ]
        if len(found) != 1:
            found = [c for c in candidates if surname(c["name"]) == surname(name)]
        if len(found) == 1:
            ids[name][found[0]["id"]] += 1
        else:
            unmatched.append(f"{name} ({season_label(year)}, club {club_id})")

    cursor.execute("DELETE FROM manager_profiles")
    cursor.executemany(
        "INSERT INTO manager_profiles VALUES (?, ?, ?)",
        [
            (name, fotmob_id, PHOTO_URL.format(fotmob_id))
            for name, counter in ids.items()
            for fotmob_id in [counter.most_common(1)[0][0]]
        ],
    )
    connection.commit()
    connection.close()

    print(f"\nDone. {len(teams)} FotMob teams, {len(ids)} managers linked.")
    print(f"{len(unmatched)} manager-seasons without a match:")
    for line in unmatched[:30]:
        print(f"  {line}")


if __name__ == "__main__":
    main()
