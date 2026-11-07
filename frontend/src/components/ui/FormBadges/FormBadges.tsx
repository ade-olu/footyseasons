import type { FormResult } from "@/utils/form";
import "./FormBadges.scss";

// Props for the FormBadges component: results oldest first, and a className for the gap
type FormBadgesProps = {
  results: FormResult[];
  className?: string;
};

const FORM_LABELS: Record<FormResult, string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
};

// A club's last results as coloured circles
export default function FormBadges({
  results,
  className = "",
}: FormBadgesProps) {
  return (
    <ol
      className={`form-badges ${className}`}
      aria-label={`Last ${results.length} results, oldest first`}
    >
      {results.map((result, index) => (
        <li
          key={index}
          className={`form-badges__badge form-badges__badge--${FORM_LABELS[result].toLowerCase()}`}
          title={FORM_LABELS[result]}
        >
          {result}
        </li>
      ))}
    </ol>
  );
}
