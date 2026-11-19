// "Sunday 24 May 2026" from a UTC date (en-GB puts a comma after the weekday)
const dayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDay(date: string): string {
  return dayFormat.format(new Date(date)).replace(",", "");
}
