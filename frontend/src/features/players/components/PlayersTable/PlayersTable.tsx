import PlayerInfo from "@/features/players/components/PlayerInfo/PlayerInfo";
import {
  columnClass,
  type PlayerColumn,
  type PlayerColumnDefinition,
} from "@/features/players/utils/playerColumns";
import { playerPosition } from "@/features/players/utils/playerStats";
import type { Player } from "@/types/api"; // Types for API responses
import "./PlayersTable.scss";

// One row: the player and their rank in the sorted list (null when the sorted
// stat isn't recorded)
export type PlayersTableRow = {
  player: Player;
  rank: number | null;
};

// Props for the PlayersTable component: the rows to show, the stat columns, the
// sorted one, a handler for sorting by another and the columns shown on phones
type PlayersTableProps = {
  rows: PlayersTableRow[];
  columns: PlayerColumnDefinition[];
  sort: PlayerColumn;
  onSort: (column: PlayerColumn) => void;
  phoneColumns: PlayerColumn[];
};

// The player's value as shown, "–" when not recorded
function formatValue(column: PlayerColumnDefinition, player: Player) {
  const value = column.value(player);
  return value === null ? "–" : column.format(value);
}

// Player stats table: rank, player, position and stat columns, sorted by one of them
export default function PlayersTable({
  rows,
  columns,
  sort,
  onSort,
  phoneColumns,
}: PlayersTableProps) {
  return (
    <div className="players-table">
      <table className="players-table__table">
        {/* Fixed column widths so every row lines up */}
        <colgroup>
          <col className="players-table__col-rank" />
          <col />
          <col className="players-table__col-stat players-table__cell--hide-wide players-table__cell--off-phone" />
          {columns.map((column) => (
            <col
              key={column.key}
              className={`players-table__col-stat players-table__col-${column.key}${columnClass(column, sort, phoneColumns)}`}
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
              className="players-table__stat players-table__cell--hide-wide players-table__cell--off-phone"
            >
              <abbr title="Position">Pos</abbr>
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`players-table__stat${columnClass(column, sort, phoneColumns)}`}
                aria-sort={column.key === sort ? "descending" : undefined}
              >
                <button
                  type="button"
                  className="players-table__sort"
                  title={`Sort by ${column.name.toLowerCase()}`}
                  aria-label={`Sort by ${column.name.toLowerCase()}`}
                  onClick={() => onSort(column.key)}
                >
                  <abbr title={column.name}>{column.label}</abbr>
                  {column.key === sort && (
                    <svg
                      className="players-table__sort-icon"
                      viewBox="0 0 12 12"
                      aria-hidden
                    >
                      <path d="M2 4h8l-4 5z" fill="currentColor" />
                    </svg>
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
              <td className="players-table__rank">{rank ?? "–"}</td>
              <td className="players-table__player">
                <PlayerInfo player={player} />
              </td>
              <td className="players-table__stat players-table__position players-table__cell--hide-wide players-table__cell--off-phone">
                {playerPosition(player)?.code ?? "–"}
              </td>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`players-table__stat${columnClass(column, sort, phoneColumns)}`}
                >
                  {formatValue(column, player)}
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
