"""
01_create_database.py

Deletes football.db and rebuilds the empty tables from schema.sql.
"""

import os
import sqlite3

DB_FILE = "football.db"
SCHEMA_FILE = "schema.sql"


def create_database():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print(f"Removed existing {DB_FILE}. Starting fresh.")

    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()

    with open(SCHEMA_FILE, "r") as f:
        schema_sql = f.read()

    # executescript() runs every statement in the file
    cursor.executescript(schema_sql)
    connection.commit()

    print(f"{DB_FILE} created successfully from {SCHEMA_FILE}.")

    # List the tables to check they were created
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
    )
    tables = cursor.fetchall()

    print(f"\nTables found ({len(tables)}):")
    for row in tables:
        print(f"  - {row[0]}")

    connection.close()


if __name__ == "__main__":
    create_database()
