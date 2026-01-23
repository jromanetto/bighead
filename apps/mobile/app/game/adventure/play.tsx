import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../../../src/contexts/AuthContext";
import {
  getAdventureQuestions,
  completeCategory,
  useAttempt,
} from "../../../src/services/adventure";
import { markQuestionSeen } from "../../../src/services/questions";
import { playSound } from "../../../src/services/sounds";
import {
  Category,
  Tier,
  getCategoryInfo,
  getTierInfo,
  QUESTIONS_PER_CATEGORY,
  MAX_ERRORS_ALLOWED,
} from "../../../src/types/adventure";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

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
  yellow: "#FFD700",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const LETTER_OPTIONS = ["A", "B", "C", "D"];
const TIME_PER_QUESTION = 15;

interface Question {
  id: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: number;
  image_url?: string | null;
  image_credit?: string | null;
}

interface FormattedQuestion {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  imageUrl?: string | null;
  imageCredit?: string | null;
}

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circular Timer Component
function CircularTimer({
  timeRemaining,
  totalTime,
  questionNumber,
}: {
  timeRemaining: number;
  totalTime: number;
  questionNumber: number;
}) {
  const isLow = timeRemaining <= 5;
  const color = isLow ? COLORS.error : COLORS.primary;

  const SIZE = 100;
  const STROKE_WIDTH = 6;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const progress = useSharedValue(timeRemaining / totalTime);

  useEffect(() => {
    progress.value = withTiming(timeRemaining / totalTime, {
      duration: 300,
      easing: Easing.linear,
    });
  }, [timeRemaining, totalTime]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View className="relative items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      <View className="absolute items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <Text
          className="text-3xl font-black"
          style={{ color: isLow ? COLORS.error : COLORS.text }}
        >
          {timeRemaining}
        </Text>
        <Text className="text-xs font-bold" style={{ color: COLORS.textMuted }}>
          Q{questionNumber}/{QUESTIONS_PER_CATEGORY}
        </Text>
      </View>
    </View>
  );
}

// Answer Option Component
function AnswerOption({
  answer,
  index,
  onPress,
  disabled,
  isSelected,
  isCorrect,
  showResult,
}: {
  answer: string;
  index: number;
  onPress: () => void;
  disabled: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  showResult: boolean;
}) {
  let bgColor = COLORS.surface;
  let borderColor = "rgba(255,255,255,0.05)";
  let letterBgColor = "rgba(255,255,255,0.05)";
  let letterTextColor = COLORS.text;

  if (showResult) {
    if (isCorrect) {
      bgColor = COLORS.successDim;
      borderColor = COLORS.success;
      letterBgColor = COLORS.success;
      letterTextColor = COLORS.bg;
    } else if (isSelected && !isCorrect) {
      bgColor = COLORS.errorDim;
      borderColor = COLORS.error;
      letterBgColor = COLORS.error;
      letterTextColor = COLORS.bg;
    }
  } else if (isSelected) {
    bgColor = COLORS.surfaceActive;
    borderColor = `${COLORS.primary}50`;
    letterBgColor = COLORS.primary;
    letterTextColor = COLORS.bg;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="rounded-xl p-4 flex-row items-center gap-4 active:opacity-90"
      style={{
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center"
        style={{ backgroundColor: letterBgColor }}
      >
        <Text className="font-bold text-lg" style={{ color: letterTextColor }}>
          {LETTER_OPTIONS[index]}
        </Text>
      </View>
      <Text className="text-lg font-medium text-white/90 flex-1">{answer}</Text>
      {showResult && isCorrect && (
        <Text className="text-xl" style={{ color: COLORS.success }}>
          ✓
        </Text>
      )}
    </Pressable>
  );
}

export default function AdventurePlayScreen() {
  const { category, tier } = useLocalSearchParams<{ category: Category; tier: Tier }>();
  const { user, isPremium } = useAuth();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [errors, setErrors] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);

  const categoryInfo = getCategoryInfo(category as Category);
  const tierInfo = getTierInfo(tier as Tier);
  const currentQuestion = questions[currentIndex];

  // Format questions from DB format
  const formatQuestions = (dbQuestions: Question[]): FormattedQuestion[] => {
    return dbQuestions.map((q) => {
      const allAnswers = [q.correct_answer, ...q.wrong_answers];
      // Shuffle answers
      const shuffled = allAnswers.sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(q.correct_answer);

      return {
        id: q.id,
        question: q.question_text,
        answers: shuffled,
        correctIndex,
        imageUrl: q.image_url,
        imageCredit: q.image_credit,
      };
    });
  };

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      if (!user || !category || !tier) return;

      setLoading(true);
      try {
        const fetchedQuestions = await getAdventureQuestions(
          user.id,
          category as Category,
          tier as Tier,
          QUESTIONS_PER_CATEGORY
        );
        const formatted = formatQuestions(fetchedQuestions);
        setQuestions(formatted);
      } catch (error) {
        console.error("Error loading questions:", error);
        // Use mock questions as fallback
        setQuestions([
          {
            id: "1",
            question: "Question exemple 1 ?",
            answers: ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
            correctIndex: 0,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();

    return () => {
      mounted.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, category, tier]);

  // Timer
  useEffect(() => {
    if (loading || gameOver || showResult) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - count as error
          handleTimeout();
          return TIME_PER_QUESTION;
        }
        if (prev <= 5) playSound("tick");
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, gameOver, showResult, currentIndex]);

  const handleTimeout = () => {
    playSound("timeout");
    setShowResult(true);
    setErrors((prev) => prev + 1);
    checkGameEnd(errors + 1, correctCount);
  };

  const handleAnswer = (index: number) => {
    if (showResult || gameOver) return;

    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      playSound("correct");
      setCorrectCount((prev) => prev + 1);
    } else {
      playSound("wrong");
      setErrors((prev) => prev + 1);
    }

    // Mark question as seen
    if (user?.id && currentQuestion?.id) {
      markQuestionSeen(user.id, currentQuestion.id, isCorrect).catch(console.error);
    }

    checkGameEnd(isCorrect ? errors : errors + 1, isCorrect ? correctCount + 1 : correctCount);
  };

  const checkGameEnd = async (currentErrors: number, currentCorrect: number) => {
    // Check if failed (2+ errors)
    if (currentErrors > MAX_ERRORS_ALLOWED) {
      setGameOver(true);
      setSuccess(false);
      playSound("gameOver");
      // Use an attempt
      if (user && !isPremium) {
        await useAttempt(user.id).catch(console.error);
      }
      return;
    }

    // Check if completed all questions
    if (currentIndex + 1 >= questions.length) {
      setGameOver(true);
      setSuccess(true);
      playSound("levelUp");
      // Mark category as completed
      if (user) {
        await completeCategory(user.id, category as Category).catch(console.error);
      }
    }
  };

  const handleNext = () => {
    if (gameOver) {
      router.replace("/game/adventure");
      return;
    }

    setSelectedAnswer(null);
    setShowResult(false);
    setTimeRemaining(TIME_PER_QUESTION);
    setCurrentIndex((prev) => prev + 1);
    playSound("buttonPress");
  };

  const handleExit = () => {
    router.replace("/game/adventure");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted }} className="mt-4">
          Chargement des questions...
        </Text>
      </SafeAreaView>
    );
  }

  // Game Over Screen
  if (gameOver) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.bg }}>
        <Text className="text-6xl mb-4">{success ? "🎉" : "😔"}</Text>
        <Text className="text-white text-2xl font-black text-center mb-2">
          {success ? "CATÉGORIE VALIDÉE !" : "PERDU !"}
        </Text>
        <Text style={{ color: COLORS.textMuted }} className="text-center mb-6">
          {success
            ? `Tu as complété ${categoryInfo.nameFr} avec ${correctCount}/${questions.length} bonnes réponses !`
            : `Tu as fait ${errors} erreurs. Réessaie demain !`}
        </Text>

        {/* Stats */}
        <View className="flex-row gap-4 mb-8">
          <View
            className="items-center px-6 py-4 rounded-2xl"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-3xl mb-1">{categoryInfo.icon}</Text>
            <Text style={{ color: COLORS.textMuted }} className="text-xs">
              {categoryInfo.nameFr}
            </Text>
          </View>
          <View
            className="items-center px-6 py-4 rounded-2xl"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-2xl font-black" style={{ color: success ? COLORS.success : COLORS.error }}>
              {correctCount}/{questions.length}
            </Text>
            <Text style={{ color: COLORS.textMuted }} className="text-xs">
              Bonnes réponses
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleExit}
          className="px-12 py-4 rounded-2xl"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
            Retour à la Montagne
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Pressable
          onPress={handleExit}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-white text-xl">×</Text>
        </Pressable>

        {/* Category Badge */}
        <View
          className="flex-row items-center px-4 py-2 rounded-full"
          style={{
            backgroundColor: `${categoryInfo.color}20`,
            borderWidth: 1,
            borderColor: `${categoryInfo.color}50`,
          }}
        >
          <Text className="text-xl mr-2">{categoryInfo.icon}</Text>
          <Text className="font-bold" style={{ color: categoryInfo.color }}>
            {categoryInfo.nameFr}
          </Text>
        </View>

        {/* Error Counter */}
        <View className="flex-row items-center">
          {[...Array(MAX_ERRORS_ALLOWED + 1)].map((_, i) => (
            <View
              key={i}
              className="w-4 h-4 rounded-full mx-0.5"
              style={{
                backgroundColor: i < errors ? COLORS.error : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </View>
      </View>

      {/* Timer */}
      <View className="items-center py-4">
        <CircularTimer
          timeRemaining={timeRemaining}
          totalTime={TIME_PER_QUESTION}
          questionNumber={currentIndex + 1}
        />
      </View>

      {/* Question Card */}
      <View className="px-6 mb-6">
        <View
          className="rounded-2xl p-6"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {currentQuestion?.imageUrl && (
            <Image
              source={{ uri: currentQuestion.imageUrl }}
              style={{ width: "100%", height: 140, borderRadius: 12, marginBottom: 16 }}
              resizeMode="cover"
            />
          )}
          <Text className="text-xl font-bold text-white">{currentQuestion?.question}</Text>
        </View>
      </View>

      {/* Answers */}
      <View className="px-6 gap-3">
        {currentQuestion?.answers.map((answer, index) => (
          <AnswerOption
            key={index}
            answer={answer}
            index={index}
            onPress={() => handleAnswer(index)}
            disabled={showResult}
            isSelected={selectedAnswer === index}
            isCorrect={index === currentQuestion.correctIndex}
            showResult={showResult}
          />
        ))}
      </View>

      {/* Next Button */}
      {showResult && !gameOver && (
        <View className="px-6 mt-6">
          <Pressable
            onPress={handleNext}
            className="py-4 rounded-2xl items-center"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
              Question suivante →
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
