import { expect, test } from '@playwright/test'

/**
 * E2E for the marketing landing page (served by the production SSR build).
 *
 * The landing is static marketing content with no auth/session gating, so
 * these assertions never need an anonymous Supabase session to pass.
 */

test('hero "Play" CTA links to /play and is visible', async ({ page }) => {
  await page.goto('/')

  // The hero primary CTA is a link to /play. Asserted by href to stay
  // language-agnostic (FR "Jouer gratuitement" / EN "Play for free").
  const heroCta = page.locator('main a[href="/play"]').first()
  await expect(heroCta).toBeVisible()
})

test('#features section exists and the anchor scrolls to it', async ({
  page,
}) => {
  await page.goto('/')

  // The features section is server-rendered with the id used by /#features.
  const features = page.locator('#features')
  await expect(features).toHaveCount(1)

  // The footer "features" anchor should scroll the section into view.
  await page.locator('footer a[href="#features"]').click()
  await expect(features).toBeInViewport()
})
