import { useAwards } from "@/features/awards/api/awards";
import AwardCard from "@/features/awards/components/AwardCard/AwardCard";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { LEAGUES, type LeagueCode } from "@/data/leagues";
import type { Award, AwardType } from "@/types/api"; // Types for API responses
import "./SeasonAwards.scss";

// Card titles for each award
const AWARD_TITLES: Record<AwardType, string> = {
  player: "Player of the Season",
  manager: "Manager of the Season",
  goalkeeper: "Goalkeeper of the Season",
  young_player: "Young Player of the Season",
};

// Props for the SeasonAwards component: the selected league and season start year
type SeasonAwardsProps = {
  league: LeagueCode;
  season: number;
};

// "9 Goals", "1 Goal"
function countLabel(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

// Stats line in the card's green pill
function getStats(award: Award) {
  switch (award.award) {
    case "player":
      // Only set for a goalkeeper
      if (award.cleanSheets !== null) {
        return countLabel(award.cleanSheets, "Clean Sheet", "Clean Sheets");
      }
      return `${countLabel(award.goals ?? 0, "Goal", "Goals")} · ${countLabel(award.assists ?? 0, "Assist", "Assists")}`;
    case "manager":
      return `${countLabel(award.wins, "Win", "Wins")} · ${countLabel(award.points, "Point", "Points")}`;
    case "goalkeeper":
      return countLabel(award.cleanSheets ?? 0, "Clean Sheet", "Clean Sheets");
    case "young_player":
      return `${(award.goals ?? 0) + (award.assists ?? 0)} G/A · ${countLabel(award.starts ?? 0, "Start", "Starts")}`;
  }
}

// "The class of <season>" section: one card per award winner
export default function SeasonAwards({ league, season }: SeasonAwardsProps) {
  const leagueName = LEAGUES.find((item) => item.code === league)?.name;
  const { data, isError } = useAwards(league, season);

  let status = null;
  if (isError) {
    status = "Couldn't load the awards.";
  } else if (!data) {
    status = "Loading…";
  } else if (data.awards.length === 0) {
    status = "No season awards were given this season.";
  }

  return (
    <SectionCard className="season-awards">
      <SectionHeader
        title={`The class of ${season}/${season + 1}`}
        description={`The standout individuals behind this ${leagueName} season.`}
      />
      {data && !status ? (
        <div className="season-awards__grid">
          {data.awards.map((item) => (
            <AwardCard
              key={`${item.award}-${item.winnerName}`}
              award={AWARD_TITLES[item.award]}
              winner={item.winnerName}
              club={{ name: item.displayName, crestUrl: item.crestUrl }}
              stats={getStats(item)}
              photoUrl={item.photoUrl}
            />
          ))}
        </div>
      ) : (
        <p className="season-awards__status">{status}</p>
      )}
    </SectionCard>
  );
}
