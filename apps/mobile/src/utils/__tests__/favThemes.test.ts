jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import { themeLabel, primaryFavTheme, THEME_OPTIONS } from "../favThemes";

describe("theme options integrity", () => {
  it("every option has id + fr + en + emoji", () => {
    for (const o of THEME_OPTIONS) {
      expect(o.id && o.fr && o.en && o.emoji).toBeTruthy();
    }
  });
  it("ids are unique", () => {
    const ids = THEME_OPTIONS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("themeLabel", () => {
  it("returns localized label", () => {
    expect(themeLabel("histoire", "fr")).toBe("Histoire");
    expect(themeLabel("histoire", "en")).toBe("History");
  });
  it("falls back to the id for unknown", () => {
    expect(themeLabel("nope", "fr")).toBe("nope");
  });
});

describe("primaryFavTheme", () => {
  it("returns the first known selected theme with labels", () => {
    expect(primaryFavTheme(["cinema", "sport"])).toEqual({ id: "cinema", fr: "Cinéma", en: "Movies" });
  });
  it("skips unknown ids", () => {
    expect(primaryFavTheme(["zzz", "sport"])?.id).toBe("sport");
  });
  it("returns null when empty / all unknown", () => {
    expect(primaryFavTheme([])).toBeNull();
    expect(primaryFavTheme(["zzz"])).toBeNull();
  });
});
