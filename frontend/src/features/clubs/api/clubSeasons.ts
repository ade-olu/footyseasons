import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/fetchJson";
import type { LeagueCode } from "@/data/leagues";
import type { ClubSeasons } from "@/types/api";

// The seasons every club has spent in a league since 2014/15
export function useClubSeasons(league: LeagueCode) {
  return useQuery({
    queryKey: ["clubSeasons", league],
    queryFn: ({ signal }) =>
      fetchJson<ClubSeasons[]>(`/leagues/${league}/club-seasons`, signal),
  });
}
