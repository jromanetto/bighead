// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

import { ChainMeter } from './ChainMeter'
import { QuizCard } from './QuizCard'
import { TimerRing } from './TimerRing'

import { LangProvider } from '#/lib/i18n/LangProvider'

import type { ReactElement } from 'react'
import type { GameQuestion } from '#/lib/game/questions'

function withLang(ui: ReactElement) {
  return render(<LangProvider>{ui}</LangProvider>)
}

const question: GameQuestion = {
  id: 'q1',
  category: 'Histoire',
  difficulty: 2,
  question: 'Capitale de la France ?',
  answers: ['Paris', 'Lyon', 'Marseille', 'Lille'],
  correctIndex: 0,
  imageUrl: null,
}

afterEach(cleanup)

describe('game components', () => {
  it('renders TimerRing with the rounded seconds', () => {
    withLang(<TimerRing remaining={7.2} total={10} />)
    expect(screen.getByRole('timer')).toBeDefined()
    expect(screen.getByText('8')).toBeDefined()
  })

  it('renders ChainMeter with chain and multiplier', () => {
    withLang(<ChainMeter chain={3} multiplier={2} />)
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('×2')).toBeDefined()
  })

  it('QuizCard fires onAnswer on click and locks after selection', () => {
    const onAnswer = vi.fn()
    withLang(
      <QuizCard question={question} selectedIndex={null} onAnswer={onAnswer} />,
    )
    fireEvent.click(screen.getByText('Lyon'))
    expect(onAnswer).toHaveBeenCalledWith(1)

    cleanup()
    withLang(
      <QuizCard question={question} selectedIndex={1} onAnswer={onAnswer} />,
    )
    expect(
      (screen.getByText('Paris').closest('button') as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })
})
