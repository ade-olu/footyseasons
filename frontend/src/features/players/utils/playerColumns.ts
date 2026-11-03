import {
  formatDecimal,
  formatWhole,
  oneDecimal,
} from "@/features/players/utils/playerStats";
import type { Player } from "@/types/api"; // Types for API responses

// Stat columns in the players table, each one sortable
export type PlayerColumn =
  | "games"
  | "minutes"
  | "goals"
  | "assists"
  | "xG"
  | "xA"
  | "shots"
  | "keyPasses"
  | "yellowCards";

// Label, full name, value (rounded as shown, so ties match the screen), tie-breakers,
// format and the table width it's hidden below on wider screens ("wide" 940px,
// "medium" 760px); phones show a view instead (PHONE_VIEWS)
export const PLAYER_COLUMNS: {
  key: PlayerColumn;
  label: string;
  name: string;
  value: (player: Player) => number;
  tieBreakers: ((player: Player) => number)[];
  format: (value: number) => string;
  hide?: "wide" | "medium";
}[] = [
  {
    key: "games",
    label: "Apps",
    name: "Appearances",
    value: (player) => player.games,
    tieBreakers: [(player) => player.minutes],
    format: formatWhole,
  },
  {
    key: "minutes",
    label: "Mins",
    name: "Minutes",
    value: (player) => player.minutes,
    tieBreakers: [],
    format: formatWhole,
    hide: "medium",
  },
  {
    key: "goals",
    label: "G",
    name: "Goals",
    value: (player) => player.goals,
    tieBreakers: [(player) => player.xG],
    format: formatWhole,
  },
  {
    key: "assists",
    label: "A",
    name: "Assists",
    value: (player) => player.assists,
    tieBreakers: [(player) => player.xA],
    format: formatWhole,
  },
  {
    key: "xG",
    label: "xG",
    name: "Expected Goals",
    value: (player) => oneDecimal(player.xG),
    tieBreakers: [(player) => player.goals],
    format: formatDecimal,
  },
  {
    key: "xA",
    label: "xA",
    name: "Expected Assists",
    value: (player) => oneDecimal(player.xA),
    tieBreakers: [(player) => player.assists],
    format: formatDecimal,
  },
  {
    key: "shots",
    label: "Shots",
    name: "Shots",
    value: (player) => player.shots,
    tieBreakers: [(player) => player.goals],
    format: formatWhole,
    hide: "wide",
  },
  {
    key: "keyPasses",
    label: "KP",
    name: "Key Passes",
    value: (player) => player.keyPasses,
    tieBreakers: [(player) => player.assists],
    format: formatWhole,
    hide: "medium",
  },
  {
    key: "yellowCards",
    label: "YC",
    name: "Yellow Cards",
    value: (player) => player.yellowCards,
    tieBreakers: [],
    format: formatWhole,
    hide: "wide",
  },
];

// Phones show three columns at a time: a view picks them, and its sort is used
// when the sorted column isn't in it
export type PhoneView = "general" | "shooting" | "creating" | "more";

export const PHONE_VIEWS: {
  value: PhoneView;
  label: string;
  columns: PlayerColumn[];
  sort: PlayerColumn;
}[] = [
  {
    value: "general",
    label: "General",
    columns: ["games", "goals", "assists"],
    sort: "goals",
  },
  {
    value: "shooting",
    label: "Shooting",
    columns: ["goals", "xG", "shots"],
    sort: "goals",
  },
  {
    value: "creating",
    label: "Creating",
    columns: ["assists", "xA", "keyPasses"],
    sort: "assists",
  },
  {
    value: "more",
    label: "More",
    columns: ["games", "minutes", "yellowCards"],
    sort: "minutes",
  },
];
