import {
  shuffle,
  pickDistractors,
  buildGeoQuestion,
  buildGeoQuiz,
} from "../geographyQuiz";
import { COUNTRIES, countriesByContinent, countryName, capitalName } from "../../data/geography";

// Deterministic RNG (always 0) -> shuffle keeps order, picks are stable.
const rng0 = () => 0;

const europe = countriesByContinent("europe");
const france = europe.find((c) => c.code === "fr")!;

describe("dataset integrity", () => {
  it("has unique country codes", () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("gives every continent enough countries for a 4-option quiz", () => {
    (["europe", "africa", "asia", "americas", "oceania"] as const).forEach((id) => {
      expect(countriesByContinent(id).length).toBeGreaterThanOrEqual(4);
    });
  });
});

describe("shuffle", () => {
  it("preserves elements", () => {
    const out = shuffle([1, 2, 3, 4, 5], rng0);
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("pickDistractors", () => {
  it("excludes the correct country and returns n items", () => {
    const d = pickDistractors(france, europe, 3, rng0);
    expect(d).toHaveLength(3);
    expect(d.some((c) => c.code === "fr")).toBe(false);
  });
});

describe("buildGeoQuestion", () => {
  it("flags mode: prompt is a flag code, correct answer is the country name", () => {
    const q = buildGeoQuestion("flags", france, europe, "fr", rng0);
    expect(q.flagCode).toBe("fr");
    expect(q.answers).toHaveLength(4);
    expect(q.answers[q.correctIndex]).toBe(countryName(france, "fr"));
    expect(new Set(q.answers).size).toBe(q.answers.length); // no dup options
  });

  it("capitals mode: prompt is the country, correct answer is its capital", () => {
    const q = buildGeoQuestion("capitals", france, europe, "en", rng0);
    expect(q.promptText).toBe(countryName(france, "en"));
    expect(q.answers[q.correctIndex]).toBe(capitalName(france, "en"));
    expect(q.answers).toContain("Paris");
  });

  it("correctIndex always points at the right answer", () => {
    europe.slice(0, 6).forEach((c) => {
      const q = buildGeoQuestion("flags", c, europe, "fr", Math.random);
      expect(q.answers[q.correctIndex]).toBe(countryName(c, "fr"));
    });
  });
});

describe("buildGeoQuiz", () => {
  it("builds the requested number of questions", () => {
    const quiz = buildGeoQuiz("capitals", europe, "fr", 10, Math.random);
    expect(quiz).toHaveLength(10);
    quiz.forEach((q) => {
      expect(q.answers).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    });
  });

  it("clamps count to the pool size", () => {
    const small = europe.slice(0, 5);
    expect(buildGeoQuiz("flags", small, "fr", 10, Math.random)).toHaveLength(5);
  });
});
