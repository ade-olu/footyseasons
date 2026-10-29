import type { Match, PlayedMatch } from "@/types/api";

// Counts as a result in the table, AWARDED ones included
export function isPlayed(match: Match): match is PlayedMatch {
  return match.status === "FINISHED" || match.status === "AWARDED";
}
