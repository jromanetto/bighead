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
import { useTranslation } from "../src/contexts/LanguageContext";
import { completeOnboarding } from "../src/services/settings";
import { redeemReferralCode } from "../src/services/referral";
import { claimMilestone } from "../src/services/universalXp";
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
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [showUsernameStep, setShowUsernameStep] = useState(false);
  const [showReferralStep, setShowReferralStep] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralSuccess, setReferralSuccess] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
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

  // Step 2: from username → referral
  const handleUsernameNext = async () => {
    playHaptic("light");

    // Save username if provided
    if (username.trim().length >= 2) {
      try {
        await updateUsername(username.trim());
      } catch (error) {
        console.error("Error saving username:", error);
      }
    }
    setShowReferralStep(true);
  };

  const mapRedeemError = (err: string): string => {
    switch (err) {
      case "code_not_found":
      case "invalid_code":
        return t("referralErrorInvalid");
      case "self_referral":
        return t("referralErrorSelf");
      case "already_redeemed":
        return t("referralErrorAlready");
      default:
        return t("referralErrorUnknown");
    }
  };

  const handleRedeem = async () => {
    const code = referralCode.trim();
    if (code.length < 4) {
      setReferralError(t("referralErrorInvalid"));
      return;
    }
    setRedeeming(true);
    setReferralError(null);
    try {
      const result = await redeemReferralCode(code);
      if (result.success) {
        playHaptic("success");
        setReferralSuccess(true);
      } else {
        playHaptic("error");
        setReferralError(mapRedeemError(result.error));
      }
    } finally {
      setRedeeming(false);
    }
  };

  const finishOnboarding = async () => {
    playHaptic("success");
    await completeOnboarding(user?.id);
    // Reward onboarding XP — fire and forget, server enforces lifetime dedupe
    claimMilestone("onboarding_complete").catch(() => {});
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
            onPress={handleUsernameNext}
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

  // Referral code step
  if (showReferralStep) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-8 justify-center">
          <View className="items-center mb-8">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: `${COLORS.primary}20` }}
            >
              <Text className="text-5xl">🎁</Text>
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-2">
              {t("referralEnterCode")}
            </Text>
            <Text className="text-gray-400 text-center px-4">
              {t("referralReward")}
            </Text>
          </View>

          {referralSuccess ? (
            <>
              <View
                className="rounded-2xl px-6 py-4 mb-6"
                style={{ backgroundColor: `${COLORS.primary}20` }}
              >
                <Text
                  className="text-center font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  {t("referralApplied")}
                </Text>
              </View>
              <Pressable
                onPress={finishOnboarding}
                className="rounded-2xl py-4"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text
                  className="text-center font-bold text-lg"
                  style={{ color: COLORS.bg }}
                >
                  Let's go!
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <TextInput
                value={referralCode}
                onChangeText={(v) => {
                  setReferralCode(v.toUpperCase());
                  if (referralError) setReferralError(null);
                }}
                placeholder={t("referralEnterPlaceholder")}
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                className="text-white text-xl text-center rounded-2xl px-6 py-4 mb-3"
                style={{ backgroundColor: COLORS.surface, letterSpacing: 2 }}
              />

              {referralError && (
                <Text className="text-red-400 text-center text-sm mb-3">
                  {referralError}
                </Text>
              )}

              <Pressable
                onPress={handleRedeem}
                disabled={redeeming || referralCode.trim().length < 4}
                className="rounded-2xl py-4 mb-3"
                style={{
                  backgroundColor: COLORS.primary,
                  opacity:
                    redeeming || referralCode.trim().length < 4 ? 0.5 : 1,
                }}
              >
                <Text
                  className="text-center font-bold text-lg"
                  style={{ color: COLORS.bg }}
                >
                  {redeeming ? "..." : t("referralRedeem")}
                </Text>
              </Pressable>

              <Pressable onPress={finishOnboarding} className="py-3">
                <Text className="text-center text-gray-400">
                  {t("referralSkip")}
                </Text>
              </Pressable>
            </>
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
