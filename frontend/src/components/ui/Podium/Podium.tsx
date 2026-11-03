import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import "./Podium.scss";

// One step: a crest or photo (sized by the caller), a name, and the stat under it
export type PodiumStep = {
  id: string | number;
  media: ReactNode;
  name: string;
  shortName?: string; // Shown instead of name when name doesn't fit
  title?: string; // Hover text, name by default
  stat: ReactNode;
};

// Props for the Podium component: the top 3 in order, a label for screen readers
// and a class for placing it in a banner
type PodiumProps = {
  steps: PodiumStep[];
  label: string;
  className?: string;
};

// The name on one line: the full name when it fits the step, otherwise the short one
function PodiumName({
  name,
  shortName,
  title,
}: Pick<PodiumStep, "name" | "shortName" | "title">) {
  const nameRef = useRef<HTMLParagraphElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(true);

  // Compares the full name's width with the step's, again on resize or font load
  useLayoutEffect(() => {
    const element = nameRef.current;
    const measure = measureRef.current;
    if (!shortName || !element || !measure) return;

    const check = () => setFits(measure.offsetWidth <= element.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [name, shortName]);

  return (
    <p className="podium__name" ref={nameRef} title={title ?? name}>
      {shortName && (
        <span className="podium__name-measure" ref={measureRef} aria-hidden>
          {name}
        </span>
      )}
      {fits || !shortName ? (
        name
      ) : (
        <>
          <span aria-hidden>{shortName}</span>
          {/* Screen readers get the full name */}
          <span className="podium__name-full">{name}</span>
        </>
      )}
    </p>
  );
}

// Top 3 on a podium, shown 2, 1, 3, with bars sitting on the parent's bottom edge
export default function Podium({ steps, label, className }: PodiumProps) {
  // Steps in table order; CSS shows them as 2, 1, 3
  return (
    <ol
      className={`podium${className ? ` ${className}` : ""}`}
      aria-label={label}
    >
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`podium__step podium__step--${index + 1}`}
        >
          <div className="podium__media">{step.media}</div>
          <PodiumName
            name={step.name}
            shortName={step.shortName}
            title={step.title}
          />
          <div className="podium__stat">{step.stat}</div>
          <span className="podium__bar" aria-hidden="true">
            {index + 1}
          </span>
        </li>
      ))}
    </ol>
  );
}
