import {
  formatShortDuration,
  msUntilDailyReset,
  timeUntilDailyReset,
} from "../dailyReset";

describe("formatShortDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatShortDuration(90 * 60000)).toBe("1h 30m");
    expect(formatShortDuration(5 * 60 * 60000 + 12 * 60000)).toBe("5h 12m");
  });

  it("drops the hour part below 1h", () => {
    expect(formatShortDuration(5 * 60000)).toBe("5m");
    expect(formatShortDuration(0)).toBe("0m");
  });

  it("clamps negative durations to 0m", () => {
    expect(formatShortDuration(-10000)).toBe("0m");
  });
});

describe("msUntilDailyReset", () => {
  it("returns a value within (0, 24h] for any moment of the day", () => {
    const ms = msUntilDailyReset(new Date());
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(24 * 60 * 60000);
  });

  it("counts down to the next local midnight", () => {
    const at2230 = new Date(2026, 6, 20, 22, 30, 0, 0); // 20 juil 22:30 local
    expect(msUntilDailyReset(at2230)).toBe(90 * 60000); // 1h30 jusqu'à minuit
    expect(timeUntilDailyReset(at2230)).toBe("1h 30m");
  });
});
