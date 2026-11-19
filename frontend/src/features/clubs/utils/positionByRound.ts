import type { Match, PlayedMatch, Standing } from "@/types/api";
import { isPlayed } from "@/utils/match";

// A club's place in the table after one round
export type RoundPosition = {
  round: number;
  position: number;
  points: number;
  match: PlayedMatch | undefined; // The club's match in that round, if played
};

type Tally = { points: number; goalDifference: number; goalsFor: number };

// Adds one match to both clubs' tallies
function addMatch(tallies: Map<number, Tally>, match: PlayedMatch) {
  const sides = [
    [match.homeClubId, match.homeGoals, match.awayGoals],
    [match.awayClubId, match.awayGoals, match.homeGoals],
  ];
  for (const [clubId, scored, conceded] of sides) {
    const tally = tallies.get(clubId);
    if (!tally) continue;
    tally.points += scored > conceded ? 3 : scored === conceded ? 1 : 0;
    tally.goalDifference += scored - conceded;
    tally.goalsFor += scored;
  }
}

// The club's position after every round played. A rescheduled match counts in
// its original round; the last round uses the official table, and point
// deductions apply from the start
export function getPositionByRound(
  matches: Match[],
  standings: Standing[],
  clubId: number,
): RoundPosition[] {
  const played = matches.filter(isPlayed);
  const lastRound = Math.max(0, ...played.map(({ matchday }) => matchday));
  const fresh = () =>
    new Map(
      standings.map((club) => [
        club.clubId,
        { points: 0, goalDifference: 0, goalsFor: 0 },
      ]),
    );

  // Deductions: the official points minus those the results give
  const totals = fresh();
  played.forEach((match) => addMatch(totals, match));
  const deductions = new Map(
    standings.map((club) => [
      club.clubId,
      club.points - (totals.get(club.clubId)?.points ?? 0),
    ]),
  );

  // Clubs level on points, goal difference and goals keep their final order
  const finalOrder = new Map(
    standings.map((club, index) => [club.clubId, club.position ?? index + 1]),
  );

  const official = standings.find((club) => club.clubId === clubId)?.position;
  const tallies = fresh();
  const rounds: RoundPosition[] = [];

  for (let round = 1; round <= lastRound; round++) {
    const roundMatches = played.filter(({ matchday }) => matchday === round);
    roundMatches.forEach((match) => addMatch(tallies, match));

    const points = (id: number) =>
      (tallies.get(id)?.points ?? 0) + (deductions.get(id) ?? 0);
    const order = [...tallies.keys()].sort(
      (a, b) =>
        points(b) - points(a) ||
        tallies.get(b)!.goalDifference - tallies.get(a)!.goalDifference ||
        tallies.get(b)!.goalsFor - tallies.get(a)!.goalsFor ||
        finalOrder.get(a)! - finalOrder.get(b)!,
    );

    rounds.push({
      round,
      position:
        round === lastRound && official ? official : order.indexOf(clubId) + 1,
      points: points(clubId),
      match: roundMatches.find(
        ({ homeClubId, awayClubId }) =>
          homeClubId === clubId || awayClubId === clubId,
      ),
    });
  }
  return rounds;
}
