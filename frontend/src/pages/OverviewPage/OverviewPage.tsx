import FinalDayMatches from "@/features/matches/components/FinalDayMatches/FinalDayMatches";
import HeroBanner from "@/features/season/components/HeroBanner/HeroBanner";
import SeasonAwards from "@/features/awards/components/SeasonAwards/SeasonAwards";
import SeasonHighlights from "@/features/season/components/SeasonHighlights/SeasonHighlights";
import type { LeagueCode } from "@/data/leagues";
import { pageTitle } from "@/utils/pageTitle";
import TopPlayers from "@/features/players/components/TopPlayers/TopPlayers";
import TopStandings from "@/features/standings/components/TopStandings/TopStandings";
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
      <title>{pageTitle("Overview", league, season)}</title>
      {/* Hero banner section */}
      <HeroBanner league={league} season={season} />
      {/* Grid section for page content */}
      <section className="overview-page__grid">
        {/* Season highlight cards */}
        <SeasonHighlights league={league} season={season} />
        {/* Season award winners */}
        <SeasonAwards league={league} season={season} />
        {/* Top 5 of the league table */}
        <TopStandings league={league} season={season} />
        {/* Top 3 scorers and assist providers, side by side */}
        <TopPlayers
          league={league}
          season={season}
          stat="goals"
          title="Top scorers"
        />
        <TopPlayers
          league={league}
          season={season}
          stat="assists"
          title="Top assists providers"
        />
        {/* Results from the last day of the season */}
        <FinalDayMatches league={league} season={season} />
      </section>
    </>
  );
}
