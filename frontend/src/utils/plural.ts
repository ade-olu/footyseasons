// "point" or "points" for a count; most words just add an s
export function plural(count: number, word: string, many = `${word}s`) {
  return count === 1 ? word : many;
}

// "1 point", "7 points"
export function countLabel(count: number, word: string, many?: string) {
  return `${count} ${plural(count, word, many)}`;
}
