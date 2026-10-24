import type { LeagueCode } from "../../components/layout/Sidebar/Sidebar";
import { pageTitle } from "../../utils/pageTitle";

// Props for the PlayerStatsPage: the selected league and season start year (2025 = 2025/26)
type PlayerStatsPageProps = {
  league: LeagueCode;
  season: number;
};

// Player Stats page ("/player-stats")
// Placeholder until the page is designed and built
export default function PlayerStatsPage({
  league,
  season,
}: PlayerStatsPageProps) {
  return (
    <>
      <title>{pageTitle("Player Stats", league, season)}</title>
      <h1>Player Stats</h1>
    </>
  );
}
