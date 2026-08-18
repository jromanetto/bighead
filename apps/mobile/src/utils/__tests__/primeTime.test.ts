import {
  getPrimeTimeWindow,
  isPrimeTimeLive,
  msUntilNextPrimeTime,
  percentile,
  percentileLabel,
  formatParticipants,
  primeTimeLabel,
  PRIME_TIME_DURATION_MIN,
} from "../primeTime";

// Construit une Date locale à une heure:minute donnée (jour fixe, déterministe).
const at = (h: number, m = 0) => new Date(2026, 7, 18, h, m, 0, 0);

describe("prime time window", () => {
  it("window is 19:00 → 19:15 local", () => {
    const { start, end } = getPrimeTimeWindow(at(12));
    expect(start.getHours()).toBe(19);
    expect(start.getMinutes()).toBe(0);
    expect((end.getTime() - start.getTime()) / 60000).toBe(PRIME_TIME_DURATION_MIN);
  });

  it("is live during the window, not outside", () => {
    expect(isPrimeTimeLive(at(19, 5))).toBe(true);
    expect(isPrimeTimeLive(at(18, 59))).toBe(false);
    expect(isPrimeTimeLive(at(19, 15))).toBe(false); // borne exclusive
    expect(isPrimeTimeLive(at(19, 16))).toBe(false);
  });

  it("counts down to today's start when before", () => {
    expect(msUntilNextPrimeTime(at(18, 0))).toBe(60 * 60000); // 1h
  });

  it("returns 0 when live", () => {
    expect(msUntilNextPrimeTime(at(19, 3))).toBe(0);
  });

  it("rolls to tomorrow when already passed", () => {
    const ms = msUntilNextPrimeTime(at(20, 0));
    expect(ms).toBeGreaterThan(22 * 3600_000); // ~23h
    expect(ms).toBeLessThan(24 * 3600_000);
  });

  it("label is 19:00", () => {
    expect(primeTimeLabel()).toBe("19:00");
  });
});

describe("percentile", () => {
  it("beats everyone below your score", () => {
    // score 8, distribution [1..10] → 7 strictly below → 70%
    const dist = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile(8, dist)).toBe(70);
  });

  it("empty distribution => 0 (no data yet)", () => {
    expect(percentile(5, [])).toBe(0);
  });

  it("top score beats almost everyone", () => {
    expect(percentile(100, [10, 20, 30])).toBe(100);
  });

  it("label is localized", () => {
    expect(percentileLabel(8, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "fr")).toBe("Tu bats 70% des joueurs");
    expect(percentileLabel(8, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "en")).toBe("You beat 70% of players");
  });
});

describe("formatParticipants", () => {
  it("groups thousands, localized", () => {
    expect(formatParticipants(12458, "fr")).toBe("12 458 joueurs");
    expect(formatParticipants(12458, "en")).toBe("12,458 players");
  });

  it("handles singular / zero", () => {
    expect(formatParticipants(1, "fr")).toBe("1 joueur");
    expect(formatParticipants(1, "en")).toBe("1 player");
    expect(formatParticipants(0, "fr")).toBe("0 joueur");
  });
});
