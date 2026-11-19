import { useSeasonData } from "@/api/seasonData";
import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { LeagueCode } from "@/data/leagues";
import { getTableName } from "@/data/tableNames";
import type { Standing } from "@/types/api";
import { formatGoalDifference } from "@/utils/goalDifference";
import { cx } from "@/utils/cx";
import "./ClubLeagueTable.scss";

// Props for the ClubLeagueTable component: the selected league, season and
// club, plus a class for its phone tab
type ClubLeagueTableProps = {
  league: LeagueCode;
  season: number;
  clubId: number;
  className?: string;
};

const ROWS = 5;

// The club's row with two either side, kept inside the table at the ends
function rowsAround(standings: Standing[], clubId: number) {
  const index = standings.findIndex((row) => row.clubId === clubId);
  const start = Math.min(
    Math.max(index - Math.floor(ROWS / 2), 0),
    Math.max(standings.length - ROWS, 0),
  );
  return standings.slice(start, start + ROWS);
}

// Five rows of the league table around the club, with a link to the full table
export default function ClubLeagueTable({
  league,
  season,
  clubId,
  className,
}: ClubLeagueTableProps) {
  const { data, isError } = useSeasonData(league, season);
  const standings = data?.standings.standings ?? [];
  const rows = rowsAround(standings, clubId);

  return (
    <SectionCard className={cx("club-league-table", className)}>
      <div className="club-league-table__header">
        <SectionHeader
          title="League table"
          action={{
            label: "Full table",
            to: "/standings",
            shortLabel: "Full table",
          }}
        />
      </div>

      {rows.length === 0 ? (
        <p className="club-league-table__status">
          {isError ? "Couldn't load the standings." : "Loading…"}
        </p>
      ) : (
        <table className="club-league-table__table">
          <colgroup>
            <col className="club-league-table__col-position" />
            <col />
            <col className="club-league-table__col-played" />
            <col className="club-league-table__col-record" />
            <col className="club-league-table__col-record" />
            <col className="club-league-table__col-record" />
            <col className="club-league-table__col-difference" />
            <col className="club-league-table__col-points" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col" className="club-league-table__club">
                Club
              </th>
              <th scope="col" className="club-league-table__played">
                <abbr title="Played">Pl</abbr>
              </th>
              <th scope="col" className="club-league-table__record">
                <abbr title="Won">W</abbr>
              </th>
              <th scope="col" className="club-league-table__record">
                <abbr title="Drawn">D</abbr>
              </th>
              <th scope="col" className="club-league-table__record">
                <abbr title="Lost">L</abbr>
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
            {rows.map((row) => (
              <tr
                key={row.clubId}
                className={
                  row.clubId === clubId
                    ? "club-league-table__row--current"
                    : undefined
                }
                aria-current={row.clubId === clubId ? "true" : undefined}
              >
                <td className="club-league-table__position">
                  {row.position ?? standings.indexOf(row) + 1}
                </td>
                <th scope="row" className="club-league-table__club">
                  <span className="club-league-table__club-inner">
                    <ClubCrest
                      className="club-league-table__crest"
                      src={row.crestUrl}
                      name={row.displayName}
                    />
                    <span
                      className="club-league-table__name"
                      title={row.displayName}
                    >
                      {getTableName(row.clubId, row.displayName)}
                    </span>
                  </span>
                </th>
                <td className="club-league-table__played">
                  {row.gamesPlayed}
                </td>
                <td className="club-league-table__record">{row.wins}</td>
                <td className="club-league-table__record">{row.draws}</td>
                <td className="club-league-table__record">{row.losses}</td>
                <td>{formatGoalDifference(row)}</td>
                <td className="club-league-table__points">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}
