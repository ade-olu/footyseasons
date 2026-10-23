import StandingsBanner from "../../components/StandingsBanner/StandingsBanner";
import type { LeagueCode } from "../../components/Sidebar/Sidebar";

// Props for the StandingsPage: the selected league and season start year (2025 = 2025/26)
type StandingsPageProps = {
  league: LeagueCode;
  season: number;
};

// Standings page ("/standings"): banner with the podium, more sections to come
export default function StandingsPage({ league, season }: StandingsPageProps) {
  return (
    <>
      {/* Title and top 3 */}
      <StandingsBanner league={league} season={season} />
    </>
  );
}
