import { CupStar as TrophyIcon } from "reicon-react";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { useClubHonours } from "@/features/clubs/api/clubHonours";
import { TROPHIES } from "@/features/clubs/data/honours";
import { LATEST_SEASON } from "@/hooks/useSelection";
import { cx } from "@/utils/cx";
import { seasonLabel } from "@/utils/season";
import "./ClubHonours.scss";

// Props for the ClubHonours component: the selected season and club, plus a
// class for its phone tab
type ClubHonoursProps = {
  season: number;
  clubId: number;
  className?: string;
};

const TITLE = "Trophies";

// "All-time trophies.", or up to an earlier season
function description(season: number) {
  return season === LATEST_SEASON
    ? "All-time trophies."
    : `All-time trophies up to ${seasonLabel(season)}.`;
}

// League titles and cups, all-time, counted up to the selected season; hidden
// when the club has none
export default function ClubHonours({
  season,
  clubId,
  className,
}: ClubHonoursProps) {
  const { data } = useClubHonours(clubId, season);
  if (!data) return null;

  const counts = new Map(data.trophies.map((t) => [t.competition, t]));
  const items = TROPHIES.flatMap((trophy) => {
    const count = counts.get(trophy.key);
    return count ? [{ ...trophy, ...count }] : [];
  });
  if (items.length === 0) return null;

  return (
    <SectionCard className={cx("club-honours", className)}>
      <div className="club-honours__header">
        <SectionHeader title={TITLE} description={description(season)} />
      </div>
      <ul className="club-honours__items">
        {items.map((item) => (
          <li key={item.key} className="club-honours__item">
            {item.logo ? (
              <img
                className="club-honours__icon"
                src={item.logo}
                alt=""
                loading="lazy"
              />
            ) : (
              <TrophyIcon
                className="club-honours__icon club-honours__icon--trophy"
                weight="Filled"
                aria-hidden
              />
            )}
            <div className="club-honours__info">
              <h3 className="club-honours__name" title={item.name}>
                {item.name}
              </h3>
              <p className="club-honours__last">
                Last won {seasonLabel(item.lastStartYear)}
              </p>
            </div>
            <p
              className="club-honours__count"
              aria-label={`${item.count} ${item.count === 1 ? "time" : "times"}`}
            >
              {item.count}
            </p>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
