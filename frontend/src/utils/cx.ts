// Joins class names, skipping the false and empty ones:
// cx("row", isCurrent && "row--current", className)
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
