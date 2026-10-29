import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar/Navbar";
import "./styles/App.scss";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import type { LeagueCode } from "./data/leagues";
import type { LeaguePagePath } from "./data/pages";
import { useSelection } from "./hooks/useSelection";
import OverviewPage from "./pages/OverviewPage/OverviewPage";
import StandingsPage from "./pages/StandingsPage/StandingsPage";
import MatchesPage from "./pages/MatchesPage/MatchesPage";
import PlayerStatsPage from "./pages/PlayerStatsPage/PlayerStatsPage";
import ClubsPage from "./pages/ClubsPage/ClubsPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

// Each league page in PAGES and its component; a page missing here won't compile
const LEAGUE_PAGES: Record<
  LeaguePagePath,
  ComponentType<{ league: LeagueCode; season: number }>
> = {
  "": OverviewPage,
  "/standings": StandingsPage,
  "/matches": MatchesPage,
  "/player-stats": PlayerStatsPage,
  "/clubs": ClubsPage,
};

function App() {
  // Selected league and season, read from and written to the URL
  const { league, season, isLeaguePage, setLeague, setSeason, pathTo } =
    useSelection();
  // Sidebar drawer below laptop width
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  // Start each new page at the top; Back and Forward keep the browser's scroll
  useEffect(() => {
    if (navigationType !== "POP") window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  function closeMenu() {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  return (
    <div className="app">
      {/* Sidebar section */}
      <Sidebar
        selectedLeague={league}
        selectedSeason={season}
        isLeaguePage={isLeaguePage}
        onSelectLeague={setLeague}
        pathTo={pathTo}
        isOpen={isMenuOpen}
        onClose={closeMenu}
      />
      {/* Main content section */}
      <main className="app__main">
        {/* Navbar section */}
        <Navbar
          showSelection={isLeaguePage}
          selectedLeague={league}
          selectedSeason={season}
          onSelectSeason={setSeason}
          menuButtonRef={menuButtonRef}
          isMenuOpen={isMenuOpen}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
        {/* Page content */}
        <section className="app__content">
          <Routes>
            {/* Home goes to the selected league's Overview */}
            <Route path="/" element={<Navigate to={pathTo("")} replace />} />
            {/* About page route */}
            <Route path="/about" element={<AboutPage />} />
            {/* League pages, e.g. /premier-league/standings; unknown ones 404 */}
            <Route
              path="/:league"
              element={isLeaguePage ? <Outlet /> : <NotFoundPage />}
            >
              {Object.entries(LEAGUE_PAGES).map(([path, Page]) => {
                const element = <Page league={league} season={season} />;
                // Overview is the league's index route
                return path === "" ? (
                  <Route key="overview" index element={element} />
                ) : (
                  <Route key={path} path={path.slice(1)} element={element} />
                );
              })}
            </Route>
            {/* 404 page route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default App;
