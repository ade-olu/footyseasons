// League logos
import premierLeagueLogo from "../assets/sidebar/premier-league-logo.svg";
import premierLeaguelogoAlt from "../assets/sidebar/premier-league-logo-alt.svg";
import laLigaLogo from "../assets/sidebar/la-liga-logo.svg";
import serieALogo from "../assets/sidebar/serie-a-logo.svg";
import bundesligaLogo from "../assets/sidebar/bundesliga-logo.svg";
import ligue1Logo from "../assets/sidebar/ligue-1-logo.svg";
import ligue1logoAlt from "../assets/sidebar/ligue-1-logo-alt.svg";

// League codes (same as the ones used in the API)
export type LeagueCode = "PL" | "PD" | "SA" | "BL1" | "FL1";

// The app's leagues: code, URL slug, name and logos (logo on dark, logoAlt on light)
export const LEAGUES: {
  code: LeagueCode;
  slug: string; // First part of the URL, e.g. /premier-league/standings
  name: string;
  logo: string;
  logoAlt?: string;
}[] = [
  {
    code: "PL",
    slug: "premier-league",
    name: "Premier League",
    logo: premierLeagueLogo,
    logoAlt: premierLeaguelogoAlt,
  },
  {
    code: "PD",
    slug: "la-liga",
    name: "La Liga",
    logo: laLigaLogo,
    logoAlt: laLigaLogo,
  },
  {
    code: "SA",
    slug: "serie-a",
    name: "Serie A",
    logo: serieALogo,
    logoAlt: serieALogo,
  },
  {
    code: "BL1",
    slug: "bundesliga",
    name: "Bundesliga",
    logo: bundesligaLogo,
    logoAlt: bundesligaLogo,
  },
  {
    code: "FL1",
    slug: "ligue-1",
    name: "Ligue 1",
    logo: ligue1Logo,
    logoAlt: ligue1logoAlt,
  },
];
