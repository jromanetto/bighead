/**
 * Daily Limits Service
 * Manages free tier daily play limits using AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTodayIsoDate } from "../utils/dates";

const STORAGE_KEY = "daily_usage";
const FIRST_SEEN_KEY = "first_seen_at"; // epoch ms du 1er lancement, pour la période de grâce

// Période de grâce "nouveau joueur" : pas de plafond gratuit pendant les
// premiers jours après l'install. On ne colle JAMAIS un paywall le jour de
// l'installation — avant qu'une habitude existe, le mur tue la rétention.
export const GRACE_DAYS = 7;

// Limits per mode for free users
export const DAILY_LIMITS = {
  adventure: 2,
  solo_run: 2,
  family: 3,
  party: 2,
  versus: 3,
} as const;

/**
 * Pure & testable : le joueur est-il encore dans sa période de grâce ?
 */
export const isWithinGracePeriod = (
  firstSeenMs: number,
  nowMs: number,
  graceDays: number = GRACE_DAYS,
): boolean => nowMs - firstSeenMs < graceDays * 24 * 60 * 60 * 1000;

/**
 * Récupère (et pose au 1er appel) l'horodatage du premier lancement.
 */
const ensureFirstSeen = async (): Promise<number> => {
  try {
    const stored = await AsyncStorage.getItem(FIRST_SEEN_KEY);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!Number.isNaN(n)) return n;
    }
    const now = Date.now();
    await AsyncStorage.setItem(FIRST_SEEN_KEY, String(now));
    return now;
  } catch {
    return Date.now();
  }
};

/**
 * Le joueur bénéficie-t-il encore de la grâce nouveau-joueur ?
 */
export const inGracePeriod = async (): Promise<boolean> => {
  const firstSeen = await ensureFirstSeen();
  return isWithinGracePeriod(firstSeen, Date.now());
};

export type GameMode = keyof typeof DAILY_LIMITS;

interface DailyUsage {
  date: string; // YYYY-MM-DD format
  adventure: number;
  solo_run: number;
  family: number;
  party: number;
  versus: number;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = (): string => getTodayIsoDate();

/**
 * Get default empty usage object for today
 */
const getDefaultUsage = (): DailyUsage => ({
  date: getTodayDate(),
  adventure: 0,
  solo_run: 0,
  family: 0,
  party: 0,
  versus: 0,
});

/**
 * Load usage from storage, reset if new day
 */
const loadUsage = async (): Promise<DailyUsage> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultUsage();
    }

    const usage: DailyUsage = JSON.parse(stored);

    // Reset if it's a new day
    if (usage.date !== getTodayDate()) {
      const newUsage = getDefaultUsage();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      return newUsage;
    }

    return usage;
  } catch (error) {
    console.error("Error loading daily usage:", error);
    return getDefaultUsage();
  }
};

/**
 * Save usage to storage
 */
const saveUsage = async (usage: DailyUsage): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error("Error saving daily usage:", error);
  }
};

/**
 * Check if user can play a specific mode (has remaining plays)
 */
export const canPlay = async (mode: GameMode): Promise<boolean> => {
  if (await inGracePeriod()) return true; // nouveau joueur : illimité
  const usage = await loadUsage();
  const used = usage[mode];
  const limit = DAILY_LIMITS[mode];
  return used < limit;
};

/**
 * Get remaining plays for a specific mode
 */
export const getRemainingPlays = async (mode: GameMode): Promise<number> => {
  if (await inGracePeriod()) return 99; // grâce nouveau-joueur : "illimité"
  const usage = await loadUsage();
  const used = usage[mode];
  const limit = DAILY_LIMITS[mode];
  return Math.max(0, limit - used);
};

/**
 * Record a play for a specific mode (increment counter)
 * Call this after a game is completed
 */
export const recordPlay = async (mode: GameMode): Promise<void> => {
  const usage = await loadUsage();
  usage[mode] = (usage[mode] || 0) + 1;
  await saveUsage(usage);
};

/**
 * Get all limits with current usage
 * Returns object with used/max for each mode
 */
export const getAllLimits = async (): Promise<
  Record<GameMode, { used: number; max: number; remaining: number }>
> => {
  const usage = await loadUsage();
  const grace = await inGracePeriod();
  const rem = (mode: GameMode) =>
    grace ? 99 : Math.max(0, DAILY_LIMITS[mode] - usage[mode]);

  return {
    adventure: { used: usage.adventure, max: DAILY_LIMITS.adventure, remaining: rem("adventure") },
    solo_run: { used: usage.solo_run, max: DAILY_LIMITS.solo_run, remaining: rem("solo_run") },
    family: { used: usage.family, max: DAILY_LIMITS.family, remaining: rem("family") },
    party: { used: usage.party, max: DAILY_LIMITS.party, remaining: rem("party") },
    versus: { used: usage.versus, max: DAILY_LIMITS.versus, remaining: rem("versus") },
  };
};

/**
 * Reset all limits (for testing or premium upgrade)
 */
export const resetAllLimits = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

/**
 * Check if user should see limit warning (1 play remaining)
 */
export const shouldShowLimitWarning = async (mode: GameMode): Promise<boolean> => {
  const remaining = await getRemainingPlays(mode);
  return remaining === 1;
};
