import { describe, expect, it } from 'vitest'

import {
  DUEL_SHARE_BASE,
  categorizeDuel,
  duelShareUrl,
  formatDuelQuestion,
} from './duels'

import type { DuelInboxItem, DuelPayloadQuestion } from './duels'

const payloadItem: DuelPayloadQuestion = {
  id: 'q-1',
  question_text: 'Who painted the Mona Lisa?',
  correct_answer: 'Leonardo da Vinci',
  wrong_answers: ['Raphael', 'Michelangelo', 'Donatello'],
  image_url: 'https://example.com/monalisa.jpg',
  explanation: 'It hangs in the Louvre.',
  player_name: null,
}

function baseInbox(overrides: Partial<DuelInboxItem> = {}): DuelInboxItem {
  return {
    duel_id: 'd-1',
    my_role: 'host',
    opponent_id: 'u-2',
    opponent_username: 'Bob',
    opponent_avatar: null,
    category: 'general',
    status: 'awaiting_opponent',
    my_played_at: null,
    opponent_played_at: null,
    my_score: 0,
    opponent_score: null,
    winner_id: null,
    expires_at: null,
    created_at: '2026-06-08T00:00:00Z',
    ...overrides,
  }
}

describe('formatDuelQuestion', () => {
  it('produces exactly 4 answers containing all originals', () => {
    const q = formatDuelQuestion(payloadItem, () => 0)
    expect(q.answers).toHaveLength(4)
    expect(new Set(q.answers)).toEqual(
      new Set([
        payloadItem.correct_answer,
        ...payloadItem.wrong_answers,
      ]),
    )
  })

  it('points correctIndex at the correct answer after shuffle', () => {
    const q = formatDuelQuestion(payloadItem, () => 0)
    expect(q.answers[q.correctIndex]).toBe(payloadItem.correct_answer)
  })

  it('keeps correctIndex valid under a different deterministic rng', () => {
    const q = formatDuelQuestion(payloadItem, () => 0.99)
    expect(q.answers).toHaveLength(4)
    expect(q.answers[q.correctIndex]).toBe(payloadItem.correct_answer)
  })

  it('maps scalar fields and the image url', () => {
    const q = formatDuelQuestion(payloadItem, () => 0)
    expect(q.id).toBe('q-1')
    expect(q.question).toBe(payloadItem.question_text)
    expect(q.imageUrl).toBe('https://example.com/monalisa.jpg')
  })

  it('handles a null image_url', () => {
    const q = formatDuelQuestion({ ...payloadItem, image_url: null }, () => 0)
    expect(q.imageUrl).toBeNull()
  })
})

describe('categorizeDuel', () => {
  it('returns "expired" when status is expired regardless of play state', () => {
    expect(
      categorizeDuel(baseInbox({ status: 'expired', my_played_at: null })),
    ).toBe('expired')
    expect(
      categorizeDuel(
        baseInbox({ status: 'expired', my_played_at: '2026-06-08T01:00:00Z' }),
      ),
    ).toBe('expired')
  })

  it('returns "finished" when status is completed', () => {
    expect(
      categorizeDuel(
        baseInbox({
          status: 'completed',
          my_played_at: '2026-06-08T01:00:00Z',
          opponent_played_at: '2026-06-08T02:00:00Z',
        }),
      ),
    ).toBe('finished')
  })

  it('returns "waiting" when I have played but the duel is not yet completed', () => {
    expect(
      categorizeDuel(
        baseInbox({
          status: 'awaiting_opponent',
          my_played_at: '2026-06-08T01:00:00Z',
        }),
      ),
    ).toBe('waiting')
  })

  it('returns "my_turn" when I have not played and the duel is open', () => {
    expect(
      categorizeDuel(
        baseInbox({ status: 'pending', my_played_at: null }),
      ),
    ).toBe('my_turn')
  })

  it('prioritises expired over completed', () => {
    expect(
      categorizeDuel(
        baseInbox({
          status: 'expired',
          my_played_at: '2026-06-08T01:00:00Z',
          opponent_played_at: '2026-06-08T02:00:00Z',
        }),
      ),
    ).toBe('expired')
  })
})

describe('duelShareUrl', () => {
  it('builds a shareable URL from the public base and duel id', () => {
    expect(duelShareUrl('abc-123')).toBe(`${DUEL_SHARE_BASE}/duels/abc-123`)
  })

  it('uses the play.bighead-quizz.com base', () => {
    expect(duelShareUrl('x')).toBe('https://play.bighead-quizz.com/duels/x')
  })
})
