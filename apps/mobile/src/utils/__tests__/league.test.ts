import { divisionOf, tierForDivision, sliceDivision, zoneForIndex } from "../league";

describe("divisionOf", () => {
  it("chunks ranks into divisions of 30", () => {
    expect(divisionOf(1, 30)).toBe(0);
    expect(divisionOf(30, 30)).toBe(0);
    expect(divisionOf(31, 30)).toBe(1);
    expect(divisionOf(61, 30)).toBe(2);
  });
});

describe("tierForDivision", () => {
  it("top division is Diamond, deeper divisions drop tier", () => {
    expect(tierForDivision(0).name).toBe("Diamond");
    expect(tierForDivision(2).name).toBe("Gold");
  });
  it("clamps to Bronze beyond the list", () => {
    expect(tierForDivision(9).name).toBe("Bronze");
  });
});

describe("sliceDivision", () => {
  it("returns the members of a division", () => {
    const all = Array.from({ length: 65 }, (_, i) => i + 1);
    expect(sliceDivision(all, 0, 30)).toHaveLength(30);
    expect(sliceDivision(all, 2, 30)).toEqual([61, 62, 63, 64, 65]);
  });
});

describe("zoneForIndex", () => {
  it("marks the top as promote and bottom as relegate in a middle division", () => {
    const opts = { isTopDivision: false, isLastDivision: false, promote: 5, relegate: 5 };
    expect(zoneForIndex(0, 30, opts)).toBe("promote");
    expect(zoneForIndex(4, 30, opts)).toBe("promote");
    expect(zoneForIndex(5, 30, opts)).toBe("safe");
    expect(zoneForIndex(25, 30, opts)).toBe("relegate");
    expect(zoneForIndex(29, 30, opts)).toBe("relegate");
  });

  it("the top division never promotes", () => {
    expect(zoneForIndex(0, 30, { isTopDivision: true, isLastDivision: false, promote: 5, relegate: 5 })).toBe("safe");
  });

  it("a single-division league never relegates", () => {
    expect(zoneForIndex(4, 5, { isTopDivision: true, isLastDivision: true })).toBe("safe");
  });

  it("scales zones for small divisions by default", () => {
    // count 10 -> promote/relegate = floor(10*0.2)=2
    expect(zoneForIndex(1, 10, { isTopDivision: false, isLastDivision: false })).toBe("promote");
    expect(zoneForIndex(2, 10, { isTopDivision: false, isLastDivision: false })).toBe("safe");
    expect(zoneForIndex(8, 10, { isTopDivision: false, isLastDivision: false })).toBe("relegate");
  });
});
