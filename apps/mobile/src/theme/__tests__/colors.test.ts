import { COLORS, withAlpha } from "../colors";

describe("COLORS palette integrity", () => {
  it("every color token is a valid CSS color (hex or rgba)", () => {
    for (const [key, val] of Object.entries(COLORS)) {
      const ok = /^#[0-9a-fA-F]{6}$/.test(val) || /^rgba?\(/.test(val);
      expect(`${key}:${val}:${ok}`).toBe(`${key}:${val}:true`);
    }
  });

  it("keeps the QuizNext identity anchors stable", () => {
    expect(COLORS.primary).toBe("#00c2cc"); // teal
    expect(COLORS.bg).toBe("#161a1d");
    expect(COLORS.streak).toBe("#f97316");
  });
});

describe("withAlpha", () => {
  it("converts a hex token to rgba", () => {
    expect(withAlpha("primary", 0.15)).toBe("rgba(0, 194, 204, 0.15)");
  });

  it("clamps alpha to [0,1]", () => {
    expect(withAlpha("bg", 2)).toBe("rgba(22, 26, 29, 1)");
    expect(withAlpha("bg", -1)).toBe("rgba(22, 26, 29, 0)");
  });

  it("returns non-hex tokens untouched", () => {
    expect(withAlpha("primaryDim", 0.5)).toBe(COLORS.primaryDim);
  });
});
