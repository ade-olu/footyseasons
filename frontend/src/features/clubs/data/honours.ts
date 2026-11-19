import { LEAGUES, type LeagueCode } from "@/data/leagues";

// Cup logos in src/assets/competitions/<key>.svg (footylogos.com, and
// Wikimedia Commons for the Cup Winners' Cup and Trophée des Champions); a
// competition without one shows the trophy
const LOGOS = import.meta.glob<string>("@/assets/competitions/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

function cupLogo(key: string) {
  return LOGOS[`/src/assets/competitions/${key}.svg`];
}

function leagueLogo(code: LeagueCode) {
  const league = LEAGUES.find((item) => item.code === code)!;
  return league.logoAlt ?? league.logo;
}

export type Honour = {
  key: string;
  name: string;
  logo?: string; // The trophy when there's none
};

// Trophies in FotMob's order: league titles, domestic cups, European and
// world competitions (a club only has its own country's)
export const TROPHIES: Honour[] = [
  { key: "premier_league", name: "Premier League", logo: leagueLogo("PL") },
  { key: "la_liga", name: "La Liga", logo: leagueLogo("PD") },
  { key: "serie_a", name: "Serie A", logo: leagueLogo("SA") },
  { key: "bundesliga", name: "Bundesliga", logo: leagueLogo("BL1") },
  { key: "ligue_1", name: "Ligue 1", logo: leagueLogo("FL1") },
  { key: "fa_cup", name: "FA Cup" },
  { key: "efl_cup", name: "EFL Cup" },
  { key: "community_shield", name: "Community Shield" },
  { key: "copa_del_rey", name: "Copa del Rey" },
  { key: "supercopa", name: "Supercopa de España" },
  { key: "coppa_italia", name: "Coppa Italia" },
  { key: "supercoppa", name: "Supercoppa Italiana" },
  { key: "dfb_pokal", name: "DFB-Pokal" },
  { key: "dfl_supercup", name: "DFL-Supercup" },
  { key: "dfb_ligapokal", name: "DFB-Ligapokal" },
  { key: "coupe_de_france", name: "Coupe de France" },
  { key: "coupe_de_la_ligue", name: "Coupe de la Ligue" },
  { key: "trophee_des_champions", name: "Trophée des Champions" },
  { key: "champions_league", name: "UEFA Champions League" },
  { key: "europa_league", name: "UEFA Europa League" },
  { key: "conference_league", name: "UEFA Conference League" },
  { key: "cup_winners_cup", name: "UEFA Cup Winners’ Cup" },
  { key: "uefa_super_cup", name: "UEFA Super Cup" },
  { key: "club_world_cup", name: "FIFA Club World Cup" },
  { key: "intercontinental_cup", name: "Intercontinental Cup" },
].map((trophy) => ({ ...trophy, logo: trophy.logo ?? cupLogo(trophy.key) }));

// Season awards, in the order of the Overview's season awards
export const AWARDS: Honour[] = [
  { key: "player", name: "Player of the Season" },
  { key: "manager", name: "Manager of the Season" },
  { key: "goalkeeper", name: "Goalkeeper of the Season" },
  { key: "young_player", name: "Young Player of the Season" },
];
