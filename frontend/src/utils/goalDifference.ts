// "+44", "0", "-12"
export function formatGoalDifference({
  goalsFor,
  goalsAgainst,
}: {
  goalsFor: number;
  goalsAgainst: number;
}) {
  const difference = goalsFor - goalsAgainst;
  return difference > 0 ? `+${difference}` : String(difference);
}
