"""
common/fotmob.py
Requests to fotmob.com, shared by 04 and 09. FotMob has no official API:
these are the JSON endpoints its own pages load, which could change without warning.
"""

import gzip
import json

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
