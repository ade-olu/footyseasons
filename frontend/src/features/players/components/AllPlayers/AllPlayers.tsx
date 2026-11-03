import { useRef, useState } from "react";
import {
  ChevronLeft as ArrowLeftIcon,
  ChevronRight as ArrowRightIcon,
  Search as SearchIcon,
  X as ClearIcon,
} from "reicon-react";
import { usePlayers } from "@/api/players";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import { LEAGUES, type LeagueCode } from "@/data/leagues";
import PlayersTable from "@/features/players/components/PlayersTable/PlayersTable";
import {
  PLAYER_COLUMNS,
  type PlayerColumn,
} from "@/features/players/utils/playerColumns";
import {
  POSITIONS,
  playerPosition,
  sharedRanks,
  sortPlayers,
  type Position,
} from "@/features/players/utils/playerStats";
import type { Player } from "@/types/api"; // Types for API responses
import { seasonLabel } from "@/utils/season";
import "./AllPlayers.scss";

// Players per page
const PAGE_SIZE = 10;

// Position filter: the toggle's labels, and the phone dropdown's
const POSITION_TOGGLE: { value: Position | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...POSITIONS,
];

const POSITION_OPTIONS: { value: Position | "all"; label: string }[] = [
  { value: "all", label: "All positions" },
  ...POSITIONS,
];

// "Raphaël" and "raphael" both match "rapha"
function searchable(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Every club in the season's player list, A-Z
function clubOptions(players: Player[]) {
  const clubs = new Map<number, string>();
  players.forEach((player) =>
    player.clubs.forEach((club) => clubs.set(club.clubId, club.displayName)),
  );

  return [
    { value: "all" as const, label: "All clubs" },
    ...[...clubs]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
}

// Props for the AllPlayers component: the selected league and season start year (2025 = 2025/26)
type AllPlayersProps = {
  league: LeagueCode;
  season: number;
};

// "All players" section: every player in a sortable table, with search, position
// and club filters, 10 per page
export default function AllPlayers({ league, season }: AllPlayersProps) {
  const { data, isError } = usePlayers(league, season, "goals", "all");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<Position | "all">("all");
  const [club, setClub] = useState<number | "all">("all");
  const [sort, setSort] = useState<PlayerColumn>("goals");
  const [page, setPage] = useState(1);

  // Another league or season has other clubs: clear the club and go back to page 1
  const key = `${league}-${season}`;
  const [shownKey, setShownKey] = useState(key);
  if (key !== shownKey) {
    setShownKey(key);
    setClub("all");
    setPage(1);
  }

  const leagueName = LEAGUES.find((item) => item.code === league)?.name;
  const column = PLAYER_COLUMNS.find((item) => item.key === sort)!;

  // Ranks count within the position and club filters, but not the search,
  // so a searched player keeps their place
  const filtered = (data?.players ?? []).filter(
    (player) =>
      (position === "all" || playerPosition(player)?.value === position) &&
      (club === "all" || player.clubs.some((item) => item.clubId === club)),
  );
  const sorted = sortPlayers(filtered, column.value, ...column.tieBreakers);
  const ranks = sharedRanks(sorted, column.value);
  const query = searchable(search);
  const rows = sorted
    .map((player, index) => ({ player, rank: ranks[index] }))
    .filter(
      ({ player }) => !query || searchable(player.playerName).includes(query),
    );

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const first = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(first, first + PAGE_SIZE);
  const range = `${first + 1}–${first + pageRows.length}`;

  // Every change of filter or sort starts again from page 1
  function update<Value>(set: (value: Value) => void) {
    return (value: Value) => {
      set(value);
      setPage(1);
    };
  }

  const clubs = clubOptions(data?.players ?? []);

  return (
    <SectionCard className="all-players">
      <div className="all-players__header">
        <SectionHeader
          title="All players"
          description={`Every player who played in the ${seasonLabel(season)} ${leagueName}, sorted by ${column.name}.`}
        />
        <div className="all-players__search">
          <label className="all-players__search-field">
            <SearchIcon className="all-players__search-icon" aria-hidden />
            <input
              ref={searchRef}
              className="all-players__search-input"
              type="search"
              placeholder="Search players"
              aria-label="Search players"
              value={search}
              onChange={(event) => update(setSearch)(event.target.value)}
            />
          </label>
          {search && (
            <button
              type="button"
              className="all-players__search-clear"
              aria-label="Clear search"
              onClick={() => {
                update(setSearch)("");
                searchRef.current?.focus();
              }}
            >
              <ClearIcon className="all-players__search-icon" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Position toggle and club dropdown; two dropdowns on phones */}
      <div className="all-players__controls">
        <SegmentedControl
          className="all-players__position-toggle"
          options={POSITION_TOGGLE}
          value={position}
          onChange={update(setPosition)}
          label="Position"
        />
        <Dropdown
          className="all-players__dropdown all-players__position-dropdown"
          options={POSITION_OPTIONS}
          value={position}
          onChange={update(setPosition)}
          ariaLabel="Position"
          label="Position"
          align="left"
        />
        <Dropdown
          className="all-players__dropdown all-players__club-dropdown"
          options={clubs}
          value={club}
          onChange={update(setClub)}
          ariaLabel="Club"
          label="Club"
        />
      </div>

      {data ? (
        <div className="all-players__results">
          <PlayersTable rows={pageRows} sort={sort} onSort={update(setSort)} />
          {rows.length === 0 && (
            <p className="all-players__status">No players match.</p>
          )}
          <div className="all-players__footer">
            <p className="all-players__count" aria-live="polite">
              {rows.length === 0 ? (
                "No players"
              ) : (
                <>
                  <span className="all-players__count-long">Showing </span>
                  {range} of {rows.length}
                  <span className="all-players__count-long"> players</span>
                </>
              )}
            </p>
            <div className="all-players__pager">
              <button
                type="button"
                className="all-players__page-step"
                aria-label="Previous page"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ArrowLeftIcon className="all-players__page-icon" aria-hidden />
              </button>
              <p className="all-players__page">
                Page {currentPage} of {pageCount}
              </p>
              <button
                type="button"
                className="all-players__page-step"
                aria-label="Next page"
                disabled={currentPage >= pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                <ArrowRightIcon
                  className="all-players__page-icon"
                  aria-hidden
                />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="all-players__status">
          {isError ? "Couldn't load the players." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
