import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/fetchJson";
import type { ClubHonoursResponse } from "@/types/api";

// A club's trophies and season awards, counted up to the season
export function useClubHonours(clubId: number, season: number) {
  return useQuery({
    queryKey: ["clubHonours", clubId, season],
    queryFn: ({ signal }) =>
      fetchJson<ClubHonoursResponse>(
        `/clubs/${clubId}/honours?season=${season}`,
        signal,
      ),
  });
}
