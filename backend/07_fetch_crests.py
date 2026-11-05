"""
07_fetch_crests.py

Downloads each club's SVG crest from footylogos.com into
frontend/public/crests/ and sets clubs.crest_url to it
(e.g. "/crests/arsenal.svg"). Clubs missing from CLUB_CRESTS keep their
crest_url and are listed at the end.

Safe to re-run: only crests not already in the folder are downloaded, so
I swap a crest by hand by replacing its file. Re-run after
01_create_database.py.
"""

import os
import re
import time
import sqlite3
import requests

from common.club_crests import CLUB_CRESTS
from common.db import DB_FILE


# Served at the site root, e.g. /crests/arsenal.svg
CRESTS_DIR = os.path.join("..", "frontend", "public", "crests")
CRESTS_URL_PATH = "/crests"

# The site drops connections if hit too quickly
SECONDS_BETWEEN_REQUESTS = 1

HEADERS = {"User-Agent": "Mozilla/5.0"}


def crest_file(slug):
    return os.path.join(CRESTS_DIR, f"{slug}.svg")


def ensure_viewbox(svg):
    # Without a viewBox the browser crops the crest instead of scaling it
    tag_end = svg.index(">", svg.index("<svg"))
    tag = svg[svg.index("<svg"):tag_end]

    if "viewBox" in tag:
        return svg

    width = re.search(r'\swidth="([\d.]+)', tag)
    height = re.search(r'\sheight="([\d.]+)', tag)
    if not width or not height:
        return svg

    viewbox = f' viewBox="0 0 {width.group(1)} {height.group(1)}"'
    return svg[:tag_end] + viewbox + svg[tag_end:]


def download_crest(slug):
    # The crest is at one of two paths, depending on the club
    urls = [
        f"https://assets.footylogos.com/logos/{slug}/{slug}-logo-footylogos.svg",
        f"https://assets.footylogos.com/logos/{slug}-logo-footylogos.svg",
    ]

    for url in urls:
        response = requests.get(url, headers=HEADERS, timeout=30)
        time.sleep(SECONDS_BETWEEN_REQUESTS)

        # A missing file comes back as an HTML page
        if response.status_code == 200 and "<svg" in response.text[:1000]:
            return ensure_viewbox(response.text)

    raise Exception(
        f'No crest found on footylogos for "{slug}". Check the name at '
        f"https://www.footylogos.com/logos/{slug}"
    )


def get_all_clubs(cursor):
    cursor.execute("SELECT club_id, name FROM clubs ORDER BY name")
    return cursor.fetchall()


def main():
    os.makedirs(CRESTS_DIR, exist_ok=True)

    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    clubs = get_all_clubs(cursor)
    downloaded = 0
    missing = []

    for i, (club_id, name) in enumerate(clubs, start=1):
        slug = CLUB_CRESTS.get(club_id)

        if slug is None:
            missing.append(name)
            continue

        # Only download crests we don't have yet
        if not os.path.exists(crest_file(slug)):
            print(f"[{i}/{len(clubs)}] Downloading {name} ({slug})")
            svg = download_crest(slug)
            with open(crest_file(slug), "w", encoding="utf-8") as f:
                f.write(svg)
            downloaded += 1

        cursor.execute(
            "UPDATE clubs SET crest_url = ? WHERE club_id = ?",
            (f"{CRESTS_URL_PATH}/{slug}.svg", club_id),
        )

    connection.commit()
    connection.close()

    print(
        f"\nDone. Downloaded {downloaded} new crests and set crest_url for "
        f"{len(clubs) - len(missing)} of {len(clubs)} clubs."
    )

    if missing:
        print(
            "These clubs aren't in CLUB_CRESTS and keep their current "
            "crest_url (football-data.org's, or none for clubs added by 04, "
            "which the frontend shows as a shield):"
        )
        for name in missing:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
