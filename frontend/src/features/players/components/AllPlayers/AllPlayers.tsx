import { useState } from "react";
import {
  ChevronLeft as ArrowLeftIcon,
  ChevronRight as ArrowRightIcon,
} from "reicon-react";
import { usePlayers } from "@/api/players";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import SearchBox from "@/components/ui/SearchBox/SearchBox";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import { getLeagueName, type LeagueCode } from "@/data/leagues";
import PlayersTable from "@/features/players/components/PlayersTable/PlayersTable";
import StatKey from "@/features/players/components/StatKey/StatKey";
import {
  PHONE_VIEWS,
  PLAYER_COLUMNS,
  STAT_GROUPS,
  type PlayerColumn,
  type StatGroup,
  type StatsView,
} from "@/features/players/utils/playerColumns";
import {
  POSITIONS,
  playerPosition,
  sharedRanks,
  sortPlayers,
  type Position,
} from "@/features/players/utils/playerStats";
import type { Player } from "@/types/api"; // Types for API responses
import { searchable } from "@/utils/search";
import { seasonLabel } from "@/utils/season";
import "./AllPlayers.scss";

// Players per page
const PAGE_SIZE = 10;

// Position filter options
const POSITION_OPTIONS: { value: Position | "all"; label: string }[] = [
  { value: "all", label: "All positions" },
  ...POSITIONS,
];

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

// "All players" section: every player in a sortable table of general, defence or
// goalkeeping stats, with search, position and club filters, 10 per page
export default function AllPlayers({ league, season }: AllPlayersProps) {
  const { data, isError } = usePlayers(league, season, "goals", "all");
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<Position | "all">("all");
  const [club, setClub] = useState<number | "all">("all");
  const [sort, setSort] = useState<PlayerColumn>("goals");
  const [statsView, setStatsView] = useState<StatsView>("general");
  const [page, setPage] = useState(1);

  // Another league or season has other clubs: clear the club and go back to page 1
  const key = `${league}-${season}`;
  const [shownKey, setShownKey] = useState(key);
  if (key !== shownKey) {
    setShownKey(key);
    setClub("all");
    setPage(1);
  }

  // Every change of filter or sort starts again from page 1
  function update<Value>(set: (value: Value) => void) {
    return (value: Value) => {
      set(value);
      setPage(1);
    };
  }

  // Phones pick one of six views, wider screens one of three groups
  const view = PHONE_VIEWS.find((item) => item.value === statsView)!;
  const group = STAT_GROUPS.find((item) => item.value === view.group)!;

  // A new view keeps the sort if its column is shown, otherwise uses the view's;
  // goalkeeping shows goalkeepers, and leaving it shows every position again
  function changeView(value: StatsView, columns: PlayerColumn[]) {
    const next = PHONE_VIEWS.find((item) => item.value === value)!;
    setStatsView(value);
    if (!columns.includes(sort)) update(setSort)(next.sort);
    if (next.group === "goalkeeping") {
      update(setPosition)("goalkeepers");
    } else if (group.value === "goalkeeping" && position === "goalkeepers") {
      update(setPosition)("all");
    }
  }

  function changeGroup(value: StatGroup) {
    changeView(value, STAT_GROUPS.find((item) => item.value === value)!.columns);
  }

  function changePhoneView(value: StatsView) {
    changeView(value, PHONE_VIEWS.find((item) => item.value === value)!.columns);
  }

  // Defence and goalkeeping start in 2016/17: older seasons go back to general
  const hasDefensiveStats = data?.hasDefensiveStats !== false;
  if (!hasDefensiveStats && group.value !== "general") {
    changeView("general", []);
  }

  const leagueName = getLeagueName(league);
  const columns = group.columns.map(
    (key) => PLAYER_COLUMNS.find((item) => item.key === key)!,
  );
  const column = PLAYER_COLUMNS.find((item) => item.key === sort)!;
  // "goalkeepers" when filtered by position, otherwise "players"
  const shownPlayers =
    POSITIONS.find((item) => item.value === position)?.label.toLowerCase() ??
    "players";

  // Ranks count within the position and club filters, but not the search,
  // so a searched player keeps their place; players without the stat go last
  const filtered = (data?.players ?? []).filter(
    (player) =>
      (position === "all" || playerPosition(player)?.value === position) &&
      (club === "all" || player.clubs.some((item) => item.clubId === club)),
  );
  const value = (player: Player) => column.value(player) as number;
  const sorted = sortPlayers(
    filtered.filter((player) => column.value(player) !== null),
    value,
    ...column.tieBreakers,
  );
  const ranks = sharedRanks(sorted, value);
  const notRecorded = sortPlayers(
    filtered.filter((player) => column.value(player) === null),
    (player) => player.minutes,
  );
  const query = searchable(search);
  const rows = [
    ...sorted.map((player, index) => ({ player, rank: ranks[index] })),
    ...notRecorded.map((player) => ({ player, rank: null })),
  ].filter(
    ({ player }) => !query || searchable(player.playerName).includes(query),
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const first = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(first, first + PAGE_SIZE);
  const range = `${first + 1}–${first + pageRows.length}`;

  // Defence and goalkeeping can't be picked without their stats
  const groupOptions = STAT_GROUPS.map((item) => ({
    ...item,
    disabled: !hasDefensiveStats && item.value !== "general",
  }));
  const viewOptions = PHONE_VIEWS.map((item) => ({
    ...item,
    disabled: !hasDefensiveStats && item.group !== "general",
  }));

  const clubs = clubOptions(data?.players ?? []);

  return (
    <SectionCard className="all-players">
      <div className="all-players__header">
        <SectionHeader
          title="All players"
          description={`Every ${shownPlayers.slice(0, -1)} who played in the ${seasonLabel(season)} ${leagueName}, sorted by ${column.name.toLowerCase()}.`}
        />
        <SearchBox
          label="Search players"
          value={search}
          onChange={update(setSearch)}
        />
      </div>

      {/* Stats toggle on the left, position and club dropdowns on the right; on
          phones the two dropdowns, then a stats dropdown below */}
      <div className="all-players__controls">
        <SegmentedControl
          className="all-players__view-toggle"
          options={groupOptions}
          value={group.value}
          onChange={changeGroup}
          label="Stats shown"
          fit="content"
          maxPadding={24}
        />
        <div className="all-players__filters">
          <Dropdown
            className="all-players__dropdown"
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
        <Dropdown
          className="all-players__dropdown all-players__view-dropdown"
          options={viewOptions}
          value={statsView}
          onChange={changePhoneView}
          ariaLabel="Stats shown"
          label="Stats"
          align="left"
        />
      </div>

      {data ? (
        <div className="all-players__results">
          <PlayersTable
            rows={pageRows}
            columns={columns}
            sort={sort}
            onSort={update(setSort)}
            phoneColumns={view.columns}
          />
          {rows.length === 0 && (
            <p className="all-players__status">No players match.</p>
          )}
          <div className="all-players__footer">
            <p className="all-players__count" aria-live="polite">
              {rows.length === 0 ? (
                `No ${shownPlayers}`
              ) : (
                <>
                  <span className="all-players__count-long">Showing </span>
                  {range} of {rows.length}
                  <span className="all-players__count-long">
                    {" "}
                    {shownPlayers}
                  </span>
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
          <StatKey
            columns={columns}
            sort={sort}
            phoneColumns={view.columns}
            showNotRecorded={group.value !== "general"}
          />
        </div>
      ) : (
        <p className="all-players__status">
          {isError ? "Couldn't load the players." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
