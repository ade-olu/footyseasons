import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import type { LeagueCode } from "@/data/leagues";
import { useClub } from "@/features/clubs/api/club";
import { useClubHistory } from "@/features/clubs/api/clubHistory";
import { useEasedValues } from "@/features/clubs/hooks/useEasedValues";
import { ordinal } from "@/features/clubs/utils/clubDirectory";
import { possessive } from "@/features/clubs/utils/clubPage";
import { EARLIEST_SEASON, LATEST_SEASON } from "@/hooks/useSelection";
import type { ClubSeasonRecord } from "@/types/api";
import { formatGoalDifference } from "@/utils/goalDifference";
import { prefersReducedMotion } from "@/utils/motion";
import { seasonLabel } from "@/utils/season";
import { cx } from "@/utils/cx";
import "./SeasonBySeason.scss";

// Props for the SeasonBySeason component: the selected league, season and
// club, plus a class for its phone tab
type SeasonBySeasonProps = {
  league: LeagueCode;
  season: number;
  clubId: number;
  className?: string;
};

type View = "chart" | "table";

const VIEWS: { value: View; label: string }[] = [
  { value: "chart", label: "Chart" },
  { value: "table", label: "Table" },
];

const TITLE = "Season by season";

// Every season the app covers, oldest first
const SEASONS = Array.from(
  { length: LATEST_SEASON - EARLIEST_SEASON + 1 },
  (_, i) => EARLIEST_SEASON + i,
);

// "Arsenal's final league position in each season since 2014/15, with 1 title
// in that time.", plus a line for any gaps
function description(name: string, records: ClubSeasonRecord[]) {
  const titles = records.filter(({ isChampion }) => isChampion).length;
  const since = `${possessive(name)} final league position in each season since ${seasonLabel(EARLIEST_SEASON)}`;
  const won = titles
    ? `, with ${titles} ${titles === 1 ? "title" : "titles"} in that time.`
    : ".";
  const gaps =
    records.length < SEASONS.length
      ? " A gap means they weren't in the league."
      : "";
  return `${since}${won}${gaps}`;
}

// "1 win", "7 draws"
function count(value: number, word: string) {
  return `${value} ${word}${value === 1 ? "" : "s"}`;
}

// "1st, 85 points"
function placeLine({ position, points }: ClubSeasonRecord) {
  return `${ordinal(position)}, ${count(points, "point")}`;
}

// "26 wins, 7 draws, 5 defeats"
function recordLine({ wins, draws, losses }: ClubSeasonRecord) {
  return `${count(wins, "win")}, ${count(draws, "draw")}, ${count(losses, "defeat")}`;
}

// When the line reaches a point (0 to 1 of the draw), undoing its ease-out,
// which is close to 1 - (1 - t) ** 5
function arrival(x: number) {
  return 1 - (1 - x) ** (1 / 5);
}

// "25/26"
function shortLabel(startYear: number) {
  return seasonLabel(startYear).slice(2);
}

// Seasons in a row, so the line breaks where the club wasn't in the league
function runs(byYear: Map<number, ClubSeasonRecord>) {
  const result: number[][] = [];
  let run: number[] = [];
  SEASONS.forEach((year, i) => {
    if (byYear.has(year)) {
      run.push(i);
    } else if (run.length) {
      result.push(run);
      run = [];
    }
  });
  if (run.length) result.push(run);
  return result;
}

// A club's final league position in every season since 2014/15, as a chart
// or a table
export default function SeasonBySeason({
  league,
  season,
  clubId,
  className,
}: SeasonBySeasonProps) {
  const { data, isError } = useClubHistory(clubId);
  const club = useClub(clubId);
  const [view, setView] = useState<View>("chart");
  // The season under the pointer or tapped, and the last one shown, kept
  // while its tooltip fades out
  const [active, setActive] = useState<number | null>(null);
  const [shownYear, setShownYear] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  // Whether the last press was a mouse, so its click doesn't toggle the tooltip
  const pointerTypeRef = useRef("mouse");

  const records = data?.filter(({ leagueCode }) => leagueCode === league) ?? [];
  const byYear = new Map(records.map((record) => [record.startYear, record]));

  // The league's largest size, so every season shares one scale
  const clubs = records.length
    ? Math.max(...records.map(({ clubCount }) => clubCount))
    : 20;
  const yOf = (position: number) => (position - 1) / (clubs - 1);

  // Another club's line morphs from the last one when it played the same
  // seasons; otherwise the line draws in again
  const shape = `${SEASONS.map((year) => Number(byYear.has(year))).join("")}-${clubs}`;
  const lineYs = useEasedValues(
    SEASONS.map((year) => {
      const record = byYear.get(year);
      return record ? yOf(record.position) : 0;
    }),
    shape,
  );

  // Phones scroll the chart sideways: open with the selected season in view,
  // gliding to another season once open
  const hasChart = view === "chart" && records.length > 0;
  const scrolledRef = useRef(false);
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !hasChart) {
      scrolledRef.current = false;
      return;
    }
    const column = scroller.scrollWidth / SEASONS.length;
    const index = Math.max(SEASONS.indexOf(season), 0);
    scroller.scrollTo({
      left: (index + 0.5) * column - scroller.clientWidth / 2,
      behavior:
        scrolledRef.current && !prefersReducedMotion() ? "smooth" : "instant",
    });
    scrolledRef.current = true;
  }, [season, clubId, hasChart]);

  // Keeps the tooltip within the visible part of the chart, centred on its
  // point where it fits
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const plot = plotRef.current;
    const tooltip = tooltipRef.current;
    if (!scroller || !plot || !tooltip || shownYear === null) return;

    const view = scroller.getBoundingClientRect();
    const box = plot.getBoundingClientRect();
    const x = parseFloat(tooltip.dataset.x ?? "0") * box.width;
    const width = tooltip.offsetWidth;
    // The part of the plot in view, in the plot's own coordinates
    const min = Math.max(view.left - box.left, 0);
    const max = Math.min(view.right - box.left, box.width) - width;
    tooltip.style.left = `${Math.min(Math.max(x - width / 2, min), max)}px`;
  }, [shownYear]);

  // A tap anywhere else closes the tooltip
  useEffect(() => {
    if (active === null) return;
    const close = (event: globalThis.PointerEvent) => {
      if (!plotRef.current?.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active]);

  const name = club.data?.club.displayName;
  const classes = cx("season-by-season", className);

  if (!data || !name) {
    const status =
      isError || club.isError ? "Couldn't load the seasons." : "Loading…";
    return (
      <SectionCard className={classes}>
        <div className="season-by-season__header">
          <SectionHeader title={TITLE} description={status} />
        </div>
      </SectionCard>
    );
  }

  const xOf = (year: number) =>
    (SEASONS.indexOf(year) + 0.5) / SEASONS.length;
  const at = (x: number, y: number) =>
    ({ "--x": x, "--y": y }) as CSSProperties;

  const played = records.map(({ startYear }) => startYear);
  // "11.5,0.05": a season's centre and place, in the line's own units
  const linePoint = (i: number) => `${i + 0.5},${lineYs[i]}`;
  const shown = shownYear === null ? undefined : byYear.get(shownYear);

  const show = (year: number) => {
    setActive(year);
    setShownYear(year);
  };

  // The season in the column under the pointer, if the club played it
  const yearAt = (clientX: number) => {
    const box = plotRef.current!.getBoundingClientRect();
    const across = (clientX - box.left) / box.width;
    const index = Math.floor(across * SEASONS.length);
    const year = SEASONS[Math.min(Math.max(index, 0), SEASONS.length - 1)];
    return byYear.has(year) ? year : null;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const year = yearAt(event.clientX);
    if (year === null) setActive(null);
    else show(year);
  };
  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType === "mouse") setActive(null);
  };
  // Touch: a tap opens a season, and a second tap on it closes it
  const handleClick = (event: { clientX: number }) => {
    if (pointerTypeRef.current === "mouse") return;
    const year = yearAt(event.clientX);
    if (year === null || year === active) setActive(null);
    else show(year);
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    const current = played.indexOf(active ?? season);
    const last = played.length - 1;
    const next = {
      ArrowLeft: current === -1 ? last : current - 1,
      ArrowRight: current === -1 ? last : current + 1,
      Home: 0,
      End: last,
    }[event.key];
    if (event.key === "Escape") setActive(null);
    if (next === undefined) return;
    event.preventDefault();
    show(played[Math.min(Math.max(next, 0), last)]);
  };

  return (
    <SectionCard className={classes}>
      <div className="season-by-season__header">
        <SectionHeader
          title={TITLE}
          description={description(name, records)}
        />
        <SegmentedControl
          className="season-by-season__view"
          label="Season by season view"
          options={VIEWS}
          value={view}
          onChange={(value) => {
            setView(value);
            setActive(null);
          }}
        />
      </div>

      {view === "chart" ? (
        <div ref={scrollRef} className="season-by-season__scroll">
          <div
            ref={plotRef}
            className="season-by-season__plot"
            style={{ "--seasons": SEASONS.length } as CSSProperties}
            tabIndex={0}
            aria-label={`${TITLE}. Use the arrow keys to read each season.`}
            onPointerDown={(event) => {
              pointerTypeRef.current = event.pointerType;
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onBlur={() => setActive(null)}
          >
            {/* The selected season's column */}
            <div
              className="season-by-season__selected"
              style={at(xOf(season), 0)}
              aria-hidden
            />

            {[...new Set([1, 10, clubs])].map((place) => (
              <div
                key={place}
                className="season-by-season__gridline"
                style={at(0, yOf(place))}
                aria-hidden
              />
            ))}

            <svg
              key={shape}
              className="season-by-season__line"
              viewBox={`0 0 ${SEASONS.length} 1`}
              preserveAspectRatio="none"
              aria-hidden
            >
              {runs(byYear).map((run) => (
                <polyline
                  key={run[0]}
                  points={run.map((i) => linePoint(i)).join(" ")}
                />
              ))}
            </svg>

            {records.map((record) => (
              <span
                key={`${shape}-${record.startYear}`}
                className={cx(
                  "season-by-season__point",
                  record.startYear === season &&
                    "season-by-season__point--selected",
                )}
                style={
                  {
                    ...at(
                      xOf(record.startYear),
                      lineYs[SEASONS.indexOf(record.startYear)],
                    ),
                    "--arrival": arrival(xOf(record.startYear)),
                  } as CSSProperties
                }
                aria-hidden
              >
                {record.position}
              </span>
            ))}

            {SEASONS.map((year) => (
              <span
                key={year}
                className={cx(
                  "season-by-season__season",
                  year === season && "season-by-season__season--selected",
                )}
                style={at(xOf(year), 0)}
                aria-hidden
              >
                {shortLabel(year)}
              </span>
            ))}

            {/* Stays after the pointer leaves, so it can fade out */}
            {shown && (
              <>
                <span
                  className={cx(
                    "season-by-season__point season-by-season__point--active",
                    shown.startYear === season &&
                      "season-by-season__point--selected",
                    active === null && "season-by-season__point--hidden",
                  )}
                  style={at(xOf(shown.startYear), yOf(shown.position))}
                  aria-hidden
                >
                  {shown.position}
                </span>
                <div
                  ref={tooltipRef}
                  className={cx(
                    "season-by-season__tooltip",
                    yOf(shown.position) > 0.5 &&
                      "season-by-season__tooltip--above",
                    active === null && "season-by-season__tooltip--hidden",
                  )}
                  style={at(xOf(shown.startYear), yOf(shown.position))}
                  data-x={xOf(shown.startYear)}
                  aria-hidden
                >
                  <span>{shown.label}</span>
                  <span className="season-by-season__tooltip-summary">
                    {placeLine(shown)}
                  </span>
                  <span>{recordLine(shown)}</span>
                </div>
              </>
            )}

            {/* Read out what the tooltip shows */}
            <span className="season-by-season__live" aria-live="polite">
              {active !== null &&
                shown &&
                `${shown.label}: ${placeLine(shown)}. ${recordLine(shown)}.`}
            </span>
          </div>
        </div>
      ) : (
        <table className="season-by-season__table">
          <colgroup>
            <col />
            <col className="season-by-season__col" />
            <col className="season-by-season__wide-col" />
            <col className="season-by-season__wide-col" />
            <col className="season-by-season__wide-col" />
            <col className="season-by-season__wide-col" />
            <col className="season-by-season__wide-col" />
            <col className="season-by-season__wide-col" />
            <col className="season-by-season__col" />
            <col className="season-by-season__last-col" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="season-by-season__label">
                Season
              </th>
              <th scope="col">
                <abbr title="Position">Pos</abbr>
              </th>
              <th scope="col" className="season-by-season__wide">
                <abbr title="Played">Pl</abbr>
              </th>
              <th scope="col" className="season-by-season__wide">
                <abbr title="Won">W</abbr>
              </th>
              <th scope="col" className="season-by-season__wide">
                <abbr title="Drawn">D</abbr>
              </th>
              <th scope="col" className="season-by-season__wide">
                <abbr title="Lost">L</abbr>
              </th>
              <th scope="col" className="season-by-season__wide">
                <abbr title="Goals for">GF</abbr>
              </th>
              <th scope="col" className="season-by-season__wide">
                <abbr title="Goals against">GA</abbr>
              </th>
              <th scope="col">
                <abbr title="Goal difference">GD</abbr>
              </th>
              <th scope="col">
                <abbr title="Points">Pts</abbr>
              </th>
            </tr>
          </thead>
          <tbody>
            {records.toReversed().map((record) => (
              <tr
                key={record.startYear}
                aria-current={record.startYear === season ? "true" : undefined}
              >
                <th scope="row" className="season-by-season__label">
                  {record.label}
                </th>
                <td>{record.position}</td>
                <td className="season-by-season__wide">{record.gamesPlayed}</td>
                <td className="season-by-season__wide">{record.wins}</td>
                <td className="season-by-season__wide">{record.draws}</td>
                <td className="season-by-season__wide">{record.losses}</td>
                <td className="season-by-season__wide">{record.goalsFor}</td>
                <td className="season-by-season__wide">
                  {record.goalsAgainst}
                </td>
                <td>{formatGoalDifference(record)}</td>
                <td className="season-by-season__points">{record.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}
