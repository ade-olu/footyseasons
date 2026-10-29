import { useSeasonData } from "@/api/seasonData";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import StandingsTable from "@/features/standings/components/StandingsTable/StandingsTable";
import { LEAGUES, type LeagueCode } from "@/data/leagues";
import { TABLE_PLACES } from "@/features/standings/data/tablePlaces";
import { getClubForm } from "@/features/standings/utils/form";
import "./TopStandings.scss";

// Number of clubs shown on the overview
const TOP_CLUBS = 5;

// Props for the TopStandings component: the selected league and season start year (2025 = 2025/26)
type TopStandingsProps = {
  league: LeagueCode;
  season: number;
};

// "Top of the standings" overview section: the top 5 of the table, linking to the full standings
export default function TopStandings({ league, season }: TopStandingsProps) {
  // Undefined until this league and season's data arrives, so an old selection never shows
  const { data, isError } = useSeasonData(league, season);

  const leagueName = LEAGUES.find((item) => item.code === league)?.name;
  // A season has a champion once it's over (03 only sets it after the end date)
  const isFinal =
    data !== undefined && data.standings.championClubId !== null;

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
      {data ? (
        <StandingsTable
          standings={data.standings.standings}
          form={getClubForm(data.matches)}
          places={TABLE_PLACES[`${league}-${season}`]}
          limit={TOP_CLUBS}
        />
      ) : (
        <p className="top-standings__status">
          {isError ? "Couldn't load the standings." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
