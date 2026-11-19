import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useSeasonData } from "@/api/seasonData";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { LeagueCode } from "@/data/leagues";
import { getTableName } from "@/data/tableNames";
import { TABLE_PLACES } from "@/data/tablePlaces";
import { ordinal } from "@/features/clubs/utils/clubDirectory";
import { possessive } from "@/features/clubs/utils/clubPage";
import {
  getPositionByRound,
  type RoundPosition,
} from "@/features/clubs/utils/positionByRound";
import { prefersReducedMotion } from "@/utils/motion";
import { seasonLabel } from "@/utils/season";
import "./PositionChart.scss";

// Props for the PositionChart component: the selected league, season and club,
// plus a class for its phone tab
type PositionChartProps = {
  league: LeagueCode;
  season: number;
  clubId: number;
  className?: string;
};

const TITLE = "Position by matchweek";

// Room either side of the line for the tooltip to line up with a 28px marker
const MARKER_OVERHANG = 14;

// "Top of the table for 31 of 38 rounds.", or the highest and lowest places
function summary(rounds: RoundPosition[]) {
  const positions = rounds.map(({ position }) => position);
  const top = positions.filter((position) => position === 1).length;
  const highest = Math.min(...positions);
  const lowest = Math.max(...positions);

  if (top === rounds.length) return "Top of the table after every round.";
  if (top > 0) return `Top of the table for ${top} of ${rounds.length} rounds.`;
  if (highest === lowest) return `${ordinal(highest)} after every round.`;
  return `Highest ${ordinal(highest)}, lowest ${ordinal(lowest)}.`;
}

// "18 Apr"
const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

// "Matchweek 33 · 18 Apr", without a date when the club had no match
function roundLine({ round, match }: RoundPosition) {
  const date = match ? ` · ${shortDate.format(new Date(match.utcDate))}` : "";
  return `Matchweek ${round}${date}`;
}

// "6th, 3 points"
function placeLine({ position, points }: RoundPosition) {
  return `${ordinal(position)}, ${points} ${points === 1 ? "point" : "points"}`;
}

// "Man United 0–1 Arsenal"
function matchLine({ match }: RoundPosition) {
  if (!match) return "No match this round";
  const home = getTableName(match.homeClubId, match.homeClubDisplayName);
  const away = getTableName(match.awayClubId, match.awayClubDisplayName);
  return `${home} ${match.homeGoals}–${match.awayGoals} ${away}`;
}

// The first place of the bottom relegation run (Elche's 13th isn't a zone)
function relegationStart(league: LeagueCode, season: number, clubs: number) {
  const places = TABLE_PLACES[`${league}-${season}`]?.relegation ?? [];
  let start: number | null = null;
  for (let place = clubs; places.includes(place); place--) start = place;
  return start;
}

// Matchweek labels under the line; phones show only 1, 20 and the last
function axisRounds(total: number) {
  const rounds = [1, 10, 20, 30].filter((round) => round <= total - 4);
  return [...rounds, total].map((round) => ({
    round,
    wide: round === 10 || round === 30,
  }));
}

// How long the line takes to move to another club's positions
const MORPH_DURATION = 500;

// Eases from the values shown to new ones, such as another club's line
function useEasedValues(target: number[]) {
  const key = target.join(",");
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const to = key ? key.split(",").map(Number) : [];
    const from = shownRef.current;
    // A different number of rounds can't morph, so it switches straight away
    const duration =
      from.length === to.length && !prefersReducedMotion() ? MORPH_DURATION : 0;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = duration ? Math.min((now - start) / duration, 1) : 1;
      const eased = 1 - (1 - progress) ** 3; // Ease-out cubic
      const next = to.map(
        (value, i) => (from[i] ?? value) * (1 - eased) + value * eased,
      );
      shownRef.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [key]);

  return shown.length === target.length ? shown : target;
}

// A club's league position after every round, as a line on a fixed scale
export default function PositionChart({
  league,
  season,
  clubId,
  className,
}: PositionChartProps) {
  const { data, isError } = useSeasonData(league, season);
  const [active, setActive] = useState<number | null>(null);
  // The last round shown, kept while its tooltip fades out
  const [shownRound, setShownRound] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  // A finger on the plot: whether it has moved, and if its round was open
  const dragRef = useRef<{ moved: boolean; wasOpen: boolean } | null>(null);

  // Keeps the tooltip inside the line's ends, centred on its point where it fits
  useLayoutEffect(() => {
    const plot = plotRef.current;
    const line = lineRef.current;
    const tooltip = tooltipRef.current;
    if (!plot || !line || !tooltip || shownRound === null) return;

    const plotBox = plot.getBoundingClientRect();
    const lineBox = line.getBoundingClientRect();
    const x = parseFloat(tooltip.dataset.x ?? "0");
    const centre = lineBox.left - plotBox.left + x * lineBox.width;
    const width = tooltip.offsetWidth;
    const min = lineBox.left - plotBox.left - MARKER_OVERHANG;
    const max = lineBox.right - plotBox.left + MARKER_OVERHANG - width;
    tooltip.style.left = `${Math.min(Math.max(centre - width / 2, min), max)}px`;
  }, [shownRound]);

  // A tap anywhere else closes the tooltip
  useEffect(() => {
    if (active === null) return;
    const close = (event: globalThis.PointerEvent) => {
      if (!plotRef.current?.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active]);

  const club = data?.standings.standings.find((row) => row.clubId === clubId);
  const rounds = data
    ? getPositionByRound(data.matches, data.standings.standings, clubId)
    : [];
  const clubs = data?.standings.standings.length ?? 20;

  // Where a place sits, as 0 to 1 down the plot
  const yOf = (position: number) => (position - 1) / Math.max(clubs - 1, 1);
  const lineYs = useEasedValues(rounds.map(({ position }) => yOf(position)));

  if (!data || !club || rounds.length === 0) {
    let status = "No matches played yet.";
    if (!data) status = isError ? "Couldn't load the matches." : "Loading…";
    return (
      <SectionCard className={className}>
        <SectionHeader title={TITLE} description={status} />
      </SectionCard>
    );
  }

  const total = Math.max(...data.matches.map(({ matchday }) => matchday));
  const last = rounds[rounds.length - 1];
  const zoneStart = relegationStart(league, season, clubs);
  const showZone =
    zoneStart !== null &&
    rounds.some(({ position }) => position >= zoneStart);

  // Where a round sits, as 0 to 1 across the plot
  const xOf = (round: number) => (round - 1) / Math.max(total - 1, 1);
  const at = (x: number, y: number) =>
    ({ "--x": x, "--y": y }) as CSSProperties;

  const linePoints = lineYs.map((y, i) => `${i},${y}`).join(" ");
  const gridlines = [...new Set([1, 10, clubs])];
  const shown = shownRound === null ? undefined : rounds[shownRound - 1];

  const show = (round: number) => {
    setActive(round);
    setShownRound(round);
  };

  // The round nearest the pointer, among those played
  const roundAt = (clientX: number) => {
    const box = lineRef.current!.getBoundingClientRect();
    const round = Math.round(((clientX - box.left) / box.width) * (total - 1));
    return Math.min(Math.max(round + 1, 1), rounds.length);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === "mouse") show(roundAt(event.clientX));
    else handleTouchMove(event);
  };
  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType === "mouse") setActive(null);
  };
  // Touch: sliding a finger scrubs through the rounds; a second tap on the
  // same round closes it
  const handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse") return;
    const round = roundAt(event.clientX);
    dragRef.current = { moved: false, wasOpen: round === active };
    event.currentTarget.setPointerCapture(event.pointerId);
    show(round);
  };
  const handleTouchMove = (event: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const round = roundAt(event.clientX);
    if (round === shownRound) return;
    drag.moved = true;
    show(round);
  };
  const handlePointerUp = (event: PointerEvent) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (event.pointerType !== "mouse" && drag && !drag.moved && drag.wasOpen) {
      setActive(null);
    }
  };
  // The page took the touch to scroll up or down
  const handlePointerCancel = () => {
    dragRef.current = null;
    setActive(null);
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    const current = active ?? rounds.length;
    const next = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 1,
      End: rounds.length,
    }[event.key];
    if (event.key === "Escape") setActive(null);
    if (next === undefined) return;
    event.preventDefault();
    show(Math.min(Math.max(next, 1), rounds.length));
  };

  return (
    <SectionCard className={className}>
      <SectionHeader
        title={TITLE}
        description={`${possessive(club.displayName)} league position after every round of ${seasonLabel(season)}. ${summary(rounds)}`}
      />
      <div
        ref={plotRef}
        className="position-chart"
        tabIndex={0}
        aria-label={`${TITLE}. Use the arrow keys to read each round.`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        data-no-drawer-swipe
        onKeyDown={handleKeyDown}
        onBlur={() => setActive(null)}
      >
        {/* Relegation zone, only for a club that was in it */}
        {showZone && (
          <div
            className="position-chart__zone"
            style={
              {
                "--top": yOf(zoneStart - 0.5),
                "--bottom": yOf(clubs + 0.5),
              } as CSSProperties
            }
            aria-hidden
          />
        )}

        {gridlines.map((place) => (
          <div key={place} aria-hidden>
            <div
              className="position-chart__gridline"
              style={at(0, yOf(place))}
            />
            <span className="position-chart__scale" style={at(0, yOf(place))}>
              {ordinal(place)}
            </span>
          </div>
        ))}

        {axisRounds(total).map(({ round, wide }) => (
          <span
            key={round}
            className={`position-chart__round${wide ? " position-chart__round--wide" : ""}${round === 1 ? " position-chart__round--first" : ""}${round === total ? " position-chart__round--last" : ""}`}
            style={at(xOf(round), 0)}
            aria-hidden
          >
            MW {round}
          </span>
        ))}

        <svg
          ref={lineRef}
          className="position-chart__line"
          viewBox={`0 0 ${Math.max(total - 1, 1)} 1`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <polyline points={linePoints} />
        </svg>

        {/* The latest round, with its position */}
        <span
          className="position-chart__marker position-chart__marker--latest"
          style={at(xOf(last.round), lineYs[last.round - 1])}
          aria-hidden
        >
          {last.position}
        </span>

        {/* Stays after the pointer leaves, so it can fade out */}
        {shown && (
          <>
            <span
              className={`position-chart__marker position-chart__marker--active${shown === last ? " position-chart__marker--latest" : ""}${active === null ? " position-chart__marker--hidden" : ""}`}
              style={at(xOf(shown.round), lineYs[shown.round - 1])}
              aria-hidden
            >
              {shown.position}
            </span>
            <div
              ref={tooltipRef}
              className={`position-chart__tooltip${yOf(shown.position) > 0.5 ? " position-chart__tooltip--above" : ""}${active === null ? " position-chart__tooltip--hidden" : ""}`}
              style={at(xOf(shown.round), lineYs[shown.round - 1])}
              data-x={xOf(shown.round)}
              aria-hidden
            >
              <span className="position-chart__tooltip-title">
                {roundLine(shown)}
              </span>
              <span className="position-chart__tooltip-summary">
                {placeLine(shown)}
              </span>
              <span className="position-chart__tooltip-detail">
                {matchLine(shown)}
              </span>
            </div>
          </>
        )}

        {/* Read out what the tooltip shows */}
        <span className="position-chart__live" aria-live="polite">
          {active !== null &&
            shown &&
            `${roundLine(shown)}: ${placeLine(shown)}. ${matchLine(shown)}.`}
        </span>
      </div>
    </SectionCard>
  );
}
