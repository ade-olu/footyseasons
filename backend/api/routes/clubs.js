// api/routes/clubs.js
// This file defines the routes for club-related API endpoints.

const express = require("express");
const db = require("../db");
const { pickMostUsedXI } = require("../mostUsedXI");
const { parseInteger, parseSeason } = require("../params");

const router = express.Router();

// The club's season for ?season=, or its latest; undefined if it didn't play
function findClubSeason(clubId, startYear) {
  return db
    .prepare(
      `
    SELECT cs.season_id AS seasonId, s.start_year AS startYear
    FROM club_season_stats cs
    JOIN seasons s ON s.season_id = cs.season_id
    WHERE cs.club_id = ? AND (? IS NULL OR s.start_year = ?)
    ORDER BY s.start_year DESC
    LIMIT 1
  `,
    )
    .get(clubId, startYear, startYear);
}

// Get a club's profile and stats for one season (?season=, defaults to its latest).
router.get("/:id", (req, res) => {
  const clubId = parseInteger(req.params.id, "id", res);
  if (clubId === undefined) return;
  const startYear = parseSeason(req, res);
  if (startYear === undefined) return;

  const club = db
    .prepare(
      `
    SELECT
      club_id AS clubId, name, short_name AS shortName, tla,
      COALESCE(display_name, name) AS displayName,
      crest_url AS crestUrl
    FROM clubs WHERE club_id = ?
  `,
    )
    .get(clubId);

  if (!club) {
    return res.status(404).json({ error: `No club found with id ${clubId}` });
  }

  // Get the club's stats for the requested season, or its latest one. Null if it didn't play that season.
  const stats = db
    .prepare(
      `
    SELECT
      cs.season_id AS seasonId, s.start_year AS startYear,
      s.label AS seasonLabel, l.name AS leagueName, l.code AS leagueCode,
      cs.games_played AS gamesPlayed, cs.wins, cs.draws, cs.losses, cs.points,
      cs.goals_for AS goalsFor, cs.goals_against AS goalsAgainst,
      cs.home_points AS homePoints, cs.away_points AS awayPoints,
      cs.home_wins AS homeWins, cs.home_draws AS homeDraws,
      cs.home_losses AS homeLosses,
      cs.away_wins AS awayWins, cs.away_draws AS awayDraws,
      cs.away_losses AS awayLosses,
      cs.home_goals_for AS homeGoalsFor,
      cs.home_goals_against AS homeGoalsAgainst,
      cs.away_goals_for AS awayGoalsFor,
      cs.away_goals_against AS awayGoalsAgainst,
      cs.clean_sheets AS cleanSheets,
      cs.longest_win_streak AS longestWinStreak,
      cs.longest_winless_streak AS longestWinlessStreak,
      cs.biggest_win_match_id AS biggestWinMatchId,
      cs.biggest_loss_match_id AS biggestLossMatchId
    FROM club_season_stats cs
    JOIN seasons s ON s.season_id = cs.season_id
    JOIN leagues l ON l.league_id = s.league_id
    WHERE cs.club_id = ? AND (? IS NULL OR s.start_year = ?)
    ORDER BY s.start_year DESC
    LIMIT 1
  `,
    )
    .get(clubId, startYear, startYear);

  res.json({ club, stats: stats ?? null });
});

// Get a club's final league record in every season it played, oldest first.
router.get("/:id/seasons", (req, res) => {
  const clubId = parseInteger(req.params.id, "id", res);
  if (clubId === undefined) return;

  const club = db
    .prepare("SELECT club_id FROM clubs WHERE club_id = ?")
    .get(clubId);

  if (!club) {
    return res.status(404).json({ error: `No club found with id ${clubId}` });
  }

  const seasons = db
    .prepare(
      `
    SELECT
      s.start_year AS startYear, s.label, l.code AS leagueCode,
      cs.position, cs.games_played AS gamesPlayed, cs.wins, cs.draws,
      cs.losses, cs.points, cs.goals_for AS goalsFor,
      cs.goals_against AS goalsAgainst,
      s.champion_club_id IS cs.club_id AS isChampion,
      (SELECT COUNT(*) FROM club_season_stats other
        WHERE other.season_id = cs.season_id) AS clubCount
    FROM club_season_stats cs
    JOIN seasons s ON s.season_id = cs.season_id
    JOIN leagues l ON l.league_id = s.league_id
    WHERE cs.club_id = ?
    ORDER BY s.start_year
  `,
    )
    .all(clubId)
    .map((season) => ({ ...season, isChampion: season.isChampion === 1 }));

  res.json(seasons);
});

// Get a club's all-time trophies, counted up to the selected season (?season=,
// every season when left out).
router.get("/:id/honours", (req, res) => {
  const clubId = parseInteger(req.params.id, "id", res);
  if (clubId === undefined) return;
  const startYear = parseSeason(req, res);
  if (startYear === undefined) return;

  const club = db
    .prepare("SELECT club_id FROM clubs WHERE club_id = ?")
    .get(clubId);

  if (!club) {
    return res.status(404).json({ error: `No club found with id ${clubId}` });
  }

  const trophies = db
    .prepare(
      `
    SELECT competition, COUNT(*) AS count, MAX(start_year) AS lastStartYear
    FROM club_honours
    WHERE club_id = ? AND (? IS NULL OR start_year <= ?)
    GROUP BY competition
  `,
    )
    .all(clubId, startYear, startYear);

  res.json({ trophies });
});

// Get a club's most-used XI and managers for one season (?season=, defaults to
// its latest).
router.get("/:id/lineup", (req, res) => {
  const clubId = parseInteger(req.params.id, "id", res);
  if (clubId === undefined) return;
  const startYear = parseSeason(req, res);
  if (startYear === undefined) return;

  const club = db
    .prepare("SELECT club_id FROM clubs WHERE club_id = ?")
    .get(clubId);

  if (!club) {
    return res.status(404).json({ error: `No club found with id ${clubId}` });
  }

  const season = findClubSeason(clubId, startYear);

  if (!season) {
    return res.json({
      formation: null,
      formationStarts: 0,
      lines: [],
      managers: [],
    });
  }

  const shapes = db
    .prepare(
      `
    SELECT formation, positions, starts FROM lineup_shapes
    WHERE season_id = ? AND club_id = ?
  `,
    )
    .all(season.seasonId, clubId);

  const starts = db
    .prepare(
      `
    SELECT transfermarkt_id AS playerId, position, starts FROM position_starts
    WHERE season_id = ? AND club_id = ?
  `,
    )
    .all(season.seasonId, clubId);

  const xi = pickMostUsedXI(shapes, starts);

  // Two Understat ids can share a Transfermarkt id, so I take the first
  const getPlayer = db.prepare(
    `
    SELECT
      pp.understat_player_id AS understatId,
      COALESCE(pp.display_name, ups.player_name, tp.name) AS playerName,
      pp.photo_url AS photoUrl, sp.shirt_number AS shirtNumber
    FROM transfermarkt_players tp
    LEFT JOIN squad_players sp ON sp.transfermarkt_id = tp.transfermarkt_id
      AND sp.season_id = ? AND sp.club_id = ?
    LEFT JOIN player_profiles pp ON pp.understat_player_id = (
      SELECT MIN(understat_player_id) FROM player_profiles
      WHERE transfermarkt_id = tp.transfermarkt_id
    )
    LEFT JOIN understat_player_stats ups
      ON ups.understat_player_id = pp.understat_player_id
      AND ups.season_id = ?
    WHERE tp.transfermarkt_id = ?
  `,
  );

  const lines = (xi?.lines ?? []).map((line) =>
    line.map(({ position, player }) => ({
      position,
      player: player && {
        ...getPlayer.get(
          season.seasonId,
          clubId,
          season.seasonId,
          player.playerId,
        ),
        starts: player.starts,
      },
    })),
  );

  // Managers with 5 or more matches, in the order they served
  const managers = db
    .prepare(
      `
    SELECT name, matches, wins, draws, losses FROM club_managers
    WHERE season_id = ? AND club_id = ?
    ORDER BY first_match
  `,
    )
    .all(season.seasonId, clubId);
  const regular = managers.filter((manager) => manager.matches >= 5);

  res.json({
    formation: xi?.formation ?? null,
    formationStarts: xi?.formationStarts ?? 0,
    lines,
    managers: regular.length > 0 ? regular : managers,
  });
});

// Get the matches played by a club, optionally for one season (?season=).
router.get("/:id/matches", (req, res) => {
  const clubId = parseInteger(req.params.id, "id", res);
  if (clubId === undefined) return;
  const startYear = parseSeason(req, res);
  if (startYear === undefined) return;

  const club = db
    .prepare("SELECT club_id FROM clubs WHERE club_id = ?")
    .get(clubId);

  if (!club) {
    return res.status(404).json({ error: `No club found with id ${clubId}` });
  }

  // Get the club's matches, with the most recent first.
  const matches = db
    .prepare(
      `
    SELECT
      m.match_id AS matchId, m.matchday, m.utc_date AS utcDate, m.status,
      m.home_goals AS homeGoals, m.away_goals AS awayGoals,
      hc.name AS homeClubName, hc.club_id AS homeClubId,
      COALESCE(hc.display_name, hc.name) AS homeClubDisplayName,
      ac.name AS awayClubName, ac.club_id AS awayClubId,
      COALESCE(ac.display_name, ac.name) AS awayClubDisplayName
    FROM matches m
    JOIN seasons s ON s.season_id = m.season_id
    JOIN clubs hc ON hc.club_id = m.home_club_id
    JOIN clubs ac ON ac.club_id = m.away_club_id
    WHERE (m.home_club_id = ? OR m.away_club_id = ?)
      AND (? IS NULL OR s.start_year = ?)
    ORDER BY m.utc_date DESC
  `,
    )
    .all(clubId, clubId, startYear, startYear);

  res.json(matches);
});

module.exports = router;
