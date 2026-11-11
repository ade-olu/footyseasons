import type { Match } from "@/types/api"; // Types for API responses
import { isFinished, isPlayed, totalGoals } from "@/utils/match";

// Goals per FINISHED match, or null without any
export function goalsPerMatch(matches: Match[]): number | null {
  const finished = matches.filter(isFinished);
  if (finished.length === 0) return null;

  const goals = finished.reduce((sum, match) => sum + totalGoals(match), 0);
  return goals / finished.length;
}

// One matchweek's summary: its goals, home wins, draws and away wins, how many
// of its matches were played, and its goals per match against the season's
export type RoundStats = {
  total: number;
  played: number;
  stats: { label: string; value: number }[];
  roundAverage: number | null;
  seasonAverage: number | null;
};

export function getRoundStats(matches: Match[], matchweek: number): RoundStats {
  const round = matches.filter((match) => match.matchday === matchweek);
  const played = round.filter(isPlayed);
  // Wins and draws from every result; goals from FINISHED matches only
  const goals = round
    .filter(isFinished)
    .reduce((sum, match) => sum + totalGoals(match), 0);
  const count = (test: (home: number, away: number) => boolean) =>
    played.filter((match) => test(match.homeGoals, match.awayGoals)).length;

  return {
    total: round.length,
    played: played.length,
    stats: [
      { label: "Goals", value: goals },
      { label: "Home Wins", value: count((home, away) => home > away) },
      { label: "Draws", value: count((home, away) => home === away) },
      { label: "Away Wins", value: count((home, away) => home < away) },
    ],
    roundAverage: goalsPerMatch(round),
    seasonAverage: goalsPerMatch(matches),
  };
}
