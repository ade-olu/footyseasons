import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/fetchJson";
import type { LeagueCode } from "@/data/leagues";
import type { AwardsResponse } from "@/types/api"; // Types for API responses

// A league season's award winners
export function useAwards(league: LeagueCode, season: number) {
  return useQuery({
    queryKey: ["awards", league, season],
    queryFn: ({ signal }) =>
      fetchJson<AwardsResponse>(
        `/leagues/${league}/awards?season=${season}`,
        signal,
      ),
  });
}
