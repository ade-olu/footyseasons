import type { FormResult } from "@/features/standings/components/StandingsTable/StandingsTable";
import type { Match } from "@/types/api";
import { isPlayed } from "@/utils/match";

// Each club's last `count` results, oldest first, keyed by clubId; `side` keeps only home or away games.
// Matches can come in any order; they're sorted by date here.
export function getClubForm(
  matches: Match[],
  count = 5,
  side?: "home" | "away",
): Record<number, FormResult[]> {
  const played = matches
    .filter(isPlayed)
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate)); // Newest first

  const form: Record<number, FormResult[]> = {};

  const addResult = (clubId: number, goalsFor: number, goalsAgainst: number) => {
    const results = (form[clubId] ??= []);
    if (results.length >= count) return;

    // unshift, since we walk newest to oldest but show oldest first
    results.unshift(
      goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D",
    );
  };

  for (const { homeClubId, awayClubId, homeGoals, awayGoals } of played) {
    if (side !== "away") addResult(homeClubId, homeGoals, awayGoals);
    if (side !== "home") addResult(awayClubId, awayGoals, homeGoals);
  }

  return form;
}
