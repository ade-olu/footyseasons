import { useSeasonData, type SeasonData } from "@/api/seasonData";
import type { LeagueCode } from "@/data/leagues";
import { isPlayed } from "@/utils/match";
import "./MatchesBanner.scss";

// One part of the home win / draw / away win split
type Share = {
  side: "home" | "draw" | "away";
  count: number;
  label: string;
};

// Props for the MatchesBanner component: the selected league and season start year (2025 = 2025/26)
type MatchesBannerProps = {
  league: LeagueCode;
  season: number;
};

// "16 August 2025" from a UTC date
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// The line under the title and the result split, from the standings and matches
function getBannerContent({ standings, matches }: SeasonData): {
  description: string;
  shares: Share[];
} {
  const played = matches.filter(isPlayed);
  const label = standings.season.label;
  const clubs = standings.standings.length;

  // Every club plays every other club home and away
  const total = clubs * (clubs - 1);

  if (played.length === 0) {
    return {
      description: `No matches played yet in the ${label} season.`,
      shares: [],
    };
  }

  // Matches aren't returned in date order
  const dates = played.map((match) => match.utcDate).sort();
  const first = dateFormat.format(new Date(dates[0]));
  const last = dateFormat.format(new Date(dates[dates.length - 1]));
  const range = `from ${first} to ${last}`;

  const homeWins = played.filter((m) => m.homeGoals > m.awayGoals).length;
  const awayWins = played.filter((m) => m.awayGoals > m.homeGoals).length;
  const draws = played.length - homeWins - awayWins;

  return {
    description:
      played.length === total
        ? `All ${total} matches of the ${label} season, ${range}.`
        : `${played.length} of ${total} matches played in the ${label} season, ${range}.`,
    shares: [
      { side: "home", count: homeWins, label: "home wins" },
      { side: "draw", count: draws, label: draws === 1 ? "draw" : "draws" },
      { side: "away", count: awayWins, label: "away wins" },
    ],
  };
}

// Matches page banner: title, description and the home win / draw / away win split
export default function MatchesBanner({ league, season }: MatchesBannerProps) {
  const { data, isError } = useSeasonData(league, season);
  const content = data ? getBannerContent(data) : null;
  const played = content?.shares.reduce((sum, s) => sum + s.count, 0) ?? 0;

  return (
    <section
      className="matches-banner"
      aria-labelledby="matches-banner-title"
      aria-busy={!content && !isError}
    >
      <div className="matches-banner__text">
        <h2 id="matches-banner-title" className="matches-banner__title">
          Matches
        </h2>
        {isError && (
          <p className="matches-banner__description" role="alert">
            Couldn't load the matches.
          </p>
        )}
        {content && (
          <p className="matches-banner__description">{content.description}</p>
        )}
      </div>

      {/* Each column is as wide as its share, with its bar below */}
      {content && played > 0 && (
        <div
          className="matches-banner__split"
          style={{
            gridTemplateColumns: content.shares
              .map((share) => `${share.count}fr`)
              .join(" "),
          }}
        >
          {content.shares.map((share) => (
            <p key={share.side} className="matches-banner__share">
              <span className="matches-banner__percent">
                {Math.round((share.count / played) * 100)}%
              </span>
              <span className="matches-banner__count">
                {share.count} {share.label}
              </span>
            </p>
          ))}
          {content.shares.map((share) => (
            <span
              key={share.side}
              className={`matches-banner__bar matches-banner__bar--${share.side}`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </section>
  );
}
