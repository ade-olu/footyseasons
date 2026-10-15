import type { FormResult } from "../components/StandingsTable/StandingsTable";
import type { Match } from "../types/api";

// Statuses that count as a result in the table (an AWARDED score is given without the game being played)
const PLAYED_STATUSES = new Set(["FINISHED", "AWARDED"]);

// Each club's last `count` results, oldest first, keyed by clubId.
// Matches can come in any order; they're sorted by date here.
export function getClubForm(
  matches: Match[],
  count = 5,
): Record<number, FormResult[]> {
  const played = matches
    .filter(
      (match) =>
        PLAYED_STATUSES.has(match.status) &&
        match.homeGoals !== null &&
        match.awayGoals !== null,
    )
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

  for (const match of played) {
    const homeGoals = match.homeGoals ?? 0;
    const awayGoals = match.awayGoals ?? 0;
    addResult(match.homeClubId, homeGoals, awayGoals);
    addResult(match.awayClubId, awayGoals, homeGoals);
  }

  return form;
}
