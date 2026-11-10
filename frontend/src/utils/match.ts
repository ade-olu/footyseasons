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

export function margin(match: PlayedMatch): number {
  return Math.abs(match.homeGoals - match.awayGoals);
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
