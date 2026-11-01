import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import { getTableName } from "@/data/tableNames";
import { statusLabel } from "@/features/matches/utils/matchStatus";
import type { Match } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";
import "./MatchResult.scss";

// Props for the MatchResult component: one match, played or not
type MatchResultProps = {
  match: Match;
};

// One match: home club, score (or kick-off), away club. The losing club's name is muted.
// Names are the table's short names, or three-letter codes on phones
export default function MatchResult({ match }: MatchResultProps) {
  const played = isPlayed(match);
  const homeLost = played && match.homeGoals < match.awayGoals;
  const awayLost = played && match.awayGoals < match.homeGoals;

  return (
    <div className="match-result">
      <p
        className={`match-result__club match-result__club--home${homeLost ? " match-result__club--lost" : ""}`}
      >
        <span
          className="match-result__club-name"
          title={match.homeClubDisplayName}
        >
          <span className="match-result__name-short">
            {getTableName(match.homeClubId, match.homeClubDisplayName)}
          </span>
          <span className="match-result__name-tla">{match.homeClubTla}</span>
        </span>
        <span className="match-result__crest-slot">
          <ClubCrest
            className="match-result__crest"
            src={match.homeClubCrestUrl}
            name={match.homeClubDisplayName}
          />
        </span>
      </p>
      <p
        className={`match-result__score${played ? "" : " match-result__score--unplayed"}`}
      >
        {played
          ? `${match.homeGoals} – ${match.awayGoals}`
          : statusLabel(match)}
      </p>
      <p
        className={`match-result__club${awayLost ? " match-result__club--lost" : ""}`}
      >
        <span className="match-result__crest-slot">
          <ClubCrest
            className="match-result__crest"
            src={match.awayClubCrestUrl}
            name={match.awayClubDisplayName}
          />
        </span>
        <span
          className="match-result__club-name"
          title={match.awayClubDisplayName}
        >
          <span className="match-result__name-short">
            {getTableName(match.awayClubId, match.awayClubDisplayName)}
          </span>
          <span className="match-result__name-tla">{match.awayClubTla}</span>
        </span>
      </p>
    </div>
  );
}
