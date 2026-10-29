import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";
import type { League } from "@/types/api"; // Types for API responses

// Every league and its seasons, newest first (loaded once per visit)
export function useLeagues() {
  return useQuery({
    queryKey: ["leagues"],
    queryFn: ({ signal }) => fetchJson<League[]>("/leagues", signal),
  });
}
