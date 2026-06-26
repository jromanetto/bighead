import { decideWeeklyNextStep } from "../weeklyFlow";

describe("decideWeeklyNextStep", () => {
  const TOTAL = 20;

  it("loads the first question when there is no progress", () => {
    expect(decideWeeklyNextStep(null, TOTAL)).toEqual({ kind: "question", position: 1 });
    expect(decideWeeklyNextStep(undefined, TOTAL)).toEqual({ kind: "question", position: 1 });
    expect(decideWeeklyNextStep({ current_position: 0 }, TOTAL)).toEqual({
      kind: "question",
      position: 1,
    });
  });

  it("loads the next question mid-quiz", () => {
    expect(decideWeeklyNextStep({ current_position: 5 }, TOTAL)).toEqual({
      kind: "question",
      position: 6,
    });
    // last question of the quiz
    expect(decideWeeklyNextStep({ current_position: 19 }, TOTAL)).toEqual({
      kind: "question",
      position: 20,
    });
  });

  it("goes to recap once completed_at is set", () => {
    expect(
      decideWeeklyNextStep({ current_position: 20, completed_at: "2026-06-25T10:00:00Z" }, TOTAL),
    ).toEqual({ kind: "result" });
  });

  // REGRESSION: the reported bug. Player answered all 20 questions
  // (current_position == total) but completed_at hadn't propagated yet. The old
  // code computed nextPosition = 21, fetched question 21 -> null -> "Question
  // not found" full screen. The guard must send them to the recap instead.
  it("goes to recap when the last answer is in but completed_at lags (position == total)", () => {
    expect(decideWeeklyNextStep({ current_position: TOTAL }, TOTAL)).toEqual({ kind: "result" });
  });

  // REGRESSION: cross-challenge bug. A 20q challenge could get a progress row
  // from a 30q one (position up to 30). Anything past `total` must degrade to
  // recap, never request a non-existent question.
  it("goes to recap when position overshoots total (crossed challenge)", () => {
    expect(decideWeeklyNextStep({ current_position: 30 }, TOTAL)).toEqual({ kind: "result" });
    expect(decideWeeklyNextStep({ current_position: 25 }, TOTAL)).toEqual({ kind: "result" });
  });

  it("completed_at wins even if position looks mid-quiz", () => {
    expect(
      decideWeeklyNextStep({ current_position: 3, completed_at: "2026-06-25T10:00:00Z" }, TOTAL),
    ).toEqual({ kind: "result" });
  });
});
