import { View, Text, Pressable, Share, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/contexts/AuthContext";
import { saveGameResult } from "../../src/services/gameResults";
import { ConfettiEffect } from "../../src/components/effects";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { useRatingPrompt } from "../../src/hooks/useRatingPrompt";
import { RatingModal } from "../../src/components/RatingModal";

// New QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceActive: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.2)",
  error: "#ef4444",
  errorDim: "rgba(239, 68, 68, 0.2)",
  yellow: "#FFD100",
  purple: "#A16EFF",
  coral: "#FF6B6B",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// Circular Score Ring Component
function ScoreRing({ percentage }: { percentage: number }) {
  return (
    <View className="relative items-center justify-center" style={{ width: 160, height: 160 }}>
      {/* Background Circle */}
      <View
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 140,
          borderWidth: 10,
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      />
      {/* Progress Circle */}
      <View
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 140,
          borderWidth: 10,
          borderColor: COLORS.primary,
          borderTopColor: percentage < 25 ? 'transparent' : COLORS.primary,
          borderRightColor: percentage < 50 ? 'transparent' : COLORS.primary,
          borderBottomColor: percentage < 75 ? 'transparent' : COLORS.primary,
          borderLeftColor: 'transparent',
          transform: [{ rotate: '-90deg' }],
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
        }}
      />
      {/* Percentage Text */}
      <Text className="text-5xl font-black text-white">{percentage}%</Text>
    </View>
  );
}

// Question Summary Item Component
function QuestionSummaryItem({
  question,
  answer,
  isCorrect,
  correctAnswer
}: {
  question: string;
  answer: string;
  isCorrect: boolean;
  correctAnswer?: string;
}) {
  return (
    <View
      className="rounded-xl p-4 flex-row items-start gap-3"
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      {/* Status Icon */}
      <View
        className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
        style={{ backgroundColor: isCorrect ? COLORS.success : COLORS.error }}
      >
        <Text className="text-white text-xs font-bold">{isCorrect ? '✓' : '✗'}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-white font-medium mb-1">{question}</Text>
        <Text
          className="text-sm"
          style={{ color: isCorrect ? COLORS.primary : COLORS.coral }}
        >
          {answer}
        </Text>
        {!isCorrect && correctAnswer && (
          <Text className="text-gray-500 text-xs mt-0.5">
            Correct: {correctAnswer}
          </Text>
        )}
      </View>
    </View>
  );
}

interface QuestionSummaryData {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
  imageUrl: string | null;
}

export default function ResultScreen() {
  const { score, correct, total, maxChain, questionSummary } = useLocalSearchParams<{
    score: string;
    correct: string;
    total: string;
    maxChain?: string;
    questionSummary?: string;
  }>();

  // Parse question summary data
  const parsedQuestionSummary: QuestionSummaryData[] = questionSummary
    ? JSON.parse(questionSummary)
    : [];

  const { user, refreshProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { showRatingModal, closeRatingModal, checkAndShowRating } = useRatingPrompt();

  const scoreNum = Number(score || 0);
  const correctNum = Number(correct || 0);
  const totalNum = Number(total || 1);
  const maxChainNum = Number(maxChain || 1);
  const accuracy = Math.round((correctNum / totalNum) * 100);

  // XP earned (simplified calculation)
  const xpEarned = Math.round(scoreNum * 0.1) + correctNum * 10;

  // Trigger confetti for good performance
  useEffect(() => {
    if (accuracy >= 70) {
      setShowConfetti(true);
    }
  }, [accuracy]);

  // Save game result when component mounts
  useEffect(() => {
    const saveResult = async () => {
      if (saved || !user) return;

      try {
        await saveGameResult({
          userId: user.id,
          mode: "chain_solo",
          score: scoreNum,
          correctCount: correctNum,
          totalQuestions: totalNum,
          maxChain: maxChainNum,
        });
        setSaved(true);
        await refreshProfile();

        // Check if we should show rating prompt
        await checkAndShowRating();
      } catch (error) {
        console.error("Error saving game result:", error);
      }
    };

    saveResult();
  }, [user, saved]);

  const getPerformanceTitle = () => {
    if (accuracy >= 90) return "Legendary!";
    if (accuracy >= 70) return "Stellar Job!";
    if (accuracy >= 50) return "Well played!";
    return "Keep going!";
  };

  const handleShare = async () => {
    buttonPressFeedback();
    try {
      await Share.share({
        message: `I scored ${scoreNum.toLocaleString()} points on BIGHEAD with ${accuracy}% correct answers! Can you beat that? 🧠🔥`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };


  // Find a "Did You Know" fact from a correct answer with explanation
  const didYouKnowFact = parsedQuestionSummary.find(
    (q) => q.isCorrect && q.explanation
  );

  // Find the first question with an image
  const questionWithImage = parsedQuestionSummary.find((q) => q.imageUrl);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Confetti Effect for good performance */}
      <ConfettiEffect
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
        duration={2500}
      />

      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable
          onPress={() => {
            buttonPressFeedback();
            router.replace("/");
          }}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-white text-xl">×</Text>
        </Pressable>

        <Text className="flex-1 text-center text-sm font-bold tracking-widest text-gray-400 uppercase">
          Results
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View className="items-center mt-4 mb-6">
          <Text className="text-4xl font-black">
            <Text style={{ color: COLORS.text }}>Stellar </Text>
            <Text style={{ color: COLORS.primary }}>Job!</Text>
          </Text>
        </View>

        {/* Score Card */}
        <View
          className="mx-6 rounded-2xl p-6 items-center mb-6"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          {/* Score Ring */}
          <ScoreRing percentage={accuracy} />

          {/* XP Badge */}
          <View
            className="flex-row items-center rounded-full px-4 py-2 mt-4"
            style={{ backgroundColor: COLORS.surfaceActive }}
          >
            <Text className="mr-2" style={{ color: COLORS.yellow }}>⚡</Text>
            <Text className="font-bold text-white">+{xpEarned} XP Earned</Text>
          </View>

          <Text className="text-gray-400 text-sm mt-3">
            You answered {correctNum} out of {totalNum} correctly
          </Text>
        </View>

        {/* Did You Know Card - only show if we have an explanation */}
        {didYouKnowFact && (
          <View className="mx-6 mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-xl">💡</Text>
              <Text className="text-white font-bold">Did You Know?</Text>
            </View>

            <View
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
              }}
            >
              {/* Question Image if available */}
              {questionWithImage?.imageUrl ? (
                <View style={{ height: 128, backgroundColor: COLORS.surfaceActive }}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 }}
                  />
                </View>
              ) : (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ height: 80, opacity: 0.3 }}
                />
              )}

              <View className="p-4">
                <Text className="text-white leading-6">
                  {didYouKnowFact.explanation}
                </Text>
                <Text className="text-gray-500 text-xs mt-2">
                  ℹ️ {didYouKnowFact.question.substring(0, 50)}...
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Question Summary */}
        {parsedQuestionSummary.length > 0 && (
          <View className="mx-6 mb-6">
            <Text className="text-white font-bold mb-3">Question Summary</Text>

            <View style={{ gap: 8 }}>
              {parsedQuestionSummary.map((item, index) => (
                <QuestionSummaryItem
                  key={index}
                  question={item.question}
                  answer={item.selectedAnswer}
                  isCorrect={item.isCorrect}
                  correctAnswer={item.isCorrect ? undefined : item.correctAnswer}
                />
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 py-4 flex-row items-center gap-4"
        style={{
          backgroundColor: COLORS.bg,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Home Button */}
        <Pressable
          onPress={() => {
            buttonPressFeedback();
            router.replace("/");
          }}
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-2xl">🏠</Text>
        </Pressable>

        {/* Play Again Button */}
        <Pressable
          onPress={() => {
            buttonPressFeedback();
            router.replace("/game/chain");
          }}
          className="flex-1 h-14 rounded-full flex-row items-center justify-center active:opacity-80"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-xl mr-2">↻</Text>
          <Text className="text-lg font-bold" style={{ color: COLORS.bg }}>
            Play Again
          </Text>
        </Pressable>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-2xl">↗</Text>
        </Pressable>
      </View>

      {/* Rating Modal */}
      <RatingModal visible={showRatingModal} onClose={closeRatingModal} />
    </SafeAreaView>
  );
}
