import ClubCrest from "../ClubCrest/ClubCrest";
import type { Match } from "../../types/api"; // Types for API responses
import "./MatchResult.scss";

// Props for the MatchResult component: one played match
type MatchResultProps = {
  match: Match;
};

// One result: home club, score, away club. The losing club's name is muted,
// and phones show short names
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
          <span className="match-result__name-full">
            {match.homeClubDisplayName}
          </span>
          <span className="match-result__name-short">
            {match.homeClubShortName}
          </span>
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
          <span className="match-result__name-full">
            {match.awayClubDisplayName}
          </span>
          <span className="match-result__name-short">
            {match.awayClubShortName}
          </span>
        </span>
      </p>
    </div>
  );
}
