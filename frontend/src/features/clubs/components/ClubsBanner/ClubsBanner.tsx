import { getLeagueName, type LeagueCode } from "@/data/leagues";
import { useClubDirectory } from "@/features/clubs/hooks/useClubDirectory";
import { EARLIEST_SEASON } from "@/hooks/useSelection";
import { seasonLabel } from "@/utils/season";
import "./ClubsBanner.scss";

// Props for the ClubsBanner component: the selected league and season start year (2025 = 2025/26)
type ClubsBannerProps = {
  league: LeagueCode;
  season: number;
};

// Clubs page banner: title, description and the season's club counts
export default function ClubsBanner({ league, season }: ClubsBannerProps) {
  const { data, isError } = useClubDirectory(league, season);

  const metrics = [
    { label: "Clubs", value: data?.clubs.length },
    { label: "Promoted", value: data?.promoted },
    { label: "Relegated", value: data?.relegated },
  ];

  return (
    <section
      className="clubs-banner"
      aria-labelledby="clubs-banner-title"
      aria-busy={!data && !isError}
    >
      <div className="clubs-banner__text">
        <h2 id="clubs-banner-title" className="clubs-banner__title">
          Clubs
        </h2>
        {isError && (
          <p className="clubs-banner__description" role="alert">
            Couldn't load the clubs.
          </p>
        )}
        {data && (
          <p className="clubs-banner__description">
            Results, squads and league history since{" "}
            {seasonLabel(EARLIEST_SEASON)} for all {data.clubs.length} clubs in
            the {seasonLabel(season)} {getLeagueName(league)}.
          </p>
        )}
      </div>

      {/* dt = label, dd = value; CSS shows the value first */}
      <dl className="clubs-banner__metrics">
        {metrics.map(({ label, value }) => (
          <div key={label} className="clubs-banner__metric">
            <dt className="clubs-banner__metric-label">{label}</dt>
            <dd className="clubs-banner__metric-value">{value ?? "–"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
