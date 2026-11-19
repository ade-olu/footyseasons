import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/fetchJson";
import type { ClubSeasonRecord } from "@/types/api";

// A club's final league record in every season it played, oldest first; the
// last club's stays while another loads, so the chart can morph between them
export function useClubHistory(clubId: number) {
  return useQuery({
    queryKey: ["clubHistory", clubId],
    queryFn: ({ signal }) =>
      fetchJson<ClubSeasonRecord[]>(`/clubs/${clubId}/seasons`, signal),
    placeholderData: keepPreviousData,
  });
}
