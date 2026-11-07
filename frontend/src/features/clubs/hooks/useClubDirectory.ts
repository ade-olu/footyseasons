import { useSeasonData } from "@/api/seasonData";
import type { LeagueCode } from "@/data/leagues";
import { useClubSeasons } from "@/features/clubs/api/clubSeasons";
import { getClubDirectory } from "@/features/clubs/utils/clubDirectory";

// A league-season's clubs for the directory; data is undefined until both requests load
export function useClubDirectory(league: LeagueCode, season: number) {
  const seasonData = useSeasonData(league, season);
  const clubSeasons = useClubSeasons(league);

  return {
    data:
      seasonData.data && clubSeasons.data
        ? getClubDirectory(seasonData.data, clubSeasons.data, league, season)
        : undefined,
    isError: seasonData.isError || clubSeasons.isError,
  };
}
