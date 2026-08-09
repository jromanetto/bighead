jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import { isWithinGracePeriod, GRACE_DAYS } from "../dailyLimits";

const DAY = 24 * 60 * 60 * 1000;

describe("isWithinGracePeriod", () => {
  const firstSeen = 1_000_000_000_000; // ancre arbitraire

  it("is true right at install", () => {
    expect(isWithinGracePeriod(firstSeen, firstSeen)).toBe(true);
  });

  it("is true within the grace window", () => {
    expect(isWithinGracePeriod(firstSeen, firstSeen + (GRACE_DAYS - 1) * DAY)).toBe(true);
    expect(isWithinGracePeriod(firstSeen, firstSeen + 3 * DAY)).toBe(true);
  });

  it("is false once the grace window has elapsed", () => {
    expect(isWithinGracePeriod(firstSeen, firstSeen + GRACE_DAYS * DAY)).toBe(false);
    expect(isWithinGracePeriod(firstSeen, firstSeen + (GRACE_DAYS + 1) * DAY)).toBe(false);
  });

  it("respects a custom grace length", () => {
    expect(isWithinGracePeriod(firstSeen, firstSeen + 2 * DAY, 3)).toBe(true);
    expect(isWithinGracePeriod(firstSeen, firstSeen + 3 * DAY, 3)).toBe(false);
  });
});
