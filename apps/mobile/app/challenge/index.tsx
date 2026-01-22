import { View, Text, Pressable, TextInput, ScrollView, Share, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/contexts/AuthContext";
import { createFriendChallenge, getFriendChallenge } from "../../src/services/friendChallenge";
import { buttonPressFeedback, playHaptic } from "../../src/utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  yellow: "#FFD100",
  green: "#22c55e",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const CATEGORIES = [
  { id: "general", name: "General", icon: "🧠", color: COLORS.primary },
  { id: "history", name: "History", icon: "📜", color: COLORS.yellow },
  { id: "geography", name: "Geography", icon: "🌍", color: COLORS.green },
  { id: "science", name: "Science", icon: "🔬", color: COLORS.purple },
  { id: "sports", name: "Sports", icon: "⚽", color: COLORS.coral },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#f472b6" },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function FriendChallengeScreen() {
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [questionCount, setQuestionCount] = useState(10);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdChallenge, setCreatedChallenge] = useState<{
    code: string;
    shareUrl: string;
  } | null>(null);

  const handleCreateChallenge = async () => {
    if (!user) {
      setError("You need to be logged in to create a challenge");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createFriendChallenge(
        user.id,
        selectedCategory,
        questionCount,
        15,
        "en"
      );

      if (result) {
        setCreatedChallenge({
          code: result.code,
          shareUrl: result.shareUrl,
        });
        playHaptic("success");
      } else {
        setError("Failed to create challenge. Please try again.");
      }
    } catch (err) {
      console.error("Error creating challenge:", err);
      setError("Failed to create challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!joinCode.trim()) {
      setError("Please enter a challenge code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const challenge = await getFriendChallenge(joinCode.trim().toUpperCase());

      if (challenge) {
        playHaptic("success");
        router.push({
          pathname: "/challenge/play",
          params: { code: joinCode.trim().toUpperCase() },
        });
      } else {
        setError("Challenge not found. Check the code and try again.");
      }
    } catch (err) {
      console.error("Error joining challenge:", err);
      setError("Failed to join challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!createdChallenge) return;

    try {
      await Share.share({
        message: `Challenge me in BigHead! 🧠\n\nUse code: ${createdChallenge.code}\n\nOr click: ${createdChallenge.shareUrl}`,
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handlePlayChallenge = () => {
    if (!createdChallenge) return;
    router.push({
      pathname: "/challenge/play",
      params: { code: createdChallenge.code },
    });
  };

  // Main Menu
  if (mode === "menu") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-6 pt-4">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.back();
              }}
              className="mr-4"
            >
              <Text className="text-white text-2xl">←</Text>
            </Pressable>
            <Text className="text-white text-2xl font-black">Friend Challenge</Text>
          </View>

          {/* Hero Section */}
          <View className="items-center mb-10">
            <Text className="text-6xl mb-4">🤝</Text>
            <Text className="text-white text-xl font-bold text-center mb-2">
              Challenge Your Friends
            </Text>
            <Text style={{ color: COLORS.textMuted }} className="text-center px-4">
              Create a challenge and share it with friends, or join one with a code!
            </Text>
          </View>

          {/* Action Cards */}
          <View className="gap-4">
            {/* Create Challenge */}
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                setMode("create");
              }}
              className="rounded-2xl overflow-hidden active:opacity-90"
            >
              <LinearGradient
                colors={[COLORS.primary, "#0891b2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-3xl mb-2">🎯</Text>
                    <Text className="text-white text-xl font-bold mb-1">
                      Create Challenge
                    </Text>
                    <Text className="text-white/70 text-sm">
                      Pick a category and share the code
                    </Text>
                  </View>
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Text className="text-white text-xl">→</Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Join Challenge */}
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                setMode("join");
              }}
              className="rounded-2xl overflow-hidden active:opacity-90"
            >
              <LinearGradient
                colors={[COLORS.purple, "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-3xl mb-2">🎟️</Text>
                    <Text className="text-white text-xl font-bold mb-1">
                      Join Challenge
                    </Text>
                    <Text className="text-white/70 text-sm">
                      Enter a code to compete
                    </Text>
                  </View>
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Text className="text-white text-xl">→</Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Recent Challenges */}
          <View className="mt-8">
            <Text className="text-white font-bold mb-4">How it works</Text>
            <View
              className="rounded-xl p-4"
              style={{ backgroundColor: COLORS.surface }}
            >
              <View className="flex-row items-start gap-3 mb-3">
                <Text className="text-lg">1️⃣</Text>
                <Text style={{ color: COLORS.textMuted }} className="flex-1">
                  Create a challenge and pick your category
                </Text>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Text className="text-lg">2️⃣</Text>
                <Text style={{ color: COLORS.textMuted }} className="flex-1">
                  Share the code with your friends
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <Text className="text-lg">3️⃣</Text>
                <Text style={{ color: COLORS.textMuted }} className="flex-1">
                  Compare scores on the leaderboard!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Create Challenge Screen
  if (mode === "create") {
    if (createdChallenge) {
      return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
          <View className="flex-1 px-6 pt-4 items-center justify-center">
            {/* Success */}
            <View className="items-center mb-8">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${COLORS.green}20` }}
              >
                <Text className="text-5xl">✅</Text>
              </View>
              <Text className="text-white text-2xl font-bold mb-2">
                Challenge Created!
              </Text>
              <Text style={{ color: COLORS.textMuted }} className="text-center">
                Share this code with your friends
              </Text>
            </View>

            {/* Code Display */}
            <View
              className="w-full rounded-2xl p-6 items-center mb-6"
              style={{ backgroundColor: COLORS.surface }}
            >
              <Text style={{ color: COLORS.textMuted }} className="mb-2">
                Challenge Code
              </Text>
              <Text
                className="text-4xl font-black tracking-widest mb-4"
                style={{ color: COLORS.primary }}
              >
                {createdChallenge.code}
              </Text>
              <Pressable
                onPress={handleShare}
                className="flex-row items-center gap-2 px-6 py-3 rounded-xl"
                style={{ backgroundColor: COLORS.surfaceLight }}
              >
                <Text className="text-lg">📤</Text>
                <Text className="text-white font-bold">Share with Friends</Text>
              </Pressable>
            </View>

            {/* Actions */}
            <View className="w-full gap-3">
              <Pressable
                onPress={handlePlayChallenge}
                className="w-full rounded-xl py-4"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text
                  className="text-center font-bold text-lg"
                  style={{ color: COLORS.bg }}
                >
                  Play Now
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  setCreatedChallenge(null);
                  setMode("menu");
                }}
                className="w-full py-4"
              >
                <Text className="text-center text-white">Back to Menu</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <ScrollView className="flex-1" contentContainerClassName="px-6 pt-4 pb-8">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                setMode("menu");
                setError(null);
              }}
              className="mr-4"
            >
              <Text className="text-white text-2xl">←</Text>
            </Pressable>
            <Text className="text-white text-2xl font-black">Create Challenge</Text>
          </View>

          {/* Category Selection */}
          <View className="mb-6">
            <Text className="text-white font-bold mb-3">Choose Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    buttonPressFeedback();
                    setSelectedCategory(cat.id);
                  }}
                  className="px-4 py-3 rounded-xl flex-row items-center gap-2"
                  style={{
                    backgroundColor:
                      selectedCategory === cat.id ? cat.color : COLORS.surface,
                    borderWidth: 2,
                    borderColor:
                      selectedCategory === cat.id ? cat.color : "transparent",
                  }}
                >
                  <Text className="text-lg">{cat.icon}</Text>
                  <Text
                    className="font-medium"
                    style={{
                      color: selectedCategory === cat.id ? COLORS.bg : COLORS.text,
                    }}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Question Count */}
          <View className="mb-6">
            <Text className="text-white font-bold mb-3">Number of Questions</Text>
            <View className="flex-row gap-3">
              {QUESTION_COUNTS.map((count) => (
                <Pressable
                  key={count}
                  onPress={() => {
                    buttonPressFeedback();
                    setQuestionCount(count);
                  }}
                  className="flex-1 py-4 rounded-xl items-center"
                  style={{
                    backgroundColor:
                      questionCount === count ? COLORS.primary : COLORS.surface,
                    borderWidth: 2,
                    borderColor:
                      questionCount === count ? COLORS.primary : "transparent",
                  }}
                >
                  <Text
                    className="text-xl font-bold"
                    style={{
                      color: questionCount === count ? COLORS.bg : COLORS.text,
                    }}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Summary */}
          <View
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text style={{ color: COLORS.textMuted }} className="text-sm mb-2">
              Challenge Summary
            </Text>
            <Text className="text-white font-medium">
              {questionCount} questions about{" "}
              {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            </Text>
            <Text className="text-white font-medium">15 seconds per question</Text>
          </View>

          {/* Error */}
          {error && (
            <View
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: `${COLORS.coral}20` }}
            >
              <Text style={{ color: COLORS.coral }}>{error}</Text>
            </View>
          )}

          {/* Create Button */}
          <Pressable
            onPress={handleCreateChallenge}
            disabled={loading}
            className="rounded-xl py-4 active:opacity-80"
            style={{
              backgroundColor: loading ? COLORS.surfaceLight : COLORS.primary,
            }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text
                className="text-center font-bold text-lg"
                style={{ color: COLORS.bg }}
              >
                Create Challenge
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Join Challenge Screen
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              setMode("menu");
              setError(null);
              setJoinCode("");
            }}
            className="mr-4"
          >
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-black">Join Challenge</Text>
        </View>

        {/* Code Input */}
        <View className="items-center">
          <Text className="text-6xl mb-6">🎟️</Text>
          <Text className="text-white text-xl font-bold mb-2">
            Enter Challenge Code
          </Text>
          <Text
            style={{ color: COLORS.textMuted }}
            className="text-center mb-8"
          >
            Ask your friend for the 6-character code
          </Text>

          <TextInput
            value={joinCode}
            onChangeText={(text) => setJoinCode(text.toUpperCase())}
            placeholder="XXXXXX"
            placeholderTextColor={COLORS.textMuted}
            maxLength={6}
            autoCapitalize="characters"
            className="w-full text-center text-3xl font-black tracking-widest py-4 rounded-xl mb-6"
            style={{
              backgroundColor: COLORS.surface,
              color: COLORS.primary,
            }}
          />

          {/* Error */}
          {error && (
            <View
              className="w-full rounded-xl p-4 mb-4"
              style={{ backgroundColor: `${COLORS.coral}20` }}
            >
              <Text style={{ color: COLORS.coral }} className="text-center">
                {error}
              </Text>
            </View>
          )}

          {/* Join Button */}
          <Pressable
            onPress={handleJoinChallenge}
            disabled={loading || joinCode.length < 6}
            className="w-full rounded-xl py-4 active:opacity-80"
            style={{
              backgroundColor:
                loading || joinCode.length < 6
                  ? COLORS.surfaceLight
                  : COLORS.purple,
            }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text className="text-center font-bold text-lg text-white">
                Join Challenge
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
