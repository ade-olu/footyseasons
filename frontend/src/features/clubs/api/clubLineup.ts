import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/fetchJson";
import type { ClubLineupResponse } from "@/types/api";

// A club's most-used XI and managers in a season
export function useClubLineup(clubId: number, season: number) {
  return useQuery({
    queryKey: ["clubLineup", clubId, season],
    queryFn: ({ signal }) =>
      fetchJson<ClubLineupResponse>(
        `/clubs/${clubId}/lineup?season=${season}`,
        signal,
      ),
  });
}
