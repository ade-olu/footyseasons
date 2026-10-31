import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import { getTableName } from "@/data/tableNames";
import type { Match, UnplayedMatch } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";
import "./MatchResult.scss";

// Props for the MatchResult component: one match, played or not
type MatchResultProps = {
  match: Match;
};

// "15:00" in the visitor's time zone
const kickOffFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

// What the pill shows for a match without a result
function unplayedLabel(match: UnplayedMatch): string {
  switch (match.status) {
    case "SCHEDULED":
    case "TIMED":
      return kickOffFormat.format(new Date(match.utcDate));
    case "POSTPONED":
      return "Postponed";
    case "CANCELLED":
      return "Cancelled";
    case "SUSPENDED":
      return "Suspended";
    default:
      return match.homeGoals !== null && match.awayGoals !== null
        ? `${match.homeGoals} – ${match.awayGoals}`
        : "Live";
  }
}

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
          : unplayedLabel(match)}
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
