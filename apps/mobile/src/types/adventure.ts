/**
 * Adventure Mode Types
 * Montagne de la Connaissance
 */

// Character-based tiers (8 tiers × 3 levels = 24 total levels)
export type Tier =
  | 'homer'
  | 'mario'
  | 'sherlock'
  | 'tony'
  | 'gandalf'
  | 'yoda'
  | 'leonardo'
  | 'einstein';

// All categories
export type Category =
  | 'culture_generale'
  | 'histoire'
  | 'geographie'
  | 'sciences'
  | 'sport'
  | 'pop_culture'
  | 'jeux_video'
  | 'cinema'
  | 'musique'
  | 'technologie'
  | 'logo';

// Category display info
export interface CategoryInfo {
  code: Category;
  name: string;
  nameFr: string;
  icon: string;
  color: string;
}

// All categories with display info
export const CATEGORIES: CategoryInfo[] = [
  { code: 'culture_generale', name: 'General Knowledge', nameFr: 'Culture Générale', icon: '🎯', color: '#00c2cc' },
  { code: 'histoire', name: 'History', nameFr: 'Histoire', icon: '📜', color: '#f59e0b' },
  { code: 'geographie', name: 'Geography', nameFr: 'Géographie', icon: '🌍', color: '#22c55e' },
  { code: 'sciences', name: 'Sciences', nameFr: 'Sciences', icon: '🔬', color: '#8b5cf6' },
  { code: 'sport', name: 'Sports', nameFr: 'Sport', icon: '⚽', color: '#ef4444' },
  { code: 'pop_culture', name: 'Pop Culture', nameFr: 'Pop Culture', icon: '🌟', color: '#ec4899' },
  { code: 'jeux_video', name: 'Video Games', nameFr: 'Jeux Vidéo', icon: '🎮', color: '#6366f1' },
  { code: 'cinema', name: 'Movies & Series', nameFr: 'Cinéma & Séries', icon: '🎬', color: '#f97316' },
  { code: 'musique', name: 'Music', nameFr: 'Musique', icon: '🎵', color: '#14b8a6' },
  { code: 'technologie', name: 'Technology', nameFr: 'Technologie', icon: '💻', color: '#64748b' },
  { code: 'logo', name: 'Logos', nameFr: 'Logo', icon: '🏷️', color: '#a855f7' },
];

// Tier display info
export interface TierInfo {
  code: Tier;
  name: string;
  nameFr: string;
  color: string;
  bgColor: string;
  description: string;
  icon: string;
}

export const TIERS: TierInfo[] = [
  { code: 'homer', name: 'Homer Simpson', nameFr: 'Homer Simpson', color: '#FFD93D', bgColor: '#FFF8DC', description: 'Débutant', icon: '🥨' },
  { code: 'mario', name: 'Mario', nameFr: 'Mario', color: '#E52521', bgColor: '#FFE4E1', description: 'Novice', icon: '🍄' },
  { code: 'sherlock', name: 'Sherlock Holmes', nameFr: 'Sherlock Holmes', color: '#8B4513', bgColor: '#F5E6D3', description: 'Amateur', icon: '🔍' },
  { code: 'tony', name: 'Tony Stark', nameFr: 'Tony Stark', color: '#8B0000', bgColor: '#FFE4E1', description: 'Confirmé', icon: '🤖' },
  { code: 'gandalf', name: 'Gandalf', nameFr: 'Gandalf', color: '#808080', bgColor: '#F0F0F0', description: 'Expérimenté', icon: '🧙‍♂️' },
  { code: 'yoda', name: 'Yoda', nameFr: 'Yoda', color: '#228B22', bgColor: '#E8F5E9', description: 'Expert', icon: '🌌' },
  { code: 'leonardo', name: 'Leonardo da Vinci', nameFr: 'Leonardo da Vinci', color: '#FFD700', bgColor: '#FFF8DC', description: 'Maître', icon: '🎨' },
  { code: 'einstein', name: 'Albert Einstein', nameFr: 'Albert Einstein', color: '#4169E1', bgColor: '#E6E6FA', description: 'Légende', icon: '🧠' },
];

// User progress
export interface AdventureProgress {
  id?: string;
  user_id: string;
  tier: Tier;
  level: 1 | 2 | 3;
  completed_categories: Category[];
  created_at?: string;
  updated_at?: string;
}

// Daily attempts
export interface DailyAttempts {
  id?: string;
  user_id: string;
  date: string;
  attempts_used: number;
  created_at?: string;
}

// Constants
export const MAX_FREE_ATTEMPTS = 2;
export const QUESTIONS_PER_CATEGORY = 10; // Default, use getQuestionsForTier() instead
export const MAX_ERRORS_ALLOWED = 1; // 2 errors = fail

// Tiered question counts for progressive difficulty
export type TierDifficulty = 'easy' | 'medium' | 'hard';

// In the new system, difficulty is determined by the level (1=easy, 2=medium, 3=hard), not the tier
// This map is kept for backward compatibility
export const TIER_DIFFICULTY_MAP: Record<Tier, TierDifficulty> = {
  homer: 'easy',
  mario: 'easy',
  sherlock: 'easy',
  tony: 'medium',
  gandalf: 'medium',
  yoda: 'medium',
  leonardo: 'hard',
  einstein: 'hard',
};

// Level to difficulty mapping (new system)
export const LEVEL_DIFFICULTY_MAP: Record<1 | 2 | 3, TierDifficulty> = {
  1: 'easy',
  2: 'medium',
  3: 'hard',
};

export const QUESTIONS_BY_DIFFICULTY: Record<TierDifficulty, number> = {
  easy: 5,
  medium: 8,
  hard: 10,
};

/**
 * Get the number of questions based on level
 * Level 1 (Easy): 5 questions
 * Level 2 (Medium): 8 questions
 * Level 3 (Hard): 10 questions
 */
export function getQuestionsForLevel(level: 1 | 2 | 3): number {
  const difficulty = LEVEL_DIFFICULTY_MAP[level];
  return QUESTIONS_BY_DIFFICULTY[difficulty];
}

/**
 * Get the number of questions for a specific tier (legacy support)
 * Now uses level-based difficulty
 */
export function getQuestionsForTier(tier: Tier, level: 1 | 2 | 3 = 1): number {
  return getQuestionsForLevel(level);
}

/**
 * Get the difficulty based on level
 */
export function getLevelDifficulty(level: 1 | 2 | 3): TierDifficulty {
  return LEVEL_DIFFICULTY_MAP[level];
}

/**
 * Get the tier difficulty level (legacy - returns based on tier position)
 */
export function getTierDifficulty(tier: Tier): TierDifficulty {
  return TIER_DIFFICULTY_MAP[tier];
}

// Helper functions
export function getTierInfo(tier: Tier): TierInfo {
  return TIERS.find(t => t.code === tier) || TIERS[0];
}

export function getCategoryInfo(category: Category): CategoryInfo {
  return CATEGORIES.find(c => c.code === category) || CATEGORIES[0];
}

export function getNextTier(tier: Tier): Tier | null {
  const index = TIERS.findIndex(t => t.code === tier);
  if (index < TIERS.length - 1) {
    return TIERS[index + 1].code;
  }
  return null;
}

export function getNextLevel(tier: Tier, level: 1 | 2 | 3): { tier: Tier; level: 1 | 2 | 3 } | null {
  if (level < 3) {
    return { tier, level: (level + 1) as 1 | 2 | 3 };
  }
  const nextTier = getNextTier(tier);
  if (nextTier) {
    return { tier: nextTier, level: 1 };
  }
  return null; // Already at max
}

export function getTotalLevels(): number {
  return TIERS.length * 3; // 8 tiers * 3 levels = 24
}

export function getCurrentLevelNumber(tier: Tier, level: 1 | 2 | 3): number {
  const tierIndex = TIERS.findIndex(t => t.code === tier);
  return tierIndex * 3 + level;
}

// Family mode types
export type AgeGroup = 6 | 8 | 10 | 12 | 14 | 16 | 18 | 99;
export type QuestionCount = 10 | 20 | 30 | 'unlimited';

export interface FamilyGameConfig {
  min_age: AgeGroup;
  question_count: QuestionCount;
  category: Category | 'mix';
}

export interface FamilyGameState {
  config: FamilyGameConfig;
  current_question: number;
  score: number;
  is_answer_revealed: boolean;
}

export const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 6, label: '6 ans' },
  { value: 8, label: '8 ans' },
  { value: 10, label: '10 ans' },
  { value: 12, label: '12 ans' },
  { value: 14, label: '14 ans' },
  { value: 16, label: '16 ans' },
  { value: 18, label: '18 ans' },
  { value: 99, label: 'Adulte' },
];

export const QUESTION_COUNTS: { value: QuestionCount; label: string }[] = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
  { value: 'unlimited', label: 'Illimité' },
];
