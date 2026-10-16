import { Link, NavLink } from "react-router-dom";
import { useEffect, useRef, type ComponentType } from "react";
import { X as CloseIcon } from "reicon-react";
import "./Sidebar.scss";

// Sidebar icons
import logoIcon from "../../assets/logo.svg";
import { Grid as OverviewIcon } from "reicon-react";
import { Trophy as StandingsIcon } from "reicon-react";
import { CalendarDays as MatchesIcon } from "reicon-react";
import { UserCircle as PlayerStatsIcon } from "reicon-react";
import { Shield2 as ClubsIcon } from "reicon-react";
import { InfoCircle as AboutIcon } from "reicon-react";

// League logos
import premierLeagueLogo from "../../assets/sidebar/premier-league-logo.svg";
import premierLeaguelogoAlt from "../../assets/sidebar/premier-league-logo-alt.svg";
import laLigaLogo from "../../assets/sidebar/la-liga-logo.svg";
import serieALogo from "../../assets/sidebar/serie-a-logo.svg";
import bundesligaLogo from "../../assets/sidebar/bundesliga-logo.svg";
import ligue1Logo from "../../assets/sidebar/ligue-1-logo.svg";
import ligue1logoAlt from "../../assets/sidebar/ligue-1-logo-alt.svg";

// League codes (same as the ones used in the API) for the leagues in the sidebar
export type LeagueCode = "PL" | "PD" | "SA" | "BL1" | "FL1";

// Props for the icon components, allowing for optional className to be passed in
type IconProps = {
  className?: string;
};

// Sidebar pages and their corresponding icons
const PAGES: { path: string; name: string; icon: ComponentType<IconProps> }[] =
  [
    { path: "/", name: "Overview", icon: OverviewIcon },
    { path: "/standings", name: "Standings", icon: StandingsIcon },
    { path: "/matches", name: "Matches", icon: MatchesIcon },
    { path: "/player-stats", name: "Player Stats", icon: PlayerStatsIcon },
    { path: "/clubs", name: "Clubs", icon: ClubsIcon },
    { path: "/about", name: "About", icon: AboutIcon },
  ];

// Sidebar leagues and their corresponding logos
export const LEAGUES: {
  code: LeagueCode;
  name: string;
  logo: string;
  logoAlt?: string;
}[] = [
  {
    code: "PL",
    name: "Premier League",
    logo: premierLeagueLogo,
    logoAlt: premierLeaguelogoAlt,
  },
  { code: "PD", name: "La Liga", logo: laLigaLogo, logoAlt: laLigaLogo },
  { code: "SA", name: "Serie A", logo: serieALogo, logoAlt: serieALogo },
  {
    code: "BL1",
    name: "Bundesliga",
    logo: bundesligaLogo,
    logoAlt: bundesligaLogo,
  },
  {
    code: "FL1",
    name: "Ligue 1",
    logo: ligue1Logo,
    logoAlt: ligue1logoAlt,
  },
];

// Props for the Sidebar component: the selected league, plus the drawer state below laptop width
type SidebarProps = {
  selectedLeague: LeagueCode;
  onSelectLeague: (league: LeagueCode) => void;
  isOpen: boolean;
  onClose: () => void;
};

// Sidebar component that renders the sidebar navigation with pages and leagues
export default function Sidebar({
  selectedLeague,
  onSelectLeague,
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
            to="/"
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
                <li key={page.path}>
                  <NavLink
                    to={page.path}
                    end={page.path === "/"}
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
                const isSelected = selectedLeague === league.code;
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
