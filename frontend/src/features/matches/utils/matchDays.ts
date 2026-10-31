import type { Match } from "@/types/api"; // Types for API responses

// One day's matches (UTC date "2026-05-24")
export type MatchDay<T extends Match = Match> = {
  date: string;
  matches: T[];
};

// Groups matches by UTC date, oldest first, then by kick-off and home club
export function groupByDay<T extends Match>(matches: T[]): MatchDay<T>[] {
  const sorted = [...matches].sort(
    (a, b) =>
      a.utcDate.localeCompare(b.utcDate) ||
      a.homeClubDisplayName.localeCompare(b.homeClubDisplayName),
  );
  const days: MatchDay<T>[] = [];

  for (const match of sorted) {
    const date = match.utcDate.slice(0, 10);
    const day = days[days.length - 1];

    if (day?.date === date) {
      day.matches.push(match);
    } else {
      days.push({ date, matches: [match] });
    }
  }

  return days;
}
