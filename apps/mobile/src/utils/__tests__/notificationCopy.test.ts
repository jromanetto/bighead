import { buildNotificationCopy } from "../notificationCopy";

describe("Mia notification copy", () => {
  it("personalizes the daily reminder with the favorite theme", () => {
    const c = buildNotificationCopy("daily_reminder", { favoriteThemeFr: "Histoire", favoriteThemeEn: "History" }, "fr");
    expect(c.body).toContain("Histoire");
  });

  it("falls back to a generic (but Mia-voiced) daily reminder without a theme", () => {
    const c = buildNotificationCopy("daily_reminder", {}, "fr");
    expect(c.body.length).toBeGreaterThan(0);
    expect(c.body).not.toContain("undefined");
  });

  it("references the streak length in the warning", () => {
    const c = buildNotificationCopy("streak_warning", { streak: 12 }, "fr");
    expect(c.title).toContain("12");
  });

  it("is GENTLE for fragile users, punchier for engaged ones", () => {
    const fragile = buildNotificationCopy("streak_warning", { streak: 3, fragile: true }, "fr");
    const engaged = buildNotificationCopy("streak_warning", { streak: 30, fragile: false }, "fr");
    expect(fragile.title).not.toContain("Ne casse pas");
    expect(engaged.title).toContain("Ne casse pas");
  });

  it("offers to start a streak when there is none", () => {
    const c = buildNotificationCopy("streak_warning", { streak: 0 }, "en");
    expect(c.title.toLowerCase()).toContain("streak");
  });

  it("league overtake references the rank when known", () => {
    const c = buildNotificationCopy("league_overtake", { leagueRank: 3 }, "fr");
    expect(c.body).toContain("3");
  });

  it("comeback leads with the saved streak when one exists", () => {
    const c = buildNotificationCopy("comeback", { streak: 9, daysAbsent: 2 }, "fr");
    expect(c.body).toContain("9");
  });

  it("never leaks 'undefined' into any copy across kinds/langs", () => {
    const kinds = ["daily_reminder", "streak_warning", "league_overtake", "prime_time", "comeback"] as const;
    for (const lang of ["fr", "en"] as const) {
      for (const k of kinds) {
        const c = buildNotificationCopy(k, {}, lang);
        expect(`${c.title} ${c.body}`).not.toContain("undefined");
        expect(c.title.length).toBeGreaterThan(0);
        expect(c.body.length).toBeGreaterThan(0);
      }
    }
  });
});
