import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
  SlideInRight,
} from "react-native-reanimated";
import { useAuth } from "../src/contexts/AuthContext";
import { CircularTimer } from "../src/components/CircularTimer";
import { getTodayIsoDate } from "../src/utils/dates";
import {
  hasPlayedDailySurvivalToday,
  getDailyStreak,
  getTodaysDailyQuestions,
  submitDailyBrain,
  DAILY_BRAIN_QUESTION_COUNT,
  type DailyQuestion,
} from "../src/services/dailyChallenge";
import { correctAnswerFeedback, wrongAnswerFeedback } from "../src/utils/feedback";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSettings } from "../src/services/settings";
import { IconButton } from "../src/components/ui";
import { useRatingPrompt } from "../src/hooks/useRatingPrompt";
import { RatingModal } from "../src/components/RatingModal";
import { QuestionImage } from "../src/components/QuestionImage";
import { ShareScorecard } from "../src/components/ShareScorecard";
import { incrementWins, shouldShowInvitePrompt, markInviteShown, markInviteDismissed } from "../src/services/invite-prompt";
import { inviteFriends } from "../src/utils/share";
import { useTranslation } from "../src/contexts/LanguageContext";

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
const TOTAL_QUESTIONS = DAILY_BRAIN_QUESTION_COUNT;
const FEEDBACK_DELAY_MS = 1200;

// Format helper for templated translations
function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

// Local wrapper around the shared CircularTimer to preserve the question-number
// label and shadow halo specific to the Daily Brain screen.
function DailyCircularTimer({
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
  const SIZE = 120;

  return (
    <View
      className="relative items-center justify-center"
      style={{ width: SIZE + 20, height: SIZE + 20 }}
    >
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
      <CircularTimer
        totalSeconds={totalTime}
        timeLeft={timeRemaining}
        size={SIZE}
        color={color}
        textColor={isLow ? COLORS.error : COLORS.text}
        hideTimeText
      >
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
      </CircularTimer>
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
      <Text className="text-lg font-medium text-white/90 flex-1 text-left">
        {answer}
      </Text>
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [perfect, setPerfect] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [showInvitePrompt, setShowInvitePrompt] = useState(false);
  const { showRatingModal, closeRatingModal, checkAndShowRating } = useRatingPrompt();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(Date.now());
  const userLanguage = useRef<string>("en");
  const finishingRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0);

  const scale = useSharedValue(1);

  const currentQuestion = questions[currentIndex] || null;

  useEffect(() => {
    checkAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Timer: counts down per question
  useEffect(() => {
    if (!currentQuestion || gameOver || alreadyPlayed || selectedAnswer !== null) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Time's up = treat as wrong answer, auto-advance
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, gameOver, alreadyPlayed, selectedAnswer]);

  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion && !gameOver && !alreadyPlayed) {
      setTimeRemaining(TOTAL_TIME);
    }
  }, [currentQuestion?.id, gameOver, alreadyPlayed]);

  const checkAndLoad = async () => {
    setLoading(true);
    try {
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
        const today = getTodayIsoDate();
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

      // Fetch today's 5 questions
      startTime.current = Date.now();
      const daily = await getTodaysDailyQuestions(userLanguage.current);
      setQuestions(daily);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error loading daily brain:", error);
    }
    setLoading(false);
  };

  const advance = useCallback(() => {
    setCurrentIndex((prevIdx) => {
      const nextIdx = prevIdx + 1;
      if (nextIdx >= TOTAL_QUESTIONS || nextIdx >= questions.length) {
        // End of session
        finishSession();
        return prevIdx;
      }
      setSelectedAnswer(null);
      setIsCorrect(null);
      return nextIdx;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  const handleTimeout = useCallback(() => {
    if (selectedAnswer !== null || !currentQuestion) return;
    setSelectedAnswer(-1); // sentinel: timed out, no selection
    setIsCorrect(false);
    wrongAnswerFeedback();
    setTimeout(() => {
      advance();
    }, FEEDBACK_DELAY_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswer, currentQuestion, advance]);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      correctAnswerFeedback();
      scale.value = withSequence(withSpring(1.1), withSpring(1));
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
    } else {
      wrongAnswerFeedback();
    }

    setTimeout(() => {
      advance();
    }, FEEDBACK_DELAY_MS);
  };

  const finishSession = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setGameOver(true);

    const finalScore = scoreRef.current;
    const totalTimeMs = Date.now() - startTime.current;

    if (user && !isAnonymous) {
      try {
        const result = await submitDailyBrain(user.id, finalScore, totalTimeMs);
        setXpEarned(result.xpEarned);
        setStreak(result.newStreak);
        setIsNewRecord(result.isNewRecord);
        setPerfect(result.perfect);
      } catch (error) {
        console.error("Error saving result:", error);
      }
    } else {
      const today = getTodayIsoDate();
      await AsyncStorage.setItem(
        DAILY_SURVIVAL_KEY,
        JSON.stringify({ date: today, score: finalScore })
      );
      setPerfect(finalScore >= TOTAL_QUESTIONS);
    }

    await checkAndShowRating();

    if (finalScore > 0) {
      await incrementWins();
      const shouldInvite = await shouldShowInvitePrompt();
      if (shouldInvite) {
        setShowInvitePrompt(true);
        await markInviteShown();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAnonymous]);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Already played today
  if (alreadyPlayed) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
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
            {t("dailyAlreadyPlayedTitle")}
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-center mb-4">
            {fmt(t("dailyScoreOutOf"), { score: previousScore ?? 0, total: TOTAL_QUESTIONS })}
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-center mb-8 opacity-60">
            {t("dailyAlreadyPlayedSubtitle")}
          </Text>

          {streak > 0 && (
            <View
              className="rounded-xl px-6 py-4 mb-8"
              style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}
            >
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">🔥</Text>
                <View>
                  <Text style={{ color: COLORS.orange }} className="font-bold text-xl">
                    {fmt(t("dailyStreakDays"), { count: streak })}
                  </Text>
                  <Text style={{ color: COLORS.orange, opacity: 0.6 }} className="text-sm">
                    {t("dailyStreakLabel")}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Pressable
            onPress={() => router.navigate("/(tabs)")}
            className="rounded-xl py-4 px-8"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
              {t("dailyBackHome")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Game Over screen — show summary
  if (gameOver) {
    const finalScore = scoreRef.current;
    const headline =
      finalScore >= TOTAL_QUESTIONS
        ? t("dailyResultGreat")
        : finalScore >= 3
        ? t("dailyResultGood")
        : t("dailyResultMeh");
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
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

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 }}>
          <Animated.View
            entering={FadeIn.duration(500)}
            className="items-center"
          >
            <View
              className="w-28 h-28 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: perfect ? 'rgba(255, 209, 0, 0.2)' : COLORS.primaryDim,
              }}
            >
              <Text className="text-6xl">{perfect ? "🏆" : finalScore >= 3 ? "💪" : "🧠"}</Text>
            </View>

            <Text className="text-white text-3xl font-bold text-center mb-2">
              {headline}
            </Text>

            <Text style={{ color: COLORS.textMuted }} className="text-center mb-6">
              {fmt(t("dailyScoreOutOf"), { score: finalScore, total: TOTAL_QUESTIONS })}
            </Text>

            <View
              className="rounded-2xl px-8 py-6 mb-6 items-center"
              style={{ backgroundColor: COLORS.surface }}
            >
              <Text style={{ color: COLORS.textMuted }} className="text-sm mb-1">
                {t("dailyTotalScore").toUpperCase()}
              </Text>
              <Text className="text-white text-5xl font-bold">
                {finalScore}/{TOTAL_QUESTIONS}
              </Text>
              {isNewRecord && (
                <View
                  className="rounded-full px-4 py-1 mt-2"
                  style={{ backgroundColor: 'rgba(255, 209, 0, 0.2)' }}
                >
                  <Text style={{ color: COLORS.yellow }} className="font-bold">
                    {t("dailyNewRecord")}
                  </Text>
                </View>
              )}
            </View>

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

            {perfect && (
              <View
                className="rounded-xl px-6 py-3 mb-4"
                style={{ backgroundColor: 'rgba(255, 209, 0, 0.15)' }}
              >
                <Text style={{ color: COLORS.yellow }} className="font-bold">
                  {t("dailyBonus5of5")}
                </Text>
              </View>
            )}

            {streak > 0 && (
              <View
                className="rounded-xl px-6 py-4 mb-8"
                style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}
              >
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-3">🔥</Text>
                  <View>
                    <Text style={{ color: COLORS.orange }} className="font-bold text-xl">
                      {fmt(t("dailyStreakDays"), { count: streak })}
                    </Text>
                    <Text style={{ color: COLORS.orange, opacity: 0.6 }} className="text-sm">
                      {t("dailyStreakLabel")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="mb-6">
              <ShareScorecard
                score={finalScore}
                streak={streak}
                questionsAnswered={TOTAL_QUESTIONS}
                isNewRecord={isNewRecord}
              />
            </View>

            {showInvitePrompt && (
              <View
                className="rounded-xl p-4 mb-4"
                style={{
                  backgroundColor: "rgba(161, 110, 255, 0.15)",
                  borderWidth: 1,
                  borderColor: "rgba(161, 110, 255, 0.3)",
                }}
              >
                <Text className="text-white font-bold text-center mb-2">
                  {t("inviteFriends")}
                </Text>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={async () => {
                      await inviteFriends();
                      setShowInvitePrompt(false);
                    }}
                    className="flex-1 rounded-xl py-3 items-center"
                    style={{ backgroundColor: COLORS.purple }}
                  >
                    <Text className="text-white font-bold">{t("invite")}</Text>
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      await markInviteDismissed();
                      setShowInvitePrompt(false);
                    }}
                    className="flex-1 rounded-xl py-3 items-center"
                    style={{ backgroundColor: COLORS.surface }}
                  >
                    <Text style={{ color: COLORS.textMuted }} className="font-bold">{t("cancel")}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <Pressable
              onPress={() => router.navigate("/(tabs)")}
              className="rounded-xl py-4 px-8"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
                {t("dailyBackHome")}
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading
  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted }} className="mt-4">{t("loading")}</Text>
      </SafeAreaView>
    );
  }

  // Empty (no questions available)
  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">🎯</Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
            {t("dailyEmptyTitle")}
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-center mb-8">
            {t("dailyEmptySubtitle")}
          </Text>
          <Pressable
            onPress={() => router.navigate("/(tabs)")}
            className="rounded-xl py-4 px-8"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="font-bold" style={{ color: COLORS.bg }}>{t("dailyBackHome")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const progressPct = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;
  const questionNumber = currentIndex + 1;

  // Game in progress
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
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
          <IconButton
            name="ArrowLeft"
            onPress={() => router.navigate("/(tabs)")}
            variant="glass"
            size={40}
          />

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

          <View
            className="px-4 py-2 rounded-full flex-row items-center gap-2"
            style={{
              backgroundColor: 'rgba(30, 37, 41, 0.7)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text className="text-xl" style={{ color: COLORS.primary }}>🏆</Text>
            <Text className="text-sm font-bold tracking-wide text-white">{score}/{TOTAL_QUESTIONS}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="px-6 pt-2">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs font-bold tracking-wide" style={{ color: COLORS.textMuted }}>
              {fmt(t("dailyProgress"), { current: questionNumber, total: TOTAL_QUESTIONS })}
            </Text>
          </View>
          <View
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <View
              style={{
                width: `${progressPct}%`,
                height: '100%',
                backgroundColor: COLORS.primary,
                borderRadius: 999,
              }}
            />
          </View>
        </View>

        {/* Timer Section */}
        <View className="items-center py-4">
          <DailyCircularTimer
            timeRemaining={timeRemaining}
            totalTime={TOTAL_TIME}
            questionNumber={questionNumber}
          />
        </View>

        {/* Scrollable Question & Answers */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={currentQuestion.id}
            entering={SlideInRight.duration(300)}
            className="px-6 mb-6"
          >
            <Animated.View
              style={animatedScaleStyle}
              className="rounded-2xl relative overflow-hidden"
            >
              <View
                style={{
                  backgroundColor: COLORS.surface,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  borderRadius: 16,
                }}
              >
                <View className="p-6">
                  <View
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{ backgroundColor: COLORS.primary }}
                  />

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

                  {currentQuestion.image_url && (
                    <View className="mt-4 items-center">
                      <QuestionImage
                        uri={currentQuestion.image_url}
                        style={{ width: 200, height: 150, borderRadius: 12 }}
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
          </Animated.View>

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
                  {isCorrect ? t("dailyCorrectNext") : t("dailyWrongNext")}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <RatingModal visible={showRatingModal} onClose={closeRatingModal} />
    </SafeAreaView>
  );
}
