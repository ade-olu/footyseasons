import ClubCrest from "../../ui/ClubCrest/ClubCrest";
import { getTableName } from "../../../data/tableNames";
import type { Match } from "../../../types/api"; // Types for API responses
import "./MatchResult.scss";

// Props for the MatchResult component: one played match
type MatchResultProps = {
  match: Match;
};

// One result: home club, score, away club. The losing club's name is muted.
// Names are the table's short names, or three-letter codes on phones
export default function MatchResult({ match }: MatchResultProps) {
  const homeGoals = match.homeGoals ?? 0;
  const awayGoals = match.awayGoals ?? 0;

  return (
    <div className="match-result">
      <p
        className={`match-result__club match-result__club--home${homeGoals < awayGoals ? " match-result__club--lost" : ""}`}
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
      <p className="match-result__score">
        {homeGoals} – {awayGoals}
      </p>
      <p
        className={`match-result__club${awayGoals < homeGoals ? " match-result__club--lost" : ""}`}
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
