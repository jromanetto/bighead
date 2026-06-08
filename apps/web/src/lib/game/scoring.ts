/**
 * Pure chain-scoring logic for BIGHEAD gameplay.
 *
 * Mirrors the mobile app's scoring so web and native award identical points.
 * Everything here is deterministic and side-effect free, so it is unit tested
 * directly (see `scoring.test.ts`).
 */

/** Time budget per question, in milliseconds. */
export const TIME_PER_QUESTION_MS = 15000

/** Base points awarded for a correct answer at the given difficulty. */
export function getBasePoints(difficulty: number): number {
  switch (difficulty) {
    case 1:
      return 100
    case 2:
      return 150
    case 3:
      return 200
    default:
      return 100
  }
}

/** Score multiplier for the current answer streak (chain) length. */
export function getChainMultiplier(chain: number): number {
  if (chain >= 10) return 10
  if (chain >= 8) return 8
  if (chain >= 5) return 5
  if (chain >= 3) return 3
  if (chain >= 2) return 2
  return 1
}

export interface ComputeChainPointsOptions {
  difficulty: number
  chain: number
  isCorrect: boolean
  answerMs: number
  timePerQuestionMs: number
}

export interface ChainPointsResult {
  points: number
  newChain: number
  multiplier: number
}

/**
 * Computes points for a single answer, the resulting chain length, and the
 * multiplier applied. A wrong answer scores zero and resets the chain.
 */
export function computeChainPoints({
  difficulty,
  chain,
  isCorrect,
  answerMs,
  timePerQuestionMs,
}: ComputeChainPointsOptions): ChainPointsResult {
  if (!isCorrect) {
    return { points: 0, newChain: 0, multiplier: 1 }
  }

  const newChain = chain + 1
  const multiplier = getChainMultiplier(newChain)
  const timeBonus = Math.max(0, 1 - answerMs / timePerQuestionMs) * 0.5
  const points = Math.round(
    getBasePoints(difficulty) * multiplier * (1 + timeBonus),
  )

  return { points, newChain, multiplier }
}
