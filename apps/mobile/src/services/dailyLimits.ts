/**
 * Daily Limits Service
 * Manages free tier daily play limits using AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "daily_usage";

// Limits per mode for free users
export const DAILY_LIMITS = {
  adventure: 2,
  solo_run: 2,
  family: 3,
  party: 2,
  versus: 3,
} as const;

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
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

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
  const usage = await loadUsage();
  const used = usage[mode];
  const limit = DAILY_LIMITS[mode];
  return used < limit;
};

/**
 * Get remaining plays for a specific mode
 */
export const getRemainingPlays = async (mode: GameMode): Promise<number> => {
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

  return {
    adventure: {
      used: usage.adventure,
      max: DAILY_LIMITS.adventure,
      remaining: Math.max(0, DAILY_LIMITS.adventure - usage.adventure),
    },
    solo_run: {
      used: usage.solo_run,
      max: DAILY_LIMITS.solo_run,
      remaining: Math.max(0, DAILY_LIMITS.solo_run - usage.solo_run),
    },
    family: {
      used: usage.family,
      max: DAILY_LIMITS.family,
      remaining: Math.max(0, DAILY_LIMITS.family - usage.family),
    },
    party: {
      used: usage.party,
      max: DAILY_LIMITS.party,
      remaining: Math.max(0, DAILY_LIMITS.party - usage.party),
    },
    versus: {
      used: usage.versus,
      max: DAILY_LIMITS.versus,
      remaining: Math.max(0, DAILY_LIMITS.versus - usage.versus),
    },
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
