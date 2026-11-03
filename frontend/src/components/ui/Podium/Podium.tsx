import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import "./Podium.scss";

// One step: a crest or photo (sized by the caller), a name, and the stat under it
export type PodiumStep = {
  id: string | number;
  media: ReactNode;
  name: string;
  shortNames?: string[]; // Tried in order when name doesn't fit
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

// The name on one line: the full name when it fits the step, otherwise the first
// short name that does, or the last one with an ellipsis
function PodiumName({
  name,
  shortNames = [],
  title,
}: Pick<PodiumStep, "name" | "shortNames" | "title">) {
  const nameRef = useRef<HTMLParagraphElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  const options = [name, ...shortNames];

  // Compares each option's width with the step's, again on resize or font load
  useLayoutEffect(() => {
    const element = nameRef.current;
    const measures = measureRef.current;
    if (!element || !measures) return;

    const check = () => {
      const widths = [...measures.children].map(
        (option) => (option as HTMLElement).offsetWidth,
      );
      const fitting = widths.findIndex((width) => width <= element.clientWidth);
      setShown(fitting === -1 ? widths.length - 1 : fitting);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    observer.observe(measures);
    return () => observer.disconnect();
  }, [name, shortNames]);

  return (
    <p className="podium__name" ref={nameRef} title={title ?? name}>
      {shortNames.length > 0 && (
        <span className="podium__name-measure" ref={measureRef} aria-hidden>
          {options.map((option, index) => (
            <span key={index}>{option}</span>
          ))}
        </span>
      )}
      {shown === 0 || !options[shown] ? (
        name
      ) : (
        <>
          <span aria-hidden>{options[shown]}</span>
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
            shortNames={step.shortNames}
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
