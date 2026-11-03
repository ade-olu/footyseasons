import { ChevronDown as SortIcon } from "reicon-react";
import PlayerInfo from "@/features/players/components/PlayerInfo/PlayerInfo";
import {
  PLAYER_COLUMNS,
  type PlayerColumn,
} from "@/features/players/utils/playerColumns";
import { playerPosition } from "@/features/players/utils/playerStats";
import type { Player } from "@/types/api"; // Types for API responses
import "./PlayersTable.scss";

// One row: the player and their rank in the sorted list
export type PlayersTableRow = {
  player: Player;
  rank: number;
};

// Props for the PlayersTable component: the rows to show, the sorted column and a
// handler for sorting by another
type PlayersTableProps = {
  rows: PlayersTableRow[];
  sort: PlayerColumn;
  onSort: (column: PlayerColumn) => void;
};

// The column's classes: hidden on narrower tables, always shown when sorted
function columnClass(column: (typeof PLAYER_COLUMNS)[number], sort: string) {
  if (column.key === sort) return " players-table__cell--sorted";
  return column.hide ? ` players-table__cell--hide-${column.hide}` : "";
}

// Player stats table: rank, player, position and stat columns, sorted by one of them
export default function PlayersTable({
  rows,
  sort,
  onSort,
}: PlayersTableProps) {
  return (
    <div className="players-table">
      <table className="players-table__table">
        {/* Fixed column widths so every row lines up */}
        <colgroup>
          <col className="players-table__col-rank" />
          <col />
          <col className="players-table__col-stat players-table__cell--hide-wide" />
          {PLAYER_COLUMNS.map((column) => (
            <col
              key={column.key}
              className={`players-table__col-stat${columnClass(column, sort)}`}
            />
          ))}
          <col className="players-table__col-end" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="players-table__rank">
              #
            </th>
            <th scope="col" className="players-table__player">
              Player
            </th>
            <th
              scope="col"
              className="players-table__stat players-table__cell--hide-wide"
            >
              <abbr title="Position">Pos</abbr>
            </th>
            {PLAYER_COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`players-table__stat${columnClass(column, sort)}`}
                aria-sort={column.key === sort ? "descending" : undefined}
              >
                <button
                  type="button"
                  className="players-table__sort"
                  title={`Sort by ${column.name}`}
                  onClick={() => onSort(column.key)}
                >
                  <abbr title={column.name}>{column.label}</abbr>
                  {column.key === sort && (
                    <SortIcon
                      className="players-table__sort-icon"
                      aria-hidden
                    />
                  )}
                </button>
              </th>
            ))}
            <th aria-hidden />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ player, rank }) => (
            <tr key={player.understatId}>
              <td className="players-table__rank">{rank}</td>
              <td className="players-table__player">
                <PlayerInfo player={player} />
              </td>
              <td className="players-table__stat players-table__position players-table__cell--hide-wide">
                {playerPosition(player)?.code ?? "–"}
              </td>
              {PLAYER_COLUMNS.map((column) => (
                <td
                  key={column.key}
                  className={`players-table__stat${columnClass(column, sort)}`}
                >
                  {column.format(column.value(player))}
                </td>
              ))}
              <td aria-hidden />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
