import { collectionByContinent, totalCaught, completedContinents } from "../geoCollectionStats";
import { COUNTRIES } from "../../data/geography";

describe("collectionByContinent", () => {
  it("counts caught per continent and ignores unknown codes", () => {
    const caught = new Set(["fr", "de", "jp", "zz" /* not a real code */]);
    const byCont = collectionByContinent(caught);
    const europe = byCont.find((c) => c.id === "europe")!;
    const asia = byCont.find((c) => c.id === "asia")!;
    expect(europe.caught).toBe(2); // fr, de
    expect(asia.caught).toBe(1); // jp
    expect(europe.total).toBe(COUNTRIES.filter((c) => c.continent === "europe").length);
  });

  it("is empty-caught for an empty set", () => {
    collectionByContinent(new Set()).forEach((c) => expect(c.caught).toBe(0));
  });
});

describe("totalCaught", () => {
  it("counts only valid dataset codes against the full total", () => {
    const caught = new Set(["fr", "us", "notacode"]);
    const { caught: n, total } = totalCaught(caught);
    expect(n).toBe(2);
    expect(total).toBe(COUNTRIES.length);
  });
});

describe("completedContinents", () => {
  it("returns none when nothing is fully caught", () => {
    expect(completedContinents(new Set(["fr", "de"]))).toEqual([]);
  });

  it("returns a continent once every one of its countries is caught", () => {
    const oceania = COUNTRIES.filter((c) => c.continent === "oceania").map((c) => c.code);
    const caught = new Set(oceania);
    expect(completedContinents(caught)).toContain("oceania");
  });

  it("all continents complete when the whole world is caught", () => {
    const all = new Set(COUNTRIES.map((c) => c.code));
    expect(completedContinents(all).sort()).toEqual(
      ["africa", "americas", "asia", "europe", "oceania"],
    );
  });
});
