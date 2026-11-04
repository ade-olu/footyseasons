-- FootySeasons database schema: empty tables, filled by the pipeline scripts.

-- Reject rows that point at a missing parent row.
PRAGMA foreign_keys = ON;


-- One row per competition.
CREATE TABLE leagues (
    league_id   INTEGER PRIMARY KEY,   -- football-data.org's id, e.g. 2021
    name        TEXT NOT NULL,         -- e.g. "Premier League"
    code        TEXT NOT NULL          -- e.g. "PL"
);


-- One row per league per year.
CREATE TABLE seasons (
    season_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    league_id            INTEGER NOT NULL,
    start_year           INTEGER NOT NULL,   -- e.g. 2025 for 2025/26
    label                 TEXT,               -- e.g. "2025/26"
    champion_club_id      INTEGER,            -- set by 03 or 04

    FOREIGN KEY (league_id)           REFERENCES leagues(league_id),
    FOREIGN KEY (champion_club_id)    REFERENCES clubs(club_id),

    UNIQUE (league_id, start_year)
);


-- One row per club, shared across leagues and seasons.
CREATE TABLE clubs (
    club_id     INTEGER PRIMARY KEY,   -- football-data.org's id; minus the Understat id for pre-2023 clubs
    name        TEXT NOT NULL,         -- e.g. "Arsenal FC"
    short_name  TEXT,                  -- e.g. "Arsenal"
    tla         TEXT,                  -- e.g. "ARS"
    crest_url   TEXT,                  -- e.g. "/crests/arsenal.svg"; set by 07
    display_name TEXT                  -- name shown in the app; set by 06
);


-- One row per match.
CREATE TABLE matches (
    match_id      INTEGER PRIMARY KEY,  -- football-data.org's id; minus the Understat id before 2023/24
    season_id     INTEGER NOT NULL,
    matchday      INTEGER,              -- FotMob's round before 2023/24
    utc_date      TEXT,                 -- ISO text, e.g. "2025-08-16T14:00:00Z"
    status        TEXT,                 -- e.g. "FINISHED"
    home_club_id  INTEGER NOT NULL,
    away_club_id  INTEGER NOT NULL,
    home_goals    INTEGER,
    away_goals    INTEGER,

    FOREIGN KEY (season_id)    REFERENCES seasons(season_id),
    FOREIGN KEY (home_club_id) REFERENCES clubs(club_id),
    FOREIGN KEY (away_club_id) REFERENCES clubs(club_id)
);

CREATE INDEX idx_matches_season   ON matches(season_id);
CREATE INDEX idx_matches_utc_date ON matches(utc_date);


-- One row per club per season. 03 and 04 fill the tables, 05 the computed stats.
CREATE TABLE club_season_stats (
    id                     INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id              INTEGER NOT NULL,
    club_id                INTEGER NOT NULL,

    position               INTEGER,   -- after tie-breakers (1 = top)
    games_played           INTEGER,
    wins                   INTEGER,
    draws                  INTEGER,
    losses                 INTEGER,
    points                 INTEGER,
    goals_for              INTEGER,
    goals_against          INTEGER,

    -- Home and away tables
    home_points             INTEGER,
    away_points              INTEGER,
    home_wins INTEGER, home_draws INTEGER, home_losses INTEGER,
    away_wins INTEGER, away_draws INTEGER, away_losses INTEGER,
    home_goals_for INTEGER, home_goals_against INTEGER,
    away_goals_for INTEGER, away_goals_against INTEGER,

    -- Computed by 05
    clean_sheets            INTEGER,
    biggest_win_match_id     INTEGER,
    biggest_loss_match_id    INTEGER,
    longest_win_streak       INTEGER,
    longest_winless_streak   INTEGER,

    FOREIGN KEY (season_id)             REFERENCES seasons(season_id),
    FOREIGN KEY (club_id)                REFERENCES clubs(club_id),
    FOREIGN KEY (biggest_win_match_id)   REFERENCES matches(match_id),
    FOREIGN KEY (biggest_loss_match_id)  REFERENCES matches(match_id),

    UNIQUE (season_id, club_id)
);

CREATE INDEX idx_club_season_stats_season ON club_season_stats(season_id);


-- One row per player per season, filled by 06. A mid-season transfer within a
-- league gets one combined row, since Understat doesn't split it by club.
CREATE TABLE understat_player_stats (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id            INTEGER NOT NULL,
    understat_player_id  INTEGER NOT NULL,   -- the same across seasons
    player_name          TEXT NOT NULL,
    position             TEXT,               -- e.g. "F S" or "D M"
    games                INTEGER,
    minutes              INTEGER,
    goals                INTEGER,            -- no own goals, so less than the matches table
    non_penalty_goals    INTEGER,
    assists              INTEGER,
    shots                INTEGER,
    key_passes           INTEGER,
    yellow_cards         INTEGER,
    red_cards            INTEGER,
    xg                   REAL,               -- expected goals
    npxg                 REAL,               -- non-penalty expected goals
    xa                   REAL,               -- expected assists
    xg_chain             REAL,
    xg_buildup           REAL,

    FOREIGN KEY (season_id) REFERENCES seasons(season_id),

    UNIQUE (season_id, understat_player_id)
);

CREATE INDEX idx_understat_player_stats_season ON understat_player_stats(season_id);


-- The club(s) behind each understat_player_stats row; two or more after a transfer.
CREATE TABLE understat_player_clubs (
    player_stats_id  INTEGER NOT NULL,
    club_id          INTEGER NOT NULL,
    last_match_date  TEXT,               -- player's last match for this club; transfers only

    FOREIGN KEY (player_stats_id) REFERENCES understat_player_stats(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id)         REFERENCES clubs(club_id),

    PRIMARY KEY (player_stats_id, club_id)
);

CREATE INDEX idx_understat_player_clubs_club ON understat_player_clubs(club_id);


-- One row per award winner, so a shared award has several. Loaded by 08 from awards.csv.
CREATE TABLE season_awards (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id            INTEGER NOT NULL,
    award                TEXT NOT NULL,      -- "player", "manager", "goalkeeper" or "young_player"
    winner_name          TEXT NOT NULL,      -- e.g. "Bruno Fernandes"
    understat_player_id  INTEGER,            -- NULL for managers
    club_id              INTEGER NOT NULL,   -- club the winner played for or managed
    awarding_body        TEXT NOT NULL,      -- e.g. "Premier League", "PFA", "Marca"
    source_url           TEXT,
    starts               INTEGER,            -- league starts; goalkeepers and young players only
    clean_sheets         INTEGER,            -- starts without conceding; same rows as starts

    FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    FOREIGN KEY (club_id)   REFERENCES clubs(club_id),

    UNIQUE (season_id, award, winner_name)
);


-- Photo (FotMob) and birth date (Transfermarkt) per Understat player, filled by 09.
CREATE TABLE player_profiles (
    understat_player_id  INTEGER PRIMARY KEY,
    fotmob_id            INTEGER,
    photo_url            TEXT,
    transfermarkt_id     INTEGER,
    date_of_birth        TEXT,               -- "YYYY-MM-DD"
    position             TEXT                -- main position: FW, MF, DF or GK
);


-- FotMob's defending and goalkeeping totals from 2016/17, filled by 10. FotMob
-- only lists players above a minutes threshold, so a missing stat is NULL.
CREATE TABLE fotmob_player_stats (
    season_id            INTEGER NOT NULL,
    understat_player_id  INTEGER NOT NULL,
    fotmob_id            INTEGER NOT NULL,
    minutes              INTEGER,            -- can differ slightly from Understat's
    defensive_actions    INTEGER,            -- FotMob's "defensive contributions"
    tackles              INTEGER,
    interceptions        INTEGER,
    clearances           INTEGER,
    blocks               INTEGER,            -- outfield players' blocked shots
    recoveries           INTEGER,
    clean_sheets         INTEGER,
    saves                INTEGER,
    goals_conceded       INTEGER,
    goals_prevented      REAL,               -- xGOT faced minus goals conceded; from 2018/19
    save_percentage      REAL,               -- 0-100

    FOREIGN KEY (season_id) REFERENCES seasons(season_id),

    PRIMARY KEY (season_id, understat_player_id)
);
