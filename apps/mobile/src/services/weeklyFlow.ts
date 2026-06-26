/**
 * Pure decision logic for the weekly challenge play loop.
 *
 * Extracted from `app/weekly/play.tsx` so it can be unit-tested without React
 * Native. This is the exact branch that regressed: when a player reached the
 * last question (position == total), a stale/crossed challenge could push
 * `nextPosition` past `total` and the screen showed "Question not found"
 * instead of the recap. The guard `nextPosition > total -> result` lives here.
 */

export type WeeklyNextStep =
  | { kind: "result" }
  | { kind: "question"; position: number };

export interface WeeklyProgressLike {
  completed_at?: string | null;
  current_position?: number | null;
}

/**
 * Decide what the play screen should do next, given the player's progress and
 * the challenge size. Pure: no IO, no side effects.
 *
 * - already completed            -> recap
 * - next position beyond the last -> recap (graceful end, never an error screen)
 * - otherwise                     -> load that question
 */
export function decideWeeklyNextStep(
  progress: WeeklyProgressLike | null | undefined,
  totalQuestions: number,
): WeeklyNextStep {
  if (progress?.completed_at) return { kind: "result" };
  const nextPosition = (progress?.current_position ?? 0) + 1;
  if (nextPosition > totalQuestions) return { kind: "result" };
  return { kind: "question", position: nextPosition };
}
