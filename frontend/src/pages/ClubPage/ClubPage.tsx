import { Navigate, useParams } from "react-router-dom";
import type { LeagueCode } from "@/data/leagues";
import { useClub } from "@/features/clubs/api/club";
import { useClubSeasons } from "@/features/clubs/api/clubSeasons";
import ClubBanner from "@/features/clubs/components/ClubBanner/ClubBanner";
import ClubHighlights from "@/features/clubs/components/ClubHighlights/ClubHighlights";
import ClubNav from "@/features/clubs/components/ClubNav/ClubNav";
import {
  CLUB_TABS,
  clubPath,
  clubSlug,
  isClubTab,
  type ClubTab,
} from "@/features/clubs/utils/clubPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import HighlightCards from "@/components/ui/HighlightCards/HighlightCards";
import TabBar from "@/components/ui/TabBar/TabBar";
import { pageTitle } from "@/utils/pageTitle";
import "./ClubPage.scss";

// Props for the ClubPage: the selected league and season start year (2025 = 2025/26)
type ClubPageProps = {
  league: LeagueCode;
  season: number;
};

// One club's page ("/<league>/clubs/<clubId>/<slug>") for the selected season
export default function ClubPage({ league, season }: ClubPageProps) {
  const { clubId: clubIdParam = "", slug, tab = "" } = useParams();
  // Ids are integers, negative for clubs only in the older seasons
  const clubId = /^-?\d+$/.test(clubIdParam) ? Number(clubIdParam) : null;

  const clubSeasons = useClubSeasons(league);
  const club = useClub(clubId);

  const startYears = clubSeasons.data?.find(
    (row) => row.clubId === clubId,
  )?.startYears;

  // A club never in this league, or an unknown tab, has no page
  if (clubId === null || (clubSeasons.data && !startYears) || !isClubTab(tab)) {
    return <NotFoundPage />;
  }

  // A missing or old name in the address is replaced with the club's own
  if (club.data && slug !== clubSlug(club.data.club.displayName)) {
    return (
      <Navigate to={clubPath(league, club.data.club, season, tab)} replace />
    );
  }

  const isInSeason = startYears?.includes(season) ?? true;
  const name = club.data?.club.displayName ?? "Clubs";

  // Phones show a section only under its tab
  const onTab = (sectionTab: ClubTab) =>
    sectionTab === tab ? "club-page__on-tab" : "club-page__off-tab";

  return (
    <>
      <title>{pageTitle(name, league, season)}</title>
      {/* Back to the directory, and the club picker */}
      <ClubNav league={league} season={season} clubId={clubId} tab={tab} />
      {/* Crest, name, season summary, position, points and goal difference */}
      <ClubBanner league={league} season={season} clubId={clubId} />
      {/* Phone tabs */}
      {isInSeason && club.data && (
        <TabBar
          className="club-page__tabs"
          ariaLabel="Club sections"
          tabs={CLUB_TABS.map(({ path, label }) => ({
            label,
            to: clubPath(league, club.data.club, season, path),
            end: path === "",
          }))}
        />
      )}
      {/* Best win streak, clean sheets, biggest win and biggest defeat */}
      {isInSeason && (
        <HighlightCards className={onTab("")}>
          <ClubHighlights league={league} season={season} clubId={clubId} />
        </HighlightCards>
      )}
    </>
  );
}
