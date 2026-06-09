import { describe, expect, it } from 'vitest'

import { CATEGORIES, getCategory } from './categories'
import { DUEL_CATEGORIES } from './duels'
import { strings } from '#/lib/i18n/strings'

describe('categories model', () => {
  it('exposes the 11 expected slugs in the duel category set', () => {
    expect(CATEGORIES).toHaveLength(11)
    const slugs = CATEGORIES.map((c) => c.slug)
    expect(new Set(slugs)).toEqual(new Set(DUEL_CATEGORIES))
  })

  it('every category resolves valid i18n label and description keys', () => {
    for (const c of CATEGORIES) {
      expect(strings).toHaveProperty(c.labelKey)
      expect(strings).toHaveProperty(c.descKey)
    }
  })

  describe('getCategory', () => {
    it('returns the category for a known slug', () => {
      const cat = getCategory('history')
      expect(cat?.slug).toBe('history')
      expect(cat?.labelKey).toBe('category.history')
    })

    it('returns undefined for an unknown slug', () => {
      expect(getCategory('notreal')).toBeUndefined()
      expect(getCategory('')).toBeUndefined()
    })
  })
})
