import { useSeasonData } from "@/api/seasonData";
import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import FittedName from "@/components/ui/FittedName/FittedName";
import { getLeagueName, type LeagueCode } from "@/data/leagues";
import { useClub } from "@/features/clubs/api/club";
import { useClubSeasons } from "@/features/clubs/api/clubSeasons";
import { ordinal } from "@/features/clubs/utils/clubDirectory";
import {
  formatGoalDifference,
  getClubSummary,
  shortClubNames,
} from "@/features/clubs/utils/clubPage";
import { EARLIEST_SEASON, LATEST_SEASON } from "@/hooks/useSelection";
import { seasonLabel } from "@/utils/season";
import "./ClubBanner.scss";

const TOTAL_SEASONS = LATEST_SEASON - EARLIEST_SEASON + 1;

// Props for the ClubBanner component: the selected league, season and club
type ClubBannerProps = {
  league: LeagueCode;
  season: number;
  clubId: number;
};

// Club page banner: crest, name, a summary of the season and its finish, points and goal difference
export default function ClubBanner({ league, season, clubId }: ClubBannerProps) {
  const seasonData = useSeasonData(league, season);
  const clubData = useClub(clubId);
  const clubSeasons = useClubSeasons(league);

  const standings = seasonData.data?.standings;
  const standing = standings?.standings.find((row) => row.clubId === clubId);
  // The standings row when the club played that season, the club's details otherwise
  const club = standing ?? clubData.data?.club;
  const seasonsInLeague = clubSeasons.data?.find(
    (row) => row.clubId === clubId,
  )?.startYears.length;
  const isNotInLeague = Boolean(standings && !standing);
  const isError =
    seasonData.isError || clubData.isError || clubSeasons.isError;

  let description: string | null = null;
  if (standings && standing) {
    description = getClubSummary(
      standing,
      standings.standings,
      standings.championClubId,
      league,
      season,
    );
  } else if (isNotInLeague && club && seasonsInLeague !== undefined) {
    description = `${club.displayName} played in ${seasonsInLeague} of the ${TOTAL_SEASONS} ${getLeagueName(league)} seasons since ${seasonLabel(EARLIEST_SEASON)}.`;
  }

  const metrics = [
    {
      label: "Position",
      value: standing?.position ? ordinal(standing.position) : undefined,
    },
    { label: "Points", value: standing?.points },
    {
      label: "Goal Difference",
      shortLabel: "GD",
      value: standing ? formatGoalDifference(standing) : undefined,
    },
  ];

  return (
    <section
      className="club-banner"
      aria-labelledby="club-banner-title"
      aria-busy={!description && !isError}
    >
      <div className="club-banner__identity">
        <ClubCrest
          className="club-banner__crest"
          src={club?.crestUrl ?? null}
          name={club?.displayName ?? ""}
          onDark
        />
        {/* One line: a shorter name when the full one doesn't fit, wrapped if none does */}
        <h2 id="club-banner-title" className="club-banner__title">
          {club ? (
            <FittedName
              className="club-banner__name"
              name={club.displayName}
              shortNames={shortClubNames(club)}
              wrapWhenTooLong
            />
          ) : isError ? (
            "Club"
          ) : (
            "Loading…"
          )}
        </h2>
        {isError && !description && (
          <p className="club-banner__description" role="alert">
            Couldn't load the club.
          </p>
        )}
        {description && (
          <p className="club-banner__description">{description}</p>
        )}
      </div>

      {/* No table numbers for a season the club wasn't in the league */}
      {!isNotInLeague && (
        // dt = label, dd = value; CSS shows the value first
        <dl className="club-banner__metrics">
          {metrics.map(({ label, shortLabel, value }) => (
            <div key={label} className="club-banner__metric">
              <dt className="club-banner__metric-label">
                {shortLabel ? (
                  // "GD" on small phones, where the full label wraps
                  <>
                    <span className="club-banner__label-full">{label}</span>
                    <abbr className="club-banner__label-short" title={label}>
                      {shortLabel}
                    </abbr>
                  </>
                ) : (
                  label
                )}
              </dt>
              <dd className="club-banner__metric-value">{value ?? "–"}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
