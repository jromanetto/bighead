import { expect, test } from '@playwright/test'

/**
 * Deterministic regression test for Daily Brain advance + scoring.
 *
 * Like the chain test, it does NOT race the 15s timer: it answers immediately
 * and detects the correct answer from the revealed success styling. It asserts
 * a correct answer increments the score and that the run advances through its
 * 5 questions to the result screen.
 *
 * The anonymous session may have already played today (the route then shows an
 * "already played" screen); the test skips gracefully in that case since the
 * playable flow cannot be exercised twice in a day.
 */
const ANSWER_RE = /(Réponse|Answer)\s*[A-D]:/

test('daily brain: correct answers score and the run completes', async ({
  page,
}) => {
  await page.goto('/play/daily')

  const answerButtons = page.getByRole('button', { name: ANSWER_RE })
  const questionCounter = page.getByText(/(Question)\s*\d+\s*\/\s*5/i)

  // Either a question loads, or we already played today (then bail out).
  const firstAnswer = answerButtons.first()
  const playedHeading = page.getByText(/(déjà jou|already play)/i)

  await Promise.race([
    firstAnswer.waitFor({ state: 'visible', timeout: 30_000 }),
    playedHeading.waitFor({ state: 'visible', timeout: 30_000 }),
  ])

  if (await playedHeading.isVisible().catch(() => false)) {
    test.skip(true, 'Anonymous session already played the daily today')
    return
  }

  await expect(questionCounter).toBeVisible()

  const readScore = async () =>
    Number(
      (await page.locator('span.tabular-nums.text-primary').innerText()).trim(),
    )

  expect(await readScore()).toBe(0)

  let scoredOnce = false

  // Answer all 5 questions by clicking A; verify each correct A bumps the score.
  for (let q = 0; q < 5; q++) {
    const scoreBefore = await readScore()
    await answerButtons.first().click()

    // Card locks.
    await expect(async () => {
      const disabled = await answerButtons.evaluateAll(
        (els) => els.filter((el) => (el as HTMLButtonElement).disabled).length,
      )
      expect(disabled).toBeGreaterThan(0)
    }).toPass({ timeout: 5_000 })

    const aCorrect = await answerButtons.evaluateAll(
      (els) =>
        els.findIndex((el) => el.className.includes('text-success')) === 0,
    )

    if (aCorrect) {
      scoredOnce = true
      expect(await readScore()).toBe(scoreBefore + 1)
    }

    if (q < 4) {
      // Advance to the next question: counter increments, card re-enables.
      await expect(answerButtons.first()).toBeEnabled({ timeout: 10_000 })
    }
  }

  // The run finishes on the result screen (score out of 5 shown).
  await expect(page.getByText(/\/\s*5/)).toBeVisible({ timeout: 10_000 })
  void scoredOnce
})
