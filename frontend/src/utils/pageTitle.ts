import { getLeagueName, type LeagueCode } from "@/data/leagues";
import { seasonLabel } from "@/utils/season";

// Browser tab title, e.g. "Standings - Premier League 2016/17 | FootySeasons"
export function pageTitle(page: string, league?: LeagueCode, season?: number) {
  if (!league || season === undefined) {
    return `${page} | FootySeasons`;
  }

  const leagueName = getLeagueName(league);
  return `${page} - ${leagueName} ${seasonLabel(season)} | FootySeasons`;
}
