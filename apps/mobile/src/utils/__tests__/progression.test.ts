import {
  getLevelRank,
  getLevelTitle,
  isStreakMilestone,
  nextStreakMilestone,
  getXPForLevel,
  calculateLevel,
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

describe("level curve (single source of truth)", () => {
  it("level 1 costs the base 100 XP", () => {
    expect(getXPForLevel(1)).toBe(100);
  });

  it("grows exponentially (×1.5 per level)", () => {
    expect(getXPForLevel(2)).toBe(150);
    expect(getXPForLevel(3)).toBe(225);
  });

  it("guards against level < 1", () => {
    expect(getXPForLevel(0)).toBe(100);
    expect(getXPForLevel(-3)).toBe(100);
  });

  it("0 XP => level 1, no progress", () => {
    const l = calculateLevel(0);
    expect(l.level).toBe(1);
    expect(l.currentXP).toBe(0);
    expect(l.progress).toBe(0);
  });

  it("just under a level threshold stays on that level", () => {
    // level 1 needs 100; 99 XP => still level 1 at 99/100
    const l = calculateLevel(99);
    expect(l.level).toBe(1);
    expect(l.currentXP).toBe(99);
    expect(Math.round(l.progress)).toBe(99);
  });

  it("crossing the threshold advances the level", () => {
    // 100 (lvl1) + 0 => level 2 exactly
    expect(calculateLevel(100).level).toBe(2);
    // 100 (lvl1) + 150 (lvl2) = 250 => level 3
    expect(calculateLevel(250).level).toBe(3);
  });

  it("handles null/negative/garbage XP safely", () => {
    expect(calculateLevel(-50).level).toBe(1);
    // @ts-expect-error runtime guard
    expect(calculateLevel(undefined).level).toBe(1);
  });

  it("progress stays within 0..100", () => {
    for (const xp of [0, 1, 99, 100, 251, 5000, 999999]) {
      const p = calculateLevel(xp).progress;
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(100);
    }
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
