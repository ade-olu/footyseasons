import type { Match, PlayedMatch } from "@/types/api"; // Types for API responses

// Goals only count from FINISHED matches, since an awarded score isn't real goals
export function isFinished(match: Match): match is PlayedMatch {
  return match.status === "FINISHED";
}

export function totalGoals(match: PlayedMatch): number {
  return match.homeGoals + match.awayGoals;
}

export function margin(match: PlayedMatch): number {
  return Math.abs(match.homeGoals - match.awayGoals);
}

// Goals per FINISHED match, or null without any
export function goalsPerMatch(matches: Match[]): number | null {
  const finished = matches.filter(isFinished);
  if (finished.length === 0) return null;

  const goals = finished.reduce((sum, match) => sum + totalGoals(match), 0);
  return goals / finished.length;
}

// The first match by a ranking (higher is better), the earliest on a tie
export function best(
  matches: PlayedMatch[],
  ...ranks: ((match: PlayedMatch) => number)[]
): PlayedMatch | undefined {
  const compare = (a: PlayedMatch, b: PlayedMatch) => {
    for (const rank of ranks) {
      if (rank(a) !== rank(b)) return rank(b) - rank(a);
    }
    return a.utcDate.localeCompare(b.utcDate);
  };
  return [...matches].sort(compare)[0];
}
