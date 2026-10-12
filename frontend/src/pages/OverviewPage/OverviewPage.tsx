import HeroBanner from "../../components/HeroBanner/HeroBanner";
import SeasonHighlights from "../../components/SeasonHighlights/SeasonHighlights";
import type { LeagueCode } from "../../components/Sidebar/Sidebar";
import "./OverviewPage.scss";

// Props for the OverviewPage: the selected league and season start year (2025 = 2025/26)
type OverviewPageProps = {
  league: LeagueCode;
  season: number;
};

// Overview page ("/"): hero banner, then the grid of season sections
export default function OverviewPage({ league, season }: OverviewPageProps) {
  return (
    <>
      {/* Hero banner section */}
      <HeroBanner league={league} season={season} />
      {/* Grid section for page content */}
      <section className="overview-page__grid">
        {/* Season highlight cards */}
        <SeasonHighlights league={league} season={season} />
      </section>
    </>
  );
}
