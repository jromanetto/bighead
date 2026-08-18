import { normalizeAnswer, gradeRecall, levenshtein, recallProgress } from "../recall";
import { RECALL_QUESTIONS } from "../../data/recallQuestions";

describe("recall data (real questions) grades correctly", () => {
  it("accepts every canonical label of every question", () => {
    for (const q of RECALL_QUESTIONS) {
      const pool = q.items.flatMap((it) => [it.label, ...it.accepted]);
      for (const it of q.items) {
        expect(gradeRecall(it.label, pool).correct).toBe(true);
      }
    }
  });

  it("grades 'mars' correct against the planets question (device-repro)", () => {
    const planets = RECALL_QUESTIONS.find((q) => q.id === "planets")!;
    const pool = planets.items.flatMap((it) => [it.label, ...it.accepted]);
    expect(gradeRecall("mars", pool).correct).toBe(true);
    expect(gradeRecall("Vénus", pool).correct).toBe(true);
    expect(gradeRecall("venus", pool).correct).toBe(true);
  });
});

describe("normalizeAnswer", () => {
  it("strips accents, case and leading articles", () => {
    expect(normalizeAnswer("L'Amazone")).toBe("amazone");
    expect(normalizeAnswer("Le Nil")).toBe("nil");
    expect(normalizeAnswer("HÉLÈNE")).toBe("helene");
  });

  it("collapses whitespace and punctuation", () => {
    expect(normalizeAnswer("  New   York! ")).toBe("new york");
    expect(normalizeAnswer("Jean-Jacques")).toBe("jean jacques");
  });

  it("handles empty / garbage", () => {
    expect(normalizeAnswer("")).toBe("");
    // @ts-expect-error runtime guard
    expect(normalizeAnswer(undefined)).toBe("");
  });
});

describe("levenshtein", () => {
  it("computes edit distance", () => {
    expect(levenshtein("chat", "chat")).toBe(0);
    expect(levenshtein("chat", "chien")).toBeGreaterThan(0);
    expect(levenshtein("amazone", "amazon")).toBe(1);
  });
});

describe("gradeRecall", () => {
  const accepted = ["L'Amazone", "Amazone", "Amazon River"];

  it("accepts the exact answer (accent/case/article insensitive)", () => {
    expect(gradeRecall("amazone", accepted).correct).toBe(true);
    expect(gradeRecall("L'Amazone", accepted).exact).toBe(true);
    expect(gradeRecall("AMAZONE", accepted).correct).toBe(true);
  });

  it("tolerates a single typo on long-enough words", () => {
    const r = gradeRecall("amazon", accepted); // 'amazone' - 1
    expect(r.correct).toBe(true);
    expect(r.exact).toBe(false);
  });

  it("does NOT let short different words match", () => {
    expect(gradeRecall("chat", ["chien"]).correct).toBe(false);
    expect(gradeRecall("nil", ["rin"]).correct).toBe(false);
  });

  it("rejects a clearly wrong answer", () => {
    expect(gradeRecall("le danube", accepted).correct).toBe(false);
  });

  it("rejects empty input", () => {
    expect(gradeRecall("", accepted).correct).toBe(false);
  });

  it("returns which variant matched", () => {
    expect(gradeRecall("amazon river", accepted).matched).toBe("Amazon River");
  });
});

describe("recallProgress", () => {
  it("computes X / N and pct", () => {
    expect(recallProgress(14, 27)).toEqual({ found: 14, total: 27, pct: 52 });
  });
  it("clamps found to [0,total] and guards div-by-zero", () => {
    expect(recallProgress(30, 27).found).toBe(27);
    expect(recallProgress(5, 0)).toEqual({ found: 0, total: 0, pct: 0 });
  });
});
