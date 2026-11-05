import { useState } from "react";
import { usePlayers } from "@/api/players";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import { getLeagueName, type LeagueCode } from "@/data/leagues";
import LeaderCard from "@/features/players/components/LeaderCard/LeaderCard";
import {
  formatDecimal,
  formatSigned,
  formatWhole,
  oneDecimal,
  playerPosition,
  sharedRanks,
  sortPlayers,
} from "@/features/players/utils/playerStats";
import type { Player } from "@/types/api"; // Types for API responses
import { seasonLabel } from "@/utils/season";
import "./SeasonLeaders.scss";

// Players per card: the leader and four runners-up
const LEADERS_SHOWN = 5;

// "0.70"
function formatTwoDecimals(value: number) {
  return value.toFixed(2);
}

function isGoalkeeper(player: Player) {
  return playerPosition(player)?.code === "GK";
}

// Players with at least this many minutes count for the rate stats
type StatContext = { minMinutes: number };

// One card: its stat (rounded as shown, so ties match the screen; null leaves the
// player out), tie-breakers and format. Lowest first when ascending
type LeaderStat = {
  title: string;
  description: string;
  value: (player: Player, context: StatContext) => number | null;
  tieBreakers: ((player: Player) => number)[];
  format: (value: number) => string;
  ascending?: boolean;
};

type LeaderGroup = "attack" | "defence" | "goalkeeping";

const LEADER_GROUPS: { value: LeaderGroup; label: string }[] = [
  { value: "attack", label: "Attack" },
  { value: "defence", label: "Defence" },
  { value: "goalkeeping", label: "Goalkeeping" },
];

// Six cards per group; defence and goalkeeping come from FotMob (2016/17 onwards)
const LEADER_STATS: Record<LeaderGroup, LeaderStat[]> = {
  attack: [
    {
      title: "Goals",
      description: "Most league goals",
      value: (player) => player.goals,
      tieBreakers: [(player) => player.xG],
      format: formatWhole,
    },
    {
      title: "Assists",
      description: "Most league assists",
      value: (player) => player.assists,
      tieBreakers: [(player) => player.xA],
      format: formatWhole,
    },
    {
      title: "Expected Goals (xG)",
      description: "How good the chances a player shot from were",
      value: (player) => oneDecimal(player.xG),
      tieBreakers: [(player) => player.goals],
      format: formatDecimal,
    },
    {
      title: "Expected Assists (xA)",
      description: "How good the chances a player set up were",
      value: (player) => oneDecimal(player.xA),
      tieBreakers: [(player) => player.assists],
      format: formatDecimal,
    },
    {
      title: "Chances Created",
      description: "Passes that led to a shot",
      value: (player) => player.keyPasses,
      tieBreakers: [(player) => player.assists],
      format: formatWhole,
    },
    {
      title: "Finishing",
      description: "Goals scored above expected goals",
      value: (player) => oneDecimal(player.goals - player.xG),
      tieBreakers: [(player) => player.goals],
      format: formatSigned,
    },
  ],
  defence: [
    {
      title: "Defensive Actions",
      description: "Tackles, blocks, clearances and more, added up",
      value: (player) => player.defensiveActions,
      tieBreakers: [(player) => player.tackles ?? 0],
      format: formatWhole,
    },
    {
      title: "Tackles",
      description: "Tackles made to win the ball",
      value: (player) => player.tackles,
      tieBreakers: [(player) => player.interceptions ?? 0],
      format: formatWhole,
    },
    {
      title: "Interceptions",
      description: "Opponents' passes cut out",
      value: (player) => player.interceptions,
      tieBreakers: [(player) => player.tackles ?? 0],
      format: formatWhole,
    },
    {
      title: "Clearances",
      description: "Balls cleared away from danger",
      value: (player) => player.clearances,
      tieBreakers: [(player) => player.blocks ?? 0],
      format: formatWhole,
    },
    {
      title: "Blocks",
      description: "Opponents' shots blocked",
      value: (player) => player.blocks,
      tieBreakers: [(player) => player.clearances ?? 0],
      format: formatWhole,
    },
    {
      title: "Recoveries",
      description: "Loose balls won back by outfield players",
      value: (player) => (isGoalkeeper(player) ? null : player.recoveries),
      tieBreakers: [(player) => player.tackles ?? 0],
      format: formatWhole,
    },
  ],
  goalkeeping: [
    {
      title: "Clean Sheets",
      description: "League games without conceding",
      value: (player) => player.cleanSheets,
      tieBreakers: [(player) => -(player.goalsConceded ?? 0)],
      format: formatWhole,
    },
    {
      title: "Saves",
      description: "Shots on target stopped",
      value: (player) => player.saves,
      tieBreakers: [(player) => player.savePercentage ?? 0],
      format: formatWhole,
    },
    {
      title: "Goals Prevented",
      description: "Goals kept out beyond the shots' xGOT",
      value: (player) =>
        player.goalsPrevented === null ? null : oneDecimal(player.goalsPrevented),
      tieBreakers: [(player) => player.saves ?? 0],
      format: formatSigned,
    },
    {
      title: "Save %",
      description: "Shots on target saved, min. half the season",
      value: (player, { minMinutes }) =>
        player.savePercentage === null || player.minutes < minMinutes
          ? null
          : oneDecimal(player.savePercentage),
      tieBreakers: [(player) => player.saves ?? 0],
      format: (value) => `${formatDecimal(value)}%`,
    },
    {
      title: "Goals Conceded per 90",
      description: "Fewest conceded, min. half the season",
      value: (player, { minMinutes }) =>
        player.goalsConceded === null || player.minutes < minMinutes
          ? null
          : Math.round((player.goalsConceded / player.minutes) * 9000) / 100,
      tieBreakers: [(player) => player.minutes],
      format: formatTwoDecimals,
      ascending: true,
    },
    {
      title: "Recoveries",
      description: "Loose balls collected by goalkeepers",
      value: (player) => (isGoalkeeper(player) ? player.recoveries : null),
      tieBreakers: [(player) => player.saves ?? 0],
      format: formatWhole,
    },
  ],
};

// The top players for one stat, ranked as shown
function getLeaders(players: Player[], stat: LeaderStat) {
  // Half the season: half the most minutes anyone played
  const context = {
    minMinutes: Math.max(0, ...players.map((player) => player.minutes)) / 2,
  };
  const values = new Map(
    players.map((player) => [player, stat.value(player, context)]),
  );
  const shown = (player: Player) => values.get(player) as number;
  const rankBy = (player: Player) =>
    stat.ascending ? -shown(player) : shown(player);

  const top = sortPlayers(
    players.filter((player) => values.get(player) !== null),
    rankBy,
    ...stat.tieBreakers,
  ).slice(0, LEADERS_SHOWN);
  const ranks = sharedRanks(top, rankBy);
  return top.map((player, index) => ({
    player,
    rank: ranks[index],
    value: stat.format(shown(player)),
  }));
}

// Props for the SeasonLeaders component: the selected league and season start year (2025 = 2025/26)
type SeasonLeadersProps = {
  league: LeagueCode;
  season: number;
};

// Six leaderboards for attack, defence or goalkeeping, picked with a toggle
export default function SeasonLeaders({ league, season }: SeasonLeadersProps) {
  const { data, isError } = usePlayers(league, season, "goals", "all");
  const [group, setGroup] = useState<LeaderGroup>("attack");

  const leagueName = getLeagueName(league);
  const unavailable =
    group !== "attack" && data !== undefined && !data.hasDefensiveStats;

  return (
    <section className="season-leaders" aria-label="Season leaders">
      <div className="season-leaders__header">
        <SectionHeader
          title="Season leaders"
          description={`The top 5 in each stat across the ${seasonLabel(season)} ${leagueName}.`}
        />
        <SegmentedControl
          className="season-leaders__toggle"
          options={LEADER_GROUPS}
          value={group}
          onChange={setGroup}
          label="Stats shown"
          fit="content"
          maxPadding={24}
        />
      </div>
      {unavailable ? (
        <SectionCard className="season-leaders__unavailable">
          <h3 className="season-leaders__unavailable-title">
            No {group === "defence" ? "defensive" : "goalkeeping"} stats for{" "}
            {seasonLabel(season)}
          </h3>
          <p className="season-leaders__unavailable-text">
            Defending and goalkeeping stats start in 2016/17. Attack stats cover
            every season.
          </p>
        </SectionCard>
      ) : (
        <div className="season-leaders__grid">
          {LEADER_STATS[group].map((stat) => (
            <LeaderCard
              key={stat.title}
              title={stat.title}
              description={stat.description}
              leaders={data && getLeaders(data.players, stat)}
              isError={isError}
            />
          ))}
        </div>
      )}
    </section>
  );
}
