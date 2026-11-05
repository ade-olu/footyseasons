"""
09_fetch_player_profiles.py

Matches Understat players to FotMob (photo) and Transfermarkt (date of
birth and main position, from the CC0 transfermarkt-datasets export) and
saves them in player_profiles. Photos are loaded from FotMob's image server.

Safe to re-run: the table is rebuilt each time. I cache downloads in
cache/; delete it to refetch everything. Run 06_fetch_understat.py first.
"""

import csv
import gzip
import json
import os
import re
import sqlite3
import time
import unicodedata
from collections import Counter, defaultdict
import requests

from common.fotmob import (
    FOTMOB_URL,
    SECONDS_BETWEEN_REQUESTS,
    fetch,
    fetch_league_season,
)
from common.leagues import LATEST_SEASON, LEAGUES


DB_FILE = "football.db"
CACHE_DIR = "cache"
TRANSFERMARKT_URL = "https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data"
PHOTO_URL = "https://images.fotmob.com/image_resources/playerimages/{}.png"

# FotMob has no player stats before 2016/17
FOTMOB_FIRST_SEASON = 2016

# Names that don't match: understat_player_id -> Transfermarkt player_id
TRANSFERMARKT_IDS = {
    965: 15799,  # Santiago Cazorla -> Santi Cazorla
    1521: 244275,  # Gabriel -> Gabriel Barbosa
    2034: 2904,  # Rafael Márquez -> Rafa Márquez
    4428: 85928,  # Daniel Lafferty -> Danny Lafferty
    5114: 139434,  # Raúl García -> Raúl Carnero
    5195: 345473,  # Nicolás Schiappacase -> Nicolás Schiappacasse
    6120: 207834,  # Bono -> Yassine Bounou
    6434: 354361,  # Franck Zambo -> Frank Anguissa
    6495: 299715,  # Koke -> Koke Vegas
    6879: 495669,  # Mohamed Lamine Diaby -> Lamine Diaby-Fadiga
    7784: 381724,  # Joao Victor -> Victor Sá
    7947: 207877,  # Ruslan Malinovskiy -> Ruslan Malinovskyi
    7981: 538996,  # Nianzou Kouassi -> Tanguy Nianzou
    7983: 346482,  # Daniel N'Lundulu -> Dan Nlundulu
    8094: 607223,  # Mathis Cherki -> Rayan Cherki
    8271: 627294,  # Fernando Niño -> Fer Niño
    10981: 895480,  # Malcom Adu -> Adu Ares
    11866: 193082,  # Álex Grimaldo -> Alejandro Grimaldo
    12030: 523318,  # Tasos Douvikas -> Anastasios Douvikas
    13787: 638124,  # Manuel Fernández -> Manu Fernández
}

# Transfermarkt's position groups -> the app's codes
POSITIONS = {"Attack": "FW", "Midfield": "MF", "Defender": "DF", "Goalkeeper": "GK"}

# Players whose Transfermarkt position (their current one) is wrong for their
# Understat years: understat_player_id -> FW, MF, DF or GK
POSITION_OVERRIDES = {}

# Names that don't match, or namesakes mixed up: understat_player_id -> FotMob player id
FOTMOB_IDS = {
    15: 51841,  # Júnior Díaz (Darmstadt)
    50: 49885,  # Gonzalo Jara (Mainz 05)
    61: 132843,  # Geoffroy Serey Dié -> Serey Dié
    77: 309496,  # Jin-Su Kim -> Kim Jin-Su
    123: 36180,  # Assani Lukimya -> Assani Lukimya-Mulongoti
    284: 106309,  # Carlos Zambrano (Eintracht Frankfurt)
    401: 114044,  # Álvaro Domínguez (Borussia Mönchengladbach)
    471: 23895,  # Shaun MacDonald (AFC Bournemouth)
    562: 718876,  # James Weir (Manchester United)
    578: 165773,  # Juan Carlos Paredes -> Juan Paredes
    796: 24393,  # Gary O'Neil (Norwich City)
    869: 170429,  # Dionatan Teixeira -> Dionatan do Nascimento Teixeira
    932: 38759,  # Danny Graham (Sunderland)
    937: 299258,  # João Teixeira (Liverpool)
    1004: 30630,  # Joe Cole (Aston Villa)
    1043: 729449,  # Callum Connolly (Everton)
    1060: 281480,  # Jonathan Williams (Crystal Palace)
    1521: 450848,  # Gabriel -> Gabriel Barbosa
    1815: 26564,  # Alex (Milan)
    1824: 34305,  # Maicon (Roma)
    1885: 134236,  # Tino Costa -> Alberto Costa
    1907: 212767,  # Jerry Mbakogu -> Jerry Uche Mbakogu
    1914: 741141,  # Aaron Mattia Tabacchi -> Aaron Tabacchi
    1937: 175646,  # Fernando (Sampdoria)
    1946: 671621,  # Pepín -> José Machín
    1967: 387499,  # Gilberto (Fiorentina)
    1985: 68436,  # Marcelo Estigarribia (Atalanta)
    2025: 41629,  # Matuzalém -> Francelino Matuzalem
    2034: 30740,  # Rafael Márquez (Hellas Verona)
    2061: 97498,  # Beto (Sevilla)
    2067: 561433,  # Juan Muñoz (Sevilla)
    2076: 150080,  # Miguel Lopes (Granada)
    2078: 30914,  # Ricardo Costa (Granada)
    2119: 314947,  # Rober Correa -> Roberto Correa
    2139: 33959,  # Ion Ansotegi -> Ion Ansotegui
    2140: 242151,  # Borja Ekiza -> Ekiza
    2161: 406257,  # Nacho (Valladolid) -> Nacho Martínez
    2171: 111975,  # Manucho (Rayo Vallecano)
    2173: 710807,  # Joni Montiel -> Jonathan Montiel
    2177: 30276,  # David Navarro (Levante)
    2178: 37484,  # Juanfran (Levante)
    2205: 37449,  # Juan Rodríguez (Getafe)
    2312: 96651,  # Manu -> Manu Fernandez
    2327: 495107,  # Jonathan Rodríguez (Deportivo A Coruña)
    2343: 573463,  # Juanpi -> Juan Añor
    2448: 39719,  # Juan Vargas (Real Betis)
    2450: 389202,  # Wanderson (Getafe)
    2459: 282687,  # Álex Barrera (Sporting Gijón)
    2469: 674492,  # Matos -> José Matos
    2472: 529285,  # Bernard Mensah (Getafe)
    2529: 574905,  # Borja Fernández (Celta Vigo)
    2546: 189178,  # Juan Domínguez (Deportivo A Coruña)
    2558: 256727,  # Lass -> Alhassane Bangoura
    2579: 362194,  # Nicolás López (Granada)
    2583: 673749,  # Miguel Cardoso (Deportivo A Coruña)
    2729: 20396,  # Felipe Santana (Schalke 04)
    3249: 26402,  # Mohamed Fofana (Reims)
    3368: 213319,  # Junior Tallo -> Tallo
    3382: 103485,  # Jules Goda -> Jules Stephane Goda
    3392: 346004,  # Lucas Silva (Marseille)
    3407: 263276,  # Adryan (Nantes)
    3418: 30911,  # Ricardo Carvalho (Monaco)
    3452: 158845,  # Pape Paye -> Pape Abdou Paye
    3465: 34417,  # Alain Traoré -> Alain Sibiri Traoré
    3499: 277384,  # Gael Angoula (Angers)
    3610: 354482,  # Mory Kone -> Mory Koné
    3774: 560942,  # Alexis Araujo -> Alexis Araújo
    3813: 356378,  # Luka Djordjevic (Sampdoria)
    3822: 185925,  # Luis Pedro Cavanda -> Luis Cavanda
    3823: 39334,  # Cristian Ledesma (Lazio)
    3860: 128047,  # Zé Eduardo (Cesena)
    3865: 11560,  # Davide Succi (Cesena)
    3869: 161662,  # Dejan Lazarevic -> Dejan Lazarević
    3870: 30865,  # Nemanja Vidic -> Nemanja Vidić
    3871: 32118,  # Lukas Podolski (Arsenal)
    3882: 409812,  # Isaac Donkor (Inter)
    3897: 19285,  # Rafael Marques (Hellas Verona)
    3901: 33422,  # Guillermo Rodríguez (Hellas Verona)
    3914: 168569,  # Alejandro González (Cagliari)
    3932: 173609,  # Ivan Martic (Hellas Verona)
    3937: 24405,  # Daniele Conti (Cagliari)
    4001: 268261,  # Stefan Ristovski (Parma)
    4016: 128360,  # Edimar (Córdoba)
    4022: 94044,  # Granddi N'Goyi -> Granddi Ngoyi
    4039: 205034,  # Álex López (Celta Vigo)
    4047: 202220,  # Wellington -> Wellington Silva
    4071: 213812,  # Íñigo López (Córdoba)
    4072: 309537,  # Deivid (Córdoba)
    4079: 179404,  # Patrick Ekeng -> Patrick Ekeng Ekeng
    4081: 251256,  # Javier Espinosa -> Espinosa González
    4093: 39854,  # Xavi -> Xavi Hernández
    4121: 113695,  # Cristian Álvarez (Rayo Vallecano)
    4135: 183498,  # Javi Lara (Eibar)
    4148: 115798,  # Babá -> Papa Baba Diawara
    4156: 211118,  # Rafael Martins (Levante)
    4159: 282460,  # Guillermo -> Guillermo Fernández
    4211: 183346,  # Víctor Pérez (Levante)
    4325: 25990,  # João Pereira (Hannover 96)
    4356: 178774,  # Julian Koch (Mainz 05)
    4362: 354495,  # Junior Malanda -> Junior Malanda-Adje
    4390: 36374,  # Robert Green (Queens Park Rangers)
    4404: 24890,  # Ryan Taylor (Newcastle United)
    4411: 35480,  # Alex Bruce (Hull City)
    4428: 193501,  # Daniel Lafferty (Burnley)
    4492: 37475,  # José Enrique (Liverpool)
    4495: 210804,  # Liam Moore (Leicester City)
    4704: 25657,  # Ismael Bangoura -> Ismaël Bangoura
    4711: 35121,  # Jesper Juelsgaard -> Jesper Juelsgård
    4724: 31014,  # Romaric (SC Bastia)
    4753: 174062,  # Carlos Eduardo -> Eduardo
    4820: 116253,  # Juan Manuel Falcón -> Juan Falcón
    4834: 609735,  # Malick Seck -> Elhadji Malick Seck
    4889: 202443,  # Vincent Aboubakar (Lorient)
    4892: 149583,  # Lucas Mendes (Marseille)
    5114: 195698,  # Raúl García -> Raúl Carnero
    5195: 643161,  # Nicolás Schiappacase -> Nicolás Schiappacasse
    5821: 192504,  # Alexander Merkel (Udinese)
    6305: 882349,  # Ismail Aaneb -> Ismaël Aaneba
    6434: 612863,  # Franck Zambo -> Frank Anguissa
    6495: 785824,  # Koke -> Koke Vegas
    6879: 906950,  # Mohamed Lamine Diaby -> Lamine Diaby-Fadiga
    7265: 980793,  # Kephren Thuram -> Khéphren Thuram-Ulien
    7784: 660846,  # Joao Victor -> Victor Sá
    7947: 459658,  # Ruslan Malinovskiy -> Ruslan Malinovsky
    7981: 1070617,  # Nianzou Kouassi -> Tanguy Nianzou
    7983: 789599,  # Daniel N'Lundulu -> Dan Nlundulu
    8151: 1078166,  # Hianga'a M'Bock -> Hiang'a Mbock
    8271: 1127224,  # Fernando Niño -> Fer Niño
    8410: 1158514,  # Rodrigo Sánchez -> Rodri
    8807: 959404,  # Silas Wamangituka -> Silas Katompa Mvumpa
    9704: 181877,  # Vasilios Lampropoulos -> Vassilios Lambropoulos
    10576: 1190025,  # Álvaro Fernández -> Alvaro Carreras
    10981: 1331037,  # Malcom Adu -> Adu Ares
    11249: 1428550,  # Ousmane Camara -> Ousmane Nana Camara
    11537: 1470001,  # Santiago García -> Santi García
    11831: 1414859,  # Samu Omorodion -> Samuel Aghehowa
    13271: 1553774,  # Adrián Arnu -> Adrián Arnuncio
    13294: 1678830,  # García Pascual -> Álvaro Pascual
}

# Namesakes wrongly matched, with no FotMob page found: these show initials
NOT_ON_FOTMOB = {
    2350,  # Cifuentes (Elche)
    2451,  # Miguel Ángel (Getafe)
    3776,  # Diego Gomez (Angers)
    3825,  # Álvaro González (Lazio)
    3895,  # Fernandinho (Hellas Verona)
    3988,  # Nenê (Hellas Verona)
    4106,  # Roberto (Granada)
    4117,  # José Ángel (Elche)
    4143,  # Samu (Elche)
    4197,  # Sergio García (Córdoba)
    4215,  # José Carlos (Córdoba)
    4435,  # Nenê (West Ham United)
}

# Names FotMob gets wrong: understat_player_id -> name to show
DISPLAY_NAMES = {
    281: "Lukáš Hrádecký",
    453: "Son Heung-min",
    491: "Petr Čech",
    723: "Ki Sung-yueng",
    813: "Salomón Rondón",
    1246: "Kostas Manolas",
    1257: "Alisson",
    1505: "Samir Handanović",
    1534: "Giancarlo González",
    1663: "Jóhann Berg Gudmundsson",
    1720: "Didier Ndong",
    1741: "Zlatan Ibrahimović",
    2090: "Marc-André ter Stegen",
    2197: "Pedro León",
    2233: "Xabi Prieto",
    2266: "Saúl Ñíguez",
    2303: "Samu Castillejo",
    2385: "Mat Ryan",
    2392: "Gorka Iraizoz",
    2397: "Beñat",
    3294: "Edinson Cavani",
    3416: "Danijel Subašić",
    3526: "Ronny Rodelin",
    3600: "Serge Aurier",
    3848: "Carlos Tevez",
    4070: "Borja García",
    4136: "Ángel Rodríguez",
    5043: "Kiko Femenía",
    5136: "Pervis Estupiñán",
    5622: "Júlio Tavares",
    5706: "Dodi Lukebakio",
    5769: "Habib Diallo",
    5803: "Fodé Ballo-Touré",
    6082: "Jiří Pavlenka",
    6292: "Tomáš Koubek",
    6630: "Joe Willock",
    6766: "Dani Vivian",
    6986: "Hamed Traorè",
    7265: "Khéphren Thuram",
    7313: "Lee Kang-in",
    7382: "Dan Burn",
    7700: "Che Adams",
    7810: "Ruben Vargas",
    7829: "Éder Militão",
    7947: "Ruslan Malinovskyi",
    8056: "Arnaud Kalimuendo",
    8288: "Tomáš Souček",
    8665: "Loïc Badé",
    8777: "Vitinha",
    8807: "Silas",
    9674: "Joe Scally",
    9755: "Íñigo Ruiz de Galarreta",
    10974: "Samú Costa",
    11486: "Illia Zabarnyi",
}

# Letters that don't split into a plain letter + accent
EXTRA_LETTERS = str.maketrans(
    {"ø": "o", "Ø": "O", "ı": "i", "ł": "l", "Ł": "L", "ß": "ss", "æ": "ae", "đ": "d"}
)


def name_words(name):
    plain = unicodedata.normalize("NFKD", name.translate(EXTRA_LETTERS))
    plain = plain.encode("ascii", "ignore").decode().lower()
    return tuple(re.findall(r"[a-z0-9]+", plain))


def find_candidates(name, candidates):
    words = name_words(name)
    exact = [pid for pid, other in candidates.items() if name_words(other) == words]
    if exact:
        return exact

    words = set(words)
    return [
        pid
        for pid, other in candidates.items()
        if words <= set(name_words(other)) or set(name_words(other)) <= words
    ]


def index_names(names):
    by_name = defaultdict(set)
    for pid, name in names.items():
        by_name[name_words(name)].add(pid)
    return by_name


def unique(ids):
    return next(iter(ids)) if len(ids) == 1 else None


def match_players(understat_players, season_players, by_name):
    matches = defaultdict(Counter)
    unmatched = []
    club_votes = Counter()

    # Ids already matched per league-season, so a fallback can't reuse them
    taken = defaultdict(set)

    for key, players in understat_players.items():
        candidates = {pid: name for pid, (name, _) in season_players[key].items()}
        for understat_id, name, clubs in players:
            found = find_candidates(name, candidates)
            if len(found) == 1:
                matches[understat_id][found[0]] += 1
                taken[key].add(found[0])
                other_clubs = season_players[key][found[0]][1]
                if len(clubs) == 1 and len(other_clubs) == 1:
                    club_votes[(next(iter(clubs)), next(iter(other_clubs)))] += 1
            else:
                unmatched.append((key, understat_id, name, clubs))

    club_map = {}
    for (club, other_club), votes in club_votes.most_common():
        club_map.setdefault(club, other_club)

    # Retry within the player's club, then by a name unique in the source
    retries = []
    for key, understat_id, name, clubs in unmatched:
        other_clubs = {club_map.get(club) for club in clubs}
        club_candidates = {
            pid: other_name
            for pid, (other_name, played_for) in season_players[key].items()
            if played_for & other_clubs
        }
        found = find_candidates(name, club_candidates)
        pid = found[0] if len(found) == 1 else unique(by_name.get(name_words(name), ()))
        if pid:
            matches[understat_id][pid] += 1
            taken[key].add(pid)
        else:
            retries.append((key, understat_id, name, club_candidates))

    # Then the one unclaimed clubmate with the same surname ("Dan Burn" and
    # "Daniel Burn"), or else the same first name ("Evan Ndicka", "Evan N'Dicka")
    misses = []
    for key, understat_id, name, club_candidates in retries:
        words = name_words(name)
        free = {
            pid: name_words(other_name)
            for pid, other_name in club_candidates.items()
            if pid not in taken[key]
        }
        pid = None
        for index in (-1, 0):
            pid = pid or unique(
                {
                    p
                    for p, other in free.items()
                    if words and other and other[index] == words[index]
                }
            )
        if pid:
            matches[understat_id][pid] += 1
            taken[key].add(pid)
        else:
            misses.append((understat_id, name))

    return matches, misses


def best_ids(matches):
    # Most common id if seasons disagree
    return {uid: ids.most_common(1)[0][0] for uid, ids in matches.items()}


def read_transfermarkt(table):
    path = os.path.join(CACHE_DIR, "transfermarkt", f"{table}.csv.gz")
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print(f"Downloading {table}.csv.gz...")
        response = requests.get(f"{TRANSFERMARKT_URL}/{table}.csv.gz", timeout=300)
        response.raise_for_status()
        with open(path, "wb") as file:
            file.write(response.content)

    with gzip.open(path, "rt", encoding="utf-8") as file:
        yield from csv.DictReader(file)


def load_transfermarkt():
    competitions = {league["transfermarkt"]: league["code"] for league in LEAGUES}
    games = {
        game["game_id"]: (competitions[game["competition_id"]], int(game["season"]))
        for game in read_transfermarkt("games")
        if game["competition_id"] in competitions
    }

    season_players = defaultdict(dict)
    for appearance in read_transfermarkt("appearances"):
        key = games.get(appearance["game_id"])
        if key:
            name, clubs = season_players[key].setdefault(
                int(appearance["player_id"]), (appearance["player_name"], set())
            )
            clubs.add(appearance["player_club_id"])

    players = {int(p["player_id"]): p for p in read_transfermarkt("players")}
    return season_players, players


def fotmob_get(url, params=None):
    time.sleep(SECONDS_BETWEEN_REQUESTS)
    return fetch(url, params)


def load_fotmob_season(league, year):
    # The latest season is always refetched
    code = league["code"]
    path = os.path.join(CACHE_DIR, "fotmob", f"{code}-{year}.json")
    if os.path.exists(path) and year != LATEST_SEASON:
        with open(path, encoding="utf-8") as file:
            return json.load(file)

    print(f"  FotMob {code} {year}")
    time.sleep(SECONDS_BETWEEN_REQUESTS)
    league_page = fetch_league_season(league, year)
    url = next(
        stat["fetchAllUrl"]
        for stat in league_page["stats"]["players"]
        if stat["fetchAllUrl"].endswith("/mins_played.json")
    )
    players = [
        # "ParticiantId" is FotMob's spelling
        {"id": p["ParticiantId"], "name": p["ParticipantName"], "teamId": p["TeamId"]}
        for p in fotmob_get(url)["TopLists"][0]["StatList"]
    ]

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(players, file)
    return players


def load_fotmob():
    season_players = defaultdict(dict)
    for year in range(FOTMOB_FIRST_SEASON, LATEST_SEASON + 1):
        for league in LEAGUES:
            for p in load_fotmob_season(league, year):
                name, teams = season_players[(league["code"], year)].setdefault(
                    p["id"], (p["name"], set())
                )
                teams.add(p["teamId"])
    return season_players


def search_fotmob(name, cache):
    if name not in cache:
        groups = fotmob_get(f"{FOTMOB_URL}/search/suggest", {"term": name, "lang": "en"})
        cache[name] = [
            {"id": int(s["id"]), "name": s["name"]}
            for group in groups
            if group["title"]["key"] == "players"
            for s in group["suggestions"]
        ]
    return {s["id"] for s in cache[name] if name_words(s["name"]) == name_words(name)}


def load_fotmob_names(fm_seasons, search_cache, ids):
    # FotMob id -> name: latest season first, then search, then the player's page
    names = {}
    for key in sorted(fm_seasons, key=lambda key: key[1]):
        names.update({pid: name for pid, (name, _) in fm_seasons[key].items()})
    for results in search_cache.values():
        for result in results:
            names.setdefault(result["id"], result["name"])

    path = os.path.join(CACHE_DIR, "fotmob", "names.json")
    saved = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as file:
            saved = json.load(file)
    for pid in ids:
        if pid not in names and str(pid) not in saved:
            player = fotmob_get(f"{FOTMOB_URL}/playerData", {"id": pid})
            saved[str(pid)] = player["name"] if player else None
    with open(path, "w", encoding="utf-8") as file:
        json.dump(saved, file)

    return names | {int(pid): name for pid, name in saved.items() if name}


def accents(name):
    return sum(not char.isascii() for char in name)


def pick_display_name(uid, understat_names, fotmob_name):
    # None means showing Understat's name
    name = DISPLAY_NAMES.get(uid)
    if not name:
        name = fotmob_name
        if not name:
            return None
        # Keep Understat's spelling if it has more accents, or FotMob only adds middle names
        for other in understat_names:
            words, other_words = name_words(name), name_words(other)
            more_accents = words == other_words and accents(other) > accents(name)
            middle_names = (
                len(words) > len(other_words) > 1
                and (words[0], words[-1]) == (other_words[0], other_words[-1])
            )
            if more_accents or middle_names:
                name = other
    return None if {name} == understat_names else name


def load_understat_players(cursor):
    cursor.execute(
        """SELECT l.code, s.start_year, ps.understat_player_id, ps.player_name,
                  GROUP_CONCAT(pc.club_id)
           FROM understat_player_stats ps
           JOIN seasons s ON s.season_id = ps.season_id
           JOIN leagues l ON l.league_id = s.league_id
           JOIN understat_player_clubs pc ON pc.player_stats_id = ps.id
           GROUP BY ps.id"""
    )
    players = defaultdict(list)
    for code, year, understat_id, name, club_ids in cursor.fetchall():
        players[(code, year)].append(
            (understat_id, name, {int(club) for club in club_ids.split(",")})
        )
    return players


def main():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()
    understat_players = load_understat_players(cursor)
    names = {uid: name for ps in understat_players.values() for uid, name, _ in ps}
    season_names = defaultdict(set)
    for ps in understat_players.values():
        for uid, name, _ in ps:
            season_names[uid].add(name)

    print("Matching Transfermarkt...")
    tm_seasons, tm_players = load_transfermarkt()
    tm_by_name = index_names({pid: p["name"] for pid, p in tm_players.items()})
    tm_matches, _ = match_players(understat_players, tm_seasons, tm_by_name)
    tm_ids = best_ids(tm_matches) | TRANSFERMARKT_IDS

    print("Matching FotMob...")
    fm_seasons = load_fotmob()
    fm_by_name = index_names(
        {pid: name for ps in fm_seasons.values() for pid, (name, _) in ps.items()}
    )
    # Players before 2016/17 have no FotMob season list
    fm_matches, _ = match_players(
        {key: ps for key, ps in understat_players.items() if key[1] >= FOTMOB_FIRST_SEASON},
        fm_seasons,
        fm_by_name,
    )
    fm_ids = best_ids(fm_matches) | FOTMOB_IDS

    # The rest: by name across FotMob, with Transfermarkt's spelling too, then search
    search_path = os.path.join(CACHE_DIR, "fotmob", "search.json")
    search_cache = {}
    if os.path.exists(search_path):
        with open(search_path, encoding="utf-8") as file:
            search_cache = json.load(file)

    def spellings(uid):
        if uid in tm_ids:
            return [names[uid], tm_players[tm_ids[uid]]["name"]]
        return [names[uid]]

    for uid in names:
        if uid not in fm_ids:
            for name in spellings(uid):
                pid = unique(fm_by_name.get(name_words(name), ()))
                if pid:
                    fm_ids[uid] = pid
                    break

    missing = [uid for uid in names if uid not in fm_ids]
    print(f"Searching FotMob for {len(missing)} players...")
    for i, uid in enumerate(missing, start=1):
        for name in spellings(uid):
            pid = unique(search_fotmob(name, search_cache))
            if pid:
                fm_ids[uid] = pid
                break
        if i % 100 == 0 or i == len(missing):
            print(f"  {i}/{len(missing)}")
            os.makedirs(os.path.dirname(search_path), exist_ok=True)
            with open(search_path, "w", encoding="utf-8") as file:
                json.dump(search_cache, file)

    for uid in NOT_ON_FOTMOB:
        fm_ids.pop(uid, None)

    fm_names = load_fotmob_names(fm_seasons, search_cache, set(fm_ids.values()))

    cursor.execute("DELETE FROM player_profiles")
    for uid in names:
        if uid not in fm_ids and uid not in tm_ids and uid not in DISPLAY_NAMES:
            continue
        tm_player = tm_players.get(tm_ids.get(uid), {})
        cursor.execute(
            """INSERT INTO player_profiles
               (understat_player_id, fotmob_id, photo_url, transfermarkt_id,
                date_of_birth, position, display_name)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                uid,
                fm_ids.get(uid),
                PHOTO_URL.format(fm_ids[uid]) if uid in fm_ids else None,
                tm_ids.get(uid),
                tm_player.get("date_of_birth", "")[:10] or None,
                POSITION_OVERRIDES.get(uid, POSITIONS.get(tm_player.get("position"))),
                pick_display_name(uid, season_names[uid], fm_names.get(fm_ids.get(uid))),
            ),
        )

    connection.commit()
    connection.close()

    print(
        f"\nDone. {len(names)} Understat players: {len(fm_ids)} matched on FotMob, "
        f"{len(tm_ids)} on Transfermarkt."
    )
    no_photo = sorted(uid for uid in names if uid not in fm_ids)
    print(f"{len(no_photo)} have no FotMob match. Add them to FOTMOB_IDS:")
    for uid in no_photo[:20]:
        print(f"  {uid}: {names[uid]}")


if __name__ == "__main__":
    main()
