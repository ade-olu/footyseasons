// A season's short label from its start year: 2025 -> "2025/26"
export function seasonLabel(startYear: number) {
  return `${startYear}/${String(startYear + 1).slice(-2)}`;
}
