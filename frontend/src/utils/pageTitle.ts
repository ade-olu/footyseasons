import { LEAGUES, type LeagueCode } from "@/data/leagues";
import { seasonLabel } from "@/utils/season";

// Browser tab title, e.g. "Standings - Premier League 2016/17 | FootySeasons"
export function pageTitle(page: string, league?: LeagueCode, season?: number) {
  if (!league || season === undefined) {
    return `${page} | FootySeasons`;
  }

  const leagueName = LEAGUES.find((item) => item.code === league)?.name;
  return `${page} - ${leagueName} ${seasonLabel(season)} | FootySeasons`;
}
