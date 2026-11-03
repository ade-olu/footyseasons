import SectionCard from "@/components/ui/SectionCard/SectionCard";
import PlayerInfo from "@/features/players/components/PlayerInfo/PlayerInfo";
import type { Player } from "@/types/api"; // Types for API responses
import "./LeaderCard.scss";

// One ranked player and the stat as shown
export type Leader = {
  player: Player;
  rank: number;
  value: string;
};

// Props for the LeaderCard component: the stat's title and description, and the
// top players in order (undefined while loading)
type LeaderCardProps = {
  title: string;
  description: string;
  leaders?: Leader[];
  isError?: boolean;
};

// One stat's leaderboard: the leader on a dark panel, then the runners-up
export default function LeaderCard({
  title,
  description,
  leaders,
  isError = false,
}: LeaderCardProps) {
  return (
    <SectionCard className="leader-card">
      <header className="leader-card__header">
        <h2 className="leader-card__title">{title}</h2>
        <p className="leader-card__description">{description}</p>
      </header>
      {leaders ? (
        <ol className="leader-card__list">
          {leaders.map(({ player, rank, value }, index) =>
            index === 0 ? (
              <li className="leader-card__leader" key={player.understatId}>
                <PlayerInfo player={player} size="large" onDark />
                <span className="leader-card__leader-value">{value}</span>
              </li>
            ) : (
              <li className="leader-card__row" key={player.understatId}>
                <span className="leader-card__rank">{rank}</span>
                <PlayerInfo player={player} />
                <span className="leader-card__value">{value}</span>
              </li>
            ),
          )}
        </ol>
      ) : (
        <p className="leader-card__status">
          {isError ? "Couldn't load the players." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
