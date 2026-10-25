# FootySeasons

FootySeasons is a football stats web app for the Premier League, La Liga, Serie A,
Bundesliga and Ligue 1, covering every season from 2014/15 to 2025/26. Pick a
league and a season and see how it played out: the table, the top scorers, the
award winners and the final day.

**Live:** [footyseasons.vercel.app](https://footyseasons.vercel.app)

> Still in development. The Overview and Standings pages are done, with
> Matches, Player Stats and Clubs next.

## Why

Most football apps are built around the current season. Going back to look at
an old one usually means digging through Wikipedia tables. I wanted something
that makes any season from the last decade as easy to look at as this one, with
the same clean dashboard feel as the apps I use every week.

## Features

- **Season overview:** Headline stats, the champion, top 5 of the table, top
  scorers and assist providers, and the final day's results
- **Full league table:** Overall, home and away views, last-5 form, and
  European and relegation places for every season
- **Season awards:** Player, manager, goalkeeper and young player of the
  season, with each winner's stats
- **Shareable URLs:** The league and season live in the URL
  (`/serie-a/standings?season=2016-2017`), so any page can be linked to
- **Responsive:** Works from phones up to wide desktop screens

## Tech Stack

- **React 19 + TypeScript:** Frontend, built with Vite and React Compiler
- **SCSS:** Styling, with BEM class names
- **React Router:** Routing, with the league and season in the URL
- **Node.js + Express:** Read-only JSON API
- **SQLite (better-sqlite3):** Database
- **Python:** Data pipeline

## Architecture

```
football-data.org ─┐
Understat ─────────┤
FotMob ────────────┼──► Python pipeline ──► SQLite ──► Express API ──► React
Transfermarkt ─────┤
footylogos.com ────┘
```

Ten Python scripts in `backend/` pull data from five sources into one SQLite
file. The Express API serves it as JSON, and the React app fetches from the API.

| Source                                                                       | Used for                                       |
| ---------------------------------------------------------------------------- | ---------------------------------------------- |
| [football-data.org](https://www.football-data.org/)                          | Clubs, matches and tables from 2023/24 onwards |
| [Understat](https://understat.com/)                                          | Older match results and all player stats       |
| [FotMob](https://www.fotmob.com/)                                            | Player photos                                  |
| [transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets) | Player birth dates                             |
| [footylogos.com](https://footylogos.com/)                                    | Club crests                                    |

### Rebuilding old league tables

football-data.org's free plan only goes back to 2023/24, and Understat only has
match results for older seasons, not tables. So the pipeline works out all 45
tables from 2014/15 to 2022/23 itself, from the results.

Points and goal difference aren't enough on their own. Each league breaks ties
differently (La Liga, Serie A and Ligue 1 use head-to-head first), some clubs
had points deducted (Juventus lost 10 in 2022/23), some matches were awarded
instead of played, and Ligue 1 2019/20 was stopped for COVID and decided on
points per game. Every table was checked against its final table on Wikipedia,
and all 45 match.

### Matching players across sources

Each source has its own player IDs and spellings, so photos and birth dates are
matched to Understat's players by name within each league and season, then by
club, then by searching each site. That gets photos for over 95% of the 9,500
players, including everyone shown on the Overview page.

## API

Runs on `http://localhost:3001` locally and at
[footyseasons.vercel.app/api](https://footyseasons.vercel.app/api/leagues) in
production. League routes take an optional `?season=` with
the season's start year (`2024` = 2024/25) and default to the latest season.

| Method | Endpoint                       | Description                                        |
| ------ | ------------------------------ | -------------------------------------------------- |
| GET    | `/api/leagues`                 | Gets the leagues and their seasons.                |
| GET    | `/api/leagues/:code/standings` | Gets the table, with home and away records.        |
| GET    | `/api/leagues/:code/matches`   | Gets every match in the season.                    |
| GET    | `/api/leagues/:code/players`   | Gets player stats, sortable by goals, xG and more. |
| GET    | `/api/leagues/:code/awards`    | Gets the season's award winners.                   |
| GET    | `/api/clubs/:id`               | Gets a club and its stats for the season.          |
| GET    | `/api/clubs/:id/matches`       | Gets a club's matches.                             |

League codes: `PL` (Premier League), `PD` (La Liga), `SA` (Serie A), `BL1` (Bundesliga), `FL1`
(Ligue 1).

## Getting Started

### Prerequisites

- Node.js
- Python 3 (only to rebuild the database)

### Run

The database is committed, so you can run the app straight away.

```bash
git clone https://github.com/ade-olu/footyseasons.git
cd footyseasons

# API
cd backend/api
npm install
node server.js
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Rebuilding the database

You'll need a free [football-data.org](https://www.football-data.org/) API key
in `backend/api_key.txt`. Stop the API first (it keeps the database open), then
run the scripts in order from `backend/`:

```bash
cd backend
pip install -r requirements.txt
python 01_create_database.py   # deletes and recreates football.db
python 02_fetch_matches.py
# ...
python 10_fetch_player_profiles.py
```

A full rebuild takes a few hours, since the scripts wait between requests to
stay within rate limits.

## Project Structure

```
backend/
  01_ … 10_*.py       # data pipeline, run in number order
  schema.sql          # database tables
  awards.csv          # season awards, compiled by hand
  football.db         # the database
  api/
    server.js         # Express app
    routes/           # league and club routes
frontend/
  public/crests/      # club crests (SVG)
  src/
    pages/            # one folder per page
    components/       # layout, ui, cards, and sections per page
    api/              # API calls and caching
    data/             # leagues, table places, hero images
    styles/           # type scale, breakpoints, motion
```

## Roadmap

- Matches, Player Stats (goals, assists, xG and xA for every player) and Clubs
  pages
- Charts for player and club stats

## Credits

A personal, non-commercial project. Data from football-data.org and Understat,
player photos from FotMob, birth dates from transfermarkt-datasets and crests
from footylogos.com. Club names and crests belong to their clubs.
