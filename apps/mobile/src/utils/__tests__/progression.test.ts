import {
  getLevelRank,
  getLevelTitle,
  isStreakMilestone,
  nextStreakMilestone,
} from "../progression";

describe("getLevelRank / getLevelTitle", () => {
  it("maps low levels to Novice", () => {
    expect(getLevelTitle(1)).toBe("Novice");
    expect(getLevelTitle(2)).toBe("Novice");
  });

  it("moves up rank at each threshold", () => {
    expect(getLevelTitle(3)).toBe("Curieux");
    expect(getLevelTitle(5)).toBe("Connaisseur");
    expect(getLevelTitle(10)).toBe("Érudit");
    expect(getLevelTitle(20)).toBe("Expert");
    expect(getLevelTitle(50)).toBe("Sage");
  });

  it("caps at Légende for very high levels", () => {
    expect(getLevelTitle(100)).toBe("Légende");
    expect(getLevelTitle(250)).toBe("Légende");
  });

  it("returns English titles when asked", () => {
    expect(getLevelTitle(1, "en")).toBe("Novice");
    expect(getLevelTitle(20, "en")).toBe("Expert");
    expect(getLevelTitle(100, "en")).toBe("Legend");
  });

  it("never returns below the first rank for level 0/edge", () => {
    expect(getLevelRank(0).fr).toBe("Novice");
  });
});

describe("streak milestones", () => {
  it("detects exact milestones", () => {
    [3, 7, 14, 30, 60, 100].forEach((m) => expect(isStreakMilestone(m)).toBe(true));
  });

  it("rejects non-milestones", () => {
    [0, 1, 2, 4, 8, 29, 99, 101].forEach((n) => expect(isStreakMilestone(n)).toBe(false));
  });

  it("computes the next milestone to chase", () => {
    expect(nextStreakMilestone(0)).toBe(3);
    expect(nextStreakMilestone(3)).toBe(7);
    expect(nextStreakMilestone(30)).toBe(60);
    expect(nextStreakMilestone(100)).toBeNull();
  });
});
