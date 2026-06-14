import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { CircularTimer as SharedCircularTimer } from "../../src/components/CircularTimer";
import { recordPlay } from "../../src/services/dailyLimits";
import {
  getAsyncDuelQuestions,
  submitAsyncPlay,
  type AsyncDuelQuestion,
  type AsyncDuelAnswer,
} from "../../src/services/duel";
import {
  correctAnswerFeedback,
  wrongAnswerFeedback,
} from "../../src/utils/feedback";
import { QuestionImage } from "../../src/components/QuestionImage";

const COLORS = {
  teal: "#00c2cc",
  tealDim: "rgba(0, 194, 204, 0.15)",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  bg: "#161a1d",
  surface: "#22282c",
  surfaceLight: "#2c3339",
};

const QUESTION_TIME = 15; // seconds

// Build the 4-option array (1 correct + 3 wrong) and shuffle deterministically per question.
function buildOptions(q: AsyncDuelQuestion): { text: string; isCorrect: boolean }[] {
  const all = [
    { text: q.correct_answer, isCorrect: true },
    ...(q.wrong_answers || []).map((w) => ({ text: w, isCorrect: false })),
  ].filter((o) => !!o.text);

  // Deterministic shuffle per question id so both clients see the same order if needed.
  // (Not strictly required since order is local, but tidier.)
  const seed = q.id
    .split("")
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);
  const rand = (n: number) => {
    let s = seed + n * 17;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  };
  const rng = rand(1);
  const out = [...all];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, 4);
}

function CircularTimer({
  timeLeft,
  totalTime,
}: {
  timeLeft: number;
  totalTime: number;
}) {
  const SIZE = 80;
  return (
    <View
      className="relative items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
      <SharedCircularTimer
        totalSeconds={totalTime}
        timeLeft={timeLeft}
        size={SIZE}
        color={COLORS.teal}
        strokeWidth={4}
        hideTimeText
      >
        <Text
          className="text-3xl font-bold text-white"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {String(timeLeft).padStart(2, "0")}
        </Text>
        <Text className="text-[9px] uppercase tracking-widest text-gray-400">
          SEC
        </Text>
      </SharedCircularTimer>
    </View>
  );
}

function AnswerOption({
  letter,
  text,
  isSelected,
  isCorrect,
  isRevealed,
  onPress,
  disabled,
}: {
  letter: string;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isRevealed: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(withSpring(0.95), withSpring(1));
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  let bgColor: string = COLORS.surface;
  let borderColor: string = "rgba(255,255,255,0.05)";
  let borderWidth = 1;

  if (isSelected && !isRevealed) {
    bgColor = COLORS.tealDim;
    borderColor = COLORS.teal;
    borderWidth = 2;
  } else if (isRevealed && isCorrect) {
    bgColor = "rgba(34, 197, 94, 0.2)";
    borderColor = "#22c55e";
    borderWidth = 2;
  } else if (isRevealed && isSelected && !isCorrect) {
    bgColor = "rgba(239, 68, 68, 0.2)";
    borderColor = "#ef4444";
    borderWidth = 2;
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        className="relative flex-row items-center justify-center p-4 h-24 rounded-xl overflow-hidden"
        style={{ backgroundColor: bgColor, borderWidth, borderColor }}
      >
        <View
          className="absolute top-3 left-3 w-6 h-6 rounded-full items-center justify-center"
          style={{
            backgroundColor: isSelected ? COLORS.teal : "transparent",
            borderWidth: isSelected ? 0 : 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <Text
            className="text-xs font-bold"
            style={{ color: isSelected ? COLORS.bg : "#9ca3af" }}
          >
            {letter}
          </Text>
        </View>
        <Text
          className="text-base font-medium text-center px-6"
          style={{ color: "white" }}
        >
          {text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function DuelPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [questions, setQuestions] = useState<AsyncDuelQuestion[]>([]);
  const [optionsByQ, setOptionsByQ] = useState<
    { text: string; isCorrect: boolean }[][]
  >([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [score, setScore] = useState(0);
  // Hold the countdown until the question image is on screen (or there is none).
  const [imageReady, setImageReady] = useState(true);
  const handleImageReady = useCallback(() => setImageReady(true), []);

  const answersRef = useRef<AsyncDuelAnswer[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const totalStartRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load duel + questions
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { questions } = await getAsyncDuelQuestions(id);
        setQuestions(questions);
        setOptionsByQ(questions.map(buildOptions));
        startTimeRef.current = Date.now();
        totalStartRef.current = Date.now();
      } catch (e) {
        console.error("Load duel error", e);
      }
      setLoading(false);
    })();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const submitFinal = useCallback(
    async (allAnswers: AsyncDuelAnswer[]) => {
      if (!id || submitting) return;
      setSubmitting(true);
      const totalMs = Date.now() - totalStartRef.current;
      try {
        await submitAsyncPlay(id, allAnswers, totalMs);
        try {
          await recordPlay("versus");
        } catch (e) {
          console.error("recordPlay error", e);
        }
        router.replace(`/duel/result?id=${id}`);
      } catch (e) {
        console.error("submit error", e);
        setSubmitting(false);
      }
    },
    [id, submitting]
  );

  const moveToNext = useCallback(
    (updatedAnswers: AsyncDuelAnswer[]) => {
      if (currentRound + 1 >= questions.length) {
        submitFinal(updatedAnswers);
      } else {
        setCurrentRound((r) => r + 1);
        setSelectedIdx(null);
        setIsRevealed(false);
        setTimeLeft(QUESTION_TIME);
        startTimeRef.current = Date.now();
      }
    },
    [currentRound, questions.length, submitFinal]
  );

  const handleTimeout = useCallback(() => {
    if (selectedIdx !== null || isRevealed) return;
    const q = questions[currentRound];
    if (!q) return;
    const elapsed = Date.now() - startTimeRef.current;
    const ans: AsyncDuelAnswer = {
      question_id: q.id,
      position: currentRound,
      answer_idx: -1,
      is_correct: false,
      time_ms: elapsed,
    };
    answersRef.current = [...answersRef.current, ans];
    setIsRevealed(true);
    wrongAnswerFeedback();
    setTimeout(() => moveToNext(answersRef.current), 1500);
  }, [currentRound, isRevealed, moveToNext, questions, selectedIdx]);

  // Déclenché HORS de l'updater du timer : avec React 19, un side effect
  // dans setX(prev => ...) peut être ré-invoqué → timeouts fantômes qui
  // auto-répondent la question suivante (cf. fix équivalent côté web).
  const onTimeUpRef = useRef(handleTimeout);
  onTimeUpRef.current = handleTimeout;
  useEffect(() => {
    if (timeLeft !== 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    onTimeUpRef.current();
  }, [timeLeft]);

  // Reset the image gate when the round changes.
  useEffect(() => {
    setImageReady(!questions[currentRound]?.image_url);
  }, [currentRound, questions]);

  // Timer — only once the question image (if any) is on screen.
  useEffect(() => {
    if (loading || selectedIdx !== null || isRevealed || !imageReady) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, currentRound, selectedIdx, isRevealed, imageReady, handleTimeout]);

  const handleAnswer = (idx: number) => {
    if (selectedIdx !== null || isRevealed) return;
    const q = questions[currentRound];
    const opts = optionsByQ[currentRound];
    if (!q || !opts) return;

    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    const opt = opts[idx];
    const isCorrect = opt.isCorrect;

    setSelectedIdx(idx);

    const ans: AsyncDuelAnswer = {
      question_id: q.id,
      position: currentRound,
      answer_idx: idx,
      is_correct: isCorrect,
      time_ms: elapsed,
    };
    answersRef.current = [...answersRef.current, ans];

    setTimeout(() => {
      setIsRevealed(true);
      if (isCorrect) {
        correctAnswerFeedback();
        setScore((s) => s + 1);
      } else {
        wrongAnswerFeedback();
      }
      setTimeout(() => moveToNext(answersRef.current), 1500);
    }, 400);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.teal} />
        </View>
      </SafeAreaView>
    );
  }

  if (!questions.length) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">❌</Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
            {t("error" as any)}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-xl py-4 px-8 mt-6"
            style={{ backgroundColor: COLORS.teal }}
          >
            <Text className="font-bold" style={{ color: COLORS.bg }}>
              {t("cancel" as any)}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentRound];
  const currentOpts = optionsByQ[currentRound] || [];
  const letters = ["A", "B", "C", "D"];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <Text className="text-gray-400 text-xl">✕</Text>
        </Pressable>

        <View className="items-center">
          <Text className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">
            DUEL · ASYNC
          </Text>
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: COLORS.surfaceLight,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: COLORS.teal }}
            >
              {currentRound + 1} / {questions.length}
            </Text>
          </View>
        </View>

        <View className="w-10 h-10 items-center justify-center">
          <Text
            className="text-base font-bold"
            style={{ color: COLORS.teal }}
          >
            {score}
          </Text>
        </View>
      </View>

      {/* Game Area */}
      <View className="flex-1 px-5 py-4">
        {/* Timer centered */}
        <View className="items-center mb-6">
          <CircularTimer timeLeft={timeLeft} totalTime={QUESTION_TIME} />
        </View>

        {/* Question Card */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: `${COLORS.surface}80`,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          {currentQ.image_url && (
            <QuestionImage
              uri={currentQ.image_url}
              style={{ width: "100%", height: 140, borderRadius: 12, marginBottom: 12 }}
              onReady={handleImageReady}
            />
          )}
          <Text className="text-xl font-medium text-white leading-7">
            {currentQ.question_text}
          </Text>

          <View
            className="w-full h-1.5 rounded-full mt-6 overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <LinearGradient
              colors={[COLORS.teal, COLORS.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: "100%",
                width: `${((currentRound + 1) / questions.length) * 100}%`,
                borderRadius: 9999,
              }}
            />
          </View>
        </View>

        {/* Answers */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {currentOpts.map((opt, idx) => (
            <View key={idx} className="w-[48%]">
              <AnswerOption
                letter={letters[idx]}
                text={opt.text}
                isSelected={selectedIdx === idx}
                isCorrect={opt.isCorrect}
                isRevealed={isRevealed}
                onPress={() => handleAnswer(idx)}
                disabled={selectedIdx !== null}
              />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
