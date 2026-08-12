import { countryTier, filterByDifficulty } from "../../data/geographyDifficulty";
import { COUNTRIES, countriesByContinent } from "../../data/geography";

describe("countryTier", () => {
  it("tiers well-known countries as 1", () => {
    ["fr", "us", "jp", "br", "eg"].forEach((c) => expect(countryTier(c)).toBe(1));
  });
  it("tiers moderately-known countries as 2", () => {
    ["fi", "gh", "np", "uy"].forEach((c) => expect(countryTier(c)).toBe(2));
  });
  it("tiers obscure countries as 3", () => {
    ["tv", "nr", "km", "st"].forEach((c) => expect(countryTier(c)).toBe(3));
  });
});

describe("filterByDifficulty", () => {
  it("easy keeps only tier-1 when there are enough", () => {
    const easy = filterByDifficulty(COUNTRIES, "easy");
    expect(easy.every((c) => countryTier(c.code) === 1)).toBe(true);
    expect(easy.length).toBeGreaterThanOrEqual(10);
  });

  it("medium keeps tiers 1-2", () => {
    const med = filterByDifficulty(COUNTRIES, "medium");
    expect(med.every((c) => countryTier(c.code) <= 2)).toBe(true);
    expect(med.length).toBeGreaterThan(filterByDifficulty(COUNTRIES, "easy").length);
  });

  it("hard keeps everything", () => {
    expect(filterByDifficulty(COUNTRIES, "hard").length).toBe(COUNTRIES.length);
  });

  it("falls back to full pool when a continent has too few at that difficulty", () => {
    // Oceania has very few tier-1 countries -> easy must fall back, not return 2.
    const oceania = countriesByContinent("oceania");
    const easyOceania = filterByDifficulty(oceania, "easy");
    expect(easyOceania.length).toBeGreaterThanOrEqual(4);
  });
});
