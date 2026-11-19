import { useState } from "react";
import { useSeasonData } from "@/api/seasonData";
import MatchRow from "@/components/ui/MatchRow/MatchRow";
import Pager from "@/components/ui/Pager/Pager";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import type { LeagueCode } from "@/data/leagues";
import type { Match } from "@/types/api";
import { formatDay } from "@/utils/date";
import { seasonLabel } from "@/utils/season";
import "./ClubResults.scss";

// Props for the ClubResults component: the selected league, season and club,
// plus a class for its place on the page and its phone tab
type ClubResultsProps = {
  league: LeagueCode;
  season: number;
  clubId: number;
  className?: string;
};

type Venue = "all" | "home" | "away";

const VENUES: { value: Venue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "home", label: "Home" },
  { value: "away", label: "Away" },
];

// Matches per page, on phones too
const PAGE_SIZE = 6;

const TITLE = "Results";

// "All 38 league matches of 2025/26, in date order."
function description(venue: Venue, count: number, season: number) {
  const matches = venue === "all" ? "league matches" : `${venue} matches`;
  return `All ${count} ${matches} of ${seasonLabel(season)}, in date order.`;
}

// A date strip with the matchweek, above the match
function MatchItem({ match, hidden }: { match: Match; hidden?: boolean }) {
  return (
    <li
      className={`club-results__match${hidden ? " club-results__match--filler" : ""}`}
      aria-hidden={hidden || undefined}
    >
      <div className="club-results__strip">
        <h3 className="club-results__date">{formatDay(match.utcDate)}</h3>
        <p className="club-results__matchweek">Matchweek {match.matchday}</p>
      </div>
      <MatchRow match={match} />
    </li>
  );
}

// The club's league matches in date order, six a page, all or home or away;
// it opens on the latest page and the left arrow goes back in the season
export default function ClubResults({
  league,
  season,
  clubId,
  className,
}: ClubResultsProps) {
  const { data, isError } = useSeasonData(league, season);
  const [venue, setVenue] = useState<Venue>("all");
  // Pages back from the newest: 1 is the newest page
  const [page, setPage] = useState(1);

  // Another club or season starts again from the newest page
  const key = `${league}-${season}-${clubId}`;
  const [shownKey, setShownKey] = useState(key);
  if (key !== shownKey) {
    setShownKey(key);
    setPage(1);
  }

  const classes = `club-results${className ? ` ${className}` : ""}`;

  if (!data) {
    return (
      <SectionCard className={classes}>
        <div className="club-results__header">
          <SectionHeader
            title={TITLE}
            description={isError ? "Couldn't load the matches." : "Loading…"}
          />
        </div>
      </SectionCard>
    );
  }

  const matches = data.matches
    .filter(({ homeClubId, awayClubId }) =>
      venue === "home"
        ? homeClubId === clubId
        : venue === "away"
          ? awayClubId === clubId
          : homeClubId === clubId || awayClubId === clubId,
    )
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));

  // In date order, as on FotMob: pages fill from the start of the season, so
  // the newest page holds what's left ("37–38 of 38") with the latest match at
  // the bottom, and the left arrow goes back
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const seasonPage = pageCount - Math.min(page, pageCount) + 1;
  const first = (seasonPage - 1) * PAGE_SIZE;
  const pageMatches = matches.slice(first, first + PAGE_SIZE);
  // Invisible copies keep a short page as tall as a full one, so the pager
  // doesn't move
  const fillers = pageMatches.length
    ? Array.from(
        { length: PAGE_SIZE - pageMatches.length },
        () => pageMatches[0],
      )
    : [];
  // "37–38", or "19" for a page of one
  const range =
    pageMatches.length === 1
      ? String(first + 1)
      : `${first + 1}–${first + pageMatches.length}`;

  return (
    <SectionCard className={classes}>
      <div className="club-results__header">
        <SectionHeader
          title={TITLE}
          description={description(venue, matches.length, season)}
        />
        <SegmentedControl
          className="club-results__venue"
          label="Matches"
          options={VENUES}
          value={venue}
          onChange={(value) => {
            setVenue(value);
            setPage(1);
          }}
        />
      </div>

      {matches.length === 0 ? (
        <p className="club-results__status">No matches yet.</p>
      ) : (
        <>
          <ul className="club-results__matches">
            {pageMatches.map((match) => (
              <MatchItem key={match.matchId} match={match} />
            ))}
            {fillers.map((match, index) => (
              <MatchItem key={`filler-${index}`} match={match} hidden />
            ))}
          </ul>
          <div className="club-results__footer">
            <p className="club-results__count" aria-live="polite">
              <span className="club-results__count-long">Showing </span>
              {range} of {matches.length}
              <span className="club-results__count-long"> matches</span>
            </p>
            <Pager
              page={seasonPage}
              pageCount={pageCount}
              onChange={(shown) => setPage(pageCount - shown + 1)}
              previousLabel="Earlier matches"
              nextLabel="Later matches"
            />
          </div>
        </>
      )}
    </SectionCard>
  );
}
