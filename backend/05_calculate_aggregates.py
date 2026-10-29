"""
05_calculate_aggregates.py

Calculates each club-season's clean sheets, biggest win and loss, and
longest win and winless streaks from the matches table. No API calls.
Safe to re-run: only these 5 columns are overwritten.
"""

import sqlite3


DB_FILE = "football.db"


def get_all_seasons(cursor):
    cursor.execute("SELECT season_id FROM seasons ORDER BY season_id")
    return [row[0] for row in cursor.fetchall()]


def get_clubs_in_season(cursor, season_id):
    # Every club with a match this season
    cursor.execute(
        """SELECT home_club_id FROM matches WHERE season_id = ?
           UNION
           SELECT away_club_id FROM matches WHERE season_id = ?""",
        (season_id, season_id),
    )
    return [row[0] for row in cursor.fetchall()]


def get_club_matches(cursor, season_id, club_id):
    # The club's finished matches this season, by date
    cursor.execute(
        """SELECT match_id, utc_date, home_club_id, away_club_id,
                  home_goals, away_goals
           FROM matches
           WHERE season_id = ?
             AND status = 'FINISHED'
             AND (home_club_id = ? OR away_club_id = ?)
           ORDER BY utc_date ASC""",
        (season_id, club_id, club_id),
    )
    return cursor.fetchall()


def calculate_club_aggregates(club_id, matches):
    clean_sheets = 0

    best_win_diff = -1  # so a 1-0 still counts
    best_win_match_id = None

    best_loss_diff = -1
    best_loss_match_id = None

    current_win_streak = 0
    longest_win_streak = 0

    current_winless_streak = 0
    longest_winless_streak = 0

    for match_id, utc_date, home_id, away_id, home_goals, away_goals in matches:
        if club_id == home_id:
            us, them = home_goals, away_goals
        else:
            us, them = away_goals, home_goals

        # Skip a match without a score
        if us is None or them is None:
            continue

        if them == 0:
            clean_sheets += 1

        diff = us - them

        if diff > 0:
            # Win
            if diff > best_win_diff:
                best_win_diff = diff
                best_win_match_id = match_id

            current_win_streak += 1
            longest_win_streak = max(longest_win_streak, current_win_streak)
            current_winless_streak = 0

        else:
            # Draw or loss
            current_win_streak = 0
            current_winless_streak += 1
            longest_winless_streak = max(longest_winless_streak, current_winless_streak)

            if diff < 0:
                loss_diff = them - us  # lost 1-3 -> 2
                if loss_diff > best_loss_diff:
                    best_loss_diff = loss_diff
                    best_loss_match_id = match_id

    return {
        "clean_sheets": clean_sheets,
        "biggest_win_match_id": best_win_match_id,
        "biggest_loss_match_id": best_loss_match_id,
        "longest_win_streak": longest_win_streak,
        "longest_winless_streak": longest_winless_streak,
    }


def save_aggregates(cursor, season_id, club_id, aggregates):
    cursor.execute(
        "INSERT OR IGNORE INTO club_season_stats (season_id, club_id) VALUES (?, ?)",
        (season_id, club_id),
    )

    # Only this script's 5 columns
    cursor.execute(
        """UPDATE club_season_stats
           SET clean_sheets = ?,
               biggest_win_match_id = ?,
               biggest_loss_match_id = ?,
               longest_win_streak = ?,
               longest_winless_streak = ?
           WHERE season_id = ? AND club_id = ?""",
        (
            aggregates["clean_sheets"],
            aggregates["biggest_win_match_id"],
            aggregates["biggest_loss_match_id"],
            aggregates["longest_win_streak"],
            aggregates["longest_winless_streak"],
            season_id,
            club_id,
        ),
    )


def main():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    seasons = get_all_seasons(cursor)
    print(f"Found {len(seasons)} season(s) to process.")

    for season_id in seasons:
        club_ids = get_clubs_in_season(cursor, season_id)
        print(f"\nSeason {season_id}: {len(club_ids)} clubs")

        for club_id in club_ids:
            matches = get_club_matches(cursor, season_id, club_id)
            aggregates = calculate_club_aggregates(club_id, matches)
            save_aggregates(cursor, season_id, club_id, aggregates)

        # Commit per season so an interrupted run keeps its progress
        connection.commit()
        print(f"  Saved aggregates for {len(club_ids)} clubs.")

    connection.close()
    print(f"\nDone. Processed {len(seasons)} season(s).")


if __name__ == "__main__":
    main()
