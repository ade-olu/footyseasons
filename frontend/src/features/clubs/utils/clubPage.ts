import type { LeagueCode } from "@/data/leagues";
import { leaguePath } from "@/hooks/useSelection";

// "Brighton & Hove Albion" -> "brighton-hove-albion", "Atlético" -> "atletico"
export function clubSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // Accents, split off by NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// A club's page, e.g. "/premier-league/clubs/57/arsenal?season=2025-2026"
export function clubPath(
  league: LeagueCode,
  { clubId, displayName }: { clubId: number; displayName: string },
  season: number,
) {
  return leaguePath(
    league,
    `/clubs/${clubId}/${clubSlug(displayName)}`,
    season,
  );
}
