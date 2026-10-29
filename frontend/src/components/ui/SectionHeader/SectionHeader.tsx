import { Link } from "react-router-dom";
import type { LeaguePagePath } from "@/data/pages";
import { useSelection } from "@/hooks/useSelection";
import { ChevronRight as ArrowRightIcon } from "reicon-react";
import "./SectionHeader.scss";

// Link shown on the right of the header (e.g. "All players ›")
type SectionHeaderAction = {
  label: string;
  to: LeaguePagePath;
};

// Props for the SectionHeader component: a title, plus an optional description and link
type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: SectionHeaderAction;
};

// Title row used at the top of each overview section
export default function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  const { pathTo } = useSelection(); // Keeps the league and season

  return (
    <header
      className={`section-header${action ? " section-header--with-action" : ""}`}
    >
      <h2 className="section-header__title">{title}</h2>
      {description && (
        <p className="section-header__description">{description}</p>
      )}
      {/* Router link, so the selected league and season survive navigation */}
      {action && (
        <Link
          className="section-header__action"
          to={pathTo(action.to)}
          aria-label={action.label}
        >
          <span className="section-header__action-label">{action.label}</span>
          {/* Shorter label on phones */}
          <span className="section-header__action-label-short">See all</span>
          <ArrowRightIcon className="section-header__action-icon" aria-hidden />
        </Link>
      )}
    </header>
  );
}
