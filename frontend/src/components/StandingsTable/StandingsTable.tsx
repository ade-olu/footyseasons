import ClubCrest from "../ClubCrest/ClubCrest";
import {
  getTableZone,
  type TablePlaces,
  type TableZone,
} from "../../data/tablePlaces";
import type { Standing } from "../../types/api";
import "./StandingsTable.scss";

// One letter of a club's form: win, draw or loss
export type FormResult = "W" | "D" | "L";

// Props for the StandingsTable component: the league table (in table order), each club's
// last results (oldest first, keyed by clubId), the season's European and relegation places, and an optional row limit
type StandingsTableProps = {
  standings: Standing[];
  form: Record<number, FormResult[]>;
  places?: TablePlaces;
  limit?: number; // Overview shows the top 5; leave out for the full table
};

// Legend labels, in the order they're shown under the table
// (modifier is the BEM class suffix for the row indicator and legend dot)
const ZONES: {
  key: TableZone;
  label: string;
  modifier: string;
}[] = [
  {
    key: "championsLeague",
    label: "Champions League",
    modifier: "champions-league",
  },
  { key: "europaLeague", label: "Europa League", modifier: "europa-league" },
  {
    key: "conferenceLeague",
    label: "Conference League Qualification",
    modifier: "conference-league",
  },
  {
    key: "relegationPlayoff",
    label: "Relegation Qualification",
    modifier: "relegation-playoff",
  },
  { key: "relegation", label: "Relegation", modifier: "relegation" },
];

const RELEGATION_ZONES: TableZone[] = ["relegationPlayoff", "relegation"];

const FORM_LABELS: Record<FormResult, string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
};

// Shows goal difference with a sign, e.g. +44, 0, -12
function formatGoalDifference(club: Standing) {
  const difference = club.goalsFor - club.goalsAgainst;
  return difference > 0 ? `+${difference}` : String(difference);
}

// League table: position, club, played, W/D/L, goal difference, points and form
export default function StandingsTable({
  standings,
  form,
  places,
  limit,
}: StandingsTableProps) {
  const rows = limit === undefined ? standings : standings.slice(0, limit);

  // Position is null if the table hasn't been ranked; fall back to the row order
  const zoneOf = (club: Standing, index: number) => {
    const zone = getTableZone(places, club.position ?? index + 1);
    return ZONES.find(({ key }) => key === zone);
  };

  // The European competitions are always listed (as in Figma); the relegation
  // zones only when a shown row is in them, so the overview's top 5 doesn't list them
  const legend = ZONES.filter(
    ({ key }) =>
      !RELEGATION_ZONES.includes(key) ||
      rows.some((club, index) => zoneOf(club, index)?.key === key),
  );

  return (
    <div className="standings-table">
      {/* Scrolls sideways instead of squashing the columns on narrow screens */}
      <div className="standings-table__scroll">
        <table className="standings-table__table">
          <colgroup>
            <col className="standings-table__col-position" />
            <col />
            {Array.from({ length: 6 }, (_, index) => (
              <col key={index} className="standings-table__col-stat" />
            ))}
            <col className="standings-table__col-form" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="standings-table__position">
                #
              </th>
              <th scope="col" className="standings-table__club">
                Club
              </th>
              <th scope="col" className="standings-table__stat">
                <abbr title="Played">PL</abbr>
              </th>
              <th scope="col" className="standings-table__stat">
                <abbr title="Won">W</abbr>
              </th>
              <th scope="col" className="standings-table__stat">
                <abbr title="Drawn">D</abbr>
              </th>
              <th scope="col" className="standings-table__stat">
                <abbr title="Lost">L</abbr>
              </th>
              <th scope="col" className="standings-table__stat">
                <abbr title="Goal difference">GD</abbr>
              </th>
              <th scope="col" className="standings-table__stat">
                <abbr title="Points">PTS</abbr>
              </th>
              <th scope="col" className="standings-table__form">
                Form
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((club, index) => {
              const position = club.position ?? index + 1;
              const zone = zoneOf(club, index);
              const results = form[club.clubId] ?? [];

              return (
                <tr key={club.clubId}>
                  <td
                    className={`standings-table__position${
                      zone ? ` standings-table__position--${zone.modifier}`
                        : ""
                    }`}
                  >
                    {position}
                  </td>
                  <th scope="row" className="standings-table__club">
                    <span className="standings-table__club-inner">
                      <span className="standings-table__crest-slot">
                        <ClubCrest
                          src={club.crestUrl}
                          name={club.name}
                          className="standings-table__crest"
                        />
                      </span>
                      <span className="standings-table__club-name">
                        {club.name}
                      </span>
                    </span>
                  </th>
                  <td className="standings-table__stat">{club.gamesPlayed}</td>
                  <td className="standings-table__stat">{club.wins}</td>
                  <td className="standings-table__stat">{club.draws}</td>
                  <td className="standings-table__stat">{club.losses}</td>
                  <td className="standings-table__stat">
                    {formatGoalDifference(club)}
                  </td>
                  <td className="standings-table__stat">{club.points}</td>
                  <td className="standings-table__form">
                    <ol
                      className="standings-table__form-list"
                      aria-label="Last 5 results, oldest first"
                    >
                      {results.map((result, resultIndex) => (
                        <li
                          key={resultIndex}
                          className={`standings-table__form-badge standings-table__form-badge--${FORM_LABELS[result].toLowerCase()}`}
                          title={FORM_LABELS[result]}
                        >
                          {result}
                        </li>
                      ))}
                    </ol>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Legend only when the season's places are known */}
      {places && (
        <ul className="standings-table__legend">
          {legend.map(({ key, label, modifier }) => (
            <li key={key} className="standings-table__legend-item">
              <span
                className={`standings-table__legend-dot standings-table__legend-dot--${modifier}`}
              />
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
