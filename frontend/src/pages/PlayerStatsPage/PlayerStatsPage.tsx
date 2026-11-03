import AllPlayers from "@/features/players/components/AllPlayers/AllPlayers";
import PlayersBanner from "@/features/players/components/PlayersBanner/PlayersBanner";
import SeasonLeaders from "@/features/players/components/SeasonLeaders/SeasonLeaders";
import type { LeagueCode } from "@/data/leagues";
import { pageTitle } from "@/utils/pageTitle";

// Props for the PlayerStatsPage: the selected league and season start year (2025 = 2025/26)
type PlayerStatsPageProps = {
  league: LeagueCode;
  season: number;
};

// Player Stats page ("/<league>/player-stats"): banner with the podium, six leader cards
// and every player in a table
export default function PlayerStatsPage({
  league,
  season,
}: PlayerStatsPageProps) {
  return (
    <>
      <title>{pageTitle("Player Stats", league, season)}</title>
      {/* Title and top 3 goal contributors */}
      <PlayersBanner league={league} season={season} />
      {/* Goals, assists, xG, xA, chances created and finishing leaders */}
      <SeasonLeaders league={league} season={season} />
      {/* Every player, sortable and filterable */}
      <AllPlayers league={league} season={season} />
    </>
  );
}
