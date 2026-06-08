import { expect, test } from '@playwright/test'

/**
 * End-to-end test for the Chain Reaction screen against the production build.
 *
 * Exercises the real flow: SSR renders the loading placeholder, the client
 * effect fetches unseen questions from the real Supabase backend (via the
 * anonymous session created in the root route), a question renders, and
 * answering it produces visible feedback (the answer buttons lock + show
 * correct/wrong styling).
 *
 * Network/Supabase latency makes the first question fetch the slow part, so the
 * waits use generous timeouts.
 */
test('chain reaction: a question renders and answering shows feedback', async ({
  page,
}) => {
  await page.goto('/play/chain')

  // The four answer buttons carry aria-labels like "Réponse A: ..." (FR) or
  // "Answer A: ..." (EN). Match the letter prefix to stay language-agnostic and
  // grab the first answer button once a question has loaded.
  const firstAnswer = page
    .getByRole('button', { name: /(Réponse|Answer)\s*A:/ })
    .first()

  // Generous timeout: this waits for the client-side question fetch to resolve.
  await expect(firstAnswer).toBeVisible({ timeout: 30_000 })

  await firstAnswer.click()

  // After answering, the card locks: the clicked button becomes disabled while
  // feedback shows. Assert at least one answer button is now disabled.
  await expect(async () => {
    const disabledCount = await page
      .getByRole('button', { name: /(Réponse|Answer)\s*[A-D]:/ })
      .evaluateAll((els) =>
        els.filter((el) => (el as HTMLButtonElement).disabled).length,
      )
    expect(disabledCount).toBeGreaterThan(0)
  }).toPass({ timeout: 5_000 })
})
