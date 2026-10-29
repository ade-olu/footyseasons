import { useSeasonData, type SeasonData } from "@/api/seasonData";
import HighlightCard from "@/components/ui/HighlightCard/HighlightCard";
import { TABLE_PLACES } from "@/features/standings/data/tablePlaces";
import type { LeagueCode } from "@/data/leagues";
import type { Standing } from "@/types/api"; // Types for API responses

// Everything the cards need, worked out from the standings
type StandingsHighlightsData = {
  isFinal: boolean;
  leader: Standing;
  runnerUp: Standing | undefined;
  bestAttack: Standing;
  bestDefence: Standing;
  relegated: Standing[];
};

// Props for the StandingsHighlights component: the selected league and season start year (2025 = 2025/26)
type StandingsHighlightsProps = {
  league: LeagueCode;
  season: number;
};

// "West Ham, Burnley and Wolves"
const listFormat = new Intl.ListFormat("en-GB", { type: "conjunction" });

// Picks the leader, best attack, best defence and relegated clubs from the standings
function getHighlights(
  { standings: { standings, championClubId } }: SeasonData,
  league: LeagueCode,
  season: number,
): StandingsHighlightsData {

  // Standings are in table order, so on a tie the higher-placed club wins
  const bestAttack = standings.reduce((best, club) =>
    club.goalsFor > best.goalsFor ? club : best,
  );
  const bestDefence = standings.reduce((best, club) =>
    club.goalsAgainst < best.goalsAgainst ? club : best,
  );

  // Relegation places come from tablePlaces.ts; position is null if unranked
  const places = TABLE_PLACES[`${league}-${season}`]?.relegation ?? [];
  const relegated = standings.filter((club, index) =>
    places.includes(club.position ?? index + 1),
  );

  return {
    isFinal: championClubId !== null,
    leader: standings[0],
    runnerUp: standings[1],
    bestAttack,
    bestDefence,
    relegated,
  };
}

// The club's name and crest for a card
function crestOf(club: Standing) {
  return { name: club.displayName, crestUrl: club.crestUrl };
}

// Standings page highlight cards: title margin, best attack, best defence and relegated clubs
export default function StandingsHighlights({
  league,
  season,
}: StandingsHighlightsProps) {
  const { data, isError } = useSeasonData(league, season);

  // Loading and error states keep the cards in place with a dash
  if (!data) {
    const placeholder = isError ? "Couldn't load" : "Loading…";

    return (
      <>
        {["Title Margin", "Best Attack", "Best Defence", "Relegated"].map(
          (title) => (
            <HighlightCard
              key={title}
              title={title}
              value="–"
              description={placeholder}
            />
          ),
        )}
      </>
    );
  }

  const { isFinal, leader, runnerUp, bestAttack, bestDefence, relegated } =
    getHighlights(data, league, season);
  const margin = runnerUp ? leader.points - runnerUp.points : 0;

  // Returns a fragment so each card is a direct child of the page grid
  return (
    <>
      <HighlightCard
        title={isFinal ? "Title Margin" : "Lead at the Top"}
        value={`${margin} ${margin === 1 ? "pt" : "pts"}`}
        description={
          runnerUp
            ? `${leader.displayName} over ${runnerUp.displayName}`
            : leader.displayName
        }
        crests={[crestOf(leader)]}
      />
      <HighlightCard
        title="Best Attack"
        value={String(bestAttack.goalsFor)}
        description={`Goals scored by ${bestAttack.displayName}`}
        crests={[crestOf(bestAttack)]}
      />
      <HighlightCard
        title="Best Defence"
        value={String(bestDefence.goalsAgainst)}
        description={`Goals conceded by ${bestDefence.displayName}`}
        crests={[crestOf(bestDefence)]}
      />
      <HighlightCard
        title={isFinal ? "Relegated" : "Relegation Zone"}
        value={relegated.length > 0 ? String(relegated.length) : "–"}
        description={
          relegated.length > 0
            ? listFormat.format(relegated.map((club) => club.shortName))
            : "No relegation places"
        }
        crests={relegated.map(crestOf)}
      />
    </>
  );
}
