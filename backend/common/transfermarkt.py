"""
common/transfermarkt.py
Reads the Transfermarkt export, downloaded once into cache/transfermarkt/.
"""

import csv
import gzip
import os
import requests


CACHE_DIR = os.path.join("cache", "transfermarkt")
TRANSFERMARKT_URL = "https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data"


def read_transfermarkt(table):
    path = os.path.join(CACHE_DIR, f"{table}.csv.gz")
    if not os.path.exists(path):
        os.makedirs(CACHE_DIR, exist_ok=True)
        print(f"Downloading {table}.csv.gz...")
        response = requests.get(f"{TRANSFERMARKT_URL}/{table}.csv.gz", timeout=300)
        response.raise_for_status()
        with open(path, "wb") as file:
            file.write(response.content)

    with gzip.open(path, "rt", encoding="utf-8") as file:
        yield from csv.DictReader(file)
