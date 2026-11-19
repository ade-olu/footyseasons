import { CupStar as TrophyIcon } from "reicon-react";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { useClubHonours } from "@/features/clubs/api/clubHonours";
import { AWARDS, TROPHIES, type Honour } from "@/features/clubs/data/honours";
import { EARLIEST_SEASON, LATEST_SEASON } from "@/hooks/useSelection";
import type { ClubHonour } from "@/types/api";
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

const TITLE = "Titles and awards";

// "All-time trophies, awards since 2014/15.", up to an earlier season
function description(season: number) {
  const since = `awards since ${seasonLabel(EARLIEST_SEASON)}`;
  return season === LATEST_SEASON
    ? `All-time trophies, ${since}.`
    : `All-time trophies up to ${seasonLabel(season)}, ${since}.`;
}

// The club's honours in the list's order, only those it has won
function won(list: Honour[], counts: Map<string, ClubHonour>) {
  return list.flatMap((honour) => {
    const count = counts.get(honour.key);
    return count ? [{ ...honour, ...count }] : [];
  });
}

// League titles and cups (all-time) and season awards (since 2014/15), each
// counted up to the selected season; hidden when the club has none
export default function ClubHonours({
  season,
  clubId,
  className,
}: ClubHonoursProps) {
  const { data } = useClubHonours(clubId, season);
  if (!data) return null;

  const items = [
    ...won(TROPHIES, new Map(data.trophies.map((t) => [t.competition, t]))),
    ...won(AWARDS, new Map(data.awards.map((a) => [a.award, a]))),
  ];
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
              <h3 className="club-honours__name">{item.name}</h3>
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
