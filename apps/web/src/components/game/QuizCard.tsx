import { useEffect } from 'react'

import { useT } from '#/lib/i18n/LangProvider'

import type { StringKey } from '#/lib/i18n/strings'
import type { GameQuestion } from '#/lib/game/questions'

export interface QuizCardProps {
  question: GameQuestion
  /** Index of the answer the player chose, or null before answering. */
  selectedIndex: number | null
  onAnswer: (index: number) => void
  /** Locks the card without a selection (e.g. when time runs out). */
  disabled?: boolean
}

const LETTERS = ['A', 'B', 'C', 'D'] as const
const ANSWER_LABEL_KEYS: StringKey[] = [
  'quiz.answerPrefix.a',
  'quiz.answerPrefix.b',
  'quiz.answerPrefix.c',
  'quiz.answerPrefix.d',
]

type ButtonState = 'idle' | 'correct' | 'wrong' | 'dimmed'

function resolveState(
  index: number,
  selectedIndex: number | null,
  correctIndex: number,
  locked: boolean,
): ButtonState {
  if (!locked) return 'idle'
  if (index === correctIndex) return 'correct'
  if (index === selectedIndex) return 'wrong'
  return 'dimmed'
}

const STATE_CLASS: Record<ButtonState, string> = {
  idle: 'border-white/10 bg-surface text-fg hover:border-primary/60 hover:bg-primary/10',
  correct: 'border-success bg-success/15 text-success',
  wrong: 'border-error bg-error/15 text-error',
  dimmed: 'border-white/5 bg-surface/40 text-fg/30',
}

/**
 * A single quiz question with four answer buttons. Purely presentational: the
 * parent owns selection state and swaps questions by `key` for enter/exit
 * transitions.
 */
export function QuizCard({
  question,
  selectedIndex,
  onAnswer,
  disabled = false,
}: QuizCardProps) {
  const t = useT()
  const locked = disabled || selectedIndex !== null

  // Number keys 1–4 select the matching answer while the card is interactive.
  useEffect(() => {
    if (locked) return

    const onKeyDown = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1
      if (index >= 0 && index < question.answers.length) {
        event.preventDefault()
        onAnswer(index)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [locked, onAnswer, question.answers.length])

  return (
    <div className="bh-reveal mx-auto flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-primary/15 px-2.5 py-1 font-medium text-primary">
          {question.category}
        </span>
        <span className="rounded-full bg-accent2/15 px-2.5 py-1 font-medium text-accent2">
          {t('quiz.difficulty.label')} {question.difficulty}
        </span>
      </div>

      {question.imageUrl ? (
        <img
          src={question.imageUrl}
          alt=""
          className="max-h-56 w-full rounded-xl object-cover"
        />
      ) : null}

      <h2 className="text-balance text-lg font-bold leading-snug text-fg sm:text-xl">
        {question.question}
      </h2>

      <ul className="flex flex-col gap-3">
        {question.answers.map((answer, index) => {
          const state = resolveState(
            index,
            selectedIndex,
            question.correctIndex,
            locked,
          )
          const isSelected = index === selectedIndex
          const feedbackClass =
            isSelected && state === 'wrong'
              ? ' bh-shake'
              : isSelected && state === 'correct'
                ? ' bh-pop'
                : ''

          return (
            <li key={index}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onAnswer(index)}
                aria-label={`${t(ANSWER_LABEL_KEYS[index])}: ${answer}`}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-default ${STATE_CLASS[state]}${feedbackClass}`}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/20 text-xs font-bold"
                  aria-hidden="true"
                >
                  {LETTERS[index]}
                </span>
                <span>{answer}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
