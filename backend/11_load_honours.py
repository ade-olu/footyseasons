"""
11_load_honours.py

Loads every club's trophy wins (league titles and cups, all-time) from the
hand-kept honours.csv into club_honours. honours.csv has one row per win,
built from Wikipedia's winner lists and checked against official counts;
only clubs in football.db are in it.

Safe to re-run: the table is rebuilt from the CSV each time. Needs the clubs
and their display names (run 04 and 06 first); makes no web requests.
"""

import csv
import re
import sqlite3

from common.db import DB_FILE


HONOURS_FILE = "honours.csv"

# Every competition the file may name (the app shows them in this order)
COMPETITIONS = [
    "premier_league",
    "la_liga",
    "serie_a",
    "bundesliga",
    "ligue_1",
    "fa_cup",
    "efl_cup",
    "community_shield",
    "copa_del_rey",
    "supercopa",
    "coppa_italia",
    "supercoppa",
    "dfb_pokal",
    "dfl_supercup",
    "dfb_ligapokal",
    "coupe_de_france",
    "coupe_de_la_ligue",
    "trophee_des_champions",
    "champions_league",
    "europa_league",
    "conference_league",
    "cup_winners_cup",
    "uefa_super_cup",
    "club_world_cup",
    "intercontinental_cup",
]


def main():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    # Display name -> club_id, the names the file uses
    cursor.execute("SELECT club_id, COALESCE(display_name, name) FROM clubs")
    clubs = {name: club_id for club_id, name in cursor.fetchall()}

    rows = []
    with open(HONOURS_FILE, newline="", encoding="utf-8") as file:
        for line, row in enumerate(csv.DictReader(file), start=2):
            if row["competition"] not in COMPETITIONS:
                raise ValueError(
                    f"{HONOURS_FILE}:{line}: unknown competition {row['competition']!r}"
                )
            match = re.fullmatch(r"(\d{4})/\d{2}", row["season"])
            if match is None:
                raise ValueError(
                    f"{HONOURS_FILE}:{line}: season must look like 2025/26, got {row['season']!r}"
                )
            if row["club"] not in clubs:
                raise ValueError(
                    f"{HONOURS_FILE}:{line}: no club named {row['club']!r} in the database"
                )
            rows.append(
                (row["competition"], int(match.group(1)), clubs[row["club"]])
            )

    cursor.execute("DELETE FROM club_honours")
    cursor.executemany(
        "INSERT INTO club_honours (competition, start_year, club_id) VALUES (?, ?, ?)",
        rows,
    )
    connection.commit()

    cursor.execute("SELECT COUNT(DISTINCT club_id) FROM club_honours")
    print(f"Loaded {len(rows)} wins for {cursor.fetchone()[0]} clubs")
    connection.close()


if __name__ == "__main__":
    main()
