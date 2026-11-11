import { useSeasonData } from "@/api/seasonData";
import HighlightCard from "@/components/ui/HighlightCard/HighlightCard";
import HighlightCardPlaceholders from "@/components/ui/HighlightCardPlaceholders/HighlightCardPlaceholders";
import type { LeagueCode } from "@/data/leagues";
import { getTableName } from "@/data/tableNames";
import {
  getBiggestResult,
  getClubMatches,
  getWinStreak,
} from "@/features/clubs/utils/clubPage";
import type { PlayedMatch } from "@/types/api";

// Props for the ClubHighlights component: the selected league, season and club
type ClubHighlightsProps = {
  league: LeagueCode;
  season: number;
  clubId: number;
};

const TITLES = [
  "Best Win Streak",
  "Clean Sheets",
  "Biggest Win",
  "Biggest Defeat",
];

// "4 Oct"
const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

// Score, crests and "Arsenal vs Leeds" for a match card
function matchCard(match: PlayedMatch | undefined, none: string) {
  if (!match) return { value: "–", description: none };
  const home = getTableName(match.homeClubId, match.homeClubDisplayName);
  const away = getTableName(match.awayClubId, match.awayClubDisplayName);

  return {
    value: `${match.homeGoals} – ${match.awayGoals}`,
    // Table names fit the card ("Wolves vs Man City"); hover shows the full ones
    description: `${home} vs ${away}`,
    descriptionTitle: `${match.homeClubDisplayName} vs ${match.awayClubDisplayName}`,
    crests: [
      { name: match.homeClubDisplayName, crestUrl: match.homeClubCrestUrl },
    ],
    crestsAfter: [
      { name: match.awayClubDisplayName, crestUrl: match.awayClubCrestUrl },
    ],
  };
}

// Which rounds the longest run of wins covered, and a shorter version for phones
function streakDescription(streak: PlayedMatch[]) {
  const first = streak[0];
  const last = streak[streak.length - 1];
  if (streak.length === 1) return { description: "No wins back to back" };
  // Matchweeks, unless a rescheduled match makes the range longer than the run
  if (last.matchday - first.matchday + 1 === streak.length) {
    return {
      description: `Wins in a row, matchweeks ${first.matchday} to ${last.matchday}`,
      shortDescription: `Matchweeks ${first.matchday} to ${last.matchday}`,
    };
  }
  const from = shortDate.format(new Date(first.utcDate));
  const to = shortDate.format(new Date(last.utcDate));
  return {
    description: `Wins in a row, ${from} to ${to}`,
    shortDescription: `${from} to ${to}`,
  };
}

// Club page highlight cards: best win streak, clean sheets, biggest win and biggest defeat
export default function ClubHighlights({
  league,
  season,
  clubId,
}: ClubHighlightsProps) {
  const { data, isError } = useSeasonData(league, season);

  if (!data) {
    return <HighlightCardPlaceholders titles={TITLES} isError={isError} />;
  }

  const matches = getClubMatches(data.matches, clubId);
  const streak = getWinStreak(matches, clubId);
  const cleanSheets = matches.filter(
    (match) =>
      (match.homeClubId === clubId ? match.awayGoals : match.homeGoals) === 0,
  ).length;
  const cleanSheetShare =
    matches.length > 0 ? Math.round((cleanSheets / matches.length) * 100) : 0;

  // Returns a fragment so each card is a direct child of the page grid
  return (
    <>
      <HighlightCard
        title={TITLES[0]}
        value={String(streak?.length ?? 0)}
        {...(streak
          ? streakDescription(streak)
          : { description: "No wins this season" })}
      />
      <HighlightCard
        title={TITLES[1]}
        value={String(cleanSheets)}
        description={`In ${cleanSheetShare}% of league matches`}
      />
      <HighlightCard
        title={TITLES[2]}
        {...matchCard(getBiggestResult(matches, clubId, "win"), "No wins")}
      />
      <HighlightCard
        title={TITLES[3]}
        {...matchCard(
          getBiggestResult(matches, clubId, "defeat"),
          "Unbeaten in the league",
        )}
      />
    </>
  );
}
