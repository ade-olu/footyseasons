import { useRef, useState } from "react";
import { useSeasonData } from "@/api/seasonData";
import AtAGlance from "@/features/matches/components/AtAGlance/AtAGlance";
import MatchOfTheSeason from "@/features/matches/components/MatchOfTheSeason/MatchOfTheSeason";
import MatchweekResults from "@/features/matches/components/MatchweekResults/MatchweekResults";
import type { LeagueCode } from "@/data/leagues";
import type { Match } from "@/types/api"; // Types for API responses
import { isPlayed } from "@/utils/match";
import { prefersReducedMotion } from "@/utils/motion";
import "./MatchweekBrowser.scss";

// Props for the MatchweekBrowser component: the selected league and season start year
// (2025 = 2025/26)
type MatchweekBrowserProps = {
  league: LeagueCode;
  season: number;
};

// The last matchweek with a result, or the first before any are played
function latestMatchweek(matches: Match[]): number {
  return Math.max(1, ...matches.filter(isPlayed).map((m) => m.matchday));
}

// Results with At a glance and Match of the Season beside them (below them on smaller
// screens, where the order is Match of the Season, At a glance, results).
// Keeps the picked matchweek for all three
export default function MatchweekBrowser({
  league,
  season,
}: MatchweekBrowserProps) {
  const { data } = useSeasonData(league, season);
  // The picked matchweek, kept only for the league and season it was picked in
  const [picked, setPicked] = useState<{ key: string; matchweek: number }>();
  const resultsRef = useRef<HTMLDivElement>(null);

  const key = `${league}-${season}`;
  const matchweek = data
    ? picked?.key === key
      ? picked.matchweek
      : latestMatchweek(data.matches)
    : undefined;

  const pick = (value: number) => setPicked({ key, matchweek: value });

  // Picks the match's round and scrolls to the results
  const showMatchweek = (value: number) => {
    pick(value);
    resultsRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className="matchweek-browser">
      <div className="matchweek-browser__results" ref={resultsRef}>
        <MatchweekResults
          league={league}
          season={season}
          matchweek={matchweek}
          onChange={pick}
        />
      </div>
      <div className="matchweek-browser__glance">
        <AtAGlance league={league} season={season} matchweek={matchweek} />
      </div>
      <div className="matchweek-browser__season">
        <MatchOfTheSeason
          league={league}
          season={season}
          onShowMatchweek={showMatchweek}
        />
      </div>
    </div>
  );
}
