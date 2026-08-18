import { mutualStreak, isMutualStreakAtRisk, dayKey } from "../friendStreak";

const D = (s: string) => `${s}T10:00:00.000Z`;

describe("mutualStreak", () => {
  it("counts consecutive days both played, ending today", () => {
    const a = [D("2026-08-16"), D("2026-08-17"), D("2026-08-18")];
    const b = [D("2026-08-16"), D("2026-08-17"), D("2026-08-18")];
    expect(mutualStreak(a, b, D("2026-08-18"))).toBe(3);
  });

  it("tolerates 'not yet played today' — falls back to yesterday", () => {
    const a = [D("2026-08-16"), D("2026-08-17")];
    const b = [D("2026-08-16"), D("2026-08-17")];
    // today = 18, neither played today yet → streak from yesterday = 2
    expect(mutualStreak(a, b, D("2026-08-18"))).toBe(2);
  });

  it("breaks when only one played a day", () => {
    const a = [D("2026-08-16"), D("2026-08-17"), D("2026-08-18")];
    const b = [D("2026-08-17"), D("2026-08-18")]; // missed the 16th
    expect(mutualStreak(a, b, D("2026-08-18"))).toBe(2);
  });

  it("returns 0 when they don't overlap recently", () => {
    const a = [D("2026-08-10")];
    const b = [D("2026-08-18")];
    expect(mutualStreak(a, b, D("2026-08-18"))).toBe(0);
  });

  it("handles empty inputs", () => {
    expect(mutualStreak([], [], D("2026-08-18"))).toBe(0);
  });
});

describe("isMutualStreakAtRisk", () => {
  it("is at risk when both played yesterday but not today", () => {
    const a = [D("2026-08-17")];
    const b = [D("2026-08-17")];
    expect(isMutualStreakAtRisk(a, b, D("2026-08-18"))).toBe(true);
  });

  it("is not at risk once both played today", () => {
    const a = [D("2026-08-17"), D("2026-08-18")];
    const b = [D("2026-08-17"), D("2026-08-18")];
    expect(isMutualStreakAtRisk(a, b, D("2026-08-18"))).toBe(false);
  });
});

describe("dayKey", () => {
  it("normalizes to YYYY-MM-DD", () => {
    expect(dayKey(D("2026-08-18"))).toBe("2026-08-18");
  });
  it("returns empty for garbage", () => {
    expect(dayKey("not-a-date")).toBe("");
  });
});
