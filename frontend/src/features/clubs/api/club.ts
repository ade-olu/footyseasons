import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/fetchJson";
import type { ClubResponse } from "@/types/api";

// A club's name and crest, for seasons it isn't in the standings; null skips the request
export function useClub(clubId: number | null) {
  return useQuery({
    queryKey: ["club", clubId],
    queryFn: ({ signal }) => fetchJson<ClubResponse>(`/clubs/${clubId}`, signal),
    enabled: clubId !== null,
  });
}
