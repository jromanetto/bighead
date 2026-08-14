import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { AudioPlayer } from "../../src/components/AudioPlayer";
import { XPGainBanner } from "../../src/components/XPGainBanner";
import { Icon } from "../../src/components/ui";
import { Skeleton } from "../../src/components/Skeleton";
import { EmptyState } from "../../src/components/EmptyState";
import { AnimatedNumber } from "../../src/components/AnimatedNumber";
import { ConfettiEffect } from "../../src/components/effects/ConfettiEffect";
import { ComboBadge } from "../../src/components/ComboBadge";
import {
  getRandomAudioQuestions,
  formatAudioQuestions,
  recordAudioQuestionResult,
  computeAudioQuizXP,
  type FormattedAudioQuestion,
} from "../../src/services/audioQuiz";
import { awardXP, type XPGain } from "../../src/services/xp";
import { correctAnswerFeedback, wrongAnswerFeedback, buttonPressFeedback } from "../../src/utils/feedback";

// QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  yellow: "#FFD100",
  green: "#22c55e",
  greenDim: "rgba(34, 197, 94, 0.2)",
  red: "#ef4444",
  redDim: "rgba(239, 68, 68, 0.2)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const TOTAL_QUESTIONS = 10;
const QUESTION_DURATION_SEC = 15;
const LETTER_OPTIONS = ["A", "B", "C", "D"];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Phase = "loading" | "playing" | "feedback" | "done" | "empty";

export default function AudioQuizPlayScreen() {
  const { user, refreshProfile } = useAuth();
  const { t, language } = useTranslation();

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<FormattedAudioQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_SEC);
  const [xpGain, setXpGain] = useState<XPGain | null>(null);
  const xpAwardedRef = useRef(false);

  const progress = useSharedValue(1);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Timer starts only once audio is ready; tracked per question index.
  const [audioLoading, setAudioLoading] = useState(true);
  const timerStartedForIdx = useRef<number>(-1);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Load questions on mount ---------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const raw = await getRandomAudioQuestions(TOTAL_QUESTIONS, language);
        if (!raw.length) {
          setPhase("empty");
          return;
        }
        setQuestions(formatAudioQuestions(raw));
        setPhase("playing");
      } catch (e) {
        console.error("[audio/play] load error:", e);
        setPhase("empty");
      }
    })();
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [language]);

  // ---- Timer per question -------------------------------------------
  const startTimer = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    setTimeLeft(QUESTION_DURATION_SEC);
    progress.value = 1;
    progress.value = withTiming(
      0,
      { duration: QUESTION_DURATION_SEC * 1000, easing: Easing.linear },
      (finished) => {
        if (finished) {
          runOnJS(handleTimeout)();
        }
      }
    );
    tickRef.current = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [progress]);

  const stopTimer = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  // Called by AudioPlayer once the audio actually starts (or fails to load).
  // Starts the countdown only then, so loading time isn't deducted.
  const handleAudioReady = useCallback(() => {
    if (phase !== "playing") return;
    if (timerStartedForIdx.current === idx) return; // already started this question
    timerStartedForIdx.current = idx;
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setAudioLoading(false);
    startTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, startTimer]);

  // On entering a question: reset loading state + arm a safety fallback so a
  // hung download never leaves the user stuck without a timer.
  useEffect(() => {
    if (phase === "playing" && questions.length > 0) {
      setAudioLoading(true);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = setTimeout(() => {
        handleAudioReady();
      }, 6000);
    }
    if (phase !== "playing") {
      stopTimer();
      cancelAnimation(progress); // prevent the ring finishing later and firing handleTimeout on feedback
    }
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, questions.length]);

  // ---- Answer + advance ---------------------------------------------
  const handleTimeout = () => {
    if (phase !== "playing") return;
    setSelected(-1);
    setCombo(0);
    setPhase("feedback");
    void wrongAnswerFeedback();
    const q = questions[idx];
    if (q) void recordAudioQuestionResult(q.id, false);
  };

  const handleAnswer = (answerIdx: number) => {
    if (phase !== "playing") return;
    stopTimer();
    setSelected(answerIdx);
    const q = questions[idx];
    if (!q) return;
    const isCorrect = answerIdx === q.correctIndex;
    if (isCorrect) {
      setCorrectCount((n) => n + 1);
      setCombo((c) => c + 1);
      void correctAnswerFeedback();
    } else {
      setCombo(0);
      void wrongAnswerFeedback();
    }
    void recordAudioQuestionResult(q.id, isCorrect);
    setPhase("feedback");
  };

  const goNext = () => {
    buttonPressFeedback();
    if (idx + 1 >= questions.length) {
      setPhase("done");
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setPhase("playing");
  };

  // ---- Award XP at the end ------------------------------------------
  useEffect(() => {
    if (phase !== "done" || xpAwardedRef.current) return;
    xpAwardedRef.current = true;

    const { base, bonus, total, isPerfect } = computeAudioQuizXP(correctCount, questions.length);
    const breakdown: XPGain["breakdown"] = [
      { label: t("correct"), amount: base },
    ];
    if (isPerfect) breakdown.push({ label: t("audioPerfect"), amount: bonus });

    const gain: XPGain = { base, bonus, total, breakdown };
    setXpGain(gain);

    if (user && total > 0) {
      // Reuse the 'daily' XP source — audio_quiz is not yet a typed XPSource.
      // TODO(xp): add 'audio_quiz' to XPSource union once mode goes live.
      awardXP(user.id, total, "daily", {
        mode: "audio_quiz",
        correct: correctCount,
        total: questions.length,
      })
        .then(async (newTotal) => {
          if (newTotal !== null) await refreshProfile();
        })
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- Animated timer ring ------------------------------------------
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // ---- Render --------------------------------------------------------
  if (phase === "loading") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Skeleton width={28} height={28} rounded={14} />
            <Skeleton width={56} height={14} rounded={6} />
            <Skeleton width={56} height={56} rounded={28} />
          </View>
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              paddingVertical: 28,
              paddingHorizontal: 20,
              alignItems: "center",
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Skeleton width={120} height={120} rounded={60} />
          </View>
          <Skeleton width="80%" height={20} rounded={6} />
          <View style={{ height: 18 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <Skeleton width="100%" height={60} rounded={12} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "empty") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.bg }}>
        <EmptyState
          emoji="🎵"
          title={t("audioQuizEmptyTitle")}
          subtitle={t("audioQuizEmptySubtitle")}
          cta={{
            label: t("backToHome"),
            onPress: () => router.back(),
          }}
        />
      </SafeAreaView>
    );
  }

  if (phase === "done") {
    const isPerfect = correctCount === questions.length && questions.length > 0;
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <ConfettiEffect trigger={isPerfect} />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
          <View className="items-center">
            <Text style={{ fontSize: 64, marginBottom: 12 }}>{isPerfect ? "🏆" : "🎵"}</Text>
            <Text className="text-white text-3xl font-black text-center mb-1">
              {isPerfect ? t("audioPerfect") : t("gameOver")}
            </Text>
            <Text style={{ color: COLORS.textMuted, marginBottom: 24 }}>
              {t("audioQuizTitle")}
            </Text>

            <View
              className="rounded-2xl px-8 py-6 mb-6 items-center"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}
            >
              <Text style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 4 }}>
                {t("yourScore")}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <AnimatedNumber
                  value={correctCount}
                  duration={900}
                  style={{ color: "#ffffff", fontSize: 48, fontWeight: "900" }}
                />
                <Text style={{ color: COLORS.textMuted, fontSize: 28, fontWeight: "700" }}>
                  {" / "}{questions.length}
                </Text>
              </View>
            </View>

            {xpGain && (
              <View style={{ width: "100%", marginBottom: 24 }}>
                <XPGainBanner gain={xpGain} compact />
              </View>
            )}

            <View className="flex-row gap-3 w-full">
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.replace("/audio/play" as any);
                }}
                className="flex-1 items-center justify-center py-3 rounded-xl active:opacity-90"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text className="font-bold" style={{ color: COLORS.bg }}>
                  {t("playAgain")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.replace("/");
                }}
                className="flex-1 items-center justify-center py-3 rounded-xl active:opacity-90"
                style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
              >
                <Text className="text-white font-bold">{t("backToHome")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // playing / feedback
  const q = questions[idx];
  if (!q) return null;
  const isFeedback = phase === "feedback";

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header: question count + timer */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <Pressable
          onPress={() => {
            buttonPressFeedback();
            router.back();
          }}
          className="active:opacity-70"
        >
          <Icon name="ChevronLeft" size={28} color={COLORS.text} />
        </Pressable>

        <Text style={{ color: COLORS.text, fontWeight: "700" }}>
          {idx + 1} / {questions.length}
        </Text>

        <View style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center" }}>
          <Svg width={56} height={56}>
            <Circle
              cx={28}
              cy={28}
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={4}
              fill="transparent"
            />
            <AnimatedCircle
              cx={28}
              cy={28}
              r={radius}
              stroke={timeLeft <= 5 ? COLORS.red : COLORS.primary}
              strokeWidth={4}
              fill="transparent"
              strokeDasharray={`${circumference} ${circumference}`}
              animatedProps={animatedProps}
              strokeLinecap="round"
              transform={`rotate(-90 28 28)`}
            />
          </Svg>
          <Text
            style={{
              position: "absolute",
              color: timeLeft <= 5 ? COLORS.red : COLORS.text,
              fontWeight: "800",
              fontSize: audioLoading && !isFeedback ? 16 : 14,
            }}
          >
            {audioLoading && !isFeedback ? "🎵" : timeLeft}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        <ComboBadge combo={combo} />
        {/* Audio player card */}
        <View
          className="rounded-2xl py-6 mb-6 items-center"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <LinearGradient
            colors={["transparent", "rgba(0, 194, 204, 0.08)", "transparent"]}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: 16 }}
          />
          <AudioPlayer
            audioUrl={q.audioUrl}
            questionId={q.id}
            maxReplays={2}
            autoPlay
            onPlaybackStart={handleAudioReady}
            onLoadError={handleAudioReady}
          />
          {q.audioCredit && (
            <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 8 }}>
              {q.audioCredit}
            </Text>
          )}
        </View>

        {/* Question */}
        <Text className="text-white text-xl font-bold text-center mb-5">{q.question}</Text>

        {/* Answers */}
        <View className="flex-col gap-3">
          {q.answers.map((answer, i) => {
            const isSelected = selected === i;
            const isCorrectAnswer = i === q.correctIndex;
            let bg: string = COLORS.surface;
            let borderColor: string = "rgba(255,255,255,0.05)";
            let label = COLORS.text;
            if (isFeedback) {
              if (isCorrectAnswer) {
                bg = COLORS.greenDim;
                borderColor = COLORS.green;
                label = COLORS.green;
              } else if (isSelected) {
                bg = COLORS.redDim;
                borderColor = COLORS.red;
                label = COLORS.red;
              }
            } else if (isSelected) {
              bg = COLORS.primaryDim;
              borderColor = COLORS.primary;
            }

            return (
              <Pressable
                key={`${q.id}-${i}`}
                disabled={isFeedback}
                onPress={() => handleAnswer(i)}
                className="active:opacity-90 rounded-xl flex-row items-center"
                style={{
                  backgroundColor: bg,
                  borderWidth: 1.5,
                  borderColor,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  minHeight: 60,
                }}
              >
                <View
                  className="items-center justify-center mr-3"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Text style={{ color: label, fontWeight: "800" }}>{LETTER_OPTIONS[i]}</Text>
                </View>
                <Text style={{ color: label, flex: 1, fontSize: 16, fontWeight: "600" }}>
                  {answer}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isFeedback && (
          <Pressable
            onPress={goNext}
            className="mt-6 items-center justify-center py-4 rounded-xl active:opacity-90"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="font-bold text-base" style={{ color: COLORS.bg }}>
              {idx + 1 >= questions.length ? t("yourScore") : t("nextQuestion")}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
