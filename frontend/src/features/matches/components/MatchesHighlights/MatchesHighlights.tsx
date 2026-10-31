import { useSeasonData } from "@/api/seasonData";
import HighlightCard from "@/components/ui/HighlightCard/HighlightCard";
import type { LeagueCode } from "@/data/leagues";
import type { Match, PlayedMatch } from "@/types/api"; // Types for API responses

// Props for the MatchesHighlights component: the selected league and season start year (2025 = 2025/26)
type MatchesHighlightsProps = {
  league: LeagueCode;
  season: number;
};

// Goals only count from FINISHED matches, since an awarded score isn't real goals
function isFinished(match: Match): match is PlayedMatch {
  return match.status === "FINISHED";
}

function totalGoals(match: PlayedMatch): number {
  return match.homeGoals + match.awayGoals;
}

function margin(match: PlayedMatch): number {
  return Math.abs(match.homeGoals - match.awayGoals);
}

// The first match by a ranking (higher is better), the earliest on a tie
function best(
  matches: PlayedMatch[],
  ...ranks: ((match: PlayedMatch) => number)[]
): PlayedMatch | undefined {
  const compare = (a: PlayedMatch, b: PlayedMatch) => {
    for (const rank of ranks) {
      if (rank(a) !== rank(b)) return rank(b) - rank(a);
    }
    return a.utcDate.localeCompare(b.utcDate);
  };
  return [...matches].sort(compare)[0];
}

// Score, crests and "Arsenal vs Leeds United" for a match card
function matchCard(match: PlayedMatch | undefined) {
  if (!match) return { value: "–", description: "No matches played yet" };

  return {
    value: `${match.homeGoals} – ${match.awayGoals}`,
    description: `${match.homeClubDisplayName} vs ${match.awayClubDisplayName}`,
    crests: [{ name: match.homeClubDisplayName, crestUrl: match.homeClubCrestUrl }],
    crestsAfter: [
      { name: match.awayClubDisplayName, crestUrl: match.awayClubCrestUrl },
    ],
  };
}

// Matches page highlight cards: goals per match, biggest win, highest scoring and goalless draws
export default function MatchesHighlights({
  league,
  season,
}: MatchesHighlightsProps) {
  const { data, isError } = useSeasonData(league, season);
  const titles = [
    "Goals per Match",
    "Biggest Win",
    "Highest Scoring",
    "Goalless Draws",
  ];

  // Loading and error states keep the cards in place with a dash
  if (!data) {
    const placeholder = isError ? "Couldn't load" : "Loading…";

    return (
      <>
        {titles.map((title) => (
          <HighlightCard
            key={title}
            title={title}
            value="–"
            description={placeholder}
          />
        ))}
      </>
    );
  }

  const finished = data.matches.filter(isFinished);
  const goals = finished.reduce((sum, match) => sum + totalGoals(match), 0);
  const goalless = finished.filter((match) => totalGoals(match) === 0).length;
  const share = (count: number) =>
    finished.length > 0 ? Math.round((count / finished.length) * 100) : 0;

  // Biggest margin, then most goals; most goals, then biggest margin
  const biggestWin = best(finished, margin, totalGoals);
  const highestScoring = best(finished, totalGoals, margin);

  // Returns a fragment so each card is a direct child of the page grid
  return (
    <>
      <HighlightCard
        title={titles[0]}
        value={
          finished.length > 0 ? (goals / finished.length).toFixed(2) : "–"
        }
        description={`${goals.toLocaleString("en-GB")} goals in ${finished.length} matches`}
      />
      <HighlightCard
        title={titles[1]}
        {...matchCard(biggestWin && margin(biggestWin) > 0 ? biggestWin : undefined)}
      />
      <HighlightCard title={titles[2]} {...matchCard(highestScoring)} />
      <HighlightCard
        title={titles[3]}
        value={String(goalless)}
        description={`${share(goalless)}% of matches ended 0 – 0`}
      />
    </>
  );
}
