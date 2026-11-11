import ClubCrest from "@/components/ui/ClubCrest/ClubCrest";
import FittedName from "@/components/ui/FittedName/FittedName";
import "./HighlightCard.scss";

// Club shown next to the value (e.g. the club with the best win streak)
type HighlightClub = {
  name: string;
  crestUrl: string | null;
};

// Props for the HighlightCard component: a title, the headline value and a line of context under it
type HighlightCardProps = {
  title: string;
  value: string;
  description: string;
  descriptionTitle?: string; // Hover text for a shortened description, e.g. the full club names
  shortDescription?: string; // Shown instead on phones, so it fits on one line
  club?: HighlightClub; // When set, the card shows the club's crest and uses `value` as the club name
  shortNames?: string[]; // Shorter club names to try when `value` doesn't fit
  crests?: HighlightClub[]; // Crests shown before the value (e.g. the relegated clubs)
  crestsAfter?: HighlightClub[]; // Crests shown after the value (e.g. a match's away club)
};

// A row of small crests beside the value
function CrestList({ crests }: { crests: HighlightClub[] }) {
  return (
    <span className="highlight-card__crests">
      {crests.map((crest) => (
        <ClubCrest
          key={crest.name}
          className="highlight-card__crests-item"
          src={crest.crestUrl}
          name={crest.name}
          showName
        />
      ))}
    </span>
  );
}

// Small stat card for the season highlights row
export default function HighlightCard({
  title,
  value,
  description,
  descriptionTitle,
  shortDescription,
  club,
  shortNames,
  crests,
  crestsAfter,
}: HighlightCardProps) {
  return (
    <article className="highlight-card">
      <h3 className="highlight-card__title">{title}</h3>
      <div className="highlight-card__content">
        {/* Club cards show crest + name (smaller text), the rest show a single number */}
        <p
          className={`highlight-card__value${club ? " highlight-card__value--club" : ""}`}
        >
          {crests && crests.length > 0 && <CrestList crests={crests} />}
          {club && (
            <ClubCrest
              className="highlight-card__crest"
              src={club.crestUrl}
              name={club.name}
            />
          )}
          {club ? (
            <FittedName
              className="highlight-card__value-text"
              name={value}
              shortNames={shortNames}
              title={club.name}
            />
          ) : (
            <span className="highlight-card__value-text">{value}</span>
          )}
          {crestsAfter && crestsAfter.length > 0 && (
            <CrestList crests={crestsAfter} />
          )}
        </p>
        <p className="highlight-card__description" title={descriptionTitle}>
          {shortDescription ? (
            <>
              <span className="highlight-card__description-text--wide">
                {description}
              </span>
              <span className="highlight-card__description-text--phone">
                {shortDescription}
              </span>
            </>
          ) : (
            description
          )}
        </p>
      </div>
    </article>
  );
}
