import { useSeasonData } from "@/api/seasonData";
import type { LeagueCode } from "@/data/leagues";
import { getRoundStats } from "@/features/matches/utils/matchStats";
import "./RoundStats.scss";

// Props for the RoundStats component: the selected league and season start
// year (2025 = 2025/26) and the shown matchweek
type RoundStatsProps = {
  league: LeagueCode;
  season: number;
  matchweek: number;
};

// A compact At a glance for phones: the round's goals, home wins, draws and
// away wins, then its goals per match against the season's
export default function RoundStats({
  league,
  season,
  matchweek,
}: RoundStatsProps) {
  const { data } = useSeasonData(league, season);
  if (!data) return null;

  const { stats, roundAverage, seasonAverage } = getRoundStats(
    data.matches,
    matchweek,
  );

  return (
    <div className="round-stats">
      <dl className="round-stats__stats">
        {stats.map((stat) => (
          <div className="round-stats__stat" key={stat.label}>
            <dt className="round-stats__label">{stat.label}</dt>
            <dd className="round-stats__value">{stat.value}</dd>
          </div>
        ))}
      </dl>
      {roundAverage !== null && seasonAverage !== null && (
        <p className="round-stats__comparison">
          {`${roundAverage.toFixed(2)} goals per match, ${seasonAverage.toFixed(2)} across the season.`}
        </p>
      )}
    </div>
  );
}
