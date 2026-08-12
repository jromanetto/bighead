import { masteryLevel, overallMastery, masteryEmoji } from "../mastery";

describe("masteryLevel", () => {
  it("is 'none' below the bronze volume gate", () => {
    expect(masteryLevel(3, 3).tier).toBe("none");
    expect(masteryLevel(0, 0).tier).toBe("none");
  });

  it("awards bronze on enough volume regardless of accuracy", () => {
    expect(masteryLevel(1, 5).tier).toBe("bronze");
  });

  it("requires accuracy AND volume for silver/gold/platinum", () => {
    expect(masteryLevel(10, 12).tier).toBe("silver"); // 83% over 12
    expect(masteryLevel(8, 12).tier).toBe("silver"); // 66% over 12
    expect(masteryLevel(7, 12).tier).toBe("bronze"); // 58% -> not silver
    expect(masteryLevel(22, 25).tier).toBe("gold"); // 88% over 25
    expect(masteryLevel(47, 50).tier).toBe("platinum"); // 94% over 50
  });

  it("high accuracy but low volume can't reach platinum", () => {
    expect(masteryLevel(10, 10).tier).toBe("bronze"); // 100% but only 10 played
  });

  it("exposes a 0..4 index", () => {
    expect(masteryLevel(47, 50).index).toBe(4);
    expect(masteryLevel(3, 3).index).toBe(0);
  });
});

describe("overallMastery", () => {
  it("is 0 for an empty list", () => {
    expect(overallMastery([])).toBe(0);
  });
  it("averages tier progress", () => {
    const platinum = masteryLevel(50, 50); // index 4 -> 1.0
    const none = masteryLevel(0, 0); // index 0 -> 0
    expect(overallMastery([platinum, none])).toBeCloseTo(0.5, 5);
  });
});

describe("masteryEmoji", () => {
  it("maps tiers to medals", () => {
    expect(masteryEmoji("platinum")).toBe("💎");
    expect(masteryEmoji("none")).toBe("▫️");
  });
});
