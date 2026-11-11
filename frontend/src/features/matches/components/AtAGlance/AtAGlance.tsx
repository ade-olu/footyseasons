import { useSeasonData } from "@/api/seasonData";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { getRoundStats } from "@/features/matches/utils/matchStats";
import type { LeagueCode } from "@/data/leagues";
import "./AtAGlance.scss";

// Props for the AtAGlance component: the selected league and season start year
// (2025 = 2025/26) and the shown matchweek (undefined while loading)
type AtAGlanceProps = {
  league: LeagueCode;
  season: number;
  matchweek?: number;
};

// "All 10 matches of matchweek 38 played."
function playedLine(total: number, played: number, matchweek: number) {
  if (total === 0) return `No matches in matchweek ${matchweek}.`;
  if (played === total)
    return `All ${total} matches of matchweek ${matchweek} played.`;
  if (played === 0)
    return `None of the ${total} matches of matchweek ${matchweek} played yet.`;
  return `${played} of ${total} matches of matchweek ${matchweek} played.`;
}

// The shown matchweek's goals, home wins, draws and away wins, with its goals per match
// against the season's
export default function AtAGlance({
  league,
  season,
  matchweek,
}: AtAGlanceProps) {
  const { data, isError } = useSeasonData(league, season);

  let description = isError ? "Couldn't load the matches." : "Loading…";
  let tiles = [
    { label: "Goals", value: "–" },
    { label: "Home Wins", value: "–" },
    { label: "Draws", value: "–" },
    { label: "Away Wins", value: "–" },
  ];
  let comparison: string | undefined;

  if (data && matchweek !== undefined) {
    const { total, played, stats, roundAverage, seasonAverage } = getRoundStats(
      data.matches,
      matchweek,
    );

    description = playedLine(total, played, matchweek);
    tiles = stats.map(({ label, value }) => ({ label, value: String(value) }));

    if (roundAverage !== null && seasonAverage !== null) {
      comparison = `${roundAverage.toFixed(2)} goals per match this round, against ${seasonAverage.toFixed(2)} across the season.`;
    }
  }

  return (
    <SectionCard className="at-a-glance">
      <SectionHeader title="At a glance" description={description} />
      <dl className="at-a-glance__tiles">
        {tiles.map((tile) => (
          <div className="at-a-glance__tile" key={tile.label}>
            <dt className="at-a-glance__label">{tile.label}</dt>
            <dd className="at-a-glance__value">{tile.value}</dd>
          </div>
        ))}
      </dl>
      {comparison && <p className="at-a-glance__comparison">{comparison}</p>}
    </SectionCard>
  );
}
