import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserSettings {
  id?: string;
  user_id?: string;
  sound_enabled: boolean;
  haptic_enabled: boolean;
  notifications_enabled: boolean;
  language: string;
  theme: string;
  onboarding_completed: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  sound_enabled: true,
  haptic_enabled: true,
  notifications_enabled: true,
  language: "fr",
  theme: "dark",
  onboarding_completed: false,
};

const LOCAL_SETTINGS_KEY = "@bighead_settings";

/**
 * Get user settings (from Supabase if logged in, otherwise from local storage)
 */
export const getSettings = async (userId?: string): Promise<UserSettings> => {
  // Try to get from Supabase if user is logged in
  if (userId) {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      return data as UserSettings;
    }
  }

  // Fallback to local storage
  try {
    const localSettings = await AsyncStorage.getItem(LOCAL_SETTINGS_KEY);
    if (localSettings) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localSettings) };
    }
  } catch (error) {
    console.error("Error reading local settings:", error);
  }

  return DEFAULT_SETTINGS;
};

/**
 * Save user settings
 */
export const saveSettings = async (
  settings: Partial<UserSettings>,
  userId?: string
): Promise<UserSettings> => {
  const currentSettings = await getSettings(userId);
  const newSettings = { ...currentSettings, ...settings };

  // Save to Supabase if user is logged in
  if (userId) {
    const { data, error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        ...newSettings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserSettings;
  }

  // Save to local storage for anonymous users
  try {
    await AsyncStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.error("Error saving local settings:", error);
  }

  return newSettings;
};

/**
 * Mark onboarding as completed
 */
export const completeOnboarding = async (userId?: string): Promise<void> => {
  await saveSettings({ onboarding_completed: true }, userId);
};

/**
 * Check if onboarding is completed
 */
export const isOnboardingCompleted = async (userId?: string): Promise<boolean> => {
  const settings = await getSettings(userId);
  return settings.onboarding_completed;
};

/**
 * Sync local settings to Supabase when user logs in
 */
export const syncSettingsToCloud = async (userId: string): Promise<void> => {
  try {
    const localSettings = await AsyncStorage.getItem(LOCAL_SETTINGS_KEY);
    if (localSettings) {
      const settings = JSON.parse(localSettings);
      await saveSettings(settings, userId);
    }
  } catch (error) {
    console.error("Error syncing settings:", error);
  }
};
