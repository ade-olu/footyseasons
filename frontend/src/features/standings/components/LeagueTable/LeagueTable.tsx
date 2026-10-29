import { useState } from "react";
import { useSeasonData } from "@/api/seasonData";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import StandingsTable, {
  type TableView,
} from "@/features/standings/components/StandingsTable/StandingsTable";
import { LEAGUES, type LeagueCode } from "@/data/leagues";
import { TABLE_PLACES } from "@/features/standings/data/tablePlaces";
import { getClubForm } from "@/features/standings/utils/form";
import type { Standing } from "@/types/api"; // Types for API responses
import "./LeagueTable.scss";

// Which matches the table counts
type MatchFilter = "overall" | "home" | "away";

const MATCH_FILTERS: { value: MatchFilter; label: string }[] = [
  { value: "overall", label: "Overall" },
  { value: "home", label: "Home" },
  { value: "away", label: "Away" },
];

// Phone column views
const TABLE_VIEWS: { value: TableView; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "full", label: "Full" },
  { value: "form", label: "Form" },
];

// Props for the LeagueTable component: the selected league and season start year (2025 = 2025/26)
type LeagueTableProps = {
  league: LeagueCode;
  season: number;
};

// Home or away table: each club's figures from those games only, ranked on
// points, then goal difference, then goals scored
function sideTable(standings: Standing[], side: "home" | "away") {
  const isHome = side === "home";

  return standings
    .map((club) => {
      const wins = isHome ? club.homeWins : club.awayWins;
      const draws = isHome ? club.homeDraws : club.awayDraws;
      const losses = isHome ? club.homeLosses : club.awayLosses;

      return {
        ...club,
        gamesPlayed: wins + draws + losses,
        wins,
        draws,
        losses,
        points: isHome ? club.homePoints : club.awayPoints,
        goalsFor: isHome ? club.homeGoalsFor : club.awayGoalsFor,
        goalsAgainst: isHome ? club.homeGoalsAgainst : club.awayGoalsAgainst,
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
        b.goalsFor - a.goalsFor ||
        a.displayName.localeCompare(b.displayName),
    )
    .map((club, index) => ({ ...club, position: index + 1 }));
}

// Standings page "League table" section: the full table with GF/GA, places and form
export default function LeagueTable({ league, season }: LeagueTableProps) {
  const { data, isError } = useSeasonData(league, season);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("overall");
  const [view, setView] = useState<TableView>("short");

  const leagueName = LEAGUES.find((item) => item.code === league)?.name;

  // Overall, home or away rows; zones follow each table's own positions (as on FotMob)
  const rows = !data
    ? []
    : matchFilter === "overall"
      ? data.standings.standings
      : sideTable(data.standings.standings, matchFilter);

  // "Final Premier League standings after 38 matchweeks." or "… home table after 19 home games."
  let description = `${leagueName} standings.`;
  if (data) {
    const prefix =
      data.standings.championClubId !== null ? "Final" : "Current";
    const games = Math.max(0, ...rows.map((club) => club.gamesPlayed));
    description =
      matchFilter === "overall"
        ? `${prefix} ${leagueName} standings after ${games} ${games === 1 ? "matchweek" : "matchweeks"}.`
        : `${prefix} ${leagueName} ${matchFilter} table after ${games} ${matchFilter} ${games === 1 ? "game" : "games"}.`;
  }

  return (
    <SectionCard className="league-table">
      <div className="league-table__header">
        <SectionHeader title="League table" description={description} />
        <SegmentedControl
          className="league-table__match-toggle"
          options={MATCH_FILTERS}
          value={matchFilter}
          onChange={setMatchFilter}
          label="Matches counted"
        />
      </div>
      {/* Phones: column view on the left, matches counted as a dropdown on the right */}
      <div className="league-table__phone-controls">
        <SegmentedControl
          options={TABLE_VIEWS}
          value={view}
          onChange={setView}
          label="Columns"
        />
        <Dropdown
          options={MATCH_FILTERS}
          value={matchFilter}
          onChange={setMatchFilter}
          ariaLabel="Matches counted"
          align="auto"
        />
      </div>
      {data ? (
        <StandingsTable
          standings={rows}
          form={getClubForm(
            data.matches,
            5,
            matchFilter === "overall" ? undefined : matchFilter,
          )}
          places={TABLE_PLACES[`${league}-${season}`]}
          showGoals
          view={view}
          animateOrder
        />
      ) : (
        <p className="league-table__status">
          {isError ? "Couldn't load the standings." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
