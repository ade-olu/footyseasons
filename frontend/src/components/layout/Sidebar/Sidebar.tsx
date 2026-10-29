import { Link, NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";
import { X as CloseIcon } from "reicon-react";
import { LEAGUES, type LeagueCode } from "@/data/leagues";
import { PAGES, type LeaguePagePath } from "@/data/pages";
import logoIcon from "@/assets/logo.svg";
import "./Sidebar.scss";

// Props for the Sidebar component: the selected league and season, a link builder for
// league pages (pathTo("/standings")), plus the drawer state below laptop width
type SidebarProps = {
  selectedLeague: LeagueCode;
  isLeaguePage: boolean; // Highlights the league only on its own pages
  selectedSeason: number;
  onSelectLeague: (league: LeagueCode) => void;
  pathTo: (page: LeaguePagePath) => string;
  isOpen: boolean;
  onClose: () => void;
};

// Sidebar component that renders the sidebar navigation with pages and leagues
export default function Sidebar({
  selectedLeague,
  selectedSeason,
  isLeaguePage,
  onSelectLeague,
  pathTo,
  isOpen,
  onClose,
}: SidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the close button on open
  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Dims the page behind the drawer */}
      <div
        className={`sidebar-backdrop${isOpen ? " sidebar-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        id="sidebar"
        className={`sidebar${isOpen ? " sidebar--open" : ""}`}
      >
        <div className="sidebar__header">
          <Link
            to={pathTo("")}
            className="sidebar__logo-link"
            aria-label="FootySeasons home"
            onClick={onClose}
          >
            <img className="sidebar__logo" src={logoIcon} alt="" />
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            className="sidebar__close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <CloseIcon className="sidebar__close-icon" aria-hidden />
          </button>
        </div>
        {/* Navigation */}
        <nav className="sidebar__nav">
          {/* Main Navigation */}
          <section className="sidebar__section">
            <ul className="sidebar__nav-list">
              {/* Render each page in the sidebar navigation */}
              {PAGES.map((page) => (
                <li key={page.name}>
                  {/* Pages without a league keep the selection in history state */}
                  <NavLink
                    to={page.isLeaguePage ? pathTo(page.path) : page.path}
                    state={
                      page.isLeaguePage
                        ? undefined
                        : { league: selectedLeague, season: selectedSeason }
                    }
                    end={page.path === ""}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar__nav-item${isActive ? " sidebar__nav-item--active" : ""}`
                    }
                  >
                    <page.icon className="sidebar__nav-icon" />
                    <span>{page.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>

          {/* League Navigation */}
          <section className="sidebar__section">
            <h5 className="sidebar__section-title">Leagues</h5>
            <ul className="sidebar__nav-list">
              {/* Render each league in the sidebar navigation */}
              {LEAGUES.map((league) => {
                const isSelected =
                  isLeaguePage && selectedLeague === league.code;
                return (
                  <li key={league.code}>
                    <button
                      type="button"
                      className={`sidebar__nav-item${isSelected ? " sidebar__nav-item--selected" : ""}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        onSelectLeague(league.code);
                        onClose();
                      }}
                    >
                      <img
                        className="sidebar__nav-icon"
                        src={league.logo}
                        alt=""
                      />
                      <span>{league.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </nav>
      </aside>
    </>
  );
}
