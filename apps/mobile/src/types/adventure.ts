/**
 * Adventure Mode Types
 * Montagne de la Connaissance
 */

// Difficulty tiers (11 tiers × 3 levels = 33 total levels)
export type Tier =
  | 'coton'
  | 'carton'
  | 'bois'
  | 'bronze'
  | 'argent'
  | 'gold'
  | 'platinium'
  | 'titane'
  | 'diamant'
  | 'mythique'
  | 'legendaire';

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
  { code: 'coton', name: 'Cotton', nameFr: 'Coton', color: '#f0f0f0', bgColor: '#e8f4f8', description: 'Débutant', icon: '🌱' },
  { code: 'carton', name: 'Cardboard', nameFr: 'Carton', color: '#c4a35a', bgColor: '#f5f0e1', description: 'Novice', icon: '📦' },
  { code: 'bois', name: 'Wood', nameFr: 'Bois', color: '#8B4513', bgColor: '#f5e6d3', description: 'Amateur', icon: '🪵' },
  { code: 'bronze', name: 'Bronze', nameFr: 'Bronze', color: '#CD7F32', bgColor: '#f5ebe0', description: 'Confirmé', icon: '🥉' },
  { code: 'argent', name: 'Silver', nameFr: 'Argent', color: '#C0C0C0', bgColor: '#f0f0f0', description: 'Expérimenté', icon: '🥈' },
  { code: 'gold', name: 'Gold', nameFr: 'Gold', color: '#FFD700', bgColor: '#fff8dc', description: 'Avancé', icon: '🥇' },
  { code: 'platinium', name: 'Platinum', nameFr: 'Platinium', color: '#E5E4E2', bgColor: '#f8f8f8', description: 'Expert', icon: '💎' },
  { code: 'titane', name: 'Titanium', nameFr: 'Titane', color: '#878681', bgColor: '#e8e8e6', description: 'Maître', icon: '⚙️' },
  { code: 'diamant', name: 'Diamond', nameFr: 'Diamant', color: '#b9f2ff', bgColor: '#e6faff', description: 'Champion', icon: '💠' },
  { code: 'mythique', name: 'Mythic', nameFr: 'Mythique', color: '#9b59b6', bgColor: '#f3e5f5', description: 'Héros', icon: '🔮' },
  { code: 'legendaire', name: 'Legendary', nameFr: 'Légendaire', color: '#ff6b35', bgColor: '#fff0eb', description: 'Légende', icon: '🏆' },
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
export const QUESTIONS_PER_CATEGORY = 10;
export const MAX_ERRORS_ALLOWED = 1; // 2 errors = fail

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
  return TIERS.length * 3; // 11 tiers * 3 levels = 33
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
