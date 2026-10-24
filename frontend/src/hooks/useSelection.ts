import { useLocation, useNavigate } from "react-router-dom";
import { LEAGUES, type LeagueCode } from "../components/layout/Sidebar/Sidebar";

// Season range as start years (2025 = 2025/26)
export const EARLIEST_SEASON = 2014;
export const LATEST_SEASON = 2025;

const DEFAULT_LEAGUE: LeagueCode = "PL";

// League and season kept in history state on pages without a league (About, 404)
type StoredSelection = { league?: unknown; season?: unknown } | null;

function isSeason(value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    (value as number) >= EARLIEST_SEASON &&
    (value as number) <= LATEST_SEASON
  );
}

// "2016-2017" -> 2016; null if malformed or out of range
function parseSeason(param: string | null) {
  const match = param?.match(/^(\d{4})-(\d{4})$/);
  const start = Number(match?.[1]);
  return match && Number(match[2]) === start + 1 && isSeason(start)
    ? start
    : null;
}

// League page URL, e.g. ("SA", "/standings", 2016) -> "/serie-a/standings?season=2016-2017"
export function leaguePath(league: LeagueCode, page: string, season: number) {
  const slug = LEAGUES.find((item) => item.code === league)?.slug;
  return `/${slug}${page}?season=${season}-${season + 1}`;
}

// Selected league (from the path) and season (from ?season=), e.g. /serie-a/standings?season=2016-2017
export function useSelection() {
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();

  // "/serie-a/standings" -> slug "serie-a", page "/standings"
  const [, slug, ...rest] = pathname.split("/");
  const page = rest.length ? `/${rest.join("/")}` : "";
  const pathLeague = LEAGUES.find((item) => item.slug === slug)?.code ?? null;

  // Missing or invalid values fall back to the last selection, then the defaults
  const stored = state as StoredSelection;
  const storedLeague = LEAGUES.find((item) => item.code === stored?.league);
  const league = pathLeague ?? storedLeague?.code ?? DEFAULT_LEAGUE;
  const season =
    parseSeason(new URLSearchParams(search).get("season")) ??
    (isSeason(stored?.season) ? stored.season : LATEST_SEASON);

  // Same page with a new league or season (Overview from About or 404), as a new history entry
  function select(next: { league?: LeagueCode; season?: number }) {
    const nextLeague = next.league ?? league;
    const nextSeason = next.season ?? season;
    navigate(leaguePath(nextLeague, pathLeague ? page : "", nextSeason));
  }

  return {
    league,
    season,
    isLeaguePage: pathLeague !== null,
    setLeague: (nextLeague: LeagueCode) => select({ league: nextLeague }),
    setSeason: (nextSeason: number) => select({ season: nextSeason }),
    // Link to a league page for the current selection, e.g. pathTo("/standings")
    pathTo: (leaguePage: string) => leaguePath(league, leaguePage, season),
  };
}
