import type { ReactNode } from "react";
import FittedName from "@/components/ui/FittedName/FittedName";
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
          <FittedName
            className="podium__name"
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
