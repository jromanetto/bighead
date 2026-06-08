import { describe, expect, it } from 'vitest'

import { t } from './strings'

describe('t', () => {
  it('returns different non-empty strings for fr and en', () => {
    const fr = t('nav.play', 'fr')
    const en = t('nav.play', 'en')

    expect(fr).not.toBe('')
    expect(en).not.toBe('')
    expect(fr).not.toBe(en)
  })

  it('returns the key itself for an unknown key', () => {
    expect(t('nonexistent.key', 'fr')).toBe('nonexistent.key')
  })
})
