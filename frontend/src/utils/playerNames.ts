import { SHORT_NAMES } from "@/data/shortNames";

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
export function shortPlayerNames(player: {
  understatId: number;
  playerName: string;
}) {
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
