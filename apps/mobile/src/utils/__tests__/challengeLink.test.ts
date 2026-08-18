import {
  normalizeChallengeCode,
  buildChallengeDeepLink,
  buildChallengeWebLink,
  buildChallengeShareText,
} from "../challengeLink";

describe("normalizeChallengeCode", () => {
  it("uppercases, strips non-alphanumerics, caps at 6", () => {
    expect(normalizeChallengeCode("ab-12cd")).toBe("AB12CD");
    expect(normalizeChallengeCode("abcdefghij")).toBe("ABCDEF");
    expect(normalizeChallengeCode(" a b c 1 2 3 ")).toBe("ABC123");
  });
  it("handles empty", () => {
    // @ts-expect-error runtime guard
    expect(normalizeChallengeCode(undefined)).toBe("");
  });
});

describe("challenge links", () => {
  it("builds a native deep link", () => {
    expect(buildChallengeDeepLink("ab12cd")).toBe("bighead://challenge/AB12CD");
  });
  it("builds a web fallback link", () => {
    expect(buildChallengeWebLink("ab12cd")).toBe("https://bighead.jrmanagement.org/c/AB12CD");
  });
});

describe("buildChallengeShareText", () => {
  it("includes the normalized code and web link, localized", () => {
    const fr = buildChallengeShareText("ab12cd", "fr");
    expect(fr).toContain("AB12CD");
    expect(fr).toContain("https://bighead.jrmanagement.org/c/AB12CD");
    expect(fr).toContain("défie");

    const en = buildChallengeShareText("ab12cd", "en");
    expect(en).toContain("challenge");
    expect(en).toContain("AB12CD");
  });

  it("never leaks undefined", () => {
    expect(buildChallengeShareText("x", "fr")).not.toContain("undefined");
  });
});
