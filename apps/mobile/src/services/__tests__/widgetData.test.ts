jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import { buildWidgetPayload } from "../widgetData";

describe("buildWidgetPayload", () => {
  const day = "2026-08-18";

  it("shows ✅ when the daily is done", () => {
    const p = buildWidgetPayload({ streak: 12, dailyDone: true, hour: 20 }, day);
    expect(p.flame).toBe("✅");
    expect(p.atRisk).toBe(false);
  });

  it("flags at-risk in the evening when not done and a streak exists", () => {
    const p = buildWidgetPayload({ streak: 12, dailyDone: false, hour: 19 }, day);
    expect(p.atRisk).toBe(true);
    expect(p.flame).toBe("⚠️🔥");
  });

  it("is NOT at risk earlier in the day", () => {
    const p = buildWidgetPayload({ streak: 12, dailyDone: false, hour: 10 }, day);
    expect(p.atRisk).toBe(false);
    expect(p.flame).toBe("🔥");
  });

  it("shows the brain when there is no streak yet", () => {
    const p = buildWidgetPayload({ streak: 0, dailyDone: false, hour: 21 }, day);
    expect(p.flame).toBe("🧠");
    expect(p.atRisk).toBe(false);
  });

  it("clamps a negative streak and records the day", () => {
    const p = buildWidgetPayload({ streak: -5, dailyDone: false, hour: 8 }, day);
    expect(p.streak).toBe(0);
    expect(p.updatedAtDay).toBe(day);
  });
});
