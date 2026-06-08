import { useT } from '#/lib/i18n/LangProvider'

/**
 * A static, decorative mock of the in-game QuizCard for the hero visual.
 *
 * Purely presentational (no interactivity, no data fetching) so it renders
 * identically on the server and the client — keeping the landing fully
 * crawlable. It mirrors the real QuizCard's look (category pill, question,
 * lettered answers, a "correct" highlight) without importing it.
 */
export function HeroCard() {
  const t = useT()

  const answers = [
    { letter: 'A', text: t('landing.hero.cardAnswerA'), correct: false },
    { letter: 'B', text: t('landing.hero.cardAnswerB'), correct: true },
    { letter: 'C', text: t('landing.hero.cardAnswerC'), correct: false },
  ]

  return (
    <div className="relative" aria-hidden="true">
      {/* Glow behind the card */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/20 blur-3xl" />
      <div className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full bg-accent/30 blur-2xl" />

      <div className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-surface p-5 shadow-2xl shadow-black/40 sm:p-6">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="rounded-full bg-primary/15 px-2.5 py-1 font-medium text-primary">
            {t('landing.hero.cardCategory')}
          </span>
          <span className="rounded-full bg-accent/15 px-2.5 py-1 font-bold text-accent">
            {t('landing.hero.cardChain')}
          </span>
        </div>

        <h2 className="text-balance text-lg font-bold leading-snug text-fg sm:text-xl">
          {t('landing.hero.cardQuestion')}
        </h2>

        <ul className="flex flex-col gap-3">
          {answers.map((answer) => (
            <li
              key={answer.letter}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium ${
                answer.correct
                  ? 'border-success bg-success/15 text-success'
                  : 'border-white/10 bg-surface text-fg'
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/20 text-xs font-bold">
                {answer.letter}
              </span>
              <span>{answer.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
