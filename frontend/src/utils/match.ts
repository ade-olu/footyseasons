import type { Match, PlayedMatch } from "@/types/api";

// Counts as a result in the table, AWARDED ones included
export function isPlayed(match: Match): match is PlayedMatch {
  return match.status === "FINISHED" || match.status === "AWARDED";
}

// Goals only count from FINISHED matches, since an awarded score isn't real goals
export function isFinished(match: Match): match is PlayedMatch {
  return match.status === "FINISHED";
}

export function totalGoals(match: PlayedMatch): number {
  return match.homeGoals + match.awayGoals;
}
