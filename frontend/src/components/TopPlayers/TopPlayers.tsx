import { useEffect, useState } from "react";
import { User as UserIcon } from "reicon-react"; // Placeholder until player photos exist
import ClubCrest from "../ClubCrest/ClubCrest";
import SectionCard from "../SectionCard/SectionCard";
import SectionHeader from "../SectionHeader/SectionHeader";
import type { LeagueCode } from "../Sidebar/Sidebar";
import type { Player, PlayersResponse } from "../../types/api"; // Types for API responses
import "./TopPlayers.scss";

// Base URL for the Express API
const API_URL = "http://localhost:3001/api";

// Number of players shown on the overview
const TOP_PLAYERS = 3;

// Stats to rank by (/players ?sort= values) and their labels
const STATS = {
  goals: { label: "Goals", singular: "Goal" },
  assists: { label: "Assists", singular: "Assist" },
} as const;

type TopPlayersStat = keyof typeof STATS;

// The top players for one league, season and stat
type TopPlayersData = {
  league: LeagueCode;
  season: number;
  players: Player[];
};

// Props: league, season start year (2025 = 2025/26), stat and title
type TopPlayersProps = {
  league: LeagueCode;
  season: number;
  stat: TopPlayersStat;
  title: string;
};

// Fetches a league's top players for one stat
async function fetchTopPlayers(
  league: LeagueCode,
  season: number,
  stat: TopPlayersStat,
  signal: AbortSignal,
): Promise<TopPlayersData> {
  const res = await fetch(
    `${API_URL}/leagues/${league}/players?season=${season}&sort=${stat}&limit=${TOP_PLAYERS}`,
    { signal },
  );

  if (!res.ok) {
    throw new Error(`Could not load top players for ${league}`);
  }

  const { players } = (await res.json()) as PlayersResponse;

  return { league, season, players };
}

// Overview section with the top 3 players for one stat
export default function TopPlayers({
  league,
  season,
  stat,
  title,
}: TopPlayersProps) {
  const [data, setData] = useState<TopPlayersData | null>(null);
  const [error, setError] = useState<{
    league: LeagueCode;
    season: number;
  } | null>(null);

  // Refetch whenever the selected league or season changes
  useEffect(() => {
    // Cancels the request if the selection changes before it finishes
    const controller = new AbortController();

    fetchTopPlayers(league, season, stat, controller.signal)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setError({ league, season });
        }
      });

    return () => controller.abort();
  }, [league, season, stat]);

  // Old data or errors from a previous selection don't count for the current one
  const hasError = error?.league === league && error.season === season;
  const isReady =
    !hasError && data?.league === league && data.season === season;

  return (
    <SectionCard className="top-players">
      <SectionHeader
        title={title}
        action={{ label: "All players", to: "/player-stats" }}
      />
      {isReady ? (
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
                  <div className="top-players__photo">
                    <UserIcon className="top-players__photo-icon" aria-hidden />
                  </div>
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
          {hasError ? "Couldn't load the players." : "Loading…"}
        </p>
      )}
    </SectionCard>
  );
}
