import {
  formatDecimal,
  formatSigned,
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
  | "yellowCards"
  | "defensiveActions"
  | "tackles"
  | "interceptions"
  | "clearances"
  | "blocks"
  | "recoveries"
  | "cleanSheets"
  | "saves"
  | "savePercentage"
  | "goalsConceded"
  | "goalsPrevented";

// Label, full name, value (rounded as shown, so ties match the screen; null when
// not recorded), tie-breakers, format and the table width it's hidden below on
// wider screens ("wide" 940px, "medium" 760px); phones show a view instead
export type PlayerColumnDefinition = {
  key: PlayerColumn;
  label: string;
  name: string;
  value: (player: Player) => number | null;
  tieBreakers: ((player: Player) => number)[];
  format: (value: number) => string;
  hide?: "wide" | "medium";
};

export const PLAYER_COLUMNS: PlayerColumnDefinition[] = [
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
    name: "Minutes played",
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
    name: "Expected goals",
    value: (player) => oneDecimal(player.xG),
    tieBreakers: [(player) => player.goals],
    format: formatDecimal,
  },
  {
    key: "xA",
    label: "xA",
    name: "Expected assists",
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
    name: "Key passes",
    value: (player) => player.keyPasses,
    tieBreakers: [(player) => player.assists],
    format: formatWhole,
  },
  {
    key: "yellowCards",
    label: "YC",
    name: "Yellow cards",
    value: (player) => player.yellowCards,
    tieBreakers: [],
    format: formatWhole,
    hide: "wide",
  },
  {
    key: "defensiveActions",
    label: "Def",
    name: "Defensive actions",
    value: (player) => player.defensiveActions,
    tieBreakers: [(player) => player.tackles ?? 0],
    format: formatWhole,
  },
  {
    key: "tackles",
    label: "Tkl",
    name: "Tackles",
    value: (player) => player.tackles,
    tieBreakers: [(player) => player.interceptions ?? 0],
    format: formatWhole,
  },
  {
    key: "interceptions",
    label: "Int",
    name: "Interceptions",
    value: (player) => player.interceptions,
    tieBreakers: [(player) => player.tackles ?? 0],
    format: formatWhole,
  },
  {
    key: "clearances",
    label: "Clr",
    name: "Clearances",
    value: (player) => player.clearances,
    tieBreakers: [(player) => player.blocks ?? 0],
    format: formatWhole,
  },
  {
    key: "blocks",
    label: "Blk",
    name: "Blocks",
    value: (player) => player.blocks,
    tieBreakers: [(player) => player.clearances ?? 0],
    format: formatWhole,
    hide: "wide",
  },
  {
    key: "recoveries",
    label: "Rec",
    name: "Recoveries",
    value: (player) => player.recoveries,
    tieBreakers: [(player) => player.tackles ?? 0],
    format: formatWhole,
  },
  {
    key: "cleanSheets",
    label: "CS",
    name: "Clean sheets",
    value: (player) => player.cleanSheets,
    tieBreakers: [(player) => -(player.goalsConceded ?? 0)],
    format: formatWhole,
  },
  {
    key: "saves",
    label: "Svs",
    name: "Saves",
    value: (player) => player.saves,
    tieBreakers: [(player) => player.savePercentage ?? 0],
    format: formatWhole,
  },
  {
    key: "savePercentage",
    label: "Sv%",
    name: "Save percentage",
    value: (player) =>
      player.savePercentage === null ? null : oneDecimal(player.savePercentage),
    tieBreakers: [(player) => player.saves ?? 0],
    format: (value) => `${formatDecimal(value)}%`,
  },
  {
    key: "goalsConceded",
    label: "GC",
    name: "Goals conceded",
    value: (player) => player.goalsConceded,
    tieBreakers: [(player) => player.minutes],
    format: formatWhole,
  },
  {
    key: "goalsPrevented",
    label: "GP",
    name: "Goals prevented",
    value: (player) =>
      player.goalsPrevented === null ? null : oneDecimal(player.goalsPrevented),
    tieBreakers: [(player) => player.saves ?? 0],
    format: formatSigned,
  },
];

// The column's classes: hidden on narrower tables and on phones outside the
// view, always shown when sorted (the stat key uses them too)
export function columnClass(
  column: PlayerColumnDefinition,
  sort: PlayerColumn,
  phoneColumns: PlayerColumn[],
) {
  if (column.key === sort) return " players-table__cell--sorted";
  return [
    column.hide && ` players-table__cell--hide-${column.hide}`,
    !phoneColumns.includes(column.key) && " players-table__cell--off-phone",
  ]
    .filter(Boolean)
    .join("");
}

// Stat groups: the table's columns and default sort; defence and goalkeeping
// come from FotMob (2016/17 onwards)
export type StatGroup = "general" | "defence" | "goalkeeping";

export const STAT_GROUPS: {
  value: StatGroup;
  label: string;
  columns: PlayerColumn[];
  sort: PlayerColumn;
}[] = [
  {
    value: "general",
    label: "General",
    columns: [
      "games",
      "minutes",
      "goals",
      "assists",
      "xG",
      "xA",
      "shots",
      "keyPasses",
      "yellowCards",
    ],
    sort: "goals",
  },
  {
    value: "defence",
    label: "Defence",
    columns: [
      "games",
      "minutes",
      "defensiveActions",
      "tackles",
      "interceptions",
      "clearances",
      "blocks",
      "recoveries",
    ],
    sort: "defensiveActions",
  },
  {
    value: "goalkeeping",
    label: "Goalkeeping",
    columns: [
      "games",
      "minutes",
      "cleanSheets",
      "saves",
      "savePercentage",
      "goalsConceded",
      "goalsPrevented",
    ],
    sort: "cleanSheets",
  },
];

// Phones show three columns of a group at a time: a view picks them, and its
// sort is used when the sorted column isn't in it
export type StatsView =
  | "general"
  | "shooting"
  | "creating"
  | "more"
  | "defence"
  | "goalkeeping";

export const PHONE_VIEWS: {
  value: StatsView;
  label: string;
  group: StatGroup;
  columns: PlayerColumn[];
  sort: PlayerColumn;
}[] = [
  {
    value: "general",
    label: "General",
    group: "general",
    columns: ["games", "goals", "assists"],
    sort: "goals",
  },
  {
    value: "shooting",
    label: "Shooting",
    group: "general",
    columns: ["goals", "xG", "shots"],
    sort: "goals",
  },
  {
    value: "creating",
    label: "Creating",
    group: "general",
    columns: ["assists", "xA", "keyPasses"],
    sort: "assists",
  },
  {
    value: "defence",
    label: "Defence",
    group: "defence",
    columns: ["defensiveActions", "tackles", "clearances"],
    sort: "defensiveActions",
  },
  {
    value: "goalkeeping",
    label: "Goalkeeping",
    group: "goalkeeping",
    columns: ["cleanSheets", "saves", "savePercentage"],
    sort: "cleanSheets",
  },
  {
    value: "more",
    label: "More",
    group: "general",
    columns: ["minutes", "yellowCards"],
    sort: "minutes",
  },
];
