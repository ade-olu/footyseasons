import AwardCard from "../AwardCard/AwardCard";
import SectionCard from "../SectionCard/SectionCard";
import SectionHeader from "../SectionHeader/SectionHeader";
import { LEAGUES, type LeagueCode } from "../Sidebar/Sidebar";
import "./SeasonAwards.scss";

// Props for the SeasonAwards component: the selected league and season start year
type SeasonAwardsProps = {
  league: LeagueCode;
  season: number;
};

// Placeholder winners (PL 2025/26, as in Figma) until the awards data is ready
const PLACEHOLDER_AWARDS = [
  {
    award: "Player of the Season",
    winner: "Bruno Fernandes",
    club: { name: "Manchester United", crestUrl: "/crests/manchester-united.svg" },
    stats: "9 Goals · 21 Assists",
  },
  {
    award: "Manager of the Season",
    winner: "Mikel Arteta",
    club: { name: "Arsenal", crestUrl: "/crests/arsenal.svg" },
    stats: "26 Wins · 85 Points",
  },
  {
    award: "Goalkeeper of the Season",
    winner: "David Raya",
    club: { name: "Arsenal", crestUrl: "/crests/arsenal.svg" },
    stats: "19 Clean Sheets",
  },
  {
    award: "Young Player of the Season",
    winner: "Nico O'Reilly",
    club: { name: "Manchester City", crestUrl: "/crests/manchester-city.svg" },
    stats: "8 G/A · 29 Starts",
  },
];

// "The class of <season>" section: one card per season award
export default function SeasonAwards({ league, season }: SeasonAwardsProps) {
  const leagueName = LEAGUES.find((item) => item.code === league)?.name;

  return (
    <SectionCard className="season-awards">
      <SectionHeader
        title={`The class of ${season}/${season + 1}`}
        description={`The standout individuals behind this ${leagueName} season.`}
      />
      <div className="season-awards__grid">
        {PLACEHOLDER_AWARDS.map((item) => (
          <AwardCard key={item.award} {...item} />
        ))}
      </div>
    </SectionCard>
  );
}
