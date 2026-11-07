import ClubsBanner from "@/features/clubs/components/ClubsBanner/ClubsBanner";
import type { LeagueCode } from "@/data/leagues";
import { pageTitle } from "@/utils/pageTitle";

// Props for the ClubsPage: the selected league and season start year (2025 = 2025/26)
type ClubsPageProps = {
  league: LeagueCode;
  season: number;
};

// Clubs page ("/<league>/clubs"): banner with the season's club counts
export default function ClubsPage({ league, season }: ClubsPageProps) {
  return (
    <>
      <title>{pageTitle("Clubs", league, season)}</title>
      {/* Title and club counts */}
      <ClubsBanner league={league} season={season} />
    </>
  );
}
