import { useEffect, useState } from "react";
import { fetchSeasonData } from "../../api/seasonData";
import ClubCrest from "../ClubCrest/ClubCrest";
import type { LeagueCode } from "../Sidebar/Sidebar";
import type { Standing } from "../../types/api"; // Types for API responses
import "./StandingsBanner.scss";

// The top 3 and the line under the title for one league and season
type StandingsBannerData = {
  league: LeagueCode;
  season: number;
  podium: Standing[];
  description: string;
};

// Props for the StandingsBanner component: the selected league and season start year (2025 = 2025/26)
type StandingsBannerProps = {
  league: LeagueCode;
  season: number;
};

// Gets the standings and matches and works out the podium and description
async function fetchStandingsBannerData(
  league: LeagueCode,
  season: number,
): Promise<StandingsBannerData> {
  const {
    standings: { standings, championClubId },
    matches,
  } = await fetchSeasonData(league, season);

  // Every club plays every other club home and away
  const total = standings.length * (standings.length - 1);
  const played = matches.filter(
    (match) => match.status === "FINISHED" || match.status === "AWARDED",
  ).length;
  const places = "with European qualification and relegation places.";

  let description = `The table so far, after ${played} of ${total} matches, ${places}`;
  if (championClubId !== null) {
    description =
      played === total
        ? `The complete table after all ${total} matches, ${places}`
        : `The final table after ${played} of ${total} matches, ${places}`;
  }

  return { league, season, podium: standings.slice(0, 3), description };
}

// Standings page banner: title, description and the top 3 on a podium
export default function StandingsBanner({
  league,
  season,
}: StandingsBannerProps) {
  const [data, setData] = useState<StandingsBannerData | null>(null);
  const [error, setError] = useState<{
    league: LeagueCode;
    season: number;
  } | null>(null);

  // Refetch whenever the selected league or season changes
  useEffect(() => {
    // Ignores the result if the selection changes before it arrives
    let ignore = false;

    fetchStandingsBannerData(league, season)
      .then((result) => {
        if (!ignore) {
          setData(result);
          setError(null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError({ league, season });
        }
      });

    return () => {
      ignore = true;
    };
  }, [league, season]);

  // Old data or errors from a previous selection don't count for the current one
  const hasError = error?.league === league && error.season === season;
  const isReady =
    !hasError && data?.league === league && data.season === season;

  return (
    <section
      className="standings-banner"
      aria-labelledby="standings-banner-title"
      aria-busy={!isReady && !hasError}
    >
      <div className="standings-banner__text">
        <h2 id="standings-banner-title" className="standings-banner__title">
          Standings
        </h2>
        {hasError && (
          <p className="standings-banner__description" role="alert">
            Could not load the standings.
          </p>
        )}
        {isReady && (
          <p className="standings-banner__description">{data.description}</p>
        )}
      </div>

      {/* Top 3 in table order; CSS shows them as 2, 1, 3 */}
      {isReady && (
        <ol className="standings-banner__podium" aria-label="Top 3">
          {data.podium.map((club, index) => (
            <li
              key={club.clubId}
              className={`standings-banner__step standings-banner__step--${index + 1}`}
            >
              <ClubCrest
                className="standings-banner__crest"
                src={club.crestUrl}
                name={club.shortName}
                onDark
              />
              <p className="standings-banner__club" title={club.displayName}>
                {club.shortName}
              </p>
              <p className="standings-banner__points">{club.points} pts</p>
              <span className="standings-banner__bar" aria-hidden="true">
                {index + 1}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
