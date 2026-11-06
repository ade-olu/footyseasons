import { useSeasonData } from "@/api/seasonData";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { goalsPerMatch } from "@/features/matches/utils/matchStats";
import type { LeagueCode } from "@/data/leagues";
import type { Match } from "@/types/api"; // Types for API responses
import { isFinished, isPlayed, totalGoals } from "@/utils/match";
import "./AtAGlance.scss";

// Props for the AtAGlance component: the selected league and season start year
// (2025 = 2025/26) and the shown matchweek (undefined while loading)
type AtAGlanceProps = {
  league: LeagueCode;
  season: number;
  matchweek?: number;
};

// "All 10 matches of matchweek 38 played."
function playedLine(round: Match[], played: number, matchweek: number) {
  const total = round.length;
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
    const round = data.matches.filter((match) => match.matchday === matchweek);
    const played = round.filter(isPlayed);
    // Wins and draws from every result; goals from FINISHED matches only
    const goals = round
      .filter(isFinished)
      .reduce((sum, match) => sum + totalGoals(match), 0);
    const count = (test: (home: number, away: number) => boolean) =>
      String(played.filter((m) => test(m.homeGoals, m.awayGoals)).length);

    description = playedLine(round, played.length, matchweek);
    tiles = [
      { label: "Goals", value: String(goals) },
      { label: "Home Wins", value: count((home, away) => home > away) },
      { label: "Draws", value: count((home, away) => home === away) },
      { label: "Away Wins", value: count((home, away) => home < away) },
    ];

    const roundAverage = goalsPerMatch(round);
    const seasonAverage = goalsPerMatch(data.matches);
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
