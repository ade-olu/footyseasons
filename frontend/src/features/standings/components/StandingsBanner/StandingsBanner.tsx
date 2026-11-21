import { useSeasonData, type SeasonData } from "@/api/seasonData";
import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import PageBanner from "@/components/ui/PageBanner/PageBanner";
import Podium from "@/components/ui/Podium/Podium";
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
    <PageBanner
      className="standings-banner"
      title="Standings"
      description={content?.description}
      error="Couldn't load the standings."
      isError={isError}
      isLoading={!content && !isError}
      podium
    >

      {content && (
        <Podium
          label="Top 3"
          steps={content.podium.map((club) => ({
            id: club.clubId,
            media: (
              <ClubCrest
                className="standings-banner__crest"
                src={club.crestUrl}
                name={club.shortName}
                onDark
              />
            ),
            name: club.shortName,
            title: club.displayName,
            stat: `${club.points} pts`,
          }))}
        />
      )}
    </PageBanner>
  );
}
