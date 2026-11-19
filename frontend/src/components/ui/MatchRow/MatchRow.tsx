import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import FittedName from "@/components/ui/FittedName/FittedName";
import { getTableName } from "@/data/tableNames";
import {
  isUpcoming,
  kickOffTime,
  statusLabel,
} from "@/utils/matchStatus";
import type { Match } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";
import "./MatchRow.scss";

// Props for the MatchRow component: one match, played or not
type MatchRowProps = {
  match: Match;
};

// Props for the row itself: whether to leave out the kick-off time
type MatchRowOptions = MatchRowProps & {
  hideTime?: boolean;
};

type Side = "home" | "away";

// Club name and crest: the table name, or the short name when it doesn't fit
// ("Valladolid"); the three-letter code on phones
function Club({
  match,
  side,
  lost,
}: MatchRowProps & { side: Side; lost: boolean }) {
  const id = side === "home" ? match.homeClubId : match.awayClubId;
  const name =
    side === "home" ? match.homeClubDisplayName : match.awayClubDisplayName;
  const shortName =
    side === "home" ? match.homeClubShortName : match.awayClubShortName;
  const tla = side === "home" ? match.homeClubTla : match.awayClubTla;
  const tableName = getTableName(id, name);
  const shortNames = shortName.length < tableName.length ? [shortName] : [];
  const crestUrl =
    side === "home" ? match.homeClubCrestUrl : match.awayClubCrestUrl;

  return (
    <p
      className={`match-row__club match-row__club--${side}${lost ? " match-row__club--lost" : ""}`}
    >
      <span className="match-row__club-name">
        <span className="match-row__name-short">
          <FittedName
            className="match-row__fitted"
            name={tableName}
            shortNames={shortNames}
            title={name}
          />
        </span>
        <span className="match-row__name-tla" title={name}>
          {tla}
        </span>
      </span>
      <span className="match-row__crest-slot">
        <ClubCrest className="match-row__crest" src={crestUrl} name={name} />
      </span>
    </p>
  );
}

// One row of the results list: kick-off time, home club, score, away club.
// The losing club's name is muted
export default function MatchRow({ match, hideTime = false }: MatchRowOptions) {
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
    <div className={`match-row${hideTime ? " match-row--no-time" : ""}`}>
      {!hideTime && (
        <p className="match-row__time">
          {hasTime ? kickOffTime(match) : "–"}
        </p>
      )}
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
