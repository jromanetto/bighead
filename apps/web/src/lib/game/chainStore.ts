import { create } from 'zustand'

import { computeChainPoints, TIME_PER_QUESTION_MS } from '#/lib/game/scoring'
import {
  getUnseenQuestions,
  markQuestionSeen,
} from '#/lib/game/questions'
import { awardXp, saveGameResult } from '#/lib/game/results'
import { recordAnsweredQuestion } from '#/lib/funnel/freePlay'
import { playCorrect, playWrong } from '#/lib/game/sound'
import { EV, track } from '#/lib/analytics'

import type { Lang } from '#/lib/i18n/strings'
import type { GameQuestion } from '#/lib/game/questions'

/** Number of questions fetched per batch. */
const BATCH_SIZE = 10
/** When fewer than this many unplayed questions remain, prefetch another batch. */
const PREFETCH_THRESHOLD = 3
/** Countdown duration per question, in seconds. */
const TIMER_SECONDS = Math.round(TIME_PER_QUESTION_MS / 1000)

export type ChainStatus = 'idle' | 'playing' | 'finished' | 'error'

interface ChainState {
  questions: GameQuestion[]
  index: number
  chain: number
  maxChain: number
  multiplier: number
  score: number
  correctCount: number
  /** Number of questions that have been resolved (answered or timed out). */
  answered: number
  selectedIndex: number | null
  /** Seconds remaining on the current question. */
  remaining: number
  status: ChainStatus
  startedAt: number
  questionStartedAt: number
}

interface ChainActions {
  start: (lang: Lang, category?: string | null) => Promise<void>
  /**
   * Switches the question language mid-run. Loads a fresh batch in the new
   * language and shows a clean question, preserving the accumulated score,
   * chain and counts. No-op when not playing or the language is unchanged.
   */
  changeLang: (lang: Lang) => Promise<void>
  answer: (index: number) => void
  next: () => Promise<void>
  tick: () => void
  end: () => void
  reset: () => void
}

const INITIAL: ChainState = {
  questions: [],
  index: 0,
  chain: 0,
  maxChain: 0,
  multiplier: 1,
  score: 0,
  correctCount: 0,
  answered: 0,
  selectedIndex: null,
  remaining: TIMER_SECONDS,
  status: 'idle',
  startedAt: 0,
  questionStartedAt: 0,
}

/** Language used to fetch questions; set on start so refills use the same one. */
let activeLang: Lang = 'fr'
/** Active category filter (null = all). Set on start so refills stay scoped. */
let activeCategory: string | null = null

export const useChainStore = create<ChainState & ChainActions>((set, get) => ({
  ...INITIAL,

  reset: () => set({ ...INITIAL }),

  start: async (lang, category = null) => {
    activeLang = lang
    activeCategory = category ?? null
    set({ ...INITIAL, status: 'idle' })
    try {
      const questions = await getUnseenQuestions(BATCH_SIZE, lang, activeCategory)
      if (questions.length === 0) {
        set({ status: 'error' })
        return
      }
      const now = Date.now()
      set({
        questions,
        status: 'playing',
        remaining: TIMER_SECONDS,
        startedAt: now,
        questionStartedAt: now,
      })
      track(EV.gameStarted, { mode: 'chain' })
    } catch (err) {
      console.error('chainStore.start failed', err)
      set({ status: 'error' })
    }
  },

  changeLang: async (lang) => {
    const state = get()
    if (state.status !== 'playing') return
    if (lang === activeLang) return
    activeLang = lang
    try {
      const questions = await getUnseenQuestions(
        BATCH_SIZE,
        lang,
        activeCategory,
      )
      if (questions.length === 0) return // keep the current run rather than break it
      // Fresh question in the new language; score and chain carry over.
      set({
        questions,
        index: 0,
        selectedIndex: null,
        remaining: TIMER_SECONDS,
        questionStartedAt: Date.now(),
      })
    } catch (err) {
      console.error('chainStore.changeLang failed', err)
    }
  },

  answer: (index) => {
    const state = get()
    if (state.status !== 'playing') return
    if (state.selectedIndex !== null) return

    const currentQ = state.questions.at(state.index)
    if (!currentQ) return

    const answerMs = Date.now() - state.questionStartedAt
    const isCorrect = index === currentQ.correctIndex

    // Decorative answer feedback (no-op if muted/unsupported; never throws).
    if (isCorrect) playCorrect()
    else playWrong()

    const { points, newChain, multiplier } = computeChainPoints({
      difficulty: currentQ.difficulty,
      chain: state.chain,
      isCorrect,
      answerMs,
      timePerQuestionMs: TIME_PER_QUESTION_MS,
    })

    try {
      markQuestionSeen(currentQ.id, isCorrect)
    } catch (err) {
      console.error('chainStore markQuestionSeen failed', err)
    }

    // Count this as one answered question for the free-play gate. Timeouts route
    // through here too (via answer(-1)); they are a resolved question so they
    // count. SSR-safe (no-op without a window).
    recordAnsweredQuestion()

    set({
      selectedIndex: index,
      score: state.score + points,
      chain: newChain,
      maxChain: Math.max(state.maxChain, newChain),
      multiplier,
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      answered: state.answered + 1,
    })
  },

  next: async () => {
    const state = get()
    if (state.status !== 'playing') return

    const nextIndex = state.index + 1
    let questions = state.questions

    // Prefetch another batch when running low so play never stalls.
    if (questions.length - nextIndex < PREFETCH_THRESHOLD) {
      try {
        const more = await getUnseenQuestions(BATCH_SIZE, activeLang, activeCategory)
        const existingIds = new Set(questions.map((q) => q.id))
        const fresh = more.filter((q) => !existingIds.has(q.id))
        if (fresh.length > 0) {
          questions = [...questions, ...fresh]
        }
      } catch (err) {
        console.error('chainStore.next prefetch failed', err)
      }
    }

    if (nextIndex >= questions.length) {
      // Nothing left to play; end the run.
      get().end()
      return
    }

    set({
      questions,
      index: nextIndex,
      selectedIndex: null,
      remaining: TIMER_SECONDS,
      questionStartedAt: Date.now(),
    })
  },

  tick: () => {
    const state = get()
    if (state.status !== 'playing') return
    if (state.selectedIndex !== null) return

    const remaining = state.remaining - 1
    if (remaining <= 0) {
      set({ remaining: 0 })
      // Time's up: count as a wrong answer (resets the chain).
      get().answer(-1)
    } else {
      set({ remaining })
    }
  },

  end: () => {
    const state = get()
    if (state.status === 'finished') return

    const durationSeconds = state.startedAt
      ? Math.max(0, Math.round((Date.now() - state.startedAt) / 1000))
      : 0

    set({ status: 'finished' })

    track(EV.gameFinished, { mode: 'chain', score: state.score })

    const xp = Math.round(state.score * 0.1 + state.correctCount * 10)

    // Network side-effects are fire-and-forget; never crash the UI.
    void saveGameResult({
      mode: 'chain_solo',
      score: state.score,
      correctCount: state.correctCount,
      totalQuestions: state.answered,
      maxChain: state.maxChain,
      durationSeconds,
    }).catch((err) => console.error('chainStore saveGameResult failed', err))

    void awardXp(
      xp,
      'chain_solo',
      { maxChain: state.maxChain, correctCount: state.correctCount },
      'chain_' + state.startedAt,
    ).catch((err) => console.error('chainStore awardXp failed', err))
  },
}))
