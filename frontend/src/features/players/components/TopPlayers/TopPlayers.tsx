import { usePlayers } from "@/api/players";
import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import PlayerPhoto from "@/components/ui/PlayerPhoto/PlayerPhoto";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { LeagueCode } from "@/data/leagues";
import "./TopPlayers.scss";

// Number of players shown on the overview
const TOP_PLAYERS = 3;

// Stats to rank by (/players ?sort= values) and their labels
const STATS = {
  goals: { label: "Goals", singular: "Goal" },
  assists: { label: "Assists", singular: "Assist" },
} as const;

type TopPlayersStat = keyof typeof STATS;

// Props: league, season start year (2025 = 2025/26), stat and title
type TopPlayersProps = {
  league: LeagueCode;
  season: number;
  stat: TopPlayersStat;
  title: string;
};

// Overview section with the top 3 players for one stat
export default function TopPlayers({
  league,
  season,
  stat,
  title,
}: TopPlayersProps) {
  const { data, isError } = usePlayers(league, season, stat, TOP_PLAYERS);

  return (
    <SectionCard className="top-players">
      <SectionHeader
        title={title}
        action={{ label: "All players", to: "/player-stats" }}
      />
      {data ? (
        <ol className="top-players__list">
          {data.players.map((player) => {
            const value = player[stat];
            // Tied players share a rank (1, 2, 2)
            const rank =
              data.players.findIndex((other) => other[stat] === value) + 1;
            // Current club (clubs are oldest first)
            const club = player.clubs[player.clubs.length - 1];

            return (
              <li className="top-players__row" key={player.understatId}>
                <span className="top-players__rank">{rank}</span>
                <div className="top-players__player">
                  <PlayerPhoto
                    className="top-players__photo"
                    src={player.photoUrl}
                    name={player.playerName}
                  />
                  <div className="top-players__details">
                    <p className="top-players__name" title={player.playerName}>
                      {player.playerName}
                    </p>
                    {club && (
                      <p className="top-players__club">
                        <ClubCrest
                          className="top-players__crest"
                          src={club.crestUrl}
                          name={club.displayName}
                        />
                        <span
                          className="top-players__club-name"
                          title={club.displayName}
                        >
                          {club.displayName}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <p className="top-players__stat">
                  <span className="top-players__stat-value">{value}</span>
                  <span className="top-players__stat-label">
                    {value === 1 ? STATS[stat].singular : STATS[stat].label}
                  </span>
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="top-players__status">
          {isError ? "Couldn't load the players." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
