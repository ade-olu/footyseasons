import {
  columnClass,
  type PlayerColumn,
  type PlayerColumnDefinition,
} from "@/features/players/utils/playerColumns";
import "./StatKey.scss";

// Props for the StatKey component: the table's stat columns, the sorted one, the
// columns shown on phones and whether to explain "–"
type StatKeyProps = {
  columns: PlayerColumnDefinition[];
  sort: PlayerColumn;
  phoneColumns: PlayerColumn[];
  showNotRecorded: boolean;
};

// Full names of the table's abbreviated columns, hidden with their columns
export default function StatKey({
  columns,
  sort,
  phoneColumns,
  showNotRecorded,
}: StatKeyProps) {
  return (
    <ul className="stat-key" aria-label="Stat key">
      <li className="stat-key__item players-table__cell--hide-wide players-table__cell--off-phone">
        <span className="stat-key__abbreviation">Pos</span>
        Position
      </li>
      {columns
        .filter((column) => column.label !== column.name)
        .map((column) => (
          <li
            key={column.key}
            className={`stat-key__item${columnClass(column, sort, phoneColumns)}`}
          >
            <span className="stat-key__abbreviation">{column.label}</span>
            {column.name}
          </li>
        ))}
      {showNotRecorded && (
        <li className="stat-key__item stat-key__item--new-line">
          <span className="stat-key__abbreviation">–</span>
          Not recorded
        </li>
      )}
    </ul>
  );
}
