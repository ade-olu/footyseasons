import type { CSSProperties } from "react";
import PlayerPhoto from "@/components/ui/PlayerPhoto/PlayerPhoto";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { useClubLineup } from "@/features/clubs/api/clubLineup";
import { possessive } from "@/features/clubs/utils/clubPage";
import type { ClubManager, LineupPlayer, LineupSlot } from "@/types/api";
import { cx } from "@/utils/cx";
import { shortPlayerNames } from "@/utils/playerNames";
import { countLabel } from "@/utils/plural";
import { seasonLabel } from "@/utils/season";
import "./MostUsedXI.scss";

// Props for the MostUsedXI component: the selected season and club, its name
// for the description, plus a class for its phone tab
type MostUsedXIProps = {
  season: number;
  clubId: number;
  clubName: string;
  className?: string;
};

// A line of 5 is drawn as 2 rows on phones
const isPacked = (line: LineupSlot[]) => line.length >= 5;

// "Viktor Gyökeres" -> "Gyökeres", "Virgil van Dijk" -> "van Dijk"
function surname(player: LineupPlayer) {
  const names = shortPlayerNames({
    understatId: player.understatId ?? 0,
    playerName: player.playerName,
  });
  return names.at(-1) ?? player.playerName;
}

function Player({ player }: { player: LineupPlayer }) {
  return (
    <div className="most-used-xi__player">
      <PlayerPhoto
        className="most-used-xi__photo"
        src={player.photoUrl}
        name={player.playerName}
      />
      <span className="most-used-xi__name" title={player.playerName}>
        {player.shirtNumber !== null && (
          <span className="most-used-xi__number">{player.shirtNumber}</span>
        )}
        <span className="most-used-xi__surname">{surname(player)}</span>
      </span>
      <span className="most-used-xi__starts">
        {countLabel(player.starts, "start")}
      </span>
    </div>
  );
}

function Manager({
  manager,
  isOnly,
}: {
  manager: ClubManager;
  isOnly: boolean;
}) {
  const { wins, draws, losses, matches } = manager;
  const record = `${wins}W ${draws}D ${losses}L`;
  return (
    <li className="most-used-xi__manager">
      <PlayerPhoto
        className="most-used-xi__photo"
        src={manager.photoUrl}
        name={manager.name}
      />
      <span className="most-used-xi__manager-info">
        <span className="most-used-xi__manager-name">{manager.name}</span>
        <span className="most-used-xi__manager-detail">
          {isOnly
            ? `Manager · ${record}`
            : `${countLabel(matches, "match", "matches")} · ${record}`}
        </span>
      </span>
    </li>
  );
}

// The club's most-used formation with the players who started most in each
// position, on a half pitch, and the season's managers below
export default function MostUsedXI({
  season,
  clubId,
  clubName,
  className,
}: MostUsedXIProps) {
  const { data, isError } = useClubLineup(clubId, season);

  // Seasons without lineups have nothing to show
  if (data && !data.formation) return null;

  const [goalkeeper, ...outfield] = data?.lines ?? [];
  // Each outfield line's first row on phones, counted from 1
  const rows: number[] = [];
  let rowCount = 0;
  for (const line of outfield) {
    rows.push(rowCount + 1);
    rowCount += isPacked(line) ? 2 : 1;
  }

  let description = "Loading…";
  if (data) {
    description = `The players who started most in each position in ${seasonLabel(season)}, in ${possessive(clubName)} most-used shape, ${data.formation}.`;
  } else if (isError) {
    description = "Couldn't load the most-used XI.";
  }

  return (
    <SectionCard className={cx("most-used-xi", className)}>
      <SectionHeader title="Most-used XI" description={description} />
      {data && (
        <>
          <div
            className={cx(
              "most-used-xi__pitch",
              outfield.length > 3 && "most-used-xi__pitch--deep",
              outfield.some(isPacked) && "most-used-xi__pitch--packed",
            )}
            style={
              {
                "--outfield": outfield.length,
                "--rows": rowCount,
              } as CSSProperties
            }
          >
            <span className="most-used-xi__box" aria-hidden />
            <span className="most-used-xi__goal-area" aria-hidden />
            <span className="most-used-xi__arc" aria-hidden />
            <span className="most-used-xi__circle" aria-hidden />
            {[goalkeeper, ...outfield].map((line, index) => (
              <div
                key={index}
                className={cx(
                  "most-used-xi__line",
                  index === 0 && "most-used-xi__line--goalkeeper",
                  index === 1 && "most-used-xi__line--defence",
                  line.length >= 4 && "most-used-xi__line--crowded",
                  isPacked(line) && "most-used-xi__line--packed",
                )}
                style={
                  {
                    "--line": index,
                    "--row": rows[index - 1] ?? 0,
                  } as CSSProperties
                }
              >
                {line.map((slot, slotIndex) =>
                  slot.player ? (
                    <Player key={slotIndex} player={slot.player} />
                  ) : (
                    <div key={slotIndex} className="most-used-xi__player" />
                  ),
                )}
              </div>
            ))}
          </div>
          {data.managers.length > 0 && (
            <ul className="most-used-xi__managers">
              {data.managers.map((manager) => (
                <Manager
                  key={manager.name}
                  manager={manager}
                  isOnly={data.managers.length === 1}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </SectionCard>
  );
}
