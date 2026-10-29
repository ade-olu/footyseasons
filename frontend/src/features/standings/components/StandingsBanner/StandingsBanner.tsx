import { useSeasonData, type SeasonData } from "@/api/seasonData";
import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import type { LeagueCode } from "@/data/leagues";
import type { Standing } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";
import "./StandingsBanner.scss";

// Props for the StandingsBanner component: the selected league and season start year (2025 = 2025/26)
type StandingsBannerProps = {
  league: LeagueCode;
  season: number;
};

// The top 3 and the line under the title, from the standings and matches
function getBannerContent({
  standings: { standings, championClubId },
  matches,
}: SeasonData): { podium: Standing[]; description: string } {

  // Every club plays every other club home and away
  const total = standings.length * (standings.length - 1);
  const played = matches.filter(isPlayed).length;
  const places = "with European qualification and relegation places.";

  let description = `The table so far, after ${played} of ${total} matches, ${places}`;
  if (championClubId !== null) {
    description =
      played === total
        ? `The complete table after all ${total} matches, ${places}`
        : `The final table after ${played} of ${total} matches, ${places}`;
  }

  return { podium: standings.slice(0, 3), description };
}

// Standings page banner: title, description and the top 3 on a podium
export default function StandingsBanner({
  league,
  season,
}: StandingsBannerProps) {
  const { data, isError } = useSeasonData(league, season);
  const content = data ? getBannerContent(data) : null;

  return (
    <section
      className="standings-banner"
      aria-labelledby="standings-banner-title"
      aria-busy={!content && !isError}
    >
      <div className="standings-banner__text">
        <h2 id="standings-banner-title" className="standings-banner__title">
          Standings
        </h2>
        {isError && (
          <p className="standings-banner__description" role="alert">
            Could not load the standings.
          </p>
        )}
        {content && (
          <p className="standings-banner__description">
            {content.description}
          </p>
        )}
      </div>

      {/* Top 3 in table order; CSS shows them as 2, 1, 3 */}
      {content && (
        <ol className="standings-banner__podium" aria-label="Top 3">
          {content.podium.map((club, index) => (
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
