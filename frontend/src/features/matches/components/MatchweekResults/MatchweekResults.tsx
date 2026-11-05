import { useSeasonData } from "@/api/seasonData";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import MatchRow from "@/features/matches/components/MatchRow/MatchRow";
import MatchweekPicker from "@/features/matches/components/MatchweekPicker/MatchweekPicker";
import { groupByDay } from "@/features/matches/utils/matchDays";
import { getLeagueName, type LeagueCode } from "@/data/leagues";
import "./MatchweekResults.scss";

// Props for the MatchweekResults component: the selected league and season start year
// (2025 = 2025/26), the shown matchweek (undefined while loading) and a change handler
type MatchweekResultsProps = {
  league: LeagueCode;
  season: number;
  matchweek?: number;
  onChange: (matchweek: number) => void;
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

// Matches page "Results" section: one matchweek's matches as a list, grouped by day
export default function MatchweekResults({
  league,
  season,
  matchweek,
  onChange,
}: MatchweekResultsProps) {
  const { data, isError } = useSeasonData(league, season);
  const leagueName = getLeagueName(league);

  if (!data || matchweek === undefined) {
    return (
      <SectionCard className="matchweek-results">
        <div className="matchweek-results__header">
          <SectionHeader title="Results" />
        </div>
        <p className="matchweek-results__status">
          {isError ? "Couldn't load the matches." : "Loading…"}
        </p>
      </SectionCard>
    );
  }

  const { matches, standings } = data;
  const total = Math.max(0, ...matches.map((match) => match.matchday));
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
            onChange={onChange}
          />
        )}
      </div>
      {days.length > 0 ? (
        // Keyed by matchweek so a new one fades in
        <div
          className="matchweek-results__days"
          key={`${league}-${season}-${matchweek}`}
        >
          {days.map((day) => (
            <section className="matchweek-results__day" key={day.date}>
              <h3 className="matchweek-results__date">{formatDay(day.date)}</h3>
              <ul className="matchweek-results__list">
                {day.matches.map((match) => (
                  <li className="matchweek-results__item" key={match.matchId}>
                    <MatchRow match={match} />
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
