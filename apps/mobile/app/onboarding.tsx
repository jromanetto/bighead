import { View, Text, Pressable, Dimensions, TextInput } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useAuth } from "../src/contexts/AuthContext";
import { completeOnboarding } from "../src/services/settings";
import { playHaptic } from "../src/utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceActive: "#252e33",
  primary: "#00c2cc",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: "🧠",
    title: "Welcome to BIGHEAD",
    description: "The quiz that challenges your brain! Guess the mystery player and become the best.",
    color: "#6366f1",
  },
  {
    icon: "🔥",
    title: "Chain Mode",
    description: "Chain correct answers to multiply your points. The longer your chain, the more you win!",
    color: "#f59e0b",
  },
  {
    icon: "🎉",
    title: "Party Mode",
    description: "Play with your friends locally! Pass the phone around and find out who's the real champion.",
    color: "#ec4899",
  },
  {
    icon: "🏆",
    title: "Climb the leaderboard",
    description: "Earn XP, unlock achievements and rise to the top of the global leaderboard!",
    color: "#22c55e",
  },
];

export default function OnboardingScreen() {
  const { user, updateUsername } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [showUsernameStep, setShowUsernameStep] = useState(false);
  const translateX = useSharedValue(0);

  const goToSlide = (index: number) => {
    playHaptic("light");
    translateX.value = withSpring(-index * width, { damping: 20 });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      // Show username step instead of completing directly
      setShowUsernameStep(true);
    }
  };

  const handleSkip = () => {
    setShowUsernameStep(true);
  };

  const handleComplete = async () => {
    playHaptic("success");

    // Save username if provided
    if (username.trim().length >= 2) {
      try {
        await updateUsername(username.trim());
      } catch (error) {
        console.error("Error saving username:", error);
      }
    }

    await completeOnboarding(user?.id);
    router.replace("/");
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Username step
  if (showUsernameStep) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-8 justify-center">
          <View className="items-center mb-8">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: `${COLORS.primary}20` }}
            >
              <Text className="text-5xl">👤</Text>
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-2">
              What's your name?
            </Text>
            <Text className="text-gray-400 text-center">
              Choose a username for the leaderboard
            </Text>
          </View>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            maxLength={20}
            className="text-white text-xl text-center rounded-2xl px-6 py-4 mb-8"
            style={{ backgroundColor: COLORS.surface }}
          />

          <Pressable
            onPress={handleComplete}
            className="rounded-2xl py-4 mb-4"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              {username.trim().length >= 2 ? "Let's go!" : "Skip for now"}
            </Text>
          </Pressable>

          {username.trim().length < 2 && (
            <Text className="text-gray-500 text-center text-sm">
              You can set your username later in your profile
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1">
        {/* Skip button */}
        <View className="flex-row justify-end px-6 pt-4">
          <Pressable onPress={handleSkip} className="p-2">
            <Text className="text-gray-400">Skip</Text>
          </Pressable>
        </View>

        {/* Slides */}
        <View className="flex-1 overflow-hidden">
          <Animated.View
            style={[{ flexDirection: "row", width: width * slides.length }, animatedStyle]}
          >
            {slides.map((slide, index) => (
              <View
                key={index}
                style={{ width }}
                className="flex-1 items-center justify-center px-8"
              >
                <View
                  className="w-32 h-32 rounded-full items-center justify-center mb-8"
                  style={{ backgroundColor: `${slide.color}20` }}
                >
                  <Text className="text-6xl">{slide.icon}</Text>
                </View>
                <Text className="text-white text-2xl font-bold text-center mb-4">
                  {slide.title}
                </Text>
                <Text className="text-gray-400 text-center text-lg leading-7">
                  {slide.description}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Pagination */}
        <View className="flex-row justify-center mb-8">
          {slides.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => goToSlide(index)}
              className="p-2"
            >
              <View
                className="h-2 rounded-full"
                style={{
                  width: index === currentIndex ? 24 : 8,
                  backgroundColor: index === currentIndex ? COLORS.primary : '#4b5563',
                }}
              />
            </Pressable>
          ))}
        </View>

        {/* Button */}
        <View className="px-6 pb-6">
          <Pressable
            onPress={handleNext}
            className="rounded-xl py-4"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              {currentIndex === slides.length - 1 ? "Continue" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
