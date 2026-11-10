import type { Match } from "@/types/api"; // Types for API responses
import { isFinished, totalGoals } from "@/utils/match";

// Goals per FINISHED match, or null without any
export function goalsPerMatch(matches: Match[]): number | null {
  const finished = matches.filter(isFinished);
  if (finished.length === 0) return null;

  const goals = finished.reduce((sum, match) => sum + totalGoals(match), 0);
  return goals / finished.length;
}
