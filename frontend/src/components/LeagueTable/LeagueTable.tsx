import { useEffect, useState } from "react";
import { fetchSeasonData } from "../../api/seasonData";
import SectionCard from "../SectionCard/SectionCard";
import SectionHeader from "../SectionHeader/SectionHeader";
import SegmentedControl from "../SegmentedControl/SegmentedControl";
import Dropdown from "../Dropdown/Dropdown";
import StandingsTable, {
  type FormResult,
  type TableView,
} from "../StandingsTable/StandingsTable";
import { LEAGUES, type LeagueCode } from "../Sidebar/Sidebar";
import { TABLE_PLACES } from "../../data/tablePlaces";
import { getClubForm } from "../../utils/form";
import type { StandingsResponse } from "../../types/api"; // Types for API responses
import "./LeagueTable.scss";

// Which matches the table counts
type MatchFilter = "overall" | "home" | "away";

// Home and Away aren't built yet
const MATCH_FILTERS: {
  value: MatchFilter;
  label: string;
  disabled?: boolean;
}[] = [
  { value: "overall", label: "Overall" },
  { value: "home", label: "Home", disabled: true },
  { value: "away", label: "Away", disabled: true },
];

// Phone column views
const TABLE_VIEWS: { value: TableView; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "full", label: "Full" },
  { value: "form", label: "Form" },
];

// The standings and form for one league and season
type LeagueTableData = {
  league: LeagueCode;
  season: number;
  standings: StandingsResponse;
  form: Record<number, FormResult[]>;
};

// Props for the LeagueTable component: the selected league and season start year (2025 = 2025/26)
type LeagueTableProps = {
  league: LeagueCode;
  season: number;
};

// Gets the standings and matches (for form) for a league's season
async function fetchLeagueTableData(
  league: LeagueCode,
  season: number,
): Promise<LeagueTableData> {
  const { standings, matches } = await fetchSeasonData(league, season);

  return { league, season, standings, form: getClubForm(matches) };
}

// Standings page "League table" section: the full table with GF/GA, places and form
export default function LeagueTable({ league, season }: LeagueTableProps) {
  const [data, setData] = useState<LeagueTableData | null>(null);
  const [error, setError] = useState<{
    league: LeagueCode;
    season: number;
  } | null>(null);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("overall");
  const [view, setView] = useState<TableView>("short");

  // Refetch whenever the selected league or season changes
  useEffect(() => {
    // Ignores the result if the selection changes before it arrives
    let ignore = false;

    fetchLeagueTableData(league, season)
      .then((result) => {
        if (!ignore) {
          setData(result);
          setError(null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError({ league, season });
        }
      });

    return () => {
      ignore = true;
    };
  }, [league, season]);

  // Old data or errors from a previous selection don't count for the current one
  const hasError = error?.league === league && error.season === season;
  const isReady =
    !hasError && data?.league === league && data.season === season;

  const leagueName = LEAGUES.find((item) => item.code === league)?.name;

  // "Final Premier League standings after 38 matchweeks."
  let description = `${leagueName} standings.`;
  if (isReady) {
    const { standings, championClubId } = data.standings;
    const matchweeks = Math.max(
      0,
      ...standings.map((club) => club.gamesPlayed),
    );
    const prefix = championClubId !== null ? "Final" : "Current";
    description = `${prefix} ${leagueName} standings after ${matchweeks} ${matchweeks === 1 ? "matchweek" : "matchweeks"}.`;
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
        />
      </div>
      {isReady ? (
        <StandingsTable
          standings={data.standings.standings}
          form={data.form}
          places={TABLE_PLACES[`${league}-${season}`]}
          showGoals
          view={view}
        />
      ) : (
        <p className="league-table__status">
          {hasError ? "Couldn't load the standings." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
