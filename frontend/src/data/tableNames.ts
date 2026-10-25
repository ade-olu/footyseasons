// Shorter club names for the standings table on phones, where the full ones
// don't fit. clubId -> name; FotMob's table names, plus ESPN's (or our
// shortName) for long ones FotMob keeps. Clubs not listed use their displayName
export const TABLE_NAMES: Record<number, string> = {
  // Premier League
  1044: "Bournemouth",
  397: "Brighton",
  [-227]: "Cardiff",
  [-219]: "Huddersfield",
  [-91]: "Hull",
  349: "Ipswich",
  341: "Leeds",
  338: "Leicester",
  389: "Luton",
  65: "Man City",
  66: "Man United",
  67: "Newcastle",
  [-79]: "Norwich",
  351: "Nottm Forest",
  [-202]: "QPR",
  356: "Sheff Utd",
  [-85]: "Stoke",
  [-84]: "Swansea",
  73: "Tottenham",
  [-76]: "West Brom",
  563: "West Ham",
  76: "Wolves",
  [-93]: "Boro",
  // La Liga
  [-139]: "Deportivo",
  263: "Alavés",
  78: "Atlético",
  87: "Rayo",
  // Serie A
  [-109]: "Chievo",
  // Bundesliga
  1: "Köln",
  [-262]: "Bielefeld",
  12: "Bremen",
  44: "Heidenheim",
  [-267]: "Fürth",
  7: "Hamburg",
  3: "Leverkusen",
  5: "Bayern",
  4: "Dortmund",
  18: "M'gladbach",
  19: "Frankfurt",
  [-233]: "Düsseldorf",
  15: "Mainz",
  // Ligue 1
  524: "PSG",
  [-209]: "Évian TG",
};

// The club's name for the table on phones
export function getTableName(clubId: number, displayName: string) {
  return TABLE_NAMES[clubId] ?? displayName;
}
