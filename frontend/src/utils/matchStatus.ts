import type { Match, UnplayedMatch } from "@/types/api"; // Types for API responses

// "15:00" in the visitor's time zone
const kickOffFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

export function kickOffTime(match: Match): string {
  return kickOffFormat.format(new Date(match.utcDate));
}

// True while a match is still to be played at its kick-off time
export function isUpcoming(match: Match): boolean {
  return match.status === "SCHEDULED" || match.status === "TIMED";
}

// What a match without a result shows instead of a score
export function statusLabel(match: UnplayedMatch): string {
  switch (match.status) {
    case "SCHEDULED":
    case "TIMED":
      return kickOffTime(match);
    case "POSTPONED":
      return "Postponed";
    case "CANCELLED":
      return "Cancelled";
    case "SUSPENDED":
      return "Suspended";
    default:
      return match.homeGoals !== null && match.awayGoals !== null
        ? `${match.homeGoals} – ${match.awayGoals}`
        : "Live";
  }
}
