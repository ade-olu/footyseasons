import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "./styles/App.scss";
import Sidebar, { type LeagueCode } from "./components/Sidebar/Sidebar";
import OverviewPage from "./pages/OverviewPage/OverviewPage";
import StandingsPage from "./pages/StandingsPage/StandingsPage";
import MatchesPage from "./pages/MatchesPage/MatchesPage";
import PlayerStatsPage from "./pages/PlayerStatsPage/PlayerStatsPage";
import ClubsPage from "./pages/ClubsPage/ClubsPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

// Season shown on first load, as a start year (2025 = 2025/26)
const LATEST_SEASON = 2025;

function App() {
  const [league, setLeague] = useState<LeagueCode>("PL"); // Default league is the Premier League
  const [season, setSeason] = useState(LATEST_SEASON); // Default season is the latest season

  return (
    <div className="app">
      {/* Sidebar section */}
      <Sidebar selectedLeague={league} onSelectLeague={setLeague} />
      {/* Main content section */}
      <main className="app__main">
        {/* Navbar section */}
        <Navbar
          selectedLeague={league}
          selectedSeason={season}
          onSelectSeason={setSeason}
        />
        {/* Page content */}
        <section className="app__content">
          <Routes>
            {/* Overview page route */}
            <Route
              path="/"
              element={<OverviewPage league={league} season={season} />}
            />
            {/* Standings page route */}
            <Route path="/standings" element={<StandingsPage />} />
            {/* Matches page route */}
            <Route path="/matches" element={<MatchesPage />} />
            {/* Player Stats page route */}
            <Route path="/player-stats" element={<PlayerStatsPage />} />
            {/* Clubs page route */}
            <Route path="/clubs" element={<ClubsPage />} />
            {/* About page route */}
            <Route path="/about" element={<AboutPage />} />
            {/* 404 page route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default App;
