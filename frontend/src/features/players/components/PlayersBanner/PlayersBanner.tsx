import { usePlayers } from "@/api/players";
import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import PlayerPhoto from "@/components/ui/PlayerPhoto/PlayerPhoto";
import Podium from "@/components/ui/Podium/Podium";
import { LEAGUES, type LeagueCode } from "@/data/leagues";
import {
  currentClub,
  goalContributions,
  shortPlayerName,
  sortPlayers,
} from "@/features/players/utils/playerStats";
import { seasonLabel } from "@/utils/season";
import "./PlayersBanner.scss";

// Props for the PlayersBanner component: the selected league and season start year (2025 = 2025/26)
type PlayersBannerProps = {
  league: LeagueCode;
  season: number;
};

// Player Stats page banner: title, description and the top 3 goal contributors on a podium
export default function PlayersBanner({ league, season }: PlayersBannerProps) {
  const { data, isError } = usePlayers(league, season, "goals", "all");
  const leagueName = LEAGUES.find((item) => item.code === league)?.name;

  // Most goals plus assists, then most goals
  const podium = data
    ? sortPlayers(data.players, goalContributions, (player) => player.goals)
        .slice(0, 3)
        .map((player) => {
          const club = currentClub(player);
          return {
            id: player.understatId,
            media: (
              <PlayerPhoto
                className="players-banner__photo"
                src={player.photoUrl}
                name={player.playerName}
              />
            ),
            name: player.playerName,
            shortName: shortPlayerName(player.playerName),
            stat: (
              <>
                {club && (
                  <ClubCrest
                    className="players-banner__crest"
                    src={club.crestUrl}
                    name={club.displayName}
                    onDark
                  />
                )}
                <span>{goalContributions(player)} G/A</span>
              </>
            ),
          };
        })
    : [];

  return (
    <section
      className="players-banner"
      aria-labelledby="players-banner-title"
      aria-busy={!data && !isError}
    >
      <div className="players-banner__text">
        <h2 id="players-banner-title" className="players-banner__title">
          Player Stats
        </h2>
        {isError && (
          <p className="players-banner__description" role="alert">
            Couldn't load the players.
          </p>
        )}
        {data && (
          <p className="players-banner__description">
            Goals, chances and expected stats for all {data.totals.players}{" "}
            players who played in the {seasonLabel(season)} {leagueName}.
          </p>
        )}
      </div>

      {podium.length > 0 && (
        <Podium label="Top 3 for goals plus assists" steps={podium} />
      )}
    </section>
  );
}
