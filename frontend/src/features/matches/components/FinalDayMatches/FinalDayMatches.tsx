import { useEffect, useState } from "react";
import { fetchSeasonData } from "@/api/seasonData";
import MatchResult from "@/features/matches/components/MatchResult/MatchResult";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { LeagueCode } from "@/data/leagues";
import type { Match, PlayedMatch } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";
import "./FinalDayMatches.scss";

// The last matchweek's results for one league and season
type FinalDayData = {
  league: LeagueCode;
  season: number;
  matchweek: number;
  days: MatchDay[];
  isFinal: boolean; // The season has a champion, so its last matchweek is the final one
};

// One day's matches (UTC date "2026-05-24")
type MatchDay = {
  date: string;
  matches: PlayedMatch[];
};

// Props for the FinalDayMatches component: the selected league and season start year (2025 = 2025/26)
type FinalDayMatchesProps = {
  league: LeagueCode;
  season: number;
};

// The last matchweek's played matches and its number. Before 2023/24 there's no matchday,
// so it's every club's last match, and the number is the most games any club played
function getLastMatchweek(matches: Match[]): {
  matchweek: number;
  matches: PlayedMatch[];
} {
  const played = matches.filter(isPlayed);
  const matchdays = played.map((match) => match.matchday ?? 0);
  const lastMatchday = Math.max(0, ...matchdays);

  if (lastMatchday > 0) {
    return {
      matchweek: lastMatchday,
      matches: played.filter((match) => match.matchday === lastMatchday),
    };
  }

  // Each club's last match and number of games
  const lastMatches = new Map<number, PlayedMatch>();
  const gamesPlayed = new Map<number, number>();

  for (const match of played) {
    for (const clubId of [match.homeClubId, match.awayClubId]) {
      const last = lastMatches.get(clubId);
      if (!last || match.utcDate > last.utcDate) {
        lastMatches.set(clubId, match);
      }
      gamesPlayed.set(clubId, (gamesPlayed.get(clubId) ?? 0) + 1);
    }
  }

  return {
    matchweek: Math.max(0, ...gamesPlayed.values()),
    matches: [...new Set(lastMatches.values())],
  };
}

// Groups matches by UTC date, oldest first, then by kick-off and home club
function groupByDay(matches: PlayedMatch[]): MatchDay[] {
  const sorted = [...matches].sort(
    (a, b) =>
      a.utcDate.localeCompare(b.utcDate) ||
      a.homeClubDisplayName.localeCompare(b.homeClubDisplayName),
  );
  const days: MatchDay[] = [];

  for (const match of sorted) {
    const date = match.utcDate.slice(0, 10);
    const day = days[days.length - 1];

    if (day?.date === date) {
      day.matches.push(match);
    } else {
      days.push({ date, matches: [match] });
    }
  }

  return days;
}

// Gets the last matchweek and champion for a league's season
async function fetchFinalDayData(
  league: LeagueCode,
  season: number,
): Promise<FinalDayData> {
  const { standings, matches } = await fetchSeasonData(league, season);
  const lastMatchweek = getLastMatchweek(matches);

  return {
    league,
    season,
    matchweek: lastMatchweek.matchweek,
    days: groupByDay(lastMatchweek.matches),
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
  const [data, setData] = useState<FinalDayData | null>(null);
  const [error, setError] = useState<{
    league: LeagueCode;
    season: number;
  } | null>(null);

  // Refetch whenever the selected league or season changes
  useEffect(() => {
    // Ignores the result if the selection changes before it arrives
    let ignore = false;

    fetchFinalDayData(league, season)
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

  const isFinal = !isReady || data.isFinal;
  const hasMatches = isReady && data.days.length > 0;

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
          {hasError
            ? "Couldn't load the matches."
            : isReady
              ? "No matches played yet."
              : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
