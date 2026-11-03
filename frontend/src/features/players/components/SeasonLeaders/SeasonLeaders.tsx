import { useLayoutEffect, useRef, useState } from "react";
import { usePlayers } from "@/api/players";
import type { LeagueCode } from "@/data/leagues";
import LeaderCard from "@/features/players/components/LeaderCard/LeaderCard";
import {
  formatDecimal,
  formatWhole,
  oneDecimal,
  sharedRanks,
  sortPlayers,
} from "@/features/players/utils/playerStats";
import type { Player } from "@/types/api"; // Types for API responses
import "./SeasonLeaders.scss";

// Players per card: the leader and four runners-up
const LEADERS_SHOWN = 5;

// "+4.2", "-1.3"
function formatSigned(value: number) {
  return `${value > 0 ? "+" : ""}${formatDecimal(value)}`;
}

// Each card's stat (rounded as shown, so ties match the screen), tie-breakers and format
const LEADER_STATS: {
  title: string;
  description: string;
  value: (player: Player) => number;
  tieBreakers: ((player: Player) => number)[];
  format: (value: number) => string;
}[] = [
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
];

// Props for the SeasonLeaders component: the selected league and season start year (2025 = 2025/26)
type SeasonLeadersProps = {
  league: LeagueCode;
  season: number;
};

// Six leaderboards (goals, assists, xG, xA, chances created, finishing) in a grid
export default function SeasonLeaders({ league, season }: SeasonLeadersProps) {
  const { data, isError } = usePlayers(league, season, "goals", "all");
  const gridRef = useRef<HTMLElement>(null);
  const [fitsThree, setFitsThree] = useState(false);

  // Tries three columns and keeps them only if no name gets cut off, again on
  // resize, font load or new data
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const check = () => {
      const isThree = grid.classList.contains("season-leaders--three");
      grid.classList.add("season-leaders--three");
      const texts = grid.querySelectorAll<HTMLElement>(
        ".player-info__name, .player-info__club-name",
      );
      const fits = [...texts].every(
        (text) => text.scrollWidth <= text.clientWidth,
      );
      grid.classList.toggle("season-leaders--three", isThree);
      setFitsThree(fits);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(grid);
    document.fonts.addEventListener("loadingdone", check);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", check);
    };
  }, [data]);

  return (
    <section
      ref={gridRef}
      className={`season-leaders${fitsThree ? " season-leaders--three" : ""}`}
      aria-label="Season leaders"
    >
      {LEADER_STATS.map((stat) => {
        let leaders;
        if (data) {
          const top = sortPlayers(
            data.players,
            stat.value,
            ...stat.tieBreakers,
          ).slice(0, LEADERS_SHOWN);
          const ranks = sharedRanks(top, stat.value);
          leaders = top.map((player, index) => ({
            player,
            rank: ranks[index],
            value: stat.format(stat.value(player)),
          }));
        }

        return (
          <LeaderCard
            key={stat.title}
            title={stat.title}
            description={stat.description}
            leaders={leaders}
            isError={isError}
          />
        );
      })}
    </section>
  );
}
