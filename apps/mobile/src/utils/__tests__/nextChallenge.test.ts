import { daysUntilNextChallenge, nextChallengeLabel } from "../nextChallenge";

describe("next weekly challenge countdown", () => {
  // Le défi themed couvre start..end ; le suivant démarre à end + 1 (minuit UTC).
  it("counts days from now to the day after end_date", () => {
    expect(daysUntilNextChallenge("2026-09-26", new Date("2026-09-26T10:00:00Z"))).toBe(1);
    expect(daysUntilNextChallenge("2026-09-26", new Date("2026-09-25T10:00:00Z"))).toBe(2);
  });

  it("never returns less than 1 (challenge already over / clock skew)", () => {
    expect(daysUntilNextChallenge("2026-09-20", new Date("2026-09-26T10:00:00Z"))).toBe(1);
  });

  it("returns null on an invalid date", () => {
    expect(daysUntilNextChallenge("nope", new Date())).toBeNull();
  });

  it("says 'tomorrow' for 1 day, a count otherwise", () => {
    expect(nextChallengeLabel(1, "fr")).toBe("demain");
    expect(nextChallengeLabel(1, "en")).toBe("tomorrow");
    expect(nextChallengeLabel(2, "fr")).toBe("dans 2 jours");
    expect(nextChallengeLabel(2, "en")).toBe("in 2 days");
  });

  it("falls back to a generic wording without a count", () => {
    expect(nextChallengeLabel(null, "fr")).toBe("bientôt");
    expect(nextChallengeLabel(null, "en")).toBe("soon");
  });
});
