"""
common/fotmob.py
Requests to fotmob.com, shared by 04, 09, 10 and 13. FotMob has no official API:
these are the JSON endpoints its own pages load, which could change without warning.
"""

import gzip
import json
from collections import Counter, defaultdict

import requests

FOTMOB_URL = "https://www.fotmob.com/api/data"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"
    ),
}

SECONDS_BETWEEN_REQUESTS = 2


def fetch(url, params=None):
    response = requests.get(url, params=params, headers=HEADERS, timeout=30)
    response.raise_for_status()
    # Stat lists can arrive still gzipped
    if response.content[:2] == b"\x1f\x8b":
        return json.loads(gzip.decompress(response.content))
    return response.json()


def fetch_league_season(league, year):
    # A league page: fixtures (with rounds), tables and stat list links
    return fetch(
        f"{FOTMOB_URL}/leagues",
        {"id": league["fotmob"], "season": f"{year}/{year + 1}"},
    )


def match_teams(fixtures, matches):
    # FotMob team id -> club_id, by majority vote over games on the same day
    # with the same score
    by_day = defaultdict(list)
    for match in matches:
        by_day[match["utc_date"][:10]].append(match)

    votes = defaultdict(Counter)
    for fixture in fixtures:
        score = fixture["status"].get("scoreStr")
        if not score:
            continue
        home_goals, away_goals = (int(goals) for goals in score.split(" - "))
        for match in by_day[fixture["status"]["utcTime"][:10]]:
            if (match["home_goals"], match["away_goals"]) == (home_goals, away_goals):
                votes[fixture["home"]["id"]][match["home_club_id"]] += 1
                votes[fixture["away"]["id"]][match["away_club_id"]] += 1

    return {team_id: count.most_common(1)[0][0] for team_id, count in votes.items()}
