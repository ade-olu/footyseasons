// api/params.js
// Reads and checks request parameters, sending a 400 when one is malformed.

// The optional ?season= start year (2025 = 2025/26).
// Returns null when it's missing, or undefined after sending a 400.
function parseSeason(req, res) {
  const { season } = req.query;

  if (season === undefined) return null;

  if (!/^\d{4}$/.test(season)) {
    res
      .status(400)
      .json({ error: `season must be a start year like 2025, got "${season}"` });
    return undefined;
  }

  return Number(season);
}

// A whole number of at least min (club ids can be negative).
// Returns undefined after sending a 400.
function parseInteger(value, name, res, min = -Infinity) {
  if (!/^-?\d+$/.test(value) || Number(value) < min) {
    res.status(400).json({
      error:
        min === -Infinity
          ? `${name} must be a whole number, got "${value}"`
          : `${name} must be a whole number of at least ${min}, got "${value}"`,
    });
    return undefined;
  }

  return Number(value);
}

module.exports = { parseSeason, parseInteger };
