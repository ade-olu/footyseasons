import type { SeasonData } from "@/api/seasonData";
import type { LeagueCode } from "@/data/leagues";
import { TABLE_PLACES } from "@/data/tablePlaces";
import { EARLIEST_SEASON } from "@/hooks/useSelection";
import type { ClubSeasons, Standing } from "@/types/api";
import { getClubForm, type FormResult } from "@/utils/form";

export type ClubTag = "Champions" | "Relegated" | "Promoted";

export type DirectoryClub = {
  club: Standing;
  seasonsInLeague: number;
  form: FormResult[];
  tag: ClubTag | null;
};

export type ClubDirectory = {
  clubs: DirectoryClub[];
  promoted: number | null; // Null for the first season, which has no season before it
  relegated: number;
};

const ORDINALS = new Intl.PluralRules("en-GB", { type: "ordinal" });
const ORDINAL_ENDINGS: Record<string, string> = {
  one: "st",
  two: "nd",
  few: "rd",
  other: "th",
};

// 1 -> "1st", 22 -> "22nd"
export function ordinal(position: number) {
  return `${position}${ORDINAL_ENDINGS[ORDINALS.select(position)]}`;
}

// Each club in a league-season with its seasons, form and tag, and the banner's counts
export function getClubDirectory(
  { standings: { standings, championClubId }, matches }: SeasonData,
  clubSeasons: ClubSeasons[],
  league: LeagueCode,
  season: number,
): ClubDirectory {
  const form = getClubForm(matches);
  const relegationPlaces =
    TABLE_PLACES[`${league}-${season}`]?.relegation ?? [];
  const seasonsByClub = new Map(
    clubSeasons.map(({ clubId, startYears }) => [clubId, startYears]),
  );
  const isFirstSeason = season === EARLIEST_SEASON;

  // Promoted means not in the league the season before
  const isPromoted = (clubId: number) =>
    !isFirstSeason && !seasonsByClub.get(clubId)?.includes(season - 1);
  const isRelegated = ({ position }: Standing) =>
    position !== null && relegationPlaces.includes(position);

  // A club can be both promoted and relegated: Relegated wins
  const getTag = (club: Standing): ClubTag | null => {
    if (club.clubId === championClubId) return "Champions";
    if (isRelegated(club)) return "Relegated";
    return isPromoted(club.clubId) ? "Promoted" : null;
  };

  return {
    clubs: standings.map((club) => ({
      club,
      seasonsInLeague: seasonsByClub.get(club.clubId)?.length ?? 0,
      form: form[club.clubId] ?? [],
      tag: getTag(club),
    })),
    promoted: isFirstSeason
      ? null
      : standings.filter(({ clubId }) => isPromoted(clubId)).length,
    relegated: standings.filter(isRelegated).length,
  };
}
