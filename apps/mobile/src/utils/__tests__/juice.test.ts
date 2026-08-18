import { juicePlan, easeOutCubic, countUpFrames } from "../juice";

describe("juicePlan", () => {
  it("maps a correct answer to a success/pop, no celebration", () => {
    const p = juicePlan("answer_correct");
    expect(p.haptic).toBe("success");
    expect(p.animation).toBe("pop");
    expect(p.celebrate).toBe(false);
  });

  it("keeps a wrong answer GENTLE (warning, not error) — never punitive", () => {
    const p = juicePlan("answer_wrong");
    expect(p.haptic).toBe("warning");
    expect(p.animation).toBe("shake");
    expect(p.celebrate).toBe(false);
  });

  it("celebrates the real peaks (milestone / level up / unlock)", () => {
    expect(juicePlan("streak_milestone").celebrate).toBe(true);
    expect(juicePlan("level_up").celebrate).toBe(true);
    expect(juicePlan("unlock").celebrate).toBe(true);
  });

  it("uses a heavy haptic for the biggest moments", () => {
    expect(juicePlan("streak_milestone").haptic).toBe("heavy");
    expect(juicePlan("level_up").haptic).toBe("heavy");
  });
});

describe("easeOutCubic", () => {
  it("is clamped to [0,1] endpoints", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(-5)).toBe(0);
    expect(easeOutCubic(5)).toBe(1);
  });

  it("decelerates (past halfway before t=0.5)", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe("countUpFrames", () => {
  it("always lands exactly on the target", () => {
    const f = countUpFrames(40, 41, 10);
    expect(f[f.length - 1]).toBe(41);
  });

  it("is monotonic non-decreasing when counting up", () => {
    const f = countUpFrames(0, 100, 20);
    for (let i = 1; i < f.length; i++) expect(f[i]).toBeGreaterThanOrEqual(f[i - 1]);
  });

  it("returns a single frame when from === to", () => {
    expect(countUpFrames(23, 23, 20)).toEqual([23]);
  });

  it("counts down correctly too", () => {
    const f = countUpFrames(10, 5, 8);
    expect(f[f.length - 1]).toBe(5);
    expect(f[0]).toBeLessThanOrEqual(10);
  });
});
