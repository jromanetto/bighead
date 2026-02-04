// Rating and feedback service
// Manages rating prompt state and feedback submission

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import Constants from "expo-constants";

const RATING_STORAGE_KEY = "@bighead_rating";

export interface RatingData {
  games_played: number;
  rating_state: "pending" | "rated" | "dismissed" | "feedback_sent";
  rating_milestone: number;
  last_rating_prompt: string | null;
}

const DEFAULT_RATING_DATA: RatingData = {
  games_played: 0,
  rating_state: "pending",
  rating_milestone: 10, // First prompt after 10 games
  last_rating_prompt: null,
};

// Get current rating data from storage
export async function getRatingData(): Promise<RatingData> {
  try {
    const stored = await AsyncStorage.getItem(RATING_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_RATING_DATA, ...JSON.parse(stored) };
    }
    return DEFAULT_RATING_DATA;
  } catch (error) {
    console.error("Error getting rating data:", error);
    return DEFAULT_RATING_DATA;
  }
}

// Save rating data to storage
export async function saveRatingData(data: Partial<RatingData>): Promise<void> {
  try {
    const current = await getRatingData();
    const updated = { ...current, ...data };
    await AsyncStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving rating data:", error);
  }
}

// Increment games played counter
export async function incrementGamesPlayed(): Promise<RatingData> {
  const data = await getRatingData();
  data.games_played += 1;
  await saveRatingData(data);
  return data;
}

// Check if we should show the rating prompt
export async function shouldShowRatingPrompt(): Promise<boolean> {
  const data = await getRatingData();

  // Never show again if user rated 5 stars
  if (data.rating_state === "rated") {
    return false;
  }

  // Show if games_played reached the milestone
  return data.games_played >= data.rating_milestone;
}

// Mark that user gave 5 stars (will open App Store)
export async function markAsRated(): Promise<void> {
  await saveRatingData({
    rating_state: "rated",
    last_rating_prompt: new Date().toISOString(),
  });
}

// Mark that user dismissed or gave < 5 stars
export async function markAsDismissed(): Promise<void> {
  const data = await getRatingData();
  await saveRatingData({
    rating_state: "dismissed",
    rating_milestone: data.rating_milestone + 20, // Ask again after 20 more games
    last_rating_prompt: new Date().toISOString(),
  });
}

// Open native App Store review dialog
export async function requestStoreReview(): Promise<boolean> {
  try {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
      await markAsRated();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error requesting store review:", error);
    return false;
  }
}

// Get device info for feedback
function getDeviceInfo(): string {
  const os = Platform.OS === "ios" ? "iOS" : "Android";
  const version = Platform.Version;
  return `${os} ${version}`;
}

// Get app version
function getAppVersion(): string {
  return Constants.expoConfig?.version || "1.1.0";
}

// Submit feedback to backend
export async function submitFeedback(
  rating: number,
  feedbackText?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("submit-feedback", {
      body: {
        rating,
        feedback_text: feedbackText,
        app_version: getAppVersion(),
        device_info: getDeviceInfo(),
      },
    });

    if (error) {
      console.error("Feedback submission error:", error);
      return { success: false, error: error.message };
    }

    // Mark as dismissed so we ask again later
    await markAsDismissed();

    return { success: true };
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    return { success: false, error: error.message };
  }
}
