import MatchesBanner from "@/features/matches/components/MatchesBanner/MatchesBanner";
import MatchesHighlights from "@/features/matches/components/MatchesHighlights/MatchesHighlights";
import MatchweekResults from "@/features/matches/components/MatchweekResults/MatchweekResults";
import type { LeagueCode } from "@/data/leagues";
import { pageTitle } from "@/utils/pageTitle";
import "./MatchesPage.scss";

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
      {/* Goals per match, biggest win, highest scoring and goalless draws */}
      <section className="matches-page__highlights">
        <MatchesHighlights league={league} season={season} />
      </section>
      {/* One matchweek's results */}
      <MatchweekResults league={league} season={season} />
    </>
  );
}
