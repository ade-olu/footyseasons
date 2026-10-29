"""
common/understat.py
Requests to understat.com and matching its team names to clubs, shared by
05, 07 and 09. Understat has no official API: these are the JSON endpoints
its own pages load, which could change without warning.
"""

import re
import unicodedata

import requests

# Understat name -> clubs.name, for names that don't match
UNDERSTAT_CLUB_NAMES = {
    "Bayern Munich": "FC Bayern München",
    "FC Cologne": "1. FC Köln",
    "Borussia M.Gladbach": "Borussia Mönchengladbach",
    "RasenBallsport Leipzig": "RB Leipzig",
    "Rennes": "Stade Rennais FC 1901",
    # Not Chievo Verona
    "Verona": "Hellas Verona FC",
    "Hertha Berlin": "Hertha BSC",
    "SPAL 2013": "SPAL",
    "Fortuna Duesseldorf": "Fortuna Düsseldorf",
    "Nuernberg": "1. FC Nürnberg",
    "Greuther Fuerth": "SpVgg Greuther Fürth",
}

# Understat only answers requests that look like they're from its pages
HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "X-Requested-With": "XMLHttpRequest",
}

# Not rate limited, but I keep it gentle
SECONDS_BETWEEN_REQUESTS = 3


def fetch(path, referer_path, description):
    # e.g. fetch("/getPlayerData/618", "/player/618", "player 618")
    response = requests.get(
        f"https://understat.com{path}",
        headers={**HEADERS, "Referer": f"https://understat.com{referer_path}"},
        timeout=30,
    )

    if response.status_code != 200:
        raise Exception(
            f"Understat request failed for {description} "
            f"with status {response.status_code}: {response.text[:200]}"
        )

    return response.json()


def fetch_league_data(understat_league, start_year):
    # {"teams", "players", "dates"}; "dates" is every match, player values
    # are strings ("27")
    return fetch(
        f"/getLeagueData/{understat_league}/{start_year}",
        f"/league/{understat_league}/{start_year}",
        f"{understat_league} {start_year}",
    )


def fetch_player_matches(understat_player_id):
    # Every league match of the player's career
    return fetch(
        f"/getPlayerData/{understat_player_id}",
        f"/player/{understat_player_id}",
        f"player {understat_player_id}",
    )["matches"]


def name_words(name):
    # "Club Atlético de Madrid" -> {"club", "atletico", "de", "madrid"}
    plain = unicodedata.normalize("NFKD", name)
    plain = plain.encode("ascii", "ignore").decode().lower()
    return set(re.findall(r"[a-z0-9]+", plain))


def match_club(understat_name, clubs):
    # Raises unless exactly one of the season's clubs matches
    if understat_name in UNDERSTAT_CLUB_NAMES:
        wanted = UNDERSTAT_CLUB_NAMES[understat_name]
        candidates = [club for club in clubs if club[1] == wanted]
    else:
        # Every word has to be in the club's name or short name
        words = name_words(understat_name)
        candidates = [
            club for club in clubs
            if words <= name_words(club[1]) | name_words(club[2] or "")
        ]

        # On a tie ("Barcelona" vs Espanyol), fewest extra words wins
        if len(candidates) > 1:
            extra = {club: len(name_words(club[1]) - words) for club in candidates}
            fewest = min(extra.values())
            candidates = [club for club in candidates if extra[club] == fewest]

    if len(candidates) != 1:
        season_names = ", ".join(sorted(club[1] for club in clubs))
        raise Exception(
            f'Could not match Understat team "{understat_name}" to a club '
            f"({len(candidates)} matches). Add it to UNDERSTAT_CLUB_NAMES "
            f"in common/understat.py. Clubs this season: {season_names}"
        )

    return candidates[0][0]
