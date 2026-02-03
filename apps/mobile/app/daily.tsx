import { View, Text, Pressable, ActivityIndicator, ScrollView, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
  SlideInRight,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getNextSurvivalQuestion,
  hasPlayedDailySurvivalToday,
  submitDailySurvival,
  getDailyStreak,
  getTodaysDailyQuestion,
  type DailyQuestion,
} from "../src/services/dailyChallenge";
import { correctAnswerFeedback, wrongAnswerFeedback } from "../src/utils/feedback";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSettings } from "../src/services/settings";
import { IconButton } from "../src/components/ui";

const DAILY_SURVIVAL_KEY = "@bighead_daily_survival";

// Design system colors (same as chain.tsx)
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
  orange: "#f97316",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const LETTER_OPTIONS = ['A', 'B', 'C', 'D'];
const TOTAL_TIME = 15; // 15 seconds per question

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circular Timer Component - uses SVG with Reanimated for smooth countdown
function CircularTimer({ timeRemaining, totalTime, questionNumber }: {
  timeRemaining: number;
  totalTime: number;
  questionNumber: number;
}) {
  const isLow = timeRemaining <= 5;
  const color = isLow ? COLORS.error : COLORS.primary;

  const SIZE = 120;
  const STROKE_WIDTH = 8;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Animated progress value
  const progress = useSharedValue(timeRemaining / totalTime);

  // Update progress when timeRemaining changes
  useEffect(() => {
    progress.value = withTiming(timeRemaining / totalTime, {
      duration: 300,
      easing: Easing.linear,
    });
  }, [timeRemaining, totalTime]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View className="relative items-center justify-center" style={{ width: SIZE + 20, height: SIZE + 20 }}>
      {/* Glow effect */}
      <View
        className="absolute rounded-full"
        style={{
          width: SIZE,
          height: SIZE,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 20,
        }}
      />

      {/* SVG Timer */}
      <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background Circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        {/* Progress Circle */}
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

      {/* Timer Content - centered absolutely */}
      <View className="absolute items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <Text
          className="text-4xl font-black leading-none"
          style={{ color: isLow ? COLORS.error : COLORS.text }}
        >
          {timeRemaining}
          <Text className="text-lg text-gray-400 font-medium">s</Text>
        </Text>
        <Text
          className="text-xs font-bold tracking-widest uppercase mt-1"
          style={{ color: isLow ? COLORS.error : COLORS.primary }}
        >
          Q{questionNumber}
        </Text>
      </View>
    </View>
  );
}

// Answer Option Component (same style as chain.tsx)
function AnswerOption({
  answer,
  index,
  onPress,
  disabled,
  isSelected,
  isCorrect,
  showResult
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
  let borderColor = 'rgba(255,255,255,0.05)';
  let letterBgColor = 'rgba(255,255,255,0.05)';
  let letterBorderColor = 'rgba(255,255,255,0.1)';
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
    letterBorderColor = COLORS.primary;
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      {/* Letter Badge */}
      <View
        className="w-10 h-10 rounded-lg items-center justify-center"
        style={{
          backgroundColor: letterBgColor,
          borderWidth: 1,
          borderColor: letterBorderColor,
        }}
      >
        <Text className="font-bold text-lg" style={{ color: letterTextColor }}>
          {LETTER_OPTIONS[index]}
        </Text>
      </View>

      {/* Answer Text */}
      <Text className="text-lg font-medium text-white/90 flex-1 text-left">
        {answer}
      </Text>

      {/* Check Icon */}
      {showResult && isCorrect && (
        <Text className="text-xl" style={{ color: COLORS.success }}>✓</Text>
      )}
      {showResult && isSelected && !isCorrect && (
        <Text className="text-xl" style={{ color: COLORS.error }}>✗</Text>
      )}
    </Pressable>
  );
}

export default function DailyBrainScreen() {
  const { user, isAnonymous } = useAuth();
  const params = useLocalSearchParams<{ fromNotification?: string }>();
  const [loading, setLoading] = useState(true);
  const [isDailyQuestion, setIsDailyQuestion] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<DailyQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);

  const answeredQuestionIds = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(Date.now());
  const questionStartTime = useRef<number>(Date.now());
  const userLanguage = useRef<string>("en");

  // Animation values
  const scale = useSharedValue(1);

  useEffect(() => {
    checkAndLoad();
  }, [user]);

  // Timer effect - countdown when playing
  useEffect(() => {
    // Only run timer when we have a question and haven't answered yet
    if (currentQuestion && !gameOver && !alreadyPlayed && selectedAnswer === null) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - end game
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            // Trigger game over
            wrongAnswerFeedback();
            setTimeout(() => {
              endGame(score);
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentQuestion?.id, gameOver, alreadyPlayed, selectedAnswer]);

  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion && !gameOver && !alreadyPlayed) {
      setTimeRemaining(TOTAL_TIME);
    }
  }, [currentQuestion?.id]);

  const checkAndLoad = async () => {
    setLoading(true);
    try {
      // Load user's language preference
      const settings = await getSettings(user?.id);
      userLanguage.current = settings.language || "en";

      // Check if already played today
      if (user && !isAnonymous) {
        const { played, score: todayScore } = await hasPlayedDailySurvivalToday(user.id);
        if (played) {
          setAlreadyPlayed(true);
          setPreviousScore(todayScore || 0);
          const currentStreak = await getDailyStreak(user.id);
          setStreak(currentStreak);
          setLoading(false);
          return;
        }
      } else {
        // For anonymous users, check AsyncStorage
        const today = new Date().toISOString().split("T")[0];
        const stored = await AsyncStorage.getItem(DAILY_SURVIVAL_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.date === today) {
            setAlreadyPlayed(true);
            setPreviousScore(data.score || 0);
            setLoading(false);
            return;
          }
        }
      }

      // Start the game
      startTime.current = Date.now();

      // If coming from notification, load today's daily question first
      if (params.fromNotification === "true") {
        const dailyQ = await getTodaysDailyQuestion(userLanguage.current);
        if (dailyQ) {
          setCurrentQuestion(dailyQ);
          setQuestionNumber(1);
          setIsDailyQuestion(true);
          questionStartTime.current = Date.now();
          answeredQuestionIds.current.push(dailyQ.id);
          setLoading(false);
          return;
        }
      }

      // Otherwise load a random question
      await loadNextQuestion();
    } catch (error) {
      console.error("Error loading daily survival:", error);
    }
    setLoading(false);
  };

  const loadNextQuestion = useCallback(async () => {
    const question = await getNextSurvivalQuestion(answeredQuestionIds.current, userLanguage.current);
    if (question) {
      setCurrentQuestion(question);
      setQuestionNumber((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      questionStartTime.current = Date.now();
    } else {
      // No more questions available - end game
      await endGame(score);
    }
  }, [score]);

  const handleAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctIndex;
    setIsCorrect(correct);

    answeredQuestionIds.current.push(currentQuestion.id);

    if (correct) {
      await correctAnswerFeedback();
      scale.value = withSequence(withSpring(1.1), withSpring(1));
      setScore((prev) => prev + 1);

      // After the daily question, continue with random questions
      if (isDailyQuestion) {
        setIsDailyQuestion(false);
      }

      // Load next question after delay
      setTimeout(() => {
        loadNextQuestion();
      }, 1500);
    } else {
      await wrongAnswerFeedback();
      // Game over on wrong answer
      setTimeout(() => {
        endGame(score);
      }, 1500);
    }
  };

  const endGame = async (finalScore: number) => {
    setGameOver(true);
    const totalTimeMs = Date.now() - startTime.current;

    // Save result
    if (user && !isAnonymous) {
      try {
        const result = await submitDailySurvival(user.id, finalScore, totalTimeMs);
        setXpEarned(result.xpEarned);
        setStreak(result.newStreak);
        setIsNewRecord(result.isNewRecord);
      } catch (error) {
        console.error("Error saving result:", error);
      }
    } else {
      // Save for anonymous users in AsyncStorage
      const today = new Date().toISOString().split("T")[0];
      await AsyncStorage.setItem(
        DAILY_SURVIVAL_KEY,
        JSON.stringify({ date: today, score: finalScore })
      );
    }
  };

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Already played today
  if (alreadyPlayed) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        {/* Background Elements */}
        <View className="absolute inset-0 pointer-events-none">
          <View
            className="absolute -top-10 -left-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: COLORS.primary }}
          />
          <View
            className="absolute -bottom-10 -right-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: COLORS.purple }}
          />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: COLORS.primaryDim }}
          >
            <Text className="text-5xl">🎯</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Deja joue aujourd'hui !
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-center mb-4">
            Ton score : {previousScore} points
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-center mb-8 opacity-60">
            Reviens demain pour un nouveau Daily Brain
          </Text>

          {/* Streak */}
          {streak > 0 && (
            <View
              className="rounded-xl px-6 py-4 mb-8"
              style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}
            >
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">🔥</Text>
                <View>
                  <Text style={{ color: COLORS.orange }} className="font-bold text-xl">
                    {streak} jours
                  </Text>
                  <Text style={{ color: COLORS.orange, opacity: 0.6 }} className="text-sm">
                    Serie en cours
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Pressable
            onPress={() => router.back()}
            className="rounded-xl py-4 px-8"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
              Retour
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Game Over screen
  if (gameOver) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        {/* Background Elements */}
        <View className="absolute inset-0 pointer-events-none">
          <View
            className="absolute -top-10 -left-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: COLORS.primary }}
          />
          <View
            className="absolute -bottom-10 -right-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: COLORS.purple }}
          />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={FadeIn.duration(500)}
            className="items-center"
          >
            <View
              className="w-28 h-28 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: score >= 10 ? 'rgba(255, 209, 0, 0.2)' : COLORS.primaryDim,
              }}
            >
              <Text className="text-6xl">{score >= 10 ? "🏆" : "💪"}</Text>
            </View>

            <Text className="text-white text-3xl font-bold text-center mb-2">
              {score >= 20 ? "Incroyable !" : score >= 10 ? "Bien joue !" : "Fin de partie"}
            </Text>

            <Text style={{ color: COLORS.textMuted }} className="text-center mb-6">
              {score === 0
                ? "Pas facile... Reviens demain !"
                : score === 1
                ? "1 bonne reponse"
                : `${score} bonnes reponses`}
            </Text>

            {/* Score display */}
            <View
              className="rounded-2xl px-8 py-6 mb-6 items-center"
              style={{ backgroundColor: COLORS.surface }}
            >
              <Text style={{ color: COLORS.textMuted }} className="text-sm mb-1">SCORE</Text>
              <Text className="text-white text-5xl font-bold">{score}</Text>
              {isNewRecord && (
                <View
                  className="rounded-full px-4 py-1 mt-2"
                  style={{ backgroundColor: 'rgba(255, 209, 0, 0.2)' }}
                >
                  <Text style={{ color: COLORS.yellow }} className="font-bold">
                    Nouveau record !
                  </Text>
                </View>
              )}
            </View>

            {/* XP earned */}
            {xpEarned > 0 && (
              <View
                className="rounded-xl px-6 py-3 mb-4"
                style={{ backgroundColor: COLORS.primaryDim }}
              >
                <Text style={{ color: COLORS.primary }} className="font-bold text-lg">
                  +{xpEarned} XP
                </Text>
              </View>
            )}

            {/* Streak */}
            {streak > 0 && (
              <View
                className="rounded-xl px-6 py-4 mb-8"
                style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}
              >
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-3">🔥</Text>
                  <View>
                    <Text style={{ color: COLORS.orange }} className="font-bold text-xl">
                      {streak} jours
                    </Text>
                    <Text style={{ color: COLORS.orange, opacity: 0.6 }} className="text-sm">
                      Serie en cours
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Pressable
              onPress={() => router.back()}
              className="rounded-xl py-4 px-8"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
                Retour
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Loading
  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted }} className="mt-4">Chargement...</Text>
      </SafeAreaView>
    );
  }

  // No question available
  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">🎯</Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
            Aucune question disponible
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-center mb-8">
            Reviens plus tard !
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-xl py-4 px-8"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="font-bold" style={{ color: COLORS.bg }}>Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Game in progress
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Background Elements */}
      <View className="absolute inset-0 pointer-events-none">
        <View
          className="absolute -top-10 -left-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: COLORS.primary }}
        />
        <View
          className="absolute -bottom-10 -right-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: COLORS.purple }}
        />
      </View>

      <View className="flex-1 relative">
        {/* Top HUD */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          {/* Exit Button */}
          <IconButton
            name="ArrowLeft"
            onPress={() => router.back()}
            variant="glass"
            size={40}
          />

          {/* Mode Badge */}
          <View
            className="px-4 py-2 rounded-full flex-row items-center gap-2"
            style={{
              backgroundColor: 'rgba(30, 37, 41, 0.7)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text className="text-xl">🧠</Text>
            <Text className="text-sm font-bold tracking-wide text-white">DAILY BRAIN</Text>
          </View>

          {/* Score Badge */}
          <View
            className="px-4 py-2 rounded-full flex-row items-center gap-2"
            style={{
              backgroundColor: 'rgba(30, 37, 41, 0.7)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text className="text-xl" style={{ color: COLORS.primary }}>🏆</Text>
            <Text className="text-sm font-bold tracking-wide text-white">{score} PTS</Text>
          </View>
        </View>

        {/* Timer Section */}
        <View className="items-center py-4">
          <CircularTimer
            timeRemaining={timeRemaining}
            totalTime={TOTAL_TIME}
            questionNumber={questionNumber}
          />
          {isDailyQuestion && (
            <View
              className="mt-2 px-3 py-1 rounded-full"
              style={{ backgroundColor: COLORS.purple }}
            >
              <Text className="text-xs font-bold text-white">QUESTION DU JOUR</Text>
            </View>
          )}
          <Text style={{ color: COLORS.error }} className="text-xs font-bold mt-2">
            1 erreur = fin de partie
          </Text>
        </View>

        {/* Scrollable Question & Answers */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Card */}
          <Animated.View
            key={currentQuestion.id}
            entering={SlideInRight.duration(300)}
            className="px-6 mb-6"
          >
            <View
              className="rounded-2xl relative overflow-hidden"
              style={{
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
              }}
            >
              <View className="p-6">
                {/* Cyan Left Border */}
                <View
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: COLORS.primary }}
                />

                {/* Category Badge */}
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    className="text-sm font-bold uppercase"
                    style={{ color: COLORS.primary }}
                  >
                    {currentQuestion.category}
                  </Text>
                  <Text style={{ color: COLORS.textMuted }} className="text-sm">
                    Diff. {currentQuestion.difficulty}
                  </Text>
                </View>

                <Text className="text-xl font-bold leading-relaxed text-white">
                  {currentQuestion.question}
                </Text>

                {/* Question Image (for logo questions) */}
                {currentQuestion.image_url && (
                  <View className="mt-4 items-center">
                    <Image
                      source={{ uri: currentQuestion.image_url }}
                      className="rounded-xl"
                      style={{ width: 200, height: 150 }}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View
                  className="h-1 w-12 rounded-full mt-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                />
              </View>
            </View>
          </Animated.View>

          {/* Answer Options */}
          <View className="px-6 flex-col gap-3">
            {currentQuestion.answers.map((answer, index) => (
              <Animated.View
                key={`${currentQuestion.id}-${index}`}
                entering={SlideInRight.duration(300).delay(index * 50)}
              >
                <AnswerOption
                  answer={answer}
                  index={index}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  isSelected={selectedAnswer === index}
                  isCorrect={index === currentQuestion.correctIndex}
                  showResult={selectedAnswer !== null}
                />
              </Animated.View>
            ))}
          </View>

          {/* Feedback message */}
          {selectedAnswer !== null && (
            <View className="px-6 mt-6">
              <View
                className="rounded-xl p-4"
                style={{
                  backgroundColor: isCorrect ? COLORS.successDim : COLORS.errorDim,
                }}
              >
                <Text
                  className="text-center font-bold text-lg"
                  style={{ color: isCorrect ? COLORS.success : COLORS.error }}
                >
                  {isCorrect ? "Correct ! Question suivante..." : "Perdu !"}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
