import { describe, expect, it } from 'vitest'

import { formatQuestion } from './questions'

const row = {
  id: 'q-1',
  question_text: 'Who painted the Mona Lisa?',
  correct_answer: 'Leonardo da Vinci',
  wrong_answers: ['Raphael', 'Michelangelo', 'Donatello'],
  category: 'art',
  difficulty: 2,
  image_url: 'https://example.com/monalisa.jpg',
  image_credit: 'Louvre',
}

describe('formatQuestion', () => {
  it('produces exactly 4 answers containing all originals', () => {
    const q = formatQuestion(row, () => 0)
    expect(q.answers).toHaveLength(4)
    expect(new Set(q.answers)).toEqual(
      new Set([row.correct_answer, ...row.wrong_answers]),
    )
  })

  it('points correctIndex at the correct answer after shuffle', () => {
    const q = formatQuestion(row, () => 0)
    expect(q.answers[q.correctIndex]).toBe(row.correct_answer)
  })

  it('maps the scalar fields', () => {
    const q = formatQuestion(row, () => 0)
    expect(q.id).toBe('q-1')
    expect(q.question).toBe(row.question_text)
    expect(q.category).toBe('art')
    expect(q.difficulty).toBe(2)
    expect(q.imageUrl).toBe('https://example.com/monalisa.jpg')
  })

  it('keeps correctIndex valid under a different deterministic rng', () => {
    const q = formatQuestion(row, () => 0.99)
    expect(q.answers).toHaveLength(4)
    expect(q.answers[q.correctIndex]).toBe(row.correct_answer)
  })

  it('handles a null image_url', () => {
    const q = formatQuestion({ ...row, image_url: null as never }, () => 0)
    expect(q.imageUrl).toBeNull()
  })
})
