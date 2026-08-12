import { buildDailyShareText } from "../dailyShare";

describe("buildDailyShareText", () => {
  it("renders a Wordle-style grid with the score", () => {
    const txt = buildDailyShareText([true, true, false, true, true], 3, "fr");
    expect(txt).toContain("BIGHEAD Daily 🧠 4/5");
    expect(txt).toContain("🟩🟩🟥🟩🟩");
    expect(txt).toContain("🔥 3");
    expect(txt).toContain("https://bighead.jrmanagement.org");
  });

  it("omits the streak line when streak is 0", () => {
    const txt = buildDailyShareText([false, false], 0);
    expect(txt).not.toContain("🔥");
    expect(txt).toContain("🟥🟥");
    expect(txt).toContain("0/2");
  });

  it("handles a perfect run", () => {
    const txt = buildDailyShareText([true, true, true, true, true], 10);
    expect(txt).toContain("5/5");
    expect(txt).toContain("🟩🟩🟩🟩🟩");
  });
});
