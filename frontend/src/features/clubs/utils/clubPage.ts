import { getLeagueName, type LeagueCode } from "@/data/leagues";
import { getTableName } from "@/data/tableNames";
import { TABLE_PLACES } from "@/data/tablePlaces";
import { ordinal } from "@/features/clubs/utils/clubDirectory";
import { leaguePath } from "@/hooks/useSelection";
import type { Match, PlayedMatch, Standing } from "@/types/api";
import { best, isFinished, margin, totalGoals } from "@/utils/match";
import { seasonLabel } from "@/utils/season";

// "Brighton & Hove Albion" -> "brighton-hove-albion", "Atlético" -> "atletico"
export function clubSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // Accents, split off by NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// The club page's phone tabs; Overview has no path
export const CLUB_TABS = [
  { path: "", label: "Overview" },
  { path: "matches", label: "Matches" },
  { path: "history", label: "History" },
  { path: "squad", label: "Squad" },
] as const;

export type ClubTab = (typeof CLUB_TABS)[number]["path"];

// Whether a path segment is a tab
export function isClubTab(path: string): path is ClubTab {
  return CLUB_TABS.some((tab) => tab.path === path);
}

// A club's page or tab, e.g. "/premier-league/clubs/57/arsenal/matches"
export function clubPath(
  league: LeagueCode,
  { clubId, displayName }: { clubId: number; displayName: string },
  season: number,
  tab: ClubTab = "",
) {
  return leaguePath(
    league,
    `/clubs/${clubId}/${clubSlug(displayName)}${tab ? `/${tab}` : ""}`,
    season,
  );
}

// Shorter names to try when the full one doesn't fit, longest first:
// "Wolverhampton", then "Wolves"
export function shortClubNames(club: {
  clubId: number;
  displayName: string;
  shortName: string;
}) {
  const names = [getTableName(club.clubId, club.displayName), club.shortName];
  return [...new Set(names)]
    .filter((name) => name.length < club.displayName.length)
    .sort((a, b) => b.length - a.length);
}

// "+44", "0", "-12"
export function formatGoalDifference({ goalsFor, goalsAgainst }: Standing) {
  const difference = goalsFor - goalsAgainst;
  return difference > 0 ? `+${difference}` : String(difference);
}

// "1 point", "7 points"
function count(value: number, word: string, plural = `${word}s`) {
  return `${value} ${value === 1 ? word : plural}`;
}

// "2025/26 Premier League champions by 7 points, with 26 wins, 7 draws and 5 losses."
export function getClubSummary(
  club: Standing,
  standings: Standing[],
  championClubId: number | null,
  league: LeagueCode,
  season: number,
) {
  const competition = `${seasonLabel(season)} ${getLeagueName(league)}`;
  const record = `with ${count(club.wins, "win")}, ${count(club.draws, "draw")} and ${count(club.losses, "loss", "losses")}`;
  const relegation = TABLE_PLACES[`${league}-${season}`]?.relegation ?? [];
  const finish = club.position === null ? null : ordinal(club.position);

  if (club.clubId === championClubId) {
    const runnerUp = standings.find(({ clubId }) => clubId !== championClubId);
    const gap = runnerUp ? club.points - runnerUp.points : 0;
    const margin =
      gap > 0 ? `by ${count(gap, "point")}` : "on goal difference";
    return `${competition} champions ${margin}, ${record}.`;
  }
  if (club.position !== null && relegation.includes(club.position)) {
    return `Relegated from the ${competition} in ${finish}, ${record}.`;
  }
  return finish
    ? `${finish} in the ${competition}, ${record}.`
    : `In the ${competition}, ${record}.`;
}

// The club's FINISHED matches, oldest first (awarded scores aren't real goals)
export function getClubMatches(matches: Match[], clubId: number) {
  return matches
    .filter(isFinished)
    .filter(
      ({ homeClubId, awayClubId }) =>
        homeClubId === clubId || awayClubId === clubId,
    )
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));
}

// Goals for minus goals against, from the club's side
export function clubMargin(match: PlayedMatch, clubId: number) {
  const difference = match.homeGoals - match.awayGoals;
  return match.homeClubId === clubId ? difference : -difference;
}

// The longest run of wins, the latest on a tie; null without a win
export function getWinStreak(matches: PlayedMatch[], clubId: number) {
  let longest: PlayedMatch[] = [];
  let current: PlayedMatch[] = [];

  for (const match of matches) {
    current = clubMargin(match, clubId) > 0 ? [...current, match] : [];
    if (current.length > 0 && current.length >= longest.length) {
      longest = current;
    }
  }
  return longest.length > 0 ? longest : null;
}

// Biggest win or defeat: largest margin, then most goals, then the earliest
export function getBiggestResult(
  matches: PlayedMatch[],
  clubId: number,
  result: "win" | "defeat",
) {
  const sign = result === "win" ? 1 : -1;
  return best(
    matches.filter((match) => clubMargin(match, clubId) * sign > 0),
    margin,
    totalGoals,
  );
}
