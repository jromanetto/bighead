// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ShareScore } from './ShareScore'

import { LangProvider } from '#/lib/i18n/LangProvider'

import type { ReactElement } from 'react'

function withLang(ui: ReactElement) {
  return render(<LangProvider>{ui}</LangProvider>)
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  // Reset navigator stubs between tests.
  // @ts-expect-error test cleanup
  delete (navigator as Navigator & { share?: unknown }).share
})

describe('ShareScore', () => {
  it('uses navigator.share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
      writable: true,
    })

    withLang(<ShareScore message="Score 42" url="https://x.test/play" />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        text: 'Score 42',
        url: 'https://x.test/play',
      }),
    )
  })

  it('falls back to clipboard copy when share is unavailable', async () => {
    // No navigator.share present.
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })

    withLang(<ShareScore message="Score 42" url="https://x.test/play" />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('Score 42 https://x.test/play'),
    )
  })

  it('renders WhatsApp and X fallback links with encoded text', () => {
    withLang(<ShareScore message="Score 42" url="https://x.test/play" />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs.some((h) => h?.startsWith('https://wa.me/?text='))).toBe(true)
    expect(
      hrefs.some((h) => h?.startsWith('https://twitter.com/intent/tweet?text=')),
    ).toBe(true)
  })
})
