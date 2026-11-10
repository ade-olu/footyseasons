import { Navigate, useParams } from "react-router-dom";
import type { LeagueCode } from "@/data/leagues";
import { useClub } from "@/features/clubs/api/club";
import { useClubSeasons } from "@/features/clubs/api/clubSeasons";
import ClubBanner from "@/features/clubs/components/ClubBanner/ClubBanner";
import ClubHighlights from "@/features/clubs/components/ClubHighlights/ClubHighlights";
import ClubNav from "@/features/clubs/components/ClubNav/ClubNav";
import { clubPath, clubSlug } from "@/features/clubs/utils/clubPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import { pageTitle } from "@/utils/pageTitle";
import "./ClubPage.scss";

// Props for the ClubPage: the selected league and season start year (2025 = 2025/26)
type ClubPageProps = {
  league: LeagueCode;
  season: number;
};

// One club's page ("/<league>/clubs/<clubId>/<slug>") for the selected season
export default function ClubPage({ league, season }: ClubPageProps) {
  const { clubId: clubIdParam = "", slug } = useParams();
  // Ids are integers, negative for clubs only in the older seasons
  const clubId = /^-?\d+$/.test(clubIdParam) ? Number(clubIdParam) : null;

  const clubSeasons = useClubSeasons(league);
  const club = useClub(clubId);

  const startYears = clubSeasons.data?.find(
    (row) => row.clubId === clubId,
  )?.startYears;

  // A club that was never in this league has no page here
  if (clubId === null || (clubSeasons.data && !startYears)) {
    return <NotFoundPage />;
  }

  // A missing or old name in the address is replaced with the club's own
  if (club.data && slug !== clubSlug(club.data.club.displayName)) {
    return <Navigate to={clubPath(league, club.data.club, season)} replace />;
  }

  const isInSeason = startYears?.includes(season) ?? true;
  const name = club.data?.club.displayName ?? "Clubs";

  return (
    <>
      <title>{pageTitle(name, league, season)}</title>
      {/* Back to the directory, and the club picker */}
      <ClubNav league={league} season={season} clubId={clubId} />
      {/* Crest, name, season summary, position, points and goal difference */}
      <ClubBanner league={league} season={season} clubId={clubId} />
      {/* Best win streak, clean sheets, biggest win and biggest defeat */}
      {isInSeason && (
        <section className="club-page__highlights">
          <ClubHighlights league={league} season={season} clubId={clubId} />
        </section>
      )}
    </>
  );
}
