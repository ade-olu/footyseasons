import type { LeagueCode } from "../../data/leagues";
import { pageTitle } from "../../utils/pageTitle";

// Props for the ClubsPage: the selected league and season start year (2025 = 2025/26)
type ClubsPageProps = {
  league: LeagueCode;
  season: number;
};

// Clubs page ("/clubs")
// Placeholder until the page is designed and built
export default function ClubsPage({ league, season }: ClubsPageProps) {
  return (
    <>
      <title>{pageTitle("Clubs", league, season)}</title>
      <h1>Clubs</h1>
    </>
  );
}
