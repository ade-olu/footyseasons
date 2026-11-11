import MatchesBanner from "@/features/matches/components/MatchesBanner/MatchesBanner";
import MatchesHighlights from "@/features/matches/components/MatchesHighlights/MatchesHighlights";
import MatchweekBrowser from "@/features/matches/components/MatchweekBrowser/MatchweekBrowser";
import type { LeagueCode } from "@/data/leagues";
import HighlightCards from "@/components/ui/HighlightCards/HighlightCards";
import { pageTitle } from "@/utils/pageTitle";

// Props for the MatchesPage: the selected league and season start year (2025 = 2025/26)
type MatchesPageProps = {
  league: LeagueCode;
  season: number;
};

// Matches page ("/<league>/matches"): banner with the result split, highlight cards and results by matchweek
export default function MatchesPage({ league, season }: MatchesPageProps) {
  return (
    <>
      <title>{pageTitle("Matches", league, season)}</title>
      {/* Title and home win / draw / away win split */}
      <MatchesBanner league={league} season={season} />
      {/* Goals per match, biggest win, most common score and goalless draws */}
      <HighlightCards>
        <MatchesHighlights league={league} season={season} />
      </HighlightCards>
      {/* One matchweek's results, its summary and the match of the season */}
      <MatchweekBrowser league={league} season={season} />
    </>
  );
}
