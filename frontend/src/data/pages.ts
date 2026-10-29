import { CalendarDays as MatchesIcon } from "reicon-react";
import { Grid as OverviewIcon } from "reicon-react";
import { InfoCircle as AboutIcon } from "reicon-react";
import { Shield2 as ClubsIcon } from "reicon-react";
import { Trophy as StandingsIcon } from "reicon-react";
import { UserCircle as PlayerStatsIcon } from "reicon-react";

// The app's pages in sidebar order. League pages' paths go after the league
// slug (/premier-league/standings); App.tsx gives each one its component
export const PAGES = [
  { path: "", name: "Overview", icon: OverviewIcon, isLeaguePage: true },
  {
    path: "/standings",
    name: "Standings",
    icon: StandingsIcon,
    isLeaguePage: true,
  },
  { path: "/matches", name: "Matches", icon: MatchesIcon, isLeaguePage: true },
  {
    path: "/player-stats",
    name: "Player Stats",
    icon: PlayerStatsIcon,
    isLeaguePage: true,
  },
  { path: "/clubs", name: "Clubs", icon: ClubsIcon, isLeaguePage: true },
  { path: "/about", name: "About", icon: AboutIcon, isLeaguePage: false },
] as const;

// A league page's path: "" (Overview), "/standings", "/matches"...
export type LeaguePagePath = Extract<
  (typeof PAGES)[number],
  { isLeaguePage: true }
>["path"];
