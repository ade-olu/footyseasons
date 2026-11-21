// api/mostUsedXI.js
// Picks a club-season's most-used formation and the XI that fills it.

// How deep each position plays, to split the XI into lines
const DEPTH = {
  GK: 0,
  SW: 1,
  CB: 2,
  LB: 2.5,
  RB: 2.5,
  DM: 3,
  CM: 4,
  LM: 4.5,
  RM: 4.5,
  AM: 5,
  LW: 6,
  RW: 6,
  SS: 7,
  CF: 8,
};

// Left to right within a line
const SIDE = { LB: 0, LM: 0, LW: 0, RB: 2, RM: 2, RW: 2 };

const byMostStarts = (a, b) => b.starts - a.starts;

function pickMostUsedXI(shapes, starts) {
  if (shapes.length === 0) return null;

  // "4-3-3 Attacking" counts as 4-3-3
  const formations = new Map();
  for (const shape of shapes) {
    const formation = shape.formation.split(" ")[0];
    formations.set(formation, (formations.get(formation) ?? 0) + shape.starts);
  }
  const [formation, formationStarts] = [...formations].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0];

  const shape = shapes
    .filter((s) => s.formation.split(" ")[0] === formation)
    .sort(byMostStarts)[0];
  const positions = shape.positions
    .split(",")
    .sort((a, b) => DEPTH[a] - DEPTH[b]);

  // Highest counts first, with no player twice
  const slots = positions.map((position) => ({ position, player: null }));
  const used = new Set();
  for (const row of [...starts].sort(byMostStarts)) {
    if (used.has(row.playerId)) continue;
    const slot = slots.find((s) => s.position === row.position && !s.player);
    if (!slot) continue;
    slot.player = { playerId: row.playerId, starts: row.starts };
    used.add(row.playerId);
  }

  // Goalkeeper first, then the formation's lines
  const sizes = [1, ...formation.split("-").map(Number)];
  const lines = [];
  let index = 0;
  for (const [i, size] of sizes.entries()) {
    const end = i === sizes.length - 1 ? slots.length : index + size;
    lines.push(slots.slice(index, end));
    index = end;
  }

  // An empty slot goes to the next starter in that line
  for (const line of lines) {
    const linePositions = new Set(line.map((slot) => slot.position));
    for (const slot of line.filter((s) => !s.player)) {
      const row = [...starts]
        .sort(byMostStarts)
        .find((r) => linePositions.has(r.position) && !used.has(r.playerId));
      if (!row) continue;
      slot.player = { playerId: row.playerId, starts: row.starts };
      used.add(row.playerId);
    }
  }

  // Centre positions have no side, so they stay in order of starts
  for (const line of lines) {
    line.sort(
      (a, b) =>
        (SIDE[a.position] ?? 1) - (SIDE[b.position] ?? 1) ||
        (b.player?.starts ?? 0) - (a.player?.starts ?? 0),
    );
  }

  return { formation, formationStarts, lines };
}

module.exports = { pickMostUsedXI };
