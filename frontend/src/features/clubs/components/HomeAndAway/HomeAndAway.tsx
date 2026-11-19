import { useSeasonData } from "@/api/seasonData";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { LeagueCode } from "@/data/leagues";
import { getClubMatches, possessive } from "@/features/clubs/utils/clubPage";
import "./HomeAndAway.scss";

// Props for the HomeAndAway component: the selected league, season and club,
// plus a class for its phone tab
type HomeAndAwayProps = {
  league: LeagueCode;
  season: number;
  clubId: number;
  className?: string;
};

// One stat at home and away, and which way is better
type VenueRow = {
  label: string;
  home: number;
  away: number;
  better: "higher" | "lower" | "neither";
};

const TITLE = "Home and away";

// The better side's class, or none when level or neither is better
function lead({ home, away, better }: VenueRow) {
  if (better === "neither" || home === away) return null;
  const homeLeads = better === "higher" ? home > away : home < away;
  return homeLeads ? "home" : "away";
}

// A club's points, record and goals at home against away
export default function HomeAndAway({
  league,
  season,
  clubId,
  className,
}: HomeAndAwayProps) {
  const { data, isError } = useSeasonData(league, season);
  const club = data?.standings.standings.find((row) => row.clubId === clubId);

  if (!data || !club) {
    return (
      <SectionCard className={className}>
        <SectionHeader
          title={TITLE}
          description={isError ? "Couldn't load the standings." : "Loading…"}
        />
      </SectionCard>
    );
  }

  // Clean sheets aren't split by venue in the standings, so count them
  const cleanSheets = { home: 0, away: 0 };
  for (const match of getClubMatches(data.matches, clubId)) {
    const isHome = match.homeClubId === clubId;
    if ((isHome ? match.awayGoals : match.homeGoals) === 0) {
      cleanSheets[isHome ? "home" : "away"]++;
    }
  }

  const rows: VenueRow[] = [
    {
      label: "Won",
      home: club.homeWins,
      away: club.awayWins,
      better: "higher",
    },
    {
      label: "Drawn",
      home: club.homeDraws,
      away: club.awayDraws,
      better: "neither",
    },
    {
      label: "Lost",
      home: club.homeLosses,
      away: club.awayLosses,
      better: "lower",
    },
    {
      label: "Scored",
      home: club.homeGoalsFor,
      away: club.awayGoalsFor,
      better: "higher",
    },
    {
      label: "Conceded",
      home: club.homeGoalsAgainst,
      away: club.awayGoalsAgainst,
      better: "lower",
    },
    { label: "Clean Sheets", ...cleanSheets, better: "higher" },
  ];

  // The split's own total, so the two sides always add up to it
  const points = club.homePoints + club.awayPoints;

  return (
    <SectionCard className={`home-and-away${className ? ` ${className}` : ""}`}>
      <SectionHeader
        title={TITLE}
        description={`Where ${possessive(club.displayName)} ${points} points came from.`}
      />
      <div className="home-and-away__comparison">
        <div className="home-and-away__split">
          <div className="home-and-away__totals">
            <p className="home-and-away__total">
              <span className="home-and-away__total-value">
                {club.homePoints}
              </span>
              <span className="home-and-away__total-label">Home Points</span>
            </p>
            <p className="home-and-away__total home-and-away__total--away">
              <span className="home-and-away__total-value">
                {club.awayPoints}
              </span>
              <span className="home-and-away__total-label">Away Points</span>
            </p>
          </div>
          {/* Each side's share of the points */}
          <div className="home-and-away__bar" aria-hidden>
            <span
              className="home-and-away__bar-home"
              style={{ flexGrow: club.homePoints }}
            />
            <span
              className="home-and-away__bar-away"
              style={{ flexGrow: club.awayPoints }}
            />
          </div>
        </div>

        <ul className="home-and-away__rows">
          {rows.map((row) => {
            const side = lead(row);
            return (
              <li
                key={row.label}
                className={`home-and-away__row${side ? ` home-and-away__row--${side}` : ""}`}
                aria-label={`${row.label}: ${row.home} at home, ${row.away} away`}
              >
                <span className="home-and-away__home" aria-hidden>
                  {row.home}
                </span>
                <span className="home-and-away__label" aria-hidden>
                  {row.label}
                </span>
                <span className="home-and-away__away" aria-hidden>
                  {row.away}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionCard>
  );
}
