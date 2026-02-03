import { View, Text, Pressable, Share } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { buttonPressFeedback, playHaptic } from "../src/utils/feedback";
import { useTranslation } from "../src/contexts/LanguageContext";

// Design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// App Store URL (replace with actual URL when published)
const APP_STORE_URL = "https://apps.apple.com/app/bighead-quiz/id123456789";

export default function InviteScreen() {
  const { t } = useTranslation();

  const handleShare = async () => {
    playHaptic("medium");
    try {
      await Share.share({
        message: `🧠 ${t("inviteDescription")}\n\n${APP_STORE_URL}`,
        url: APP_STORE_URL,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 mb-6">
        <Pressable
          onPress={() => {
            buttonPressFeedback();
            router.back();
          }}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-white text-lg">←</Text>
        </Pressable>
        <Text className="text-white text-2xl font-black">{t("inviteFriends").toUpperCase()}</Text>
      </View>

      <View className="flex-1 px-5 items-center justify-center">
        {/* Main illustration */}
        <View
          className="w-32 h-32 rounded-full items-center justify-center mb-8"
          style={{ backgroundColor: COLORS.primaryDim }}
        >
          <Text className="text-6xl">🎮</Text>
        </View>

        {/* Title */}
        <Text className="text-white text-2xl font-bold text-center mb-3">
          {t("playWithFriends")}
        </Text>

        {/* Description */}
        <Text
          className="text-center text-base mb-8 px-4"
          style={{ color: COLORS.textMuted }}
        >
          {t("inviteDescription")}
        </Text>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          className="flex-row items-center justify-center px-8 py-4 rounded-2xl active:opacity-90"
          style={{
            backgroundColor: COLORS.primary,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
          }}
        >
          <Text className="text-2xl mr-3">📤</Text>
          <Text className="text-white font-bold text-lg">{t("shareApp")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
