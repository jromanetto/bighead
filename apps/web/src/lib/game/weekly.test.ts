import { describe, expect, it } from 'vitest'

import {
  formatWeeklyQuestion,
  isReplayable,
  parseReplayState,
  themeDescription,
  themeLabel,
} from './weekly'

import type { WeeklyChallenge, WeeklyQuestionRow } from './weekly'

const row: WeeklyQuestionRow = {
  id: 'wq-1',
  challenge_id: 'c-1',
  position: 1,
  difficulty: 2,
  question_fr: 'Quelle est la capitale de la Belgique ?',
  correct_answer_fr: 'Bruxelles',
  wrong_answers_fr: ['Anvers', 'Gand', 'Liège'],
  learning_fact_fr: 'Bruxelles abrite les institutions européennes.',
  question_en: 'What is the capital of Belgium?',
  correct_answer_en: 'Brussels',
  wrong_answers_en: ['Antwerp', 'Ghent', 'Liege'],
  learning_fact_en: 'Brussels hosts the European institutions.',
  image_url: 'https://example.com/brussels.jpg',
  image_credit: 'Wikimedia',
}

const challenge: WeeklyChallenge = {
  id: 'c-1',
  theme_slug: 'belgium',
  theme_label_fr: 'Belgique',
  theme_label_en: 'Belgium',
  description_fr: 'Tout sur la Belgique.',
  description_en: 'All about Belgium.',
  emoji: '🇧🇪',
  color: '#000000',
  target_category: 'geography',
  start_date: '2026-06-08',
  end_date: '2026-06-14',
  status: 'active',
  total_questions: 30,
  total_players: 12,
  challenge_type: 'themed',
}

describe('formatWeeklyQuestion', () => {
  it('produces exactly 4 answers containing the fr originals', () => {
    const q = formatWeeklyQuestion(row, 'fr', () => 0)
    expect(q.answers).toHaveLength(4)
    expect(new Set(q.answers)).toEqual(
      new Set(['Bruxelles', 'Anvers', 'Gand', 'Liège']),
    )
  })

  it('points correctIndex at the correct answer after shuffle (fr)', () => {
    const q = formatWeeklyQuestion(row, 'fr', () => 0)
    expect(q.answers[q.correctIndex]).toBe('Bruxelles')
  })

  it('keeps correctIndex valid under a different deterministic rng', () => {
    const q = formatWeeklyQuestion(row, 'fr', () => 0.99)
    expect(q.answers).toHaveLength(4)
    expect(q.answers[q.correctIndex]).toBe('Bruxelles')
  })

  it('selects the fr fields and learning fact', () => {
    const q = formatWeeklyQuestion(row, 'fr', () => 0)
    expect(q.question).toBe(row.question_fr)
    expect(q.learningFact).toBe(row.learning_fact_fr)
    expect(q.answers[q.correctIndex]).toBe('Bruxelles')
  })

  it('selects the en fields and learning fact', () => {
    const q = formatWeeklyQuestion(row, 'en', () => 0)
    expect(q.question).toBe(row.question_en)
    expect(q.learningFact).toBe(row.learning_fact_en)
    expect(new Set(q.answers)).toEqual(
      new Set(['Brussels', 'Antwerp', 'Ghent', 'Liege']),
    )
    expect(q.answers[q.correctIndex]).toBe('Brussels')
  })

  it('maps scalar fields, image url and difficulty', () => {
    const q = formatWeeklyQuestion(row, 'fr', () => 0, 'geography')
    expect(q.id).toBe('wq-1')
    expect(q.difficulty).toBe(2)
    expect(q.imageUrl).toBe('https://example.com/brussels.jpg')
    expect(q.category).toBe('geography')
  })

  it('defaults category to empty string when not provided', () => {
    const q = formatWeeklyQuestion(row, 'fr', () => 0)
    expect(q.category).toBe('')
  })

  it('handles a null image url and null learning fact', () => {
    const q = formatWeeklyQuestion(
      { ...row, image_url: null, learning_fact_fr: null },
      'fr',
      () => 0,
    )
    expect(q.imageUrl).toBeNull()
    expect(q.learningFact).toBeNull()
  })
})

describe('themeLabel / themeDescription', () => {
  it('picks the fr label and description', () => {
    expect(themeLabel(challenge, 'fr')).toBe('Belgique')
    expect(themeDescription(challenge, 'fr')).toBe('Tout sur la Belgique.')
  })

  it('picks the en label and description', () => {
    expect(themeLabel(challenge, 'en')).toBe('Belgium')
    expect(themeDescription(challenge, 'en')).toBe('All about Belgium.')
  })

  it('returns null description when missing', () => {
    expect(
      themeDescription({ ...challenge, description_en: null }, 'en'),
    ).toBeNull()
  })
})

describe('isReplayable', () => {
  it('allows archived and closed challenges', () => {
    expect(isReplayable('archived')).toBe(true)
    expect(isReplayable('closed')).toBe(true)
  })

  it('rejects active and upcoming challenges', () => {
    expect(isReplayable('active')).toBe(false)
    expect(isReplayable('upcoming')).toBe(false)
  })
})

describe('parseReplayState', () => {
  it('parses a valid jsonb payload', () => {
    expect(
      parseReplayState({ current_position: 3, correct_count: 2, completed: false }),
    ).toEqual({ current_position: 3, correct_count: 2, completed: false })
  })

  it('throws on null, non-objects and missing fields', () => {
    expect(() => parseReplayState(null)).toThrow('malformed replay state')
    expect(() => parseReplayState('nope')).toThrow('malformed replay state')
    expect(() =>
      parseReplayState({ current_position: '3', correct_count: 2, completed: false }),
    ).toThrow('malformed replay state')
    expect(() =>
      parseReplayState({ current_position: 3, correct_count: 2 }),
    ).toThrow('malformed replay state')
  })
})
