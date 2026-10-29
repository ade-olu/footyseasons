import { useEffect, useState } from "react";
import { fetchSeasonData } from "@/api/seasonData";
import HighlightCard from "@/components/ui/HighlightCard/HighlightCard";
import { TABLE_PLACES } from "@/features/standings/data/tablePlaces";
import type { LeagueCode } from "@/data/leagues";
import type { Standing } from "@/types/api"; // Types for API responses

// Everything the cards need, worked out from the standings
type StandingsHighlightsData = {
  league: LeagueCode;
  season: number;
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

// Gets the standings and picks the leader, best attack, best defence and relegated clubs
async function fetchStandingsHighlightsData(
  league: LeagueCode,
  season: number,
): Promise<StandingsHighlightsData> {
  const {
    standings: { standings, championClubId },
  } = await fetchSeasonData(league, season);

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
    league,
    season,
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
  const [data, setData] = useState<StandingsHighlightsData | null>(null);
  const [error, setError] = useState<{
    league: LeagueCode;
    season: number;
  } | null>(null);

  // Refetch whenever the selected league or season changes
  useEffect(() => {
    // Ignores the result if the selection changes before it arrives
    let ignore = false;

    fetchStandingsHighlightsData(league, season)
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

  // Loading and error states keep the cards in place with a dash
  if (!isReady || !data) {
    const placeholder = hasError ? "Couldn't load" : "Loading…";

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
    data;
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
