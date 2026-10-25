// Types for the JSON returned by the Express API (backend/api)

// A season, identified by its start year (2025 = 2025/26). Pass startYear as ?season= to league and club routes.
export type Season = {
  startYear: number;
  label: string; // e.g. "2025/26"
};

// One league in GET /api/leagues
export type League = {
  leagueId: number;
  name: string;
  code: string;
  seasons: Season[]; // Newest first
};

// One club's row in GET /api/leagues/:code/standings
export type Standing = {
  clubId: number;
  name: string; // Official name, e.g. "Manchester City FC"
  displayName: string; // Name shown in the app, e.g. "Manchester City"
  shortName: string;
  tla: string; // Three-letter abbreviation for the club
  crestUrl: string | null; // Null for a club without a crest (ClubCrest shows a shield)
  position: number | null; // Official league position, tie-breakers included
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number | null;
  longestWinStreak: number | null;
  longestWinlessStreak: number | null;
  // Home and away splits (raw results, so ten corrected club-seasons don't add up to the totals)
  homeWins: number;
  homeDraws: number;
  homeLosses: number;
  homePoints: number;
  homeGoalsFor: number;
  homeGoalsAgainst: number;
  awayWins: number;
  awayDraws: number;
  awayLosses: number;
  awayPoints: number;
  awayGoalsFor: number;
  awayGoalsAgainst: number;
};

// Full response from GET /api/leagues/:code/standings
export type StandingsResponse = {
  league: { code: string; name: string };
  season: Season;
  championClubId: number | null;
  standings: Standing[];
};

// One match in GET /api/leagues/:code/matches
export type Match = {
  matchId: number;
  matchday: number | null; // Null for 2014-2022 matches
  utcDate: string;
  status: string;
  homeGoals: number | null;
  awayGoals: number | null;
  homeClubName: string;
  homeClubDisplayName: string;
  homeClubId: number;
  homeClubShortName: string;
  homeClubTla: string;
  homeClubCrestUrl: string | null;
  awayClubName: string;
  awayClubDisplayName: string;
  awayClubId: number;
  awayClubShortName: string;
  awayClubTla: string;
  awayClubCrestUrl: string | null;
};

// A club a player played for, inside Player.clubs
export type PlayerClub = {
  clubId: number;
  name: string;
  displayName: string;
  shortName: string;
  crestUrl: string;
};

// One player in GET /api/leagues/:code/players (stats from Understat, every player in the league)
export type Player = {
  understatId: number;
  playerName: string;
  position: string; // Understat's position codes, e.g. "F S"
  games: number;
  minutes: number;
  goals: number; // Doesn't include own goals
  assists: number;
  xG: number;
  xA: number;
  shots: number;
  keyPasses: number;
  photoUrl: string | null; // Null when there's no photo
  clubs: PlayerClub[]; // Oldest first; two or more for a mid-season transfer
};

// Full response from GET /api/leagues/:code/players
export type PlayersResponse = {
  totals: {
    players: number;
    goals: number;
    assists: number;
    xG: number;
    xA: number;
  }; // Covers every player in the league, whatever ?limit= is
  players: Player[];
};

// Award ids in GET /api/leagues/:code/awards
export type AwardType = "player" | "manager" | "goalkeeper" | "young_player";

// One award winner in GET /api/leagues/:code/awards
export type Award = {
  award: AwardType;
  winnerName: string;
  understatId: number | null; // Null for managers
  awardingBody: string; // e.g. "Premier League", "PFA", "Marca"
  sourceUrl: string | null;
  clubId: number;
  shortName: string;
  displayName: string;
  crestUrl: string | null;
  goals: number | null; // Null for managers
  assists: number | null;
  starts: number | null; // Goalkeeper and young player awards, and goalkeepers who win another award
  cleanSheets: number | null; // Same as starts
  wins: number; // The club's
  points: number;
  photoUrl: string | null; // Null for managers and players without a photo
};

// Full response from GET /api/leagues/:code/awards
export type AwardsResponse = {
  season: Season;
  awards: Award[]; // Player, manager, goalkeeper, young player; one entry per winner of a shared award
};
