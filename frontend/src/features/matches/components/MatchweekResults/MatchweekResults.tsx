import { useState } from "react";
import { useSeasonData } from "@/api/seasonData";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import MatchResult from "@/features/matches/components/MatchResult/MatchResult";
import MatchweekPicker from "@/features/matches/components/MatchweekPicker/MatchweekPicker";
import { groupByDay } from "@/features/matches/utils/matchDays";
import { LEAGUES, type LeagueCode } from "@/data/leagues";
import type { Match } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";
import "./MatchweekResults.scss";

// Props for the MatchweekResults component: the selected league and season start year (2025 = 2025/26)
type MatchweekResultsProps = {
  league: LeagueCode;
  season: number;
};

// "Sunday 24 May 2026" from a UTC date (en-GB puts a comma after the weekday)
const dayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatDay(date: string): string {
  return dayFormat.format(new Date(date)).replace(",", "");
}

// The last matchweek with a result, or the first before any are played
function latestMatchweek(matches: Match[]): number {
  return Math.max(1, ...matches.filter(isPlayed).map((m) => m.matchday));
}

// Matches page "Results" section: one matchweek's matches, grouped by day
export default function MatchweekResults({
  league,
  season,
}: MatchweekResultsProps) {
  const { data, isError } = useSeasonData(league, season);
  // The picked matchweek, kept only for the league and season it was picked in
  const [picked, setPicked] = useState<{ key: string; matchweek: number }>();

  const key = `${league}-${season}`;
  const leagueName = LEAGUES.find((item) => item.code === league)?.name;

  if (!data) {
    return (
      <SectionCard className="matchweek-results">
        <SectionHeader title="Results" />
        <p className="matchweek-results__status">
          {isError ? "Couldn't load the matches." : "Loading…"}
        </p>
      </SectionCard>
    );
  }

  const { matches, standings } = data;
  const total = Math.max(0, ...matches.map((match) => match.matchday));
  const matchweek =
    picked?.key === key ? picked.matchweek : latestMatchweek(matches);
  const days = groupByDay(
    matches.filter((match) => match.matchday === matchweek),
  );

  // "The final round of the 2025/26 Premier League season."
  const label = standings.season.label;
  const isLast = matchweek === total && standings.championClubId !== null;
  const round = isLast
    ? "The final round"
    : matchweek === 1
      ? "The opening round"
      : `Matchweek ${matchweek}`;

  return (
    <SectionCard className="matchweek-results">
      <div className="matchweek-results__header">
        <SectionHeader
          title="Results"
          description={`${round} of the ${label} ${leagueName} season.`}
        />
        {total > 0 && (
          <MatchweekPicker
            matchweek={matchweek}
            total={total}
            onChange={(value) => setPicked({ key, matchweek: value })}
          />
        )}
      </div>
      {days.length > 0 ? (
        // Keyed by matchweek so a new one fades in
        <div className="matchweek-results__days" key={`${key}-${matchweek}`}>
          {days.map((day) => (
            <section className="matchweek-results__day" key={day.date}>
              <h3 className="matchweek-results__date">
                {formatDay(day.date)}
              </h3>
              <ul className="matchweek-results__list">
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
        <p className="matchweek-results__status">No matches in this season.</p>
      )}
    </SectionCard>
  );
}
