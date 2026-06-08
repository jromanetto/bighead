import { describe, expect, it } from 'vitest'

import { formatDailyQuestion } from './daily'

const row = {
  out_id: 'daily-1',
  out_position: 0,
  out_date: '2026-06-08',
  out_question_id: 'q-9',
  out_question_text: 'What is the capital of France?',
  out_category: 'geography',
  out_difficulty: 1,
  out_correct_answer: 'Paris',
  // Per contract: first element is the correct answer.
  out_options: ['Paris', 'London', 'Berlin', 'Madrid'],
  out_image_url: 'https://example.com/paris.jpg',
}

describe('formatDailyQuestion', () => {
  it('produces exactly 4 answers containing all options', () => {
    const q = formatDailyQuestion(row, () => 0)
    expect(q.answers).toHaveLength(4)
    expect(new Set(q.answers)).toEqual(
      new Set(['Paris', 'London', 'Berlin', 'Madrid']),
    )
  })

  it('points correctIndex at the first option (the correct one)', () => {
    const q = formatDailyQuestion(row, () => 0)
    expect(q.answers[q.correctIndex]).toBe('Paris')
  })

  it('maps the out_* scalar fields', () => {
    const q = formatDailyQuestion(row, () => 0)
    expect(q.id).toBe('q-9')
    expect(q.question).toBe(row.out_question_text)
    expect(q.category).toBe('geography')
    expect(q.difficulty).toBe(1)
    expect(q.imageUrl).toBe('https://example.com/paris.jpg')
  })

  it('keeps correctIndex valid under a different deterministic rng', () => {
    const q = formatDailyQuestion(row, () => 0.99)
    expect(q.answers).toHaveLength(4)
    expect(q.answers[q.correctIndex]).toBe('Paris')
  })

  it('handles a null out_image_url', () => {
    const q = formatDailyQuestion(
      { ...row, out_image_url: null as never },
      () => 0,
    )
    expect(q.imageUrl).toBeNull()
  })
})
