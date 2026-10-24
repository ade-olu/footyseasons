import { LEAGUES, type LeagueCode } from "../data/leagues";

// Browser tab title, e.g. "Standings - Premier League 2016/17 | PitchData"
export function pageTitle(page: string, league?: LeagueCode, season?: number) {
  if (!league || season === undefined) {
    return `${page} | PitchData`;
  }

  const leagueName = LEAGUES.find((item) => item.code === league)?.name;
  const seasonLabel = `${season}/${String(season + 1).slice(-2)}`;
  return `${page} - ${leagueName} ${seasonLabel} | PitchData`;
}
