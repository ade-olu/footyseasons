import { Navigate, useParams } from "react-router-dom";
import type { LeagueCode } from "@/data/leagues";
import { useClub } from "@/features/clubs/api/club";
import { useClubSeasons } from "@/features/clubs/api/clubSeasons";
import ClubBanner from "@/features/clubs/components/ClubBanner/ClubBanner";
import ClubHighlights from "@/features/clubs/components/ClubHighlights/ClubHighlights";
import ClubHonours from "@/features/clubs/components/ClubHonours/ClubHonours";
import ClubLeagueTable from "@/features/clubs/components/ClubLeagueTable/ClubLeagueTable";
import ClubNav from "@/features/clubs/components/ClubNav/ClubNav";
import ClubResults from "@/features/clubs/components/ClubResults/ClubResults";
import ClubTopPlayers from "@/features/clubs/components/ClubTopPlayers/ClubTopPlayers";
import HomeAndAway from "@/features/clubs/components/HomeAndAway/HomeAndAway";
import PositionChart from "@/features/clubs/components/PositionChart/PositionChart";
import SeasonBySeason from "@/features/clubs/components/SeasonBySeason/SeasonBySeason";
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
      {/* The season's chart and tables, in two columns from tablet width */}
      {isInSeason && (
        <div className="club-page__season">
          {/* The club's league position after every round */}
          <PositionChart
            className={`club-page__position ${onTab("")}`}
            league={league}
            season={season}
            clubId={clubId}
          />
          {/* Five rows of the table around the club */}
          <ClubLeagueTable
            className={`club-page__table ${onTab("")}`}
            league={league}
            season={season}
            clubId={clubId}
          />
          {/* The club's matches, six a page */}
          <ClubResults
            className={`club-page__results ${onTab("matches")}`}
            league={league}
            season={season}
            clubId={clubId}
          />
          {/* Points, record and goals at home against away */}
          <HomeAndAway
            className={`club-page__venue ${onTab("")}`}
            league={league}
            season={season}
            clubId={clubId}
          />
        </div>
      )}
      {/* Final league position in every season since 2014/15 */}
      <SeasonBySeason
        className={isInSeason ? onTab("history") : undefined}
        league={league}
        season={season}
        clubId={clubId}
      />
      {/* League titles, cups and season awards */}
      {isInSeason && (
        <ClubHonours
          className={onTab("history")}
          season={season}
          clubId={clubId}
        />
      )}
      {/* The club's leaders in goals, assists and minutes */}
      {isInSeason && club.data && (
        <ClubTopPlayers
          className={onTab("squad")}
          league={league}
          season={season}
          clubId={clubId}
          clubName={club.data.club.displayName}
        />
      )}
    </>
  );
}
