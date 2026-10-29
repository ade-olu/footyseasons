"""
common/leagues.py
The leagues and seasons the pipeline scripts loop over. When a season
starts, bump LATEST_SEASON here and in frontend/src/hooks/useSelection.ts.
"""

# Understat's first season
FIRST_SEASON = 2014
# football-data.org's free tier returns 403 before this
FIRST_API_SEASON = 2023
# Start year of the newest season (2025 = 2025/26)
LATEST_SEASON = 2025

# From football-data.org (02, 03)
API_SEASONS = list(range(FIRST_API_SEASON, LATEST_SEASON + 1))
# Only on Understat (04)
UNDERSTAT_ONLY_SEASONS = list(range(FIRST_SEASON, FIRST_API_SEASON))
# Every season in the database (06, 09)
ALL_SEASONS = list(range(FIRST_SEASON, LATEST_SEASON + 1))

# "id" and "code" are football-data.org's, also used by the database and
# API; the others are each source's own name or id
LEAGUES = [
    {
        "id": 2021,
        "name": "Premier League",
        "code": "PL",
        "understat": "EPL",
        "transfermarkt": "GB1",
        "fotmob": 47,
    },
    {
        "id": 2014,
        "name": "La Liga",
        "code": "PD",
        "understat": "La_liga",
        "transfermarkt": "ES1",
        "fotmob": 87,
    },
    {
        "id": 2019,
        "name": "Serie A",
        "code": "SA",
        "understat": "Serie_A",
        "transfermarkt": "IT1",
        "fotmob": 55,
    },
    {
        "id": 2002,
        "name": "Bundesliga",
        "code": "BL1",
        "understat": "Bundesliga",
        "transfermarkt": "L1",
        "fotmob": 54,
    },
    {
        "id": 2015,
        "name": "Ligue 1",
        "code": "FL1",
        "understat": "Ligue_1",
        "transfermarkt": "FR1",
        "fotmob": 53,
    },
]
