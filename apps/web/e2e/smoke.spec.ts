import { expect, test } from '@playwright/test'

/**
 * End-to-end smoke tests against the production build served on port 4173.
 *
 * These run through the real SSR server, so they prove that the app shell
 * renders and that the silent anonymous Supabase session is created
 * client-side (from the user's own IP) and persisted as an auth cookie on
 * first load.
 */

test('app shell renders brand and Play nav link', async ({ page }) => {
  await page.goto('/')

  // Brand visible in the header.
  await expect(
    page.getByRole('link', { name: 'BIGHEAD', exact: true }),
  ).toBeVisible()

  // Nav link to Play is visible. Asserted by href to stay language-agnostic
  // (SSR renders the FR label "Jouer", the EN label is "Play").
  await expect(page.locator('a[href="/play"]')).toBeVisible()
})

test('silent anonymous Supabase auth cookie is set on first load', async ({
  page,
  context,
}) => {
  await page.goto('/')

  // The client SessionProvider signs in anonymously post-hydration (from the
  // user's IP) and @supabase/ssr persists `sb-<project-ref>-auth-token`. This
  // is async, so poll until the cookie appears.
  await expect
    .poll(
      async () => {
        const cookies = await context.cookies()
        const authCookie = cookies.find((c) =>
          c.name.includes('auth-token'),
        )
        return authCookie?.value.length ?? 0
      },
      { timeout: 30_000 },
    )
    .toBeGreaterThan(0)
})
