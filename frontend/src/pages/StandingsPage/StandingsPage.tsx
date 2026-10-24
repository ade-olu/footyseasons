import StandingsBanner from "../../components/StandingsBanner/StandingsBanner";
import type { LeagueCode } from "../../components/Sidebar/Sidebar";
import { pageTitle } from "../../utils/pageTitle";

// Props for the StandingsPage: the selected league and season start year (2025 = 2025/26)
type StandingsPageProps = {
  league: LeagueCode;
  season: number;
};

// Standings page ("/standings"): banner with the podium, more sections to come
export default function StandingsPage({ league, season }: StandingsPageProps) {
  return (
    <>
      <title>{pageTitle("Standings", league, season)}</title>
      {/* Title and top 3 */}
      <StandingsBanner league={league} season={season} />
    </>
  );
}
