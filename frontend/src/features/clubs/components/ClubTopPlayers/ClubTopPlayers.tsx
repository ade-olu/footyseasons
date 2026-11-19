import { Link } from "react-router-dom";
import { ChevronRight as ArrowRightIcon } from "reicon-react";
import { usePlayers } from "@/api/players";
import FittedName from "@/components/ui/FittedName/FittedName";
import PlayerPhoto from "@/components/ui/PlayerPhoto/PlayerPhoto";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { LeagueCode } from "@/data/leagues";
import { possessive } from "@/features/clubs/utils/clubPage";
import { useSelection } from "@/hooks/useSelection";
import type { Player } from "@/types/api";
import { cx } from "@/utils/cx";
import { shortPlayerNames } from "@/utils/playerNames";
import "./ClubTopPlayers.scss";

// Props for the ClubTopPlayers component: the selected league, season and
// club, its name for the description, plus a class for its phone tab
type ClubTopPlayersProps = {
  league: LeagueCode;
  season: number;
  clubId: number;
  clubName: string;
  className?: string;
};

type Board = {
  key: string;
  label: string; // "Top Scorer", "Joint Top Scorer" when level
  stat: (player: Player) => number;
};

const BOARDS: Board[] = [
  { key: "goals", label: "Top Scorer", stat: (player) => player.goals },
  { key: "assists", label: "Top Assists", stat: (player) => player.assists },
  { key: "minutes", label: "Most Minutes", stat: (player) => player.minutes },
];

const TITLE = "Top players";

// "3,330"
const formatCount = new Intl.NumberFormat("en-GB").format;

// The top 3 for a stat, highest first, then by name
function topThree(players: Player[], stat: Board["stat"]) {
  return [...players]
    .sort(
      (a, b) =>
        stat(b) - stat(a) || a.playerName.localeCompare(b.playerName, "en"),
    )
    .slice(0, 3);
}

// One stat's leader on a dark top, then the next two and a View all link
function Leaderboard({
  board,
  players,
  allPath,
}: {
  board: Board;
  players: Player[];
  allPath: string;
}) {
  const [leader, ...rest] = topThree(players, board.stat);
  if (!leader) return null;
  const isJoint = rest.length > 0 && board.stat(rest[0]) === board.stat(leader);

  return (
    <article className="club-top-players__board">
      <div className="club-top-players__hero">
        <div className="club-top-players__info">
          <h3 className="club-top-players__label">
            {isJoint ? `Joint ${board.label}` : board.label}
          </h3>
          <FittedName
            className="club-top-players__name"
            name={leader.playerName}
            shortNames={shortPlayerNames(leader)}
          />
          <p className="club-top-players__value">
            {formatCount(board.stat(leader))}
          </p>
        </div>
        <PlayerPhoto
          className="club-top-players__photo club-top-players__photo--large"
          src={leader.photoUrl}
          name={leader.playerName}
        />
      </div>
      <ol className="club-top-players__rows" start={2}>
        {rest.map((player) => (
          <li key={player.understatId} className="club-top-players__row">
            <PlayerPhoto
              className="club-top-players__photo"
              src={player.photoUrl}
              name={player.playerName}
            />
            <FittedName
              className="club-top-players__row-name"
              name={player.playerName}
              shortNames={shortPlayerNames(player)}
            />
            <span className="club-top-players__row-value">
              {formatCount(board.stat(player))}
            </span>
          </li>
        ))}
      </ol>
      {/* Player Stats until the club page has its Squad table */}
      <Link
        className="club-top-players__all"
        to={allPath}
        aria-label={`View all players by ${board.key}`}
      >
        View all
        <ArrowRightIcon className="club-top-players__all-icon" aria-hidden />
      </Link>
    </article>
  );
}

// The club's leaders in goals, assists and minutes: three across, or a
// carousel when narrow
export default function ClubTopPlayers({
  league,
  season,
  clubId,
  clubName,
  className,
}: ClubTopPlayersProps) {
  const { data, isError } = usePlayers(league, season, "goals", "all");
  const { pathTo } = useSelection();
  // A player who moved within the league has one row for both clubs
  const players =
    data?.players.filter((player) =>
      player.clubs.some((club) => club.clubId === clubId),
    ) ?? [];

  let status: string | null = null;
  if (!data) status = isError ? "Couldn't load the players." : "Loading…";
  else if (players.length === 0) status = "No player stats for this season.";

  return (
    <SectionCard className={cx("club-top-players", className)}>
      <div className="club-top-players__header">
        <SectionHeader
          title={TITLE}
          description={
            status ??
            `${possessive(clubName)} leaders in goals, assists and minutes.`
          }
        />
      </div>
      {!status && (
        <div className="club-top-players__boards">
          {BOARDS.map((board) => (
            <Leaderboard
              key={board.key}
              board={board}
              players={players}
              allPath={pathTo("/player-stats")}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
