import StandingsBanner from "../../components/StandingsBanner/StandingsBanner";
import StandingsHighlights from "../../components/StandingsHighlights/StandingsHighlights";
import type { LeagueCode } from "../../components/Sidebar/Sidebar";
import { pageTitle } from "../../utils/pageTitle";
import "./StandingsPage.scss";

// Props for the StandingsPage: the selected league and season start year (2025 = 2025/26)
type StandingsPageProps = {
  league: LeagueCode;
  season: number;
};

// Standings page ("/<league>/standings"): banner with the podium, highlight cards, more sections to come
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
    </>
  );
}
