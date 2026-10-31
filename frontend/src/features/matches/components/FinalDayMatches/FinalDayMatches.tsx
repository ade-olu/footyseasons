import { useSeasonData, type SeasonData } from "@/api/seasonData";
import MatchResult from "@/features/matches/components/MatchResult/MatchResult";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { LeagueCode } from "@/data/leagues";
import { groupByDay, type MatchDay } from "@/features/matches/utils/matchDays";
import type { PlayedMatch } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";
import "./FinalDayMatches.scss";

// The last matchweek's results for one league and season
type FinalDayData = {
  matchweek: number;
  days: MatchDay<PlayedMatch>[];
  isFinal: boolean; // The season has a champion, so its last matchweek is the final one
};

// Props for the FinalDayMatches component: the selected league and season start year (2025 = 2025/26)
type FinalDayMatchesProps = {
  league: LeagueCode;
  season: number;
};

// The last matchweek with a result, its played matches and whether the season is over
function getFinalDayData({ standings, matches }: SeasonData): FinalDayData {
  const played = matches.filter(isPlayed);
  const matchweek = Math.max(0, ...played.map((match) => match.matchday));

  return {
    matchweek,
    days: groupByDay(played.filter((match) => match.matchday === matchweek)),
    isFinal: standings.championClubId !== null,
  };
}

// "Sunday, May 24" from a UTC date
function formatDay(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// "May 22–24", or "May 31 – June 1" across two months, from UTC dates
function formatDayRange(first: string, last: string): string {
  const format = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Date(date).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
  const start = format(first, { month: "long", day: "numeric" });

  return first.slice(0, 7) === last.slice(0, 7)
    ? `${start}–${format(last, { day: "numeric" })}`
    : `${start} – ${format(last, { month: "long", day: "numeric" })}`;
}

// "Sunday, May 24, matchweek 38" for one day, "matchweek 38, May 22–24" for several
function describeMatchweek({ matchweek, days }: FinalDayData): string {
  const first = days[0].date;
  const last = days[days.length - 1].date;

  return days.length === 1
    ? `${formatDay(first)}, matchweek ${matchweek}`
    : `matchweek ${matchweek}, ${formatDayRange(first, last)}`;
}

// Overview section with the results of the season's last matchweek, grouped by day
export default function FinalDayMatches({
  league,
  season,
}: FinalDayMatchesProps) {
  const { data: seasonData, isError } = useSeasonData(league, season);
  const data = seasonData ? getFinalDayData(seasonData) : null;

  const isFinal = !data || data.isFinal;
  const hasMatches = data !== null && data.days.length > 0;

  return (
    <SectionCard className="final-day-matches">
      <SectionHeader
        title={isFinal ? "Final day matches" : "Latest results"}
        description={
          hasMatches
            ? `The ${isFinal ? "closing" : "latest"} results from ${describeMatchweek(data)}.`
            : undefined
        }
        action={{ label: "All matches", to: "/matches" }}
      />
      {hasMatches ? (
        <div className="final-day-matches__days">
          {data.days.map((day) => (
            <section className="final-day-matches__day" key={day.date}>
              {/* Day headings only when the matchweek spans several days */}
              {data.days.length > 1 && (
                <h3 className="final-day-matches__date">
                  {formatDay(day.date)}
                </h3>
              )}
              <ul className="final-day-matches__list">
                {day.matches.map((match) => (
                  <li key={match.matchId}>
                    <MatchResult match={match} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="final-day-matches__status">
          {isError
            ? "Couldn't load the matches."
            : data
              ? "No matches played yet."
              : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
