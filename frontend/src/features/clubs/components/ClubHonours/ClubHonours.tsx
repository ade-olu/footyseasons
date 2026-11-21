import { CupStar as TrophyIcon } from "reicon-react";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { useClub } from "@/features/clubs/api/club";
import { useClubHonours } from "@/features/clubs/api/clubHonours";
import { TROPHIES } from "@/features/clubs/data/honours";
import { possessive } from "@/features/clubs/utils/clubPage";
import { LATEST_SEASON } from "@/hooks/useSelection";
import { cx } from "@/utils/cx";
import { seasonLabel } from "@/utils/season";
import { countLabel } from "@/utils/plural";
import "./ClubHonours.scss";

// Props for the ClubHonours component: the selected season and club, plus a
// class for its phone tab
type ClubHonoursProps = {
  season: number;
  clubId: number;
  className?: string;
};

const TITLE = "Trophies";

// "Arsenal's 48 trophies across all competitions.", or up to an earlier season
function description(name: string, total: number, season: number) {
  const trophies = `${possessive(name)} ${countLabel(total, "trophy", "trophies")}`;
  return season === LATEST_SEASON
    ? `${trophies} across all competitions.`
    : `${trophies} up to ${seasonLabel(season)}.`;
}

// League titles and cups, all-time, counted up to the selected season; hidden
// when the club has none
export default function ClubHonours({
  season,
  clubId,
  className,
}: ClubHonoursProps) {
  const { data } = useClubHonours(clubId, season);
  const club = useClub(clubId);
  const name = club.data?.club.displayName;
  if (!data || !name) return null;

  const counts = new Map(data.trophies.map((t) => [t.competition, t]));
  const items = TROPHIES.flatMap((trophy) => {
    const count = counts.get(trophy.key);
    return count ? [{ ...trophy, ...count }] : [];
  });
  if (items.length === 0) return null;
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <SectionCard className={cx("club-honours", className)}>
      <div className="club-honours__header">
        <SectionHeader
          title={TITLE}
          description={description(name, total, season)}
        />
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
              aria-label={countLabel(item.count, "time")}
            >
              {item.count}
            </p>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
