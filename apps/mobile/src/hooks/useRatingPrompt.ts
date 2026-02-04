// Hook for managing the rating prompt
// Call checkAndShowRating() after game completion

import { useState, useCallback, useRef } from "react";
import {
  incrementGamesPlayed,
  shouldShowRatingPrompt,
  getRatingData,
  type RatingData,
} from "../services/rating";

interface UseRatingPromptReturn {
  showRatingModal: boolean;
  ratingData: RatingData | null;
  openRatingModal: () => void;
  closeRatingModal: () => void;
  checkAndShowRating: () => Promise<boolean>;
}

export function useRatingPrompt(): UseRatingPromptReturn {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const checkingRef = useRef(false);

  const openRatingModal = useCallback(() => {
    setShowRatingModal(true);
  }, []);

  const closeRatingModal = useCallback(() => {
    setShowRatingModal(false);
  }, []);

  // Call this after a game ends
  const checkAndShowRating = useCallback(async (): Promise<boolean> => {
    // Prevent multiple simultaneous checks
    if (checkingRef.current) {
      return false;
    }

    checkingRef.current = true;

    try {
      // Increment games played
      const data = await incrementGamesPlayed();
      setRatingData(data);

      // Check if we should show the prompt
      const shouldShow = await shouldShowRatingPrompt();

      if (shouldShow) {
        // Small delay so it doesn't feel too aggressive
        setTimeout(() => {
          setShowRatingModal(true);
        }, 1500);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking rating prompt:", error);
      return false;
    } finally {
      checkingRef.current = false;
    }
  }, []);

  return {
    showRatingModal,
    ratingData,
    openRatingModal,
    closeRatingModal,
    checkAndShowRating,
  };
}
