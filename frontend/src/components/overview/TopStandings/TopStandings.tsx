import { useEffect, useState } from "react";
import { fetchSeasonData } from "../../../api/seasonData";
import SectionCard from "../../ui/SectionCard/SectionCard";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import StandingsTable, {
  type FormResult,
} from "../../cards/StandingsTable/StandingsTable";
import { LEAGUES, type LeagueCode } from "../../../data/leagues";
import { TABLE_PLACES } from "../../../data/tablePlaces";
import { getClubForm } from "../../../utils/form";
import type { StandingsResponse } from "../../../types/api"; // Types for API responses
import "./TopStandings.scss";

// Number of clubs shown on the overview
const TOP_CLUBS = 5;

// The standings and form for one league and season
type TopStandingsData = {
  league: LeagueCode;
  season: number;
  standings: StandingsResponse;
  form: Record<number, FormResult[]>;
};

// Props for the TopStandings component: the selected league and season start year (2025 = 2025/26)
type TopStandingsProps = {
  league: LeagueCode;
  season: number;
};

// Gets the standings and matches (for form) for a league's season
async function fetchTopStandingsData(
  league: LeagueCode,
  season: number,
): Promise<TopStandingsData> {
  const { standings, matches } = await fetchSeasonData(league, season);

  return { league, season, standings, form: getClubForm(matches) };
}

// "Top of the standings" overview section: the top 5 of the table, linking to the full standings
export default function TopStandings({ league, season }: TopStandingsProps) {
  const [data, setData] = useState<TopStandingsData | null>(null);
  const [error, setError] = useState<{
    league: LeagueCode;
    season: number;
  } | null>(null);

  // Refetch whenever the selected league or season changes
  useEffect(() => {
    // Ignores the result if the selection changes before it arrives
    let ignore = false;

    fetchTopStandingsData(league, season)
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
  // A season has a champion once it's over (04 only sets it after the end date)
  const isFinal = isReady && data.standings.championClubId !== null;

  return (
    <SectionCard className="top-standings">
      <div className="top-standings__header">
        <SectionHeader
          title="Top of the standings"
          description={`The season's top ${TOP_CLUBS} in the ${isFinal ? "final" : "current"} ${leagueName} table.`}
          action={{
            label: isFinal ? "Final standings" : "Full standings",
            to: "/standings",
          }}
        />
      </div>
      {isReady ? (
        <StandingsTable
          standings={data.standings.standings}
          form={data.form}
          places={TABLE_PLACES[`${league}-${season}`]}
          limit={TOP_CLUBS}
        />
      ) : (
        <p className="top-standings__status">
          {hasError ? "Couldn't load the standings." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
