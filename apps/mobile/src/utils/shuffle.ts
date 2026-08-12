/**
 * Uniform Fisher-Yates shuffle.
 *
 * Replaces the biased `arr.sort(() => Math.random() - 0.5)` idiom that was used
 * across the quiz code: that comparator is NOT a uniform shuffle (some
 * permutations are far more likely, and answer positions end up skewed — a
 * quiz player can subconsciously exploit where the correct answer tends to
 * land). This returns a NEW array; the input is not mutated.
 *
 * `rng` is injectable so callers/tests can be deterministic (default Math.random).
 */
export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
