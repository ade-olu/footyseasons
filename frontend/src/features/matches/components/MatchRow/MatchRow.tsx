import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import { getTableName } from "@/data/tableNames";
import {
  isUpcoming,
  kickOffTime,
  statusLabel,
} from "@/features/matches/utils/matchStatus";
import type { Match } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";
import "./MatchRow.scss";

// Props for the MatchRow component: one match, played or not
type MatchRowProps = {
  match: Match;
};

type Side = "home" | "away";

// Club name (table name, or three-letter code on phones) and crest
function Club({
  match,
  side,
  lost,
}: MatchRowProps & { side: Side; lost: boolean }) {
  const id = side === "home" ? match.homeClubId : match.awayClubId;
  const name =
    side === "home" ? match.homeClubDisplayName : match.awayClubDisplayName;
  const tla = side === "home" ? match.homeClubTla : match.awayClubTla;
  const crestUrl =
    side === "home" ? match.homeClubCrestUrl : match.awayClubCrestUrl;

  return (
    <p
      className={`match-row__club match-row__club--${side}${lost ? " match-row__club--lost" : ""}`}
    >
      <span className="match-row__club-name" title={name}>
        <span className="match-row__name-short">{getTableName(id, name)}</span>
        <span className="match-row__name-tla">{tla}</span>
      </span>
      <span className="match-row__crest-slot">
        <ClubCrest className="match-row__crest" src={crestUrl} name={name} />
      </span>
    </p>
  );
}

// One row of the results list: kick-off time, home club, score, away club.
// The losing club's name is muted
export default function MatchRow({ match }: MatchRowProps) {
  const played = isPlayed(match);
  const homeLost = played && match.homeGoals < match.awayGoals;
  const awayLost = played && match.awayGoals < match.homeGoals;
  // Postponed and cancelled matches have no kick-off to show
  const hasTime = played || isUpcoming(match) || match.status === "IN_PLAY";

  let score: string;
  if (played) score = `${match.homeGoals} – ${match.awayGoals}`;
  else if (isUpcoming(match)) score = "vs";
  else score = statusLabel(match);

  return (
    <div className="match-row">
      <p className="match-row__time">{hasTime ? kickOffTime(match) : "–"}</p>
      <Club match={match} side="home" lost={homeLost} />
      <p
        className={`match-row__score${played ? "" : " match-row__score--unplayed"}`}
      >
        {score}
      </p>
      <Club match={match} side="away" lost={awayLost} />
    </div>
  );
}
