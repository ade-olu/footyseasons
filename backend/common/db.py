"""
common/db.py
Season and club look-ups shared by the pipeline scripts.
"""


def season_label(start_year):
    # 2025 -> "2025/26"
    return f"{start_year}/{str(start_year + 1)[-2:]}"


def find_season_id(cursor, league_id, start_year):
    # None if the season isn't in the database yet
    cursor.execute(
        "SELECT season_id FROM seasons WHERE league_id = ? AND start_year = ?",
        (league_id, start_year),
    )
    row = cursor.fetchone()
    return row[0] if row else None


def get_season_id(cursor, league_id, start_year):
    # Look-up only: 02 creates the 2023+ seasons and 05 the older ones
    season_id = find_season_id(cursor, league_id, start_year)

    if season_id is None:
        raise Exception(
            f"No season found for league_id {league_id}, start_year "
            f"{start_year}. Run 02_fetch_matches.py (2023 onwards) or "
            "05_fetch_understat_history.py (2014-2022) first."
        )

    return season_id


def ensure_season(cursor, league_id, start_year):
    # season_id is autoincrement, so look for an existing row first
    season_id = find_season_id(cursor, league_id, start_year)
    if season_id is not None:
        return season_id

    cursor.execute(
        "INSERT INTO seasons (league_id, start_year, label) VALUES (?, ?, ?)",
        (league_id, start_year, season_label(start_year)),
    )
    return cursor.lastrowid


def get_season_clubs(cursor, season_id):
    # (club_id, name, short_name) of every club with a match this season
    cursor.execute(
        """SELECT club_id, name, short_name FROM clubs
           WHERE club_id IN (
               SELECT home_club_id FROM matches WHERE season_id = ?
               UNION
               SELECT away_club_id FROM matches WHERE season_id = ?
           )""",
        (season_id, season_id),
    )
    return cursor.fetchall()
