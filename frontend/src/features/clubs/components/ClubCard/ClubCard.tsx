import { Link } from "react-router-dom";
import { ChevronRight as ChevronIcon } from "reicon-react";
import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import FormBadges from "@/components/ui/FormBadges/FormBadges";
import {
  ordinal,
  type DirectoryClub,
} from "@/features/clubs/utils/clubDirectory";
import { EARLIEST_SEASON, LATEST_SEASON } from "@/hooks/useSelection";
import "./ClubCard.scss";

const TOTAL_SEASONS = LATEST_SEASON - EARLIEST_SEASON + 1;

// Props for the ClubCard component: the club's row, the name to show for this screen width and its page
type ClubCardProps = DirectoryClub & {
  name: string;
  to: string;
};

// A club in the directory: crest, tag, name, seasons, finish, points and form
export default function ClubCard({
  club,
  name,
  to,
  seasonsInLeague,
  form,
  tag,
}: ClubCardProps) {
  const stats = [
    {
      label: "Finish",
      value: club.position === null ? "–" : ordinal(club.position),
    },
    { label: "Points", value: club.points },
  ];

  return (
    <article className="club-card">
      <div className="club-card__top">
        <ClubCrest
          className="club-card__crest"
          src={club.crestUrl}
          name={club.displayName}
        />
        <div className="club-card__top-right">
          {tag && <span className="club-card__tag">{tag}</span>}
          <ChevronIcon className="club-card__chevron" aria-hidden />
        </div>
      </div>

      <div className="club-card__info">
        {/* The link covers the whole card */}
        <h3 className="club-card__name" title={club.displayName}>
          <Link className="club-card__link" to={to}>
            {name}
          </Link>
        </h3>
        <p className="club-card__seasons">
          {seasonsInLeague} of {TOTAL_SEASONS} seasons
        </p>
      </div>

      {/* dt = label, dd = value; CSS shows the value first */}
      <dl className="club-card__stats">
        {stats.map(({ label, value }) => (
          <div key={label} className="club-card__stat">
            <dt className="club-card__stat-label">{label}</dt>
            <dd className="club-card__stat-value">{value}</dd>
          </div>
        ))}
      </dl>

      <FormBadges className="club-card__form" results={form} />
    </article>
  );
}
