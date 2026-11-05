"""
common/football_data.py
Requests to football-data.org v4, shared by 02 and 03.
"""

import requests

API_KEY_FILE = "api_key.txt"
API_URL = "https://api.football-data.org/v4"

# Pause between requests to stay under the free tier's 10 calls/minute
SECONDS_BETWEEN_REQUESTS = 7

# Three-letter codes the API gets wrong. club_id -> code
TLA_FIXES = {
    576: "STR",  # Strasbourg, "RC " in the API
}


def load_api_key():
    # Kept out of git
    with open(API_KEY_FILE, "r") as f:
        return f.read().strip()


def fetch(api_key, path, params):
    # e.g. fetch(key, "/competitions/PL/matches", {"season": 2025})
    response = requests.get(
        f"{API_URL}{path}",
        headers={"X-Auth-Token": api_key},
        params=params,
        timeout=30,
    )

    if response.status_code != 200:
        raise Exception(
            f"API request failed for {path} with status "
            f"{response.status_code}: {response.text}"
        )

    return response.json()


def ensure_club(cursor, team):
    cursor.execute(
        """INSERT OR IGNORE INTO clubs (club_id, name, short_name, tla, crest_url)
           VALUES (?, ?, ?, ?, ?)""",
        (
            team["id"],
            team.get("name"),
            team.get("shortName"),
            TLA_FIXES.get(team["id"], team.get("tla")),
            team.get("crest"),
        ),
    )
