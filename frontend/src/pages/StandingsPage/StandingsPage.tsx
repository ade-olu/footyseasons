import LeagueTable from "@/features/standings/components/LeagueTable/LeagueTable";
import StandingsBanner from "@/features/standings/components/StandingsBanner/StandingsBanner";
import StandingsHighlights from "@/features/standings/components/StandingsHighlights/StandingsHighlights";
import type { LeagueCode } from "@/data/leagues";
import HighlightCards from "@/components/ui/HighlightCards/HighlightCards";
import { pageTitle } from "@/utils/pageTitle";

// Props for the StandingsPage: the selected league and season start year (2025 = 2025/26)
type StandingsPageProps = {
  league: LeagueCode;
  season: number;
};

// Standings page ("/<league>/standings"): banner with the podium, highlight cards and the full table
export default function StandingsPage({ league, season }: StandingsPageProps) {
  return (
    <>
      <title>{pageTitle("Standings", league, season)}</title>
      {/* Title and top 3 */}
      <StandingsBanner league={league} season={season} />
      {/* Title margin, best attack, best defence and relegated clubs */}
      <HighlightCards>
        <StandingsHighlights league={league} season={season} />
      </HighlightCards>
      {/* Full table */}
      <LeagueTable league={league} season={season} />
    </>
  );
}
