import { describe, expect, it } from 'vitest'

import { CATEGORIES } from '#/lib/game/categories'
import { CATEGORY_SEO, buildFaq, getCategorySeo, roundedCount } from './categoryContent'

describe('CATEGORY_SEO', () => {
  it('covers every category exactly', () => {
    const slugs = CATEGORIES.map((c) => c.slug).sort()
    expect(Object.keys(CATEGORY_SEO).sort()).toEqual(slugs)
  })

  it.each(Object.entries(CATEGORY_SEO))(
    '%s has complete bilingual content',
    (_slug, content) => {
      for (const lang of ['fr', 'en'] as const) {
        expect(content.intro[lang].length).toBeGreaterThan(200)
        expect(content.subtopics[lang].length).toBeGreaterThanOrEqual(6)
        expect(content.samples[lang]).toHaveLength(3)
        for (const s of content.samples[lang]) {
          expect(s.question.length).toBeGreaterThan(10)
          expect(s.answer.length).toBeGreaterThan(0)
          expect(s.explanation.length).toBeGreaterThan(20)
        }
      }
      expect(content.stats.total).toBeGreaterThan(0)
      expect(content.about.wikipedia).toMatch(/^https:\/\/fr\.wikipedia\.org\//)
    },
  )

  it('has unique intros across categories (no template duplication)', () => {
    const intros = Object.values(CATEGORY_SEO).map((c) => c.intro.fr)
    expect(new Set(intros).size).toBe(intros.length)
  })
})

describe('roundedCount', () => {
  it('floors to the hundred and appends a plus', () => {
    expect(roundedCount(1876)).toBe('1\u00A0800+')
    expect(roundedCount(3049)).toBe('3\u00A0000+')
    expect(roundedCount(250)).toBe('200+')
  })
})

describe('buildFaq', () => {
  const content = getCategorySeo('history')!

  it('returns 4 visible Q&A pairs with the exact count injected', () => {
    const faq = buildFaq('Histoire', content, 'fr')
    expect(faq).toHaveLength(4)
    expect(faq[1].a).toContain('1\u00A0800+')
    expect(faq[0].a.toLowerCase()).toContain('gratuit')
  })

  it('localizes to english', () => {
    const faq = buildFaq('History', content, 'en')
    expect(faq[0].q).toBe('Is the History quiz free?')
    expect(faq[1].a).toContain('1\u00A0800+')
  })
})
