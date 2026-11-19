// Short names for players the "B. Fernandes" rule gets wrong (a family name
// written first, a "Júnior" that isn't a surname). Understat player id ->
// short names, tried in order when the full name doesn't fit
export const SHORT_NAMES: Record<number, string[]> = {
  453: ["Son"], // Son Heung-Min
  7008: ["Vinícius Jr."], // Vinícius Júnior
};
