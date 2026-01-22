import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { getSettings } from "../services/settings";

// Sound cache
let sounds: { [key: string]: Audio.Sound | null } = {};

// Settings cache
let settingsCache: { sound: boolean; haptic: boolean } | null = null;

/**
 * Load settings into cache
 */
export const loadFeedbackSettings = async (userId?: string) => {
  const settings = await getSettings(userId);
  settingsCache = {
    sound: settings.sound_enabled,
    haptic: settings.haptic_enabled,
  };
};

/**
 * Play haptic feedback
 */
export const playHaptic = async (
  type: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light"
) => {
  if (settingsCache && !settingsCache.haptic) return;

  try {
    switch (type) {
      case "light":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "warning":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "error":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Haptics might not be available on all devices
    console.log("Haptics not available");
  }
};

/**
 * Load a sound file
 */
const loadSound = async (name: string, uri: string): Promise<Audio.Sound | null> => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    sounds[name] = sound;
    return sound;
  } catch (error) {
    console.error(`Error loading sound ${name}:`, error);
    return null;
  }
};

/**
 * Play a sound effect
 */
export const playSound = async (
  type: "correct" | "wrong" | "tick" | "success" | "levelup" | "achievement"
) => {
  if (settingsCache && !settingsCache.sound) return;

  // For now, we'll just use haptics as a fallback
  // In a real app, you'd load actual sound files
  switch (type) {
    case "correct":
      await playHaptic("success");
      break;
    case "wrong":
      await playHaptic("error");
      break;
    case "tick":
      await playHaptic("light");
      break;
    case "success":
      await playHaptic("success");
      break;
    case "levelup":
      await playHaptic("heavy");
      break;
    case "achievement":
      await playHaptic("success");
      break;
  }
};

/**
 * Feedback for correct answer
 */
export const correctAnswerFeedback = async () => {
  await Promise.all([
    playHaptic("success"),
    playSound("correct"),
  ]);
};

/**
 * Feedback for wrong answer
 */
export const wrongAnswerFeedback = async () => {
  await Promise.all([
    playHaptic("error"),
    playSound("wrong"),
  ]);
};

/**
 * Feedback for button press
 */
export const buttonPressFeedback = async () => {
  await playHaptic("light");
};

/**
 * Feedback for level up
 */
export const levelUpFeedback = async () => {
  await Promise.all([
    playHaptic("heavy"),
    playSound("levelup"),
  ]);
};

/**
 * Feedback for achievement unlocked
 */
export const achievementFeedback = async () => {
  await Promise.all([
    playHaptic("success"),
    playSound("achievement"),
  ]);
};

/**
 * Cleanup sounds when app closes
 */
export const unloadSounds = async () => {
  for (const sound of Object.values(sounds)) {
    if (sound) {
      await sound.unloadAsync();
    }
  }
  sounds = {};
};
