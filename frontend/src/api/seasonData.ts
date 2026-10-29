import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";
import type { LeagueCode } from "@/data/leagues";
import type { Match, StandingsResponse } from "@/types/api"; // Types for API responses

// A league season's standings and matches
export type SeasonData = {
  standings: StandingsResponse;
  matches: Match[];
};

// Fetches standings + matches for a league's season at the same time
async function fetchSeasonData(
  league: LeagueCode,
  season: number,
  signal: AbortSignal,
): Promise<SeasonData> {
  const [standings, matches] = await Promise.all([
    fetchJson<StandingsResponse>(
      `/leagues/${league}/standings?season=${season}`,
      signal,
    ),
    fetchJson<Match[]>(`/leagues/${league}/matches?season=${season}`, signal),
  ]);

  return { standings, matches };
}

// A league season's standings and matches; every component asking for the
// same league and season shares one request and one cached result
export function useSeasonData(league: LeagueCode, season: number) {
  return useQuery({
    queryKey: ["season", league, season],
    queryFn: ({ signal }) => fetchSeasonData(league, season, signal),
  });
}
