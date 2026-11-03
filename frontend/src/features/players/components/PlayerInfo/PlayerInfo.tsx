import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import FittedName from "@/components/ui/FittedName/FittedName";
import PlayerPhoto from "@/components/ui/PlayerPhoto/PlayerPhoto";
import { getTableName } from "@/data/tableNames";
import {
  currentClub,
  shortPlayerNames,
} from "@/features/players/utils/playerStats";
import type { Player } from "@/types/api"; // Types for API responses
import "./PlayerInfo.scss";

// Props for the PlayerInfo component: the player, a larger size for a leader
// and light text for dark backgrounds
type PlayerInfoProps = {
  player: Player;
  size?: "small" | "large";
  onDark?: boolean;
};

// Photo, name ("B. Fernandes" when the full one doesn't fit) and current club
export default function PlayerInfo({
  player,
  size = "small",
  onDark = false,
}: PlayerInfoProps) {
  const club = currentClub(player);

  return (
    <div
      className={`player-info player-info--${size}${onDark ? " player-info--on-dark" : ""}`}
    >
      <PlayerPhoto
        className="player-info__photo"
        src={player.photoUrl}
        name={player.playerName}
      />
      <div className="player-info__details">
        <FittedName
          className="player-info__name"
          name={player.playerName}
          shortNames={shortPlayerNames(player)}
        />
        {club && (
          <p className="player-info__club">
            <ClubCrest
              className="player-info__crest"
              src={club.crestUrl}
              name={club.displayName}
              onDark={onDark}
            />
            <span className="player-info__club-name" title={club.displayName}>
              {getTableName(club.clubId, club.displayName)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
