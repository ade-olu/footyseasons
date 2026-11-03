import { SHORT_NAMES } from "@/features/players/data/shortNames";
import type { Player, PlayerClub } from "@/types/api"; // Types for API responses

// Positions grouped by the first letter of Understat's codes ("F S", "D M S", "GK")
export type Position = "forwards" | "midfielders" | "defenders" | "goalkeepers";

export const POSITIONS: {
  value: Position;
  label: string;
  code: string;
  letter: string;
}[] = [
  { value: "forwards", label: "Forwards", code: "FW", letter: "F" },
  { value: "midfielders", label: "Midfielders", code: "MF", letter: "M" },
  { value: "defenders", label: "Defenders", code: "DF", letter: "D" },
  { value: "goalkeepers", label: "Goalkeepers", code: "GK", letter: "G" },
];

// The player's position group, or undefined for players only listed as a sub ("S")
export function playerPosition(player: Player) {
  return POSITIONS.find((item) => player.position.startsWith(item.letter));
}

// Current or final club (clubs are oldest first)
export function currentClub(player: Player): PlayerClub | undefined {
  return player.clubs[player.clubs.length - 1];
}

// Words that start a surname ("De Bruyne", "van Dijk", "Mac Allister")
const SURNAME_PARTICLES = new Set([
  "al",
  "ben",
  "da",
  "das",
  "de",
  "del",
  "della",
  "der",
  "di",
  "do",
  "dos",
  "du",
  "el",
  "la",
  "le",
  "mac",
  "ten",
  "ter",
  "van",
  "von",
]);

// "Bruno Fernandes" -> ["B. Fernandes", "Fernandes"], tried in order when the
// full name doesn't fit; one-word names have no short form
export function shortPlayerNames(player: Player) {
  const override = SHORT_NAMES[player.understatId];
  if (override) return override;

  const words = player.playerName.trim().split(/\s+/);
  if (words.length < 2) return [];
  // From the first particle, otherwise the last word
  const particle = words.findIndex(
    (word, index) => index > 0 && SURNAME_PARTICLES.has(word.toLowerCase()),
  );
  const surname = words.slice(particle === -1 ? -1 : particle).join(" ");
  return [`${words[0][0]}. ${surname}`, surname];
}

// Goals plus assists
export function goalContributions(player: Player) {
  return player.goals + player.assists;
}

// Rounded to one decimal, as shown, so players level on screen share a rank
export function oneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

// Highest first by value, then by each tie-breaker, then by name
export function sortPlayers(
  players: Player[],
  value: (player: Player) => number,
  ...tieBreakers: ((player: Player) => number)[]
) {
  return [...players].sort((a, b) => {
    for (const by of [value, ...tieBreakers]) {
      const difference = by(b) - by(a);
      if (difference !== 0) return difference;
    }
    return a.playerName.localeCompare(b.playerName);
  });
}

// Ranks for players already sorted by value, shared on ties with gaps (1, 2, 2, 4)
export function sharedRanks(
  players: Player[],
  value: (player: Player) => number,
) {
  const ranks: number[] = [];
  players.forEach((player, index) => {
    const tied = index > 0 && value(player) === value(players[index - 1]);
    ranks.push(tied ? ranks[index - 1] : index + 1);
  });
  return ranks;
}

// "2,979"
export function formatWhole(value: number) {
  return value.toLocaleString("en-GB");
}

// "28.8", "4.0"
export function formatDecimal(value: number) {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
