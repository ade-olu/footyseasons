"""
08_fetch_crests.py

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


DB_FILE = "football.db"

# Served at the site root, e.g. /crests/arsenal.svg
CRESTS_DIR = os.path.join("..", "frontend", "public", "crests")
CRESTS_URL_PATH = "/crests"

# club_id -> footylogos name (footylogos.com/logos/<name>); not predictable,
# so look new clubs up on the site
CLUB_CRESTS = {
    # Premier League
    1044: "afc-bournemouth",             # AFC Bournemouth
    57: "arsenal",                       # Arsenal FC
    58: "aston-villa",                   # Aston Villa FC
    402: "brentford",                    # Brentford FC
    397: "brighton-and-hove-albion",     # Brighton & Hove Albion FC
    328: "burnley",                      # Burnley FC
    61: "chelsea",                       # Chelsea FC
    354: "crystal-palace",               # Crystal Palace FC
    62: "everton",                       # Everton FC
    63: "fulham",                        # Fulham FC
    349: "ipswich-town",                 # Ipswich Town FC
    341: "leeds-united",                 # Leeds United FC
    338: "leicester",                    # Leicester City FC
    64: "liverpool-fc",                  # Liverpool FC
    389: "luton-town",                   # Luton Town FC
    65: "manchester-city",               # Manchester City FC
    66: "manchester-united",             # Manchester United FC
    67: "newcastle-united",              # Newcastle United FC
    351: "nottingham-forest",            # Nottingham Forest FC
    356: "sheffield-united",             # Sheffield United FC
    340: "southampton",                  # Southampton FC
    71: "sunderland",                    # Sunderland AFC
    73: "tottenham-hotspur",             # Tottenham Hotspur FC
    563: "west-ham-united",              # West Ham United FC
    76: "wolverhampton-wanderers",       # Wolverhampton Wanderers FC
    # La Liga
    77: "athletic-club-bilbao",          # Athletic Club
    79: "osasuna",                       # CA Osasuna
    745: "cd-leganes",                   # CD Leganés
    78: "atletico-madrid",               # Club Atlético de Madrid
    264: "cadiz-cf",                     # Cádiz CF
    263: "deportivo-alaves",             # Deportivo Alavés
    285: "elche-cf",                     # Elche CF
    81: "fc-barcelona",                  # FC Barcelona
    82: "getafe-cf",                     # Getafe CF
    298: "girona-fc",                    # Girona FC
    83: "granada",                       # Granada CF
    88: "levante-ud",                    # Levante UD
    558: "celta-vigo",                   # RC Celta de Vigo
    80: "rcd-espanyol-barcelona",        # RCD Espanyol de Barcelona
    89: "rcd-mallorca",                  # RCD Mallorca
    87: "rayo-vallecano",                # Rayo Vallecano de Madrid
    90: "real-betis-balompie",           # Real Betis Balompié
    86: "real-madrid",                   # Real Madrid CF
    1048: "real-oviedo",                 # Real Oviedo
    92: "real-sociedad",                 # Real Sociedad de Fútbol
    250: "real-valladolid",              # Real Valladolid CF
    559: "sevilla-fc",                   # Sevilla FC
    267: "ud-almeria",                   # UD Almería
    275: "las-palmas",                   # UD Las Palmas
    95: "valencia-cf",                   # Valencia CF
    94: "villarreal-cf",                 # Villarreal CF
    # Serie A
    98: "ac-milan",                      # AC Milan
    5911: "ac-monza",                    # AC Monza
    487: "pisa",                         # AC Pisa 1909
    99: "fiorentina",                    # ACF Fiorentina
    100: "roma",                         # AS Roma
    102: "atalanta",                     # Atalanta BC
    103: "bologna",                      # Bologna FC 1909
    104: "cagliari",                     # Cagliari Calcio
    7397: "como-1907",                   # Como 1907
    445: "empoli-fc",                    # Empoli FC
    108: "inter-milan",                  # FC Internazionale Milano
    470: "frosinone-calcio",             # Frosinone Calcio
    107: "genoa",                        # Genoa CFC
    450: "hellas-verona",                # Hellas Verona FC
    109: "juventus",                     # Juventus FC
    112: "parma",                        # Parma Calcio 1913
    110: "lazio",                        # SS Lazio
    113: "napoli",                       # SSC Napoli
    586: "torino",                       # Torino FC
    457: "cremonese",                    # US Cremonese
    5890: "lecce",                       # US Lecce
    455: "us-salernitana-1919",          # US Salernitana 1919
    471: "sassuolo",                     # US Sassuolo Calcio
    115: "udinese",                      # Udinese Calcio
    454: "venezia-fc",                   # Venezia FC
    # Bundesliga
    44: "fc-heidenheim",                 # 1. FC Heidenheim 1846
    1: "1-fc-koln",                      # 1. FC Köln
    28: "union-berlin",                  # 1. FC Union Berlin
    15: "mainz-05",                      # 1. FSV Mainz 05
    3: "bayer-leverkusen",               # Bayer 04 Leverkusen
    4: "borussia-dortmund",              # Borussia Dortmund
    18: "borussia-monchengladbach",      # Borussia Mönchengladbach
    19: "eintracht-frankfurt",           # Eintracht Frankfurt
    16: "fc-augsburg",                   # FC Augsburg
    5: "bayern-munich",                  # FC Bayern München
    20: "fc-st-pauli",                   # FC St. Pauli 1910
    7: "hamburger-sv",                   # Hamburger SV
    720: "holstein-kiel",                # Holstein Kiel
    721: "rb-leipzig",                   # RB Leipzig
    17: "sc-freiburg",                   # SC Freiburg
    55: "sv-darmstadt-98",               # SV Darmstadt 98
    12: "werder-bremen",                 # SV Werder Bremen
    2: "tsg-hoffenheim",                 # TSG 1899 Hoffenheim
    10: "vfb-stuttgart",                 # VfB Stuttgart
    36: "vfl-bochum",                    # VfL Bochum 1848
    11: "vfl-wolfsburg",                 # VfL Wolfsburg
    # Ligue 1
    519: "aj-auxerre",                   # AJ Auxerre
    548: "as-monaco",                    # AS Monaco FC
    527: "as-saint-etienne",             # AS Saint-Étienne
    532: "angers-sco",                   # Angers SCO
    541: "clermont-foot",                # Clermont Foot 63
    525: "fc-lorient",                   # FC Lorient
    545: "fc-metz",                      # FC Metz
    543: "fc-nantes",                    # FC Nantes
    533: "le-havre-ac",                  # Le Havre AC
    521: "losc-lille",                   # Lille OSC
    518: "montpellier",                  # Montpellier HSC
    522: "ogc-nice",                     # OGC Nice
    523: "olympique-lyonnais",           # Olympique Lyonnais
    516: "olympique-de-marseille-om",    # Olympique de Marseille
    1045: "paris-fc",                    # Paris FC
    524: "paris-saint-germain-psg",      # Paris Saint-Germain FC
    576: "rc-strasbourg-alsace",         # RC Strasbourg Alsace
    546: "rc-lens",                      # Racing Club de Lens
    512: "stade-brestois-29",            # Stade Brestois 29
    529: "stade-rennais",                # Stade Rennais FC 1901
    547: "stade-de-reims",               # Stade de Reims
    511: "toulouse-fc",                  # Toulouse FC

    # Pre-2023 clubs (negative ids, added by 05)
    # Premier League
    -227: "cardiff-city",                # Cardiff City FC
    -219: "huddersfield-town",           # Huddersfield Town AFC
    -91: "hull-city",                    # Hull City AFC
    -93: "middlesbrough",                # Middlesbrough FC
    -79: "norwich-city",                 # Norwich City FC
    -202: "queens-park-rangers",         # Queens Park Rangers FC
    -85: "stoke-city",                   # Stoke City FC
    -84: "swansea-city",                 # Swansea City AFC
    -90: "watford",                      # Watford FC
    -76: "west-bromwich-albion",         # West Bromwich Albion FC
    # La Liga
    -206: "cordoba",                     # Córdoba CF
    -139: "deportivo-la-coruna",         # RC Deportivo La Coruña
    -156: "sd-eibar",                    # SD Eibar
    -137: "malaga-cf",                   # Málaga CF
    -232: "sd-huesca",                   # SD Huesca
    -149: "sporting-gijon",              # Real Sporting de Gijón
    # Serie A
    -222: "benevento",                   # Benevento Calcio
    -242: "brescia",                     # Brescia Calcio
    -103: "ac-carpi",                    # Carpi FC 1909
    -203: "cesena-fc",                   # AC Cesena
    -109: "chievo",                      # AC Chievo Verona
    -115: "fc-crotone",                  # FC Crotone
    -100: "palermo-fc",                  # US Città di Palermo
    -114: "pescara-calcio",              # Delfino Pescara 1936
    -221: "spal",                        # SPAL
    -102: "uc-sampdoria",                # UC Sampdoria
    -260: "spezia",                      # Spezia Calcio
    # Bundesliga
    -262: "arminia-bielefeld",           # DSC Arminia Bielefeld
    -233: "fortuna-dusseldorf",          # Fortuna Düsseldorf
    -267: "spvgg-greuther-furth",        # SpVgg Greuther Fürth
    -128: "hannover-96",                 # Hannover 96
    -122: "hertha-bsc",                  # Hertha BSC
    -126: "fc-ingolstadt",               # FC Ingolstadt 04
    -234: "fc-nurnberg",                 # 1. FC Nürnberg
    -205: "sc-paderborn-07",             # SC Paderborn 07
    -124: "schalke-04",                  # FC Schalke 04
    # Ligue 1
    -274: "ac-ajaccio",                  # AC Ajaccio
    -224: "amiens-sc",                   # Amiens SC
    -176: "bordeaux",                    # FC Girondins de Bordeaux
    -165: "sm-caen",                     # Stade Malherbe Caen
    -181: "dijon-fco",                   # Dijon FCO
    -173: "gazelec-ajaccio",             # GFC Ajaccio
    -169: "ea-guingamp",                 # En Avant Guingamp
    -182: "nancy-lorraine",              # AS Nancy-Lorraine
    -235: "nimes-olympique",             # Nîmes Olympique
    -162: "sc-bastia",                   # SC Bastia
    # Not on footylogos: added by hand from football-logos.cc
    -209: "evian-thonon-gaillard",       # Évian Thonon Gaillard FC
    # Swapped by hand for Wikipedia's 12 KB SVG (footylogos' is 2 MB)
    -172: "troyes",                      # ES Troyes AC
}

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
            "crest_url (football-data.org's, or none for clubs added by 05, "
            "which the frontend shows as a shield):"
        )
        for name in missing:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
