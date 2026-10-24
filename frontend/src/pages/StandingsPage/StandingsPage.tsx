import LeagueTable from "../../components/standings/LeagueTable/LeagueTable";
import StandingsBanner from "../../components/standings/StandingsBanner/StandingsBanner";
import StandingsHighlights from "../../components/standings/StandingsHighlights/StandingsHighlights";
import type { LeagueCode } from "../../components/layout/Sidebar/Sidebar";
import { pageTitle } from "../../utils/pageTitle";
import "./StandingsPage.scss";

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
      <section className="standings-page__highlights">
        <StandingsHighlights league={league} season={season} />
      </section>
      {/* Full table */}
      <LeagueTable league={league} season={season} />
    </>
  );
}
