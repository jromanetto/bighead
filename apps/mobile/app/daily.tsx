import { View, Text, Pressable, ActivityIndicator, ScrollView, Share } from "react-native";
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
import { reportCaught } from "../src/utils/errorReport";
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
import { IconButton } from "../src/components/ui";
import { useRatingPrompt } from "../src/hooks/useRatingPrompt";
import { RatingModal } from "../src/components/RatingModal";
import { QuestionImage } from "../src/components/QuestionImage";
import { ShareScorecard } from "../src/components/ShareScorecard";
import { buildDailyShareText } from "../src/utils/dailyShare";
import { DayTwoBridge } from "../src/components/DayTwoBridge";
import { ResultIcon } from "../src/components/icons/ResultIcon";
import { incrementWins, shouldShowInvitePrompt, markInviteShown, markInviteDismissed } from "../src/services/invite-prompt";
import { recordQuestionOutcome } from "../src/services/questions";
import { inviteFriends } from "../src/utils/share";
import { useTranslation } from "../src/contexts/LanguageContext";
import { AnimatedNumber } from "../src/components/AnimatedNumber";
import { ConfettiEffect } from "../src/components/effects/ConfettiEffect";
import { isStreakMilestone } from "../src/utils/progression";

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
// Survival : on tolère 1 erreur ; la 2e termine la partie.
const MAX_ERRORS_ALLOWED = 1;
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
  const { t, language } = useTranslation();
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
  const [results, setResults] = useState<boolean[]>([]); // per-question correctness for the Wordle grid
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [showInvitePrompt, setShowInvitePrompt] = useState(false);
  // Hold the countdown until the question image is on screen (or there is none).
  const [imageReady, setImageReady] = useState(true);
  const { showRatingModal, closeRatingModal, checkAndShowRating } = useRatingPrompt();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(Date.now());
  const userLanguage = useRef<string>("en");
  const finishingRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0);
  // Questions the user actively answered (taps, not timeouts). Stays 0 when the
  // daily is opened then abandoned (timers auto-advance) — we must NOT record or
  // lock that as a played 0/5.
  const answeredRef = useRef<number>(0);
  const errorsRef = useRef<number>(0);
  const [errors, setErrors] = useState(0);

  const scale = useSharedValue(1);

  const currentQuestion = questions[currentIndex] || null;

  const handleImageReady = useCallback(() => setImageReady(true), []);

  // Reload (in the chosen language) on mount, and whenever the user changes
  // the app language — so the daily questions follow the UI language.
  useEffect(() => {
    checkAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, language]);

  // Timer: counts down per question — only once the image (if any) has loaded.
  useEffect(() => {
    if (!currentQuestion || gameOver || alreadyPlayed || selectedAnswer !== null) {
      return;
    }
    if (!imageReady) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, gameOver, alreadyPlayed, selectedAnswer, imageReady]);

  // Reset timer + image gate when the question changes.
  useEffect(() => {
    if (currentQuestion && !gameOver && !alreadyPlayed) {
      setTimeRemaining(TOTAL_TIME);
      setImageReady(!currentQuestion.image_url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, gameOver, alreadyPlayed]);

  const checkAndLoad = async () => {
    setLoading(true);
    try {
      // Use the live app language (context) so a language change reloads the
      // questions in the new language without a stale-settings race.
      userLanguage.current = language;

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
      answeredRef.current = 0;
      errorsRef.current = 0;
      setErrors(0);
      finishingRef.current = false;
      const daily = await getTodaysDailyQuestions(userLanguage.current);
      setQuestions(daily);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error loading daily brain:", error);
      reportCaught("daily_load", error);
    }
    setLoading(false);
  };

  const advance = useCallback(() => {
    // Survival : au-delà de l'erreur tolérée, la partie s'arrête net.
    if (errorsRef.current > MAX_ERRORS_ALLOWED) {
      finishSession();
      return;
    }
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
    setResults((r) => [...r, false]);
    errorsRef.current += 1; // timeout = erreur (survival)
    setErrors(errorsRef.current);
    recordQuestionOutcome(currentQuestion.id, false); // timeout = wrong
    wrongAnswerFeedback();
    setTimeout(() => {
      advance();
    }, FEEDBACK_DELAY_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswer, currentQuestion, advance]);

  // Déclenché HORS de l'updater du timer : avec React 19, un side effect
  // dans setX(prev => ...) peut être ré-invoqué → timeouts fantômes qui
  // auto-répondent la question suivante (cf. fix équivalent côté web).
  const onTimeUpRef = useRef(handleTimeout);
  onTimeUpRef.current = handleTimeout;
  useEffect(() => {
    if (timeRemaining !== 0) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onTimeUpRef.current();
  }, [timeRemaining]);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    answeredRef.current += 1;
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setResults((r) => [...r, correct]);
    // Feed the difficulty requalification job (fire-and-forget).
    recordQuestionOutcome(currentQuestion.id, correct);

    if (correct) {
      correctAnswerFeedback();
      scale.value = withSequence(withSpring(1.1), withSpring(1));
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
    } else {
      errorsRef.current += 1; // survival : erreur
      setErrors(errorsRef.current);
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

    // Abandoned: opened then left, all questions auto-timed-out with zero taps.
    // Do NOT record (DB or local) or lock it as a played 0/5 — this is the bug
    // that kept users stuck on "Déjà joué aujourd'hui ! 0/5" without playing.
    if (answeredRef.current === 0) {
      return;
    }

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
    const eliminated = errorsRef.current > MAX_ERRORS_ALLOWED && finalScore < TOTAL_QUESTIONS;
    const headline = eliminated
      ? (language === "fr" ? "Éliminé !" : "Game over!")
      : finalScore >= TOTAL_QUESTIONS
        ? t("dailyResultGreat")
        : finalScore >= 3
        ? t("dailyResultGood")
        : t("dailyResultMeh");
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <ConfettiEffect trigger={perfect || isStreakMilestone(streak)} />
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
                backgroundColor: eliminated
                  ? 'rgba(255,107,107,0.18)'
                  : perfect
                    ? 'rgba(255, 209, 0, 0.2)'
                    : COLORS.primaryDim,
              }}
            >
              <ResultIcon
                name={eliminated ? "gameover" : perfect ? "trophy" : finalScore >= 3 ? "medal" : "idea"}
                color={eliminated ? "#FF6B6B" : perfect ? COLORS.yellow : COLORS.primary}
                size={58}
              />
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
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <AnimatedNumber
                  value={finalScore}
                  duration={900}
                  style={{ color: "#ffffff", fontSize: 48, fontWeight: "700" }}
                />
                <Text className="text-white text-5xl font-bold">/{TOTAL_QUESTIONS}</Text>
              </View>
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
                <AnimatedNumber
                  value={xpEarned}
                  duration={800}
                  prefix="+"
                  suffix=" XP"
                  style={{ color: COLORS.primary, fontWeight: "700", fontSize: 18 }}
                />
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

            {/* Pont jour-1 → jour-2 : rendez-vous demain + teaser + notif */}
            <DayTwoBridge streak={streak} />

            {isStreakMilestone(streak) && (
              <View
                className="rounded-xl px-6 py-4 mb-8 items-center"
                style={{ backgroundColor: 'rgba(251, 191, 36, 0.18)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.4)' }}
              >
                <Text className="text-4xl mb-1">🏆</Text>
                <Text style={{ color: '#fbbf24' }} className="font-extrabold text-lg text-center">
                  {language === "fr"
                    ? `Palier ${streak} jours atteint !`
                    : `${streak}-day milestone reached!`}
                </Text>
                <Text style={{ color: '#fbbf24', opacity: 0.7 }} className="text-sm text-center">
                  {language === "fr" ? "Bonus XP débloqué 🎉" : "XP bonus unlocked 🎉"}
                </Text>
              </View>
            )}

            {/* Wordle-style grid + text share — the viral loop */}
            {results.length > 0 && (
              <View className="mb-5 items-center">
                <Text style={{ fontSize: 26, letterSpacing: 2 }}>
                  {results.map((r) => (r ? "🟩" : "🟥")).join("")}
                </Text>
                <Pressable
                  onPress={() =>
                    Share.share({
                      message: buildDailyShareText(results, streak, language === "fr" ? "fr" : "en"),
                    })
                  }
                  className="mt-3 px-6 py-3 rounded-xl active:opacity-80"
                  style={{ backgroundColor: "#22c55e" }}
                >
                  <Text className="font-bold" style={{ color: "#0d1117" }}>
                    {language === "fr" ? "🟩 Partager ma grille" : "🟩 Share my grid"}
                  </Text>
                </Pressable>
              </View>
            )}

            <View className="mb-6">
              <ShareScorecard
                score={finalScore}
                streak={streak}
                questionsAnswered={TOTAL_QUESTIONS}
                isNewRecord={isNewRecord}
                lang={language === "fr" ? "fr" : "en"}
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
            <Text className="text-sm tracking-tight" accessibilityLabel={`${Math.max(0, MAX_ERRORS_ALLOWED + 1 - errors)} vies`}>
              {"❤️".repeat(Math.max(0, MAX_ERRORS_ALLOWED + 1 - errors))}{"🤍".repeat(Math.min(MAX_ERRORS_ALLOWED + 1, errors))}
            </Text>
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
                        correctAnswer={currentQuestion.answers[currentQuestion.correctIndex]}
                        category={currentQuestion.category}
                        onReady={handleImageReady}
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
