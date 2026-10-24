import { Link, NavLink } from "react-router-dom";
import { useEffect, useRef, type ComponentType } from "react";
import { X as CloseIcon } from "reicon-react";
import "./Sidebar.scss";

// Sidebar icons
import logoIcon from "../../../assets/logo.svg";
import { Grid as OverviewIcon } from "reicon-react";
import { Trophy as StandingsIcon } from "reicon-react";
import { CalendarDays as MatchesIcon } from "reicon-react";
import { UserCircle as PlayerStatsIcon } from "reicon-react";
import { Shield2 as ClubsIcon } from "reicon-react";
import { InfoCircle as AboutIcon } from "reicon-react";

// League logos
import premierLeagueLogo from "../../../assets/sidebar/premier-league-logo.svg";
import premierLeaguelogoAlt from "../../../assets/sidebar/premier-league-logo-alt.svg";
import laLigaLogo from "../../../assets/sidebar/la-liga-logo.svg";
import serieALogo from "../../../assets/sidebar/serie-a-logo.svg";
import bundesligaLogo from "../../../assets/sidebar/bundesliga-logo.svg";
import ligue1Logo from "../../../assets/sidebar/ligue-1-logo.svg";
import ligue1logoAlt from "../../../assets/sidebar/ligue-1-logo-alt.svg";

// League codes (same as the ones used in the API) for the leagues in the sidebar
export type LeagueCode = "PL" | "PD" | "SA" | "BL1" | "FL1";

// Props for the icon components, allowing for optional className to be passed in
type IconProps = {
  className?: string;
};

// Sidebar pages and their icons; league pages' paths go after the league slug
const PAGES: {
  path: string;
  name: string;
  icon: ComponentType<IconProps>;
  isLeaguePage: boolean;
}[] = [
  { path: "", name: "Overview", icon: OverviewIcon, isLeaguePage: true },
  {
    path: "/standings",
    name: "Standings",
    icon: StandingsIcon,
    isLeaguePage: true,
  },
  { path: "/matches", name: "Matches", icon: MatchesIcon, isLeaguePage: true },
  {
    path: "/player-stats",
    name: "Player Stats",
    icon: PlayerStatsIcon,
    isLeaguePage: true,
  },
  { path: "/clubs", name: "Clubs", icon: ClubsIcon, isLeaguePage: true },
  { path: "/about", name: "About", icon: AboutIcon, isLeaguePage: false },
];

// Sidebar leagues and their corresponding logos
export const LEAGUES: {
  code: LeagueCode;
  slug: string; // First part of the URL, e.g. /premier-league/standings
  name: string;
  logo: string;
  logoAlt?: string;
}[] = [
  {
    code: "PL",
    slug: "premier-league",
    name: "Premier League",
    logo: premierLeagueLogo,
    logoAlt: premierLeaguelogoAlt,
  },
  {
    code: "PD",
    slug: "la-liga",
    name: "La Liga",
    logo: laLigaLogo,
    logoAlt: laLigaLogo,
  },
  {
    code: "SA",
    slug: "serie-a",
    name: "Serie A",
    logo: serieALogo,
    logoAlt: serieALogo,
  },
  {
    code: "BL1",
    slug: "bundesliga",
    name: "Bundesliga",
    logo: bundesligaLogo,
    logoAlt: bundesligaLogo,
  },
  {
    code: "FL1",
    slug: "ligue-1",
    name: "Ligue 1",
    logo: ligue1Logo,
    logoAlt: ligue1logoAlt,
  },
];

// Props for the Sidebar component: the selected league and season, a link builder for
// league pages (pathTo("/standings")), plus the drawer state below laptop width
type SidebarProps = {
  selectedLeague: LeagueCode;
  isLeaguePage: boolean; // Highlights the league only on its own pages
  selectedSeason: number;
  onSelectLeague: (league: LeagueCode) => void;
  pathTo: (page: string) => string;
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
            aria-label="PitchData home"
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
