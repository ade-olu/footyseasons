import { ChevronRight as ArrowRightIcon } from "reicon-react";
import { useSeasonData } from "@/api/seasonData";
import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import {
  best,
  isFinished,
  margin,
  totalGoals,
} from "@/features/matches/utils/matchStats";
import { LEAGUES, type LeagueCode } from "@/data/leagues";
import "./MatchOfTheSeason.scss";

// Props for the MatchOfTheSeason component: the selected league and season start year
// (2025 = 2025/26) and what to do when its matchweek link is clicked
type MatchOfTheSeasonProps = {
  league: LeagueCode;
  season: number;
  onShowMatchweek: (matchweek: number) => void;
};

// "Tue 2 Dec 2025" from a UTC date (en-GB puts a comma after the weekday)
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// Dark card with the season's highest-scoring match (then the closest score, then the
// earliest) and a link that shows its matchweek in the results
export default function MatchOfTheSeason({
  league,
  season,
  onShowMatchweek,
}: MatchOfTheSeasonProps) {
  const { data, isError } = useSeasonData(league, season);
  const leagueName = LEAGUES.find((item) => item.code === league)?.name;

  const match = data
    ? best(data.matches.filter(isFinished), totalGoals, (m) => -margin(m))
    : undefined;

  if (!data || !match) {
    let status = "No matches played yet.";
    if (!data) status = isError ? "Couldn't load the matches." : "Loading…";

    return (
      <section className="match-of-the-season">
        <div className="match-of-the-season__body">
          <h2 className="match-of-the-season__eyebrow">Match of the Season</h2>
          <p className="match-of-the-season__description">{status}</p>
        </div>
      </section>
    );
  }

  const goals = totalGoals(match);
  const label = data.standings.season.label;

  return (
    <section className="match-of-the-season">
      <div className="match-of-the-season__body">
        <h2 className="match-of-the-season__eyebrow">Match of the Season</h2>
        <div className="match-of-the-season__match">
          <p className="match-of-the-season__score">
            <ClubCrest
              className="match-of-the-season__crest"
              src={match.homeClubCrestUrl}
              name={match.homeClubDisplayName}
              onDark
            />
            {`${match.homeGoals} – ${match.awayGoals}`}
            <ClubCrest
              className="match-of-the-season__crest"
              src={match.awayClubCrestUrl}
              name={match.awayClubDisplayName}
              onDark
            />
          </p>
          <p className="match-of-the-season__clubs">
            {`${match.homeClubDisplayName} vs ${match.awayClubDisplayName}`}
          </p>
          <p className="match-of-the-season__description">
            {`${goals} ${goals === 1 ? "goal" : "goals"}, the most in any ${label} ${leagueName} match.`}
          </p>
        </div>
      </div>
      <footer className="match-of-the-season__footer">
        <p className="match-of-the-season__date">
          {dateFormat.format(new Date(match.utcDate)).replace(",", "")}
        </p>
        <button
          type="button"
          className="match-of-the-season__link"
          onClick={() => onShowMatchweek(match.matchday)}
        >
          {`Matchweek ${match.matchday}`}
          <ArrowRightIcon
            className="match-of-the-season__link-icon"
            aria-hidden
          />
        </button>
      </footer>
    </section>
  );
}
