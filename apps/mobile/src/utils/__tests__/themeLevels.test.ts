import { themeProgress, rankThemes, signatureTheme } from "../themeLevels";

describe("themeProgress", () => {
  it("uses the shared level curve per theme", () => {
    const p = themeProgress("histoire", 250, "fr");
    expect(p.theme).toBe("histoire");
    expect(p.level).toBe(3); // 100 + 150 = 250 => level 3 (même courbe que le global)
    expect(typeof p.title).toBe("string");
  });

  it("localizes the rank title", () => {
    expect(themeProgress("x", 0, "en").title).toBe("Novice");
  });
});

describe("rankThemes", () => {
  it("orders themes from most to least mastered", () => {
    const ranked = rankThemes({ cinema: 300, histoire: 1200, sport: 50 });
    expect(ranked.map((r) => r.theme)).toEqual(["histoire", "cinema", "sport"]);
  });

  it("is stable/deterministic on ties (alphabetical)", () => {
    const ranked = rankThemes({ b: 100, a: 100 });
    expect(ranked.map((r) => r.theme)).toEqual(["a", "b"]);
  });

  it("handles empty input", () => {
    expect(rankThemes({})).toEqual([]);
  });
});

describe("signatureTheme", () => {
  it("returns the most-mastered theme", () => {
    expect(signatureTheme({ cinema: 300, histoire: 1200 })?.theme).toBe("histoire");
  });
  it("returns null when the player has no XP anywhere", () => {
    expect(signatureTheme({ a: 0, b: 0 })).toBeNull();
    expect(signatureTheme({})).toBeNull();
  });
});
