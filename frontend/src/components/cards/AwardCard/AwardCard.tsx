import { CupStar as TrophyIcon } from "reicon-react";
import { User as UserIcon } from "reicon-react"; // Placeholder shown when there's no photo
import ClubCrest from "../../ui/ClubCrest/ClubCrest";
import "./AwardCard.scss";

// Club the winner played (or managed) for
type AwardClub = {
  name: string;
  crestUrl: string | null;
};

// Props for the AwardCard component: the award, its winner and the stats line in the green pill
type AwardCardProps = {
  award: string;
  winner: string;
  club: AwardClub;
  stats: string;
  photoUrl?: string; // Falls back to a person icon when missing
};

// Dark card showing one season award winner
export default function AwardCard({
  award,
  winner,
  club,
  stats,
  photoUrl,
}: AwardCardProps) {
  return (
    <article className="award-card">
      <h3 className="award-card__award">
        <TrophyIcon className="award-card__award-icon" weight="Filled" aria-hidden />
        {award}
      </h3>
      <div className="award-card__body">
        <div className="award-card__details">
          <div className="award-card__winner">
            <p className="award-card__name" title={winner}>
              {winner}
            </p>
            <p className="award-card__club">
              <ClubCrest
                className="award-card__crest"
                src={club.crestUrl}
                name={club.name}
                onDark
              />
              <span className="award-card__club-name" title={club.name}>
                {club.name}
              </span>
            </p>
          </div>
          <p className="award-card__stats">{stats}</p>
        </div>
        <div className="award-card__photo">
          {photoUrl ? (
            <img className="award-card__photo-img" src={photoUrl} alt={winner} />
          ) : (
            <UserIcon className="award-card__photo-icon" aria-hidden />
          )}
        </div>
      </div>
    </article>
  );
}
