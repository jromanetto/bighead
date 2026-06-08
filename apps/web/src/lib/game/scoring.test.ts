import { describe, expect, it } from 'vitest'

import {
  TIME_PER_QUESTION_MS,
  computeChainPoints,
  getBasePoints,
  getChainMultiplier,
} from './scoring'

describe('getBasePoints', () => {
  it('maps difficulty 1 to 100', () => {
    expect(getBasePoints(1)).toBe(100)
  })

  it('maps difficulty 2 to 150', () => {
    expect(getBasePoints(2)).toBe(150)
  })

  it('maps difficulty 3 to 200', () => {
    expect(getBasePoints(3)).toBe(200)
  })

  it('falls back to 100 for unknown difficulty', () => {
    expect(getBasePoints(0)).toBe(100)
    expect(getBasePoints(4)).toBe(100)
    expect(getBasePoints(-1)).toBe(100)
  })
})

describe('getChainMultiplier', () => {
  it('returns 10 when chain >= 10', () => {
    expect(getChainMultiplier(10)).toBe(10)
    expect(getChainMultiplier(15)).toBe(10)
  })

  it('returns 8 when chain >= 8 and < 10', () => {
    expect(getChainMultiplier(8)).toBe(8)
    expect(getChainMultiplier(9)).toBe(8)
  })

  it('returns 5 when chain >= 5 and < 8', () => {
    expect(getChainMultiplier(5)).toBe(5)
    expect(getChainMultiplier(7)).toBe(5)
  })

  it('returns 3 when chain >= 3 and < 5', () => {
    expect(getChainMultiplier(3)).toBe(3)
    expect(getChainMultiplier(4)).toBe(3)
  })

  it('returns 2 when chain >= 2 and < 3', () => {
    expect(getChainMultiplier(2)).toBe(2)
  })

  it('returns 1 below 2', () => {
    expect(getChainMultiplier(1)).toBe(1)
    expect(getChainMultiplier(0)).toBe(1)
  })
})

describe('computeChainPoints', () => {
  it('returns zero and resets the chain on a wrong answer', () => {
    expect(
      computeChainPoints({
        difficulty: 3,
        chain: 7,
        isCorrect: false,
        answerMs: 1000,
        timePerQuestionMs: TIME_PER_QUESTION_MS,
      }),
    ).toEqual({ points: 0, newChain: 0, multiplier: 1 })
  })

  it('applies the full ~+50% time bonus for an instant answer', () => {
    const result = computeChainPoints({
      difficulty: 1,
      chain: 0,
      isCorrect: true,
      answerMs: 0,
      timePerQuestionMs: TIME_PER_QUESTION_MS,
    })
    // base 100, newChain 1 -> multiplier 1, timeBonus 0.5 -> 100 * 1 * 1.5
    expect(result).toEqual({ points: 150, newChain: 1, multiplier: 1 })
  })

  it('applies no time bonus when the full time is used', () => {
    const result = computeChainPoints({
      difficulty: 1,
      chain: 0,
      isCorrect: true,
      answerMs: TIME_PER_QUESTION_MS,
      timePerQuestionMs: TIME_PER_QUESTION_MS,
    })
    // base 100, multiplier 1, timeBonus 0 -> 100
    expect(result).toEqual({ points: 100, newChain: 1, multiplier: 1 })
  })

  it('clamps the time bonus to 0 when the answer is slower than allowed', () => {
    const result = computeChainPoints({
      difficulty: 1,
      chain: 0,
      isCorrect: true,
      answerMs: TIME_PER_QUESTION_MS * 2,
      timePerQuestionMs: TIME_PER_QUESTION_MS,
    })
    expect(result.points).toBe(100)
  })

  it('matches the worked example (difficulty 2, chain 4 -> 5)', () => {
    const result = computeChainPoints({
      difficulty: 2,
      chain: 4,
      isCorrect: true,
      answerMs: 5000,
      timePerQuestionMs: 15000,
    })
    // base 150, multiplier 5, timeBonus = (1 - 5000/15000) * 0.5 = 0.3333...
    // round(150 * 5 * (1 + 0.3333...)) = round(750 * 1.3333...) = round(1000) = 1000
    // NOTE: the task spec text states 875, but that is arithmetically inconsistent
    // with its own formula (it effectively used a 0.25 bonus factor). The formula
    // `timeBonus = max(0, 1 - answerMs/timePerQuestionMs) * 0.5` yields 1000.
    expect(result).toEqual({ points: 1000, newChain: 5, multiplier: 5 })
  })
})

describe('TIME_PER_QUESTION_MS', () => {
  it('is 15000', () => {
    expect(TIME_PER_QUESTION_MS).toBe(15000)
  })
})
