import { API_URL } from "./config";
import type { LeagueCode } from "../components/Sidebar/Sidebar";
import type { Match, StandingsResponse } from "../types/api"; // Types for API responses

// A league season's standings and matches
export type SeasonData = {
  standings: StandingsResponse;
  matches: Match[];
};

// One request per league season, shared by every component that asks for it
const cache = new Map<string, Promise<SeasonData>>();

// Fetches standings + matches for a league's season
async function loadSeasonData(
  league: LeagueCode,
  season: number,
): Promise<SeasonData> {
  const [standingsRes, matchesRes] = await Promise.all([
    fetch(`${API_URL}/leagues/${league}/standings?season=${season}`),
    fetch(`${API_URL}/leagues/${league}/matches?season=${season}`),
  ]);

  if (!standingsRes.ok || !matchesRes.ok) {
    throw new Error(`Could not load season data for ${league}`);
  }

  return {
    standings: (await standingsRes.json()) as StandingsResponse,
    matches: (await matchesRes.json()) as Match[],
  };
}

// Cached standings + matches for a league's season; a failed request is retried next time
export function fetchSeasonData(
  league: LeagueCode,
  season: number,
): Promise<SeasonData> {
  const key = `${league}-${season}`;
  let request = cache.get(key);

  if (!request) {
    request = loadSeasonData(league, season);
    cache.set(key, request);
    request.catch(() => cache.delete(key));
  }

  return request;
}
