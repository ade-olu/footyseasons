import type { RefObject } from "react";
import { useLeagues } from "@/api/leagues";
import { Menu as MenuIcon } from "reicon-react"; // Opens the sidebar below laptop width
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import type { LeagueCode } from "@/data/leagues";
import { LEAGUES } from "@/data/leagues";
import type { Season } from "@/types/api";

import "./Navbar.scss";

// Props for the Navbar component: the selected league and season (start year, 2025 = 2025/26),
// plus the menu button that opens the sidebar drawer
type NavbarProps = {
  showSelection: boolean; // False on pages without a league (About, 404)
  selectedLeague: LeagueCode;
  selectedSeason: number;
  onSelectSeason: (season: number) => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
};

// Shows a season as full years, e.g. 2025 -> "2025/2026"
function formatSeason(startYear: number) {
  return `${startYear}/${startYear + 1}`;
}

export default function Navbar({
  showSelection,
  selectedLeague,
  selectedSeason,
  onSelectSeason,
  menuButtonRef,
  isMenuOpen,
  onOpenMenu,
}: NavbarProps) {
  // Empty until /leagues responds; if it fails, the fallback season below is kept
  const { data: leagues = [] } = useLeagues();

  const league = LEAGUES.find((item) => item.code === selectedLeague);

  // Seasons for the selected league, newest first. Falls back to the selected season
  // on its own until the API responds (or if it fails), so the button always has a value
  const apiSeasons =
    leagues.find((item) => item.code === selectedLeague)?.seasons ?? [];
  const seasons: Season[] =
    apiSeasons.length > 0
      ? apiSeasons
      : [{ startYear: selectedSeason, label: formatSeason(selectedSeason) }];

  return (
    // Navbar component for displaying the selected league and a dropdown for selecting the season
    <nav className={`navbar${showSelection ? "" : " navbar--menu-only"}`}>
      {/* Selected league section */}
      <div className="navbar__league">
        <button
          ref={menuButtonRef}
          type="button"
          className="navbar__menu"
          aria-label="Open menu"
          aria-controls="sidebar"
          aria-expanded={isMenuOpen}
          onClick={onOpenMenu}
        >
          <MenuIcon className="navbar__menu-icon" aria-hidden />
        </button>
        {showSelection && league?.logoAlt && (
          <img src={league.logoAlt} alt="" className="navbar__league-logo" />
        )}
        {showSelection && (
          <h2 className="navbar__league-name">
            <span className="navbar__league-full-name">{league?.name}</span>
            <span className="navbar__league-short-name">
              {league?.shortName ?? league?.name}
            </span>{" "}
            <span className="navbar__league-season">
              {formatSeason(selectedSeason)}
            </span>
          </h2>
        )}
      </div>

      {/* Dropdown for selecting the season, newest first */}
      {showSelection && (
        <Dropdown
          className="navbar__season"
          options={seasons.map((season) => ({
            value: season.startYear,
            label: formatSeason(season.startYear),
          }))}
          value={selectedSeason}
          onChange={onSelectSeason}
          ariaLabel="Season"
          label="Season"
        />
      )}
    </nav>
  );
}
