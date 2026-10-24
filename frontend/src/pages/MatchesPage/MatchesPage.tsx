import type { LeagueCode } from "../../components/Sidebar/Sidebar";
import { pageTitle } from "../../utils/pageTitle";

// Props for the MatchesPage: the selected league and season start year (2025 = 2025/26)
type MatchesPageProps = {
  league: LeagueCode;
  season: number;
};

// Matches page ("/matches")
// Placeholder until the page is designed and built
export default function MatchesPage({ league, season }: MatchesPageProps) {
  return (
    <>
      <title>{pageTitle("Matches", league, season)}</title>
      <h1>Matches</h1>
    </>
  );
}
