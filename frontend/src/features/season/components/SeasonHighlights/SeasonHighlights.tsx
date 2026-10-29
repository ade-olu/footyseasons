import { usePlayers } from "@/api/players";
import { useSeasonData, type SeasonData } from "@/api/seasonData";
import HighlightCard from "@/components/ui/HighlightCard/HighlightCard";

import type { LeagueCode } from "@/data/leagues";
import type { PlayersResponse, Standing } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";

// Everything the highlight cards need, worked out from the standings, matches and players responses
type HighlightsData = {
  matchesFinished: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  streakClub: Standing | undefined; // Club with the longest win streak (undefined if streaks haven't been calculated)
};

// Props for the SeasonHighlights component: the selected league and season start year (2025 = 2025/26)
type SeasonHighlightsProps = {
  league: LeagueCode;
  season: number;
};

// Turns a league season's standings, matches and player totals into HighlightsData
function getHighlightsData(
  { standings: { standings }, matches }: SeasonData,
  { totals }: PlayersResponse,
): HighlightsData {

  // Only matches that were actually played count here (AWARDED scores aren't real goals)
  const finished = matches
    .filter(isPlayed)
    .filter((match) => match.status === "FINISHED");

  const goalsScored = finished.reduce(
    (total, match) => total + match.homeGoals + match.awayGoals,
    0,
  );

  // Clean sheets are null until 05_calculate_aggregates.py has run
  const cleanSheets = standings.reduce(
    (total, club) => total + (club.cleanSheets ?? 0),
    0,
  );

  // Standings are in table order, so on a tie the higher-placed club wins
  const streakClub = standings.reduce<Standing | undefined>(
    (best, club) =>
      (club.longestWinStreak ?? 0) > (best?.longestWinStreak ?? 0)
        ? club
        : best,
    undefined,
  );

  return {
    matchesFinished: finished.length,
    goalsScored,
    assists: totals.assists, // Every player's assists, from Understat
    cleanSheets,
    streakClub,
  };
}

// Shows a whole number with thousands separators, e.g. 1043 -> "1,043"
function formatCount(value: number) {
  return value.toLocaleString("en-GB");
}

// Shows a per-match average to 2 decimal places (0 if no matches have been played yet)
function perMatch(total: number, matches: number) {
  return (matches > 0 ? total / matches : 0).toFixed(2);
}

// SeasonHighlights component that shows the row of 4 highlight cards for the selected season
export default function SeasonHighlights({
  league,
  season,
}: SeasonHighlightsProps) {
  // Both load at once; limit 0 skips the player list, since only the totals are needed
  const seasonQuery = useSeasonData(league, season);
  const playersQuery = usePlayers(league, season, "goals", 0);

  // Loading and error states keep the cards in place with a dash, so the grid doesn't jump
  if (!seasonQuery.data || !playersQuery.data) {
    const placeholder =
      seasonQuery.isError || playersQuery.isError ? "Couldn't load" : "Loading…";

    return (
      <>
        {["Total Goals", "Total Assists", "Clean Sheets", "Best Win Streak"].map(
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

  const data = getHighlightsData(seasonQuery.data, playersQuery.data);
  const { matchesFinished, streakClub } = data;
  const streak = streakClub?.longestWinStreak ?? 0;

  // Returns a fragment so each card is a direct child of the app grid
  return (
    <>
      <HighlightCard
        title="Total Goals"
        value={formatCount(data.goalsScored)}
        description={`${perMatch(data.goalsScored, matchesFinished)} goals per match`}
      />
      <HighlightCard
        title="Total Assists"
        value={formatCount(data.assists)}
        description={`${perMatch(data.assists, matchesFinished)} assists per match`}
      />
      <HighlightCard
        title="Clean Sheets"
        value={formatCount(data.cleanSheets)}
        description={`${perMatch(data.cleanSheets, matchesFinished)} clean sheets per match`}
      />
      {/* Best win streak shows the club's crest and name instead of a number */}
      {streakClub && streak > 0 ? (
        <HighlightCard
          title="Best Win Streak"
          value={streakClub.shortName}
          description={`${streak} consecutive ${streak === 1 ? "win" : "wins"}`}
          club={{ name: streakClub.displayName, crestUrl: streakClub.crestUrl }}
        />
      ) : (
        <HighlightCard
          title="Best Win Streak"
          value="–"
          description="No wins yet"
        />
      )}
    </>
  );
}
