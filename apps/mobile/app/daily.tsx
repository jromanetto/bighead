import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getDailyChallenge,
  hasCompletedDailyChallenge,
  submitDailyChallenge,
  getDailyStreak,
  type DailyChallenge,
} from "../src/services/dailyChallenge";
import { correctAnswerFeedback, wrongAnswerFeedback } from "../src/utils/feedback";

export default function DailyChallengeScreen() {
  const { user, isAnonymous } = useAuth();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const startTime = useRef<number>(Date.now());

  // Animation values
  const scale = useSharedValue(1);
  const resultOpacity = useSharedValue(0);

  useEffect(() => {
    loadChallenge();
  }, [user]);

  const loadChallenge = async () => {
    setLoading(true);
    try {
      // Check if already completed
      if (user && !isAnonymous) {
        const done = await hasCompletedDailyChallenge(user.id);
        if (done) {
          setCompleted(true);
          const currentStreak = await getDailyStreak(user.id);
          setStreak(currentStreak);
          setLoading(false);
          return;
        }
      }

      // Get today's challenge
      const data = await getDailyChallenge();
      setChallenge(data);
      startTime.current = Date.now();
    } catch (error) {
      console.error("Error loading daily challenge:", error);
    }
    setLoading(false);
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer || !challenge) return;

    setSelectedAnswer(answer);
    const correct = answer === challenge.out_options.correct;
    setIsCorrect(correct);

    // Feedback
    if (correct) {
      await correctAnswerFeedback();
      scale.value = withSequence(
        withSpring(1.1),
        withSpring(1)
      );
    } else {
      await wrongAnswerFeedback();
    }

    // Show result
    resultOpacity.value = withTiming(1, { duration: 300 });

    // Submit if logged in
    if (user && !isAnonymous) {
      try {
        const answerTimeMs = Date.now() - startTime.current;
        const result = await submitDailyChallenge(
          user.id,
          challenge.out_challenge_id,
          correct,
          answerTimeMs
        );
        setXpEarned(result.xpEarned);
        setStreak(result.newStreak);
      } catch (error) {
        console.error("Error submitting challenge:", error);
      }
    }
  };

  const animatedResultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const getButtonStyle = (option: string) => {
    if (!selectedAnswer) return "bg-gray-800";
    if (option === challenge?.out_options.correct) return "bg-green-500/30 border-green-500";
    if (option === selectedAnswer && !isCorrect) return "bg-red-500/30 border-red-500";
    return "bg-gray-800 opacity-50";
  };

  // Already completed today
  if (completed) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-green-500/20 w-24 h-24 rounded-full items-center justify-center mb-6">
            <Text className="text-5xl">✅</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Challenge completed!
          </Text>
          <Text className="text-gray-400 text-center mb-8">
            Come back tomorrow for a new daily challenge
          </Text>

          {/* Streak */}
          <View className="bg-orange-500/20 rounded-xl px-6 py-4 mb-8">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">🔥</Text>
              <View>
                <Text className="text-orange-400 font-bold text-xl">{streak} days</Text>
                <Text className="text-orange-300/60 text-sm">Current streak</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => router.back()}
            className="bg-primary-500 rounded-xl py-4 px-8"
          >
            <Text className="text-white font-bold">Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Loading
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-gray-400 mt-4">Loading challenge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No challenge available
  if (!challenge) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">🎯</Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
            No challenge available
          </Text>
          <Text className="text-gray-400 text-center mb-8">
            Come back soon!
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-primary-500 rounded-xl py-4 px-8"
          >
            <Text className="text-white font-bold">Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 mb-6">
          <Pressable onPress={() => router.back()} className="p-2">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <View className="flex-row items-center bg-orange-500/20 rounded-full px-4 py-2">
            <Text className="text-lg mr-2">🔥</Text>
            <Text className="text-orange-400 font-bold">{streak} days</Text>
          </View>
        </View>

        {/* Title */}
        <View className="px-6 mb-8">
          <Text className="text-primary-400 text-sm font-bold mb-1">DAILY CHALLENGE</Text>
          <Text className="text-white text-2xl font-bold">Who is this player?</Text>
        </View>

        {/* Question */}
        <View className="px-6 mb-8">
          <View className="bg-gray-800 rounded-2xl p-6">
            <Text className="text-gray-400 text-center mb-4">Hint</Text>
            <Text className="text-white text-xl text-center leading-8">
              {challenge.out_question_text}
            </Text>
          </View>
        </View>

        {/* Options */}
        <View className="px-6 flex-1">
          {["A", "B", "C", "D"].map((key) => {
            const option = challenge.out_options[key as keyof typeof challenge.out_options];
            if (key === "correct") return null;
            return (
              <Pressable
                key={key}
                onPress={() => handleAnswer(key)}
                disabled={!!selectedAnswer}
                className={`rounded-xl p-4 mb-3 border-2 border-transparent ${getButtonStyle(key)}`}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center mr-3">
                    <Text className="text-white font-bold">{key}</Text>
                  </View>
                  <Text className="text-white flex-1">{option}</Text>
                  {selectedAnswer && key === challenge.out_options.correct && (
                    <Text className="text-green-400">✓</Text>
                  )}
                  {selectedAnswer === key && !isCorrect && (
                    <Text className="text-red-400">✗</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Result */}
        {selectedAnswer && (
          <Animated.View style={animatedResultStyle} className="px-6 pb-6">
            <View
              className={`rounded-xl p-6 ${
                isCorrect ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              <View className="flex-row items-center justify-center mb-2">
                <Text className="text-4xl mr-3">{isCorrect ? "🎉" : "😔"}</Text>
                <Text
                  className={`text-2xl font-bold ${
                    isCorrect ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isCorrect ? "Well done!" : "Too bad!"}
                </Text>
              </View>
              <Text className="text-gray-300 text-center mb-4">
                The answer was {challenge.out_player_name}
              </Text>
              {xpEarned > 0 && (
                <Text className="text-primary-400 text-center font-bold">
                  +{xpEarned} XP
                </Text>
              )}
              <Pressable
                onPress={() => router.back()}
                className="bg-primary-500 rounded-xl py-3 mt-4"
              >
                <Text className="text-white text-center font-bold">Continue</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Anonymous prompt */}
        {isAnonymous && !selectedAnswer && (
          <View className="px-6 pb-6">
            <Pressable
              onPress={() => router.push("/profile")}
              className="bg-gray-800 rounded-xl p-4"
            >
              <Text className="text-gray-400 text-center text-sm">
                Create an account to save your streak 🔥
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
