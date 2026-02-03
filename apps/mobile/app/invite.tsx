import { View, Text, Pressable, Share } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { buttonPressFeedback, playHaptic } from "../src/utils/feedback";

// Design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// App Store URL (replace with actual URL when published)
const APP_STORE_URL = "https://apps.apple.com/app/bighead-quiz/id123456789";

export default function InviteScreen() {
  const handleShare = async () => {
    playHaptic("medium");
    try {
      await Share.share({
        message: `🧠 Challenge me on BigHead Quiz!\n\nTest your knowledge against friends with fun trivia questions.\n\nDownload free: ${APP_STORE_URL}`,
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
        <Text className="text-white text-2xl font-black">INVITE FRIENDS</Text>
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
          Play with Friends!
        </Text>

        {/* Description */}
        <Text
          className="text-center text-base mb-8 px-4"
          style={{ color: COLORS.textMuted }}
        >
          Invite your friends to BigHead Quiz and challenge them to beat your score!
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
          <Text className="text-white font-bold text-lg">Share App</Text>
        </Pressable>

        {/* Features list */}
        <View className="mt-12 px-4">
          <View className="flex-row items-center mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: COLORS.successDim }}
            >
              <Text>✓</Text>
            </View>
            <Text className="text-white flex-1">Challenge friends to quiz battles</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: COLORS.successDim }}
            >
              <Text>✓</Text>
            </View>
            <Text className="text-white flex-1">Compare scores on the leaderboard</Text>
          </View>

          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: COLORS.successDim }}
            >
              <Text>✓</Text>
            </View>
            <Text className="text-white flex-1">Free to play, no account required</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
