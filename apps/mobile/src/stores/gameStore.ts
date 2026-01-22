import { create } from "zustand";
import type { FormattedQuestion } from "../services/questions";

export type GameMode = "chain_solo" | "party";
export type GameStatus = "idle" | "loading" | "playing" | "paused" | "finished";

export interface GameAnswer {
  questionId: string;
  playerName?: string;
  isCorrect: boolean;
  answerTimeMs: number;
  chainMultiplier: number;
  pointsEarned: number;
  selectedAnswer: string;
}

export interface PartyPlayer {
  name: string;
  score: number;
  correctCount: number;
}

interface GameState {
  // Game configuration
  mode: GameMode;
  status: GameStatus;
  categoryIds: string[];
  difficulty: number | null;

  // Questions
  questions: FormattedQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;

  // Scoring (Chain Reaction)
  score: number;
  chain: number;
  maxChain: number;
  correctCount: number;

  // Timer
  questionStartTime: number;
  timePerQuestion: number; // in seconds
  timeRemaining: number;

  // Party mode
  players: PartyPlayer[];
  currentPlayerIndex: number;

  // History
  answers: GameAnswer[];
}

interface GameActions {
  // Setup
  initGame: (config: {
    mode: GameMode;
    questions: FormattedQuestion[];
    categoryIds?: string[];
    difficulty?: number;
    players?: string[];
    timePerQuestion?: number;
  }) => void;

  // Gameplay
  startGame: () => void;
  answerQuestion: (selectedIndex: number) => void;
  nextQuestion: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;

  // Timer
  tick: () => void;
  setTimeRemaining: (time: number) => void;

  // Party mode
  nextPlayer: () => void;

  // Reset
  reset: () => void;
}

// Chain multiplier progression
const getChainMultiplier = (chain: number): number => {
  if (chain >= 10) return 10;
  if (chain >= 8) return 8;
  if (chain >= 5) return 5;
  if (chain >= 3) return 3;
  if (chain >= 2) return 2;
  return 1;
};

// Base points per difficulty
const getBasePoints = (difficulty: number): number => {
  switch (difficulty) {
    case 1:
      return 100;
    case 2:
      return 150;
    case 3:
      return 200;
    default:
      return 100;
  }
};

const initialState: GameState = {
  mode: "chain_solo",
  status: "idle",
  categoryIds: [],
  difficulty: null,

  questions: [],
  currentQuestionIndex: 0,
  totalQuestions: 0,

  score: 0,
  chain: 0,
  maxChain: 0,
  correctCount: 0,

  questionStartTime: 0,
  timePerQuestion: 15,
  timeRemaining: 15,

  players: [],
  currentPlayerIndex: 0,

  answers: [],
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  initGame: (config) => {
    const players = config.players?.map((name) => ({
      name,
      score: 0,
      correctCount: 0,
    })) || [];

    set({
      ...initialState,
      mode: config.mode,
      questions: config.questions,
      totalQuestions: config.questions.length,
      categoryIds: config.categoryIds || [],
      difficulty: config.difficulty || null,
      players,
      timePerQuestion: config.timePerQuestion || 15,
      timeRemaining: config.timePerQuestion || 15,
      status: "loading",
    });
  },

  startGame: () => {
    set({
      status: "playing",
      questionStartTime: Date.now(),
      timeRemaining: get().timePerQuestion,
    });
  },

  answerQuestion: (selectedIndex: number) => {
    const state = get();
    if (state.status !== "playing") return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    const answerTimeMs = Date.now() - state.questionStartTime;
    const selectedAnswer = currentQuestion.answers[selectedIndex];

    let newChain = isCorrect ? state.chain + 1 : 0;
    const multiplier = isCorrect ? getChainMultiplier(newChain) : 1;
    const basePoints = getBasePoints(currentQuestion.difficulty);

    // Time bonus: faster answers get more points (up to 50% bonus)
    const timeBonus = isCorrect
      ? Math.max(0, 1 - answerTimeMs / (state.timePerQuestion * 1000)) * 0.5
      : 0;
    const pointsEarned = isCorrect
      ? Math.round(basePoints * multiplier * (1 + timeBonus))
      : 0;

    const answer: GameAnswer = {
      questionId: currentQuestion.id,
      playerName:
        state.mode === "party"
          ? state.players[state.currentPlayerIndex]?.name
          : undefined,
      isCorrect,
      answerTimeMs,
      chainMultiplier: multiplier,
      pointsEarned,
      selectedAnswer,
    };

    // Update player score in party mode
    let updatedPlayers = state.players;
    if (state.mode === "party" && state.players.length > 0) {
      updatedPlayers = state.players.map((player, index) => {
        if (index === state.currentPlayerIndex) {
          return {
            ...player,
            score: player.score + pointsEarned,
            correctCount: player.correctCount + (isCorrect ? 1 : 0),
          };
        }
        return player;
      });
    }

    set({
      score: state.score + pointsEarned,
      chain: newChain,
      maxChain: Math.max(state.maxChain, newChain),
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      answers: [...state.answers, answer],
      players: updatedPlayers,
    });
  },

  nextQuestion: () => {
    const state = get();
    const nextIndex = state.currentQuestionIndex + 1;

    if (nextIndex >= state.totalQuestions) {
      set({ status: "finished" });
      return;
    }

    // In party mode, rotate to next player
    let nextPlayerIndex = state.currentPlayerIndex;
    if (state.mode === "party" && state.players.length > 0) {
      nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    }

    set({
      currentQuestionIndex: nextIndex,
      currentPlayerIndex: nextPlayerIndex,
      questionStartTime: Date.now(),
      timeRemaining: state.timePerQuestion,
    });
  },

  pauseGame: () => {
    set({ status: "paused" });
  },

  resumeGame: () => {
    set({
      status: "playing",
      questionStartTime: Date.now(),
    });
  },

  endGame: () => {
    set({ status: "finished" });
  },

  tick: () => {
    const state = get();
    if (state.status !== "playing") return;

    const newTime = state.timeRemaining - 1;
    if (newTime <= 0) {
      // Time's up - treat as wrong answer
      get().answerQuestion(-1);
      get().nextQuestion();
    } else {
      set({ timeRemaining: newTime });
    }
  },

  setTimeRemaining: (time: number) => {
    set({ timeRemaining: time });
  },

  nextPlayer: () => {
    const state = get();
    if (state.players.length === 0) return;

    set({
      currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const selectCurrentQuestion = (state: GameState) =>
  state.questions[state.currentQuestionIndex];

export const selectCurrentPlayer = (state: GameState) =>
  state.players[state.currentPlayerIndex];

export const selectProgress = (state: GameState) => ({
  current: state.currentQuestionIndex + 1,
  total: state.totalQuestions,
  percentage:
    state.totalQuestions > 0
      ? ((state.currentQuestionIndex + 1) / state.totalQuestions) * 100
      : 0,
});

export const selectGameResult = (state: GameState) => ({
  mode: state.mode,
  score: state.score,
  maxChain: state.maxChain,
  correctCount: state.correctCount,
  totalQuestions: state.totalQuestions,
  accuracy:
    state.totalQuestions > 0
      ? Math.round((state.correctCount / state.totalQuestions) * 100)
      : 0,
  answers: state.answers,
  players: state.players,
});
