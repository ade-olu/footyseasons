import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/fetchJson";
import type { LeagueCode } from "@/data/leagues";
import type { PlayersResponse } from "@/types/api"; // Types for API responses

// Orders /players can sort by
export type PlayerSort = "goals" | "assists" | "xg" | "xa" | "minutes";

// A league season's player stats: the top `limit` players by `sort` (0 for the
// league-wide totals only), cached per league, season, sort and limit
export function usePlayers(
  league: LeagueCode,
  season: number,
  sort: PlayerSort,
  limit: number,
) {
  return useQuery({
    queryKey: ["players", league, season, sort, limit],
    queryFn: ({ signal }) =>
      fetchJson<PlayersResponse>(
        `/leagues/${league}/players?season=${season}&sort=${sort}&limit=${limit}`,
        signal,
      ),
  });
}
