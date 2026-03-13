/**
 * Normalize a player's riddle answer for comparison.
 * - Lowercase
 * - Trim whitespace
 * - Strip leading articles (a, an, the)
 * - Strip trailing punctuation
 */
export function normalize(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/^(the|an|a)\s+/, "")
    .replace(/[^a-z0-9\s-]+$/, "");
}
