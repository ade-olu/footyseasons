import { useEffect, useState } from "react";
import { API_URL } from "@/api/config";
import AwardCard from "@/features/awards/components/AwardCard/AwardCard";
import SectionCard from "@/components/ui/SectionCard/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { LEAGUES, type LeagueCode } from "@/data/leagues";
import type { Award, AwardsResponse, AwardType } from "@/types/api"; // Types for API responses
import "./SeasonAwards.scss";

// Card titles for each award
const AWARD_TITLES: Record<AwardType, string> = {
  player: "Player of the Season",
  manager: "Manager of the Season",
  goalkeeper: "Goalkeeper of the Season",
  young_player: "Young Player of the Season",
};

// The awards for one league and season
type SeasonAwardsData = {
  league: LeagueCode;
  season: number;
  awards: Award[];
};

// Props for the SeasonAwards component: the selected league and season start year
type SeasonAwardsProps = {
  league: LeagueCode;
  season: number;
};

// Fetches a league's season awards
async function fetchAwards(
  league: LeagueCode,
  season: number,
  signal: AbortSignal,
): Promise<SeasonAwardsData> {
  const res = await fetch(
    `${API_URL}/leagues/${league}/awards?season=${season}`,
    { signal },
  );

  if (!res.ok) {
    throw new Error(`Could not load awards for ${league}`);
  }

  const { awards } = (await res.json()) as AwardsResponse;

  return { league, season, awards };
}

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
  const [data, setData] = useState<SeasonAwardsData | null>(null);
  const [error, setError] = useState<{
    league: LeagueCode;
    season: number;
  } | null>(null);

  // Refetch whenever the selected league or season changes
  useEffect(() => {
    // Cancels the request if the selection changes before it finishes
    const controller = new AbortController();

    fetchAwards(league, season, controller.signal)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setError({ league, season });
        }
      });

    return () => controller.abort();
  }, [league, season]);

  // Old data or errors from a previous selection don't count for the current one
  const hasError = error?.league === league && error.season === season;
  const isReady =
    !hasError && data?.league === league && data.season === season;

  let status = null;
  if (hasError) {
    status = "Couldn't load the awards.";
  } else if (!isReady) {
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
      {isReady && !status ? (
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
