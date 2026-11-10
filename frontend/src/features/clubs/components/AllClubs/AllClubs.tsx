import { useState } from "react";
import SearchBox from "@/components/ui/SearchBox/SearchBox";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { LeagueCode } from "@/data/leagues";
import { getTableName } from "@/data/tableNames";
import ClubCard from "@/features/clubs/components/ClubCard/ClubCard";
import { useClubDirectory } from "@/features/clubs/hooks/useClubDirectory";
import { useIsPhone } from "@/features/clubs/hooks/useIsPhone";
import { clubPath } from "@/features/clubs/utils/clubPage";
import { searchable } from "@/utils/search";
import "./AllClubs.scss";

// Props for the AllClubs component: the selected league and season start year (2025 = 2025/26)
type AllClubsProps = {
  league: LeagueCode;
  season: number;
};

// Every club in the season, A to Z by the name shown, with a search box
export default function AllClubs({ league, season }: AllClubsProps) {
  const { data, isError } = useClubDirectory(league, season);
  const isPhone = useIsPhone();
  const [search, setSearch] = useState("");

  const query = searchable(search);
  const clubs = (data?.clubs ?? [])
    .map((row) => ({
      row,
      // Table names on phones, where two cards share the width
      name: isPhone
        ? getTableName(row.club.clubId, row.club.displayName)
        : row.club.displayName,
    }))
    .filter(({ row: { club } }) =>
      [
        club.displayName,
        club.shortName,
        getTableName(club.clubId, club.displayName),
      ].some((name) => searchable(name).includes(query)),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));

  return (
    <section className="all-clubs" aria-busy={!data && !isError}>
      <div className="all-clubs__header">
        <SectionHeader
          title="All clubs"
          description="A to Z, with each club's finish, points and last 5 results."
        />
        <SearchBox label="Search clubs" value={search} onChange={setSearch} />
      </div>

      {data ? (
        clubs.length > 0 ? (
          <ul className="all-clubs__grid">
            {clubs.map(({ row, name }) => (
              <li key={row.club.clubId}>
                <ClubCard
                  {...row}
                  name={name}
                  to={clubPath(league, row.club, season)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="all-clubs__status" role="status">
            No clubs match.
          </p>
        )
      ) : (
        <p className="all-clubs__status" role={isError ? "alert" : "status"}>
          {isError ? "Couldn't load the clubs." : "Loading…"}
        </p>
      )}
    </section>
  );
}
