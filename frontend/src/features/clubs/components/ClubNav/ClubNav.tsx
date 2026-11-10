import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft as ArrowLeftIcon } from "reicon-react";
import { useSeasonData } from "@/api/seasonData";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import type { LeagueCode } from "@/data/leagues";
import { useClub } from "@/features/clubs/api/club";
import { clubPath } from "@/features/clubs/utils/clubPage";
import { leaguePath } from "@/hooks/useSelection";
import "./ClubNav.scss";

// Props for the ClubNav component: the selected league, season and club
type ClubNavProps = {
  league: LeagueCode;
  season: number;
  clubId: number;
};

// Back to the directory, and a dropdown to switch to another club in the season
export default function ClubNav({ league, season, clubId }: ClubNavProps) {
  const navigate = useNavigate();
  const { data: seasonData } = useSeasonData(league, season);
  const { data: clubData } = useClub(clubId);

  // The season's clubs A to Z, plus this club when it wasn't in the league that season
  const clubs = (seasonData?.standings.standings ?? []).map(
    ({ clubId, displayName }) => ({ value: clubId, label: displayName }),
  );
  if (clubData && !clubs.some(({ value }) => value === clubId)) {
    clubs.push({ value: clubId, label: clubData.club.displayName });
  }
  clubs.sort((a, b) => a.label.localeCompare(b.label, "en-GB"));
  const labelOf = (id: number) =>
    clubs.find(({ value }) => value === id)?.label ?? "";

  return (
    <nav className="club-nav" aria-label="Clubs">
      <Link
        className="club-nav__back"
        to={leaguePath(league, "/clubs", season)}
        aria-label="All clubs"
      >
        <span className="club-nav__back-button">
          <ArrowLeftIcon className="club-nav__back-icon" aria-hidden />
        </span>
        <span className="club-nav__back-label" aria-hidden>
          All clubs
        </span>
      </Link>
      <Dropdown
        className="club-nav__dropdown"
        options={clubs}
        value={clubId}
        onChange={(nextClubId) =>
          navigate(
            clubPath(
              league,
              { clubId: nextClubId, displayName: labelOf(nextClubId) },
              season,
            ),
          )
        }
        ariaLabel="Club"
        label="Club"
      />
    </nav>
  );
}
