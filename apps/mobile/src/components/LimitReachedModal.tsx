/**
 * LimitReachedModal
 * Shows when user has used all their free daily plays for a mode
 */

import React, { useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { View, Text, Pressable } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useTranslation } from "../contexts/LanguageContext";
import { GameMode, DAILY_LIMITS } from "../services/dailyLimits";

export interface LimitReachedModalRef {
  open: (mode: GameMode) => void;
  close: () => void;
}

interface LimitReachedModalProps {
  onClose?: () => void;
}

// Mode display names mapping
const MODE_NAMES: Record<GameMode, { en: string; fr: string }> = {
  adventure: { en: "Adventure", fr: "Aventure" },
  solo_run: { en: "Solo Run", fr: "Solo Run" },
  family: { en: "Family", fr: "Famille" },
  party: { en: "Party", fr: "Party" },
  versus: { en: "Versus", fr: "Versus" },
};

export const LimitReachedModal = forwardRef<LimitReachedModalRef, LimitReachedModalProps>(
  ({ onClose }, ref) => {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [currentMode, setCurrentMode] = React.useState<GameMode>("adventure");

    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["50%"], []);

    useImperativeHandle(ref, () => ({
      open: (mode: GameMode) => {
        setCurrentMode(mode);
        bottomSheetRef.current?.expand();
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
    }));

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.7}
        />
      ),
      []
    );

    const handleClose = () => {
      bottomSheetRef.current?.close();
      onClose?.();
    };

    const handleGoPremium = () => {
      bottomSheetRef.current?.close();
      router.push("/premium");
    };

    const modeName = MODE_NAMES[currentMode]?.[language] || currentMode;
    const limit = DAILY_LIMITS[currentMode];

    // Build the message with mode name interpolation
    const getMessage = () => {
      const template = t("limitReachedMessage");
      return template.replace("{{mode}}", modeName);
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: "#1E2529" }}
        handleIndicatorStyle={{ backgroundColor: "#6b7280" }}
        onClose={onClose}
      >
        <BottomSheetView className="flex-1 px-6 pt-4 items-center">
          {/* Emoji */}
          <Text className="text-6xl mb-4">😅</Text>

          {/* Title */}
          <Text className="text-white text-2xl font-bold mb-3 text-center">
            {t("limitReached")}
          </Text>

          {/* Message */}
          <Text className="text-gray-400 text-center text-base mb-2">
            {getMessage()}
          </Text>

          {/* Usage indicator */}
          <View className="flex-row items-center justify-center mb-6">
            <View className="bg-gray-700 rounded-full px-4 py-2">
              <Text className="text-gray-300">
                {limit}/{limit} {t("playsUsed")}
              </Text>
            </View>
          </View>

          {/* Primary button - Go Premium */}
          <Pressable
            onPress={handleGoPremium}
            className="w-full bg-amber-500 py-4 rounded-2xl mb-3 active:opacity-80"
          >
            <Text className="text-white text-center font-bold text-lg">
              👑 {t("goPremiumNow")}
            </Text>
          </Pressable>

          {/* Secondary button - Come back tomorrow */}
          <Pressable
            onPress={handleClose}
            className="w-full bg-gray-700 py-4 rounded-2xl active:opacity-80"
          >
            <Text className="text-gray-300 text-center font-semibold text-base">
              {t("comeBackTomorrow")}
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

LimitReachedModal.displayName = "LimitReachedModal";
