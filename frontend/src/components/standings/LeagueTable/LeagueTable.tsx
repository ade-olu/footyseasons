import { useEffect, useState } from "react";
import { fetchSeasonData } from "../../../api/seasonData";
import SectionCard from "../../ui/SectionCard/SectionCard";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import SegmentedControl from "../../ui/SegmentedControl/SegmentedControl";
import Dropdown from "../../ui/Dropdown/Dropdown";
import StandingsTable, {
  type FormResult,
  type TableView,
} from "../../cards/StandingsTable/StandingsTable";
import { LEAGUES, type LeagueCode } from "../../../data/leagues";
import { TABLE_PLACES } from "../../../data/tablePlaces";
import { getClubForm } from "../../../utils/form";
import type { Standing, StandingsResponse } from "../../../types/api"; // Types for API responses
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

// The standings and form for one league and season
type LeagueTableData = {
  league: LeagueCode;
  season: number;
  standings: StandingsResponse;
  form: Record<MatchFilter, Record<number, FormResult[]>>;
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

  const form = {
    overall: getClubForm(matches),
    home: getClubForm(matches, 5, "home"),
    away: getClubForm(matches, 5, "away"),
  };
  return { league, season, standings, form };
}

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

  // Overall, home or away rows; zones follow each table's own positions (as on FotMob)
  const rows = !isReady
    ? []
    : matchFilter === "overall"
      ? data.standings.standings
      : sideTable(data.standings.standings, matchFilter);

  // "Final Premier League standings after 38 matchweeks." or "… home table after 19 home games."
  let description = `${leagueName} standings.`;
  if (isReady) {
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
        />
      </div>
      {isReady ? (
        <StandingsTable
          standings={rows}
          form={data.form[matchFilter]}
          places={TABLE_PLACES[`${league}-${season}`]}
          showGoals
          view={view}
          animateOrder
        />
      ) : (
        <p className="league-table__status">
          {hasError ? "Couldn't load the standings." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
