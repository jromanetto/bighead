import { shuffle } from "../shuffle";

describe("shuffle (Fisher-Yates)", () => {
  it("preserves all elements (is a permutation)", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(input);
    expect(out).toHaveLength(input.length);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
  });

  it("does not mutate the input", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it("is deterministic with a fixed rng", () => {
    const rng = () => 0; // always swap with index 0
    expect(shuffle([1, 2, 3, 4], rng)).toEqual(shuffle([1, 2, 3, 4], rng));
  });

  it("is approximately uniform (no strong position bias)", () => {
    // With a fair shuffle, element 0 should land in each of 4 positions
    // roughly 1/4 of the time. The biased sort() idiom fails this.
    const N = 8000;
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < N; i++) {
      const pos = shuffle([0, 1, 2, 3]).indexOf(0);
      counts[pos]++;
    }
    const expected = N / 4;
    counts.forEach((c) => {
      // within 15% of expected — loose but catches gross bias
      expect(Math.abs(c - expected) / expected).toBeLessThan(0.15);
    });
  });
});
