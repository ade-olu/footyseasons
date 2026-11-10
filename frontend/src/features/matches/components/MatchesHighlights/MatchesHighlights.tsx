import { useSeasonData } from "@/api/seasonData";
import HighlightCard from "@/components/ui/HighlightCard/HighlightCard";
import HighlightCardPlaceholders from "@/components/ui/HighlightCardPlaceholders/HighlightCardPlaceholders";
import type { LeagueCode } from "@/data/leagues";
import type { PlayedMatch } from "@/types/api"; // Types for API responses
import { best, isFinished, margin, totalGoals } from "@/utils/match";

// Props for the MatchesHighlights component: the selected league and season start year (2025 = 2025/26)
type MatchesHighlightsProps = {
  league: LeagueCode;
  season: number;
};

// Score, crests and "Arsenal vs Leeds United" for a match card
function matchCard(match: PlayedMatch | undefined) {
  if (!match) return { value: "–", description: "No matches played yet" };

  return {
    value: `${match.homeGoals} – ${match.awayGoals}`,
    description: `${match.homeClubDisplayName} vs ${match.awayClubDisplayName}`,
    crests: [
      { name: match.homeClubDisplayName, crestUrl: match.homeClubCrestUrl },
    ],
    crestsAfter: [
      { name: match.awayClubDisplayName, crestUrl: match.awayClubCrestUrl },
    ],
  };
}

// The most frequent score, winner's goals first ("2 – 1" counts 1 – 2 too),
// the higher-scoring one on a tie
function mostCommonScore(matches: PlayedMatch[]) {
  const counts = new Map<
    string,
    { high: number; low: number; count: number }
  >();

  for (const match of matches) {
    const high = Math.max(match.homeGoals, match.awayGoals);
    const low = Math.min(match.homeGoals, match.awayGoals);
    const key = `${high}-${low}`;
    const entry = counts.get(key) ?? { high, low, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }

  return [...counts.values()].sort(
    (a, b) =>
      b.count - a.count || b.high + b.low - (a.high + a.low) || b.high - a.high,
  )[0];
}

// Matches page highlight cards: goals per match, biggest win, most common score and goalless draws
export default function MatchesHighlights({
  league,
  season,
}: MatchesHighlightsProps) {
  const { data, isError } = useSeasonData(league, season);
  const titles = [
    "Goals per Match",
    "Biggest Win",
    "Most Common Score",
    "Goalless Draws",
  ];

  if (!data) {
    return <HighlightCardPlaceholders titles={titles} isError={isError} />;
  }

  const finished = data.matches.filter(isFinished);
  const goals = finished.reduce((sum, match) => sum + totalGoals(match), 0);
  const goalless = finished.filter((match) => totalGoals(match) === 0).length;
  const share = (count: number) =>
    finished.length > 0 ? Math.round((count / finished.length) * 100) : 0;

  // Biggest margin, then most goals
  const biggestWin = best(finished, margin, totalGoals);
  const common = mostCommonScore(finished);
  const commonMatches = common
    ? `${common.count} ${common.count === 1 ? "match" : "matches"}`
    : "";

  // Returns a fragment so each card is a direct child of the page grid
  return (
    <>
      <HighlightCard
        title={titles[0]}
        value={finished.length > 0 ? (goals / finished.length).toFixed(2) : "–"}
        description={`${goals.toLocaleString("en-GB")} goals in ${finished.length} matches`}
      />
      <HighlightCard
        title={titles[1]}
        {...matchCard(
          biggestWin && margin(biggestWin) > 0 ? biggestWin : undefined,
        )}
      />
      <HighlightCard
        title={titles[2]}
        value={common ? `${common.high} – ${common.low}` : "–"}
        description={
          !common
            ? "No matches played yet"
            : common.high === common.low
              ? commonMatches
              : `${commonMatches}, either way round`
        }
      />
      <HighlightCard
        title={titles[3]}
        value={String(goalless)}
        description={`${share(goalless)}% of matches ended 0 – 0`}
      />
    </>
  );
}
