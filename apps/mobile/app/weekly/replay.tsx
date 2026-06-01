import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  shuffleAnswers,
  type WeeklyChallenge,
  type WeeklyQuestion,
} from "../../src/services/weeklyChallenge";
import {
  getChallengeById,
  getReplayQuestion,
  submitReplayAnswer,
} from "../../src/services/weeklyHistory";
import { useTranslation } from "../../src/contexts/LanguageContext";
import {
  buttonPressFeedback,
  correctAnswerFeedback,
  wrongAnswerFeedback,
} from "../../src/utils/feedback";
import { QuestionImage } from "../../src/components/QuestionImage";
import { mixHex } from "../../src/utils/colors";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  text: "#ffffff",
  textMuted: "#9ca3af",
  success: "#22c55e",
  error: "#ef4444",
};

const LETTERS = ["A", "B", "C", "D"];

export default function WeeklyReplay() {
  const { t, language } = useTranslation();
  const params = useLocalSearchParams<{ replay_id?: string; challenge_id?: string }>();
  const replayId = params.replay_id ?? "";
  const challengeId = params.challenge_id ?? "";

  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [question, setQuestion] = useState<WeeklyQuestion | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [position, setPosition] = useState(1);
  const [correctSoFar, setCorrectSoFar] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showLearning, setShowLearning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load challenge metadata + original score once
  useEffect(() => {
    (async () => {
      if (!challengeId) {
        setError(t("error"));
        setLoading(false);
        return;
      }
      const c = (await getChallengeById(challengeId)) as WeeklyChallenge | null;
      setChallenge(c);
      // Load original score (from progress) via direct fetch
      try {
        const { supabase } = await import("../../src/services/supabase");
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          const { data } = await (supabase as any)
            .from("weekly_challenge_progress")
            .select("correct_count")
            .eq("user_id", user.id)
            .eq("challenge_id", challengeId)
            .maybeSingle();
          if (data) setOriginalScore(data.correct_count);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [challengeId, t]);

  const loadQuestion = useCallback(
    async (pos: number) => {
      if (!challengeId) return;
      setSelected(null);
      setShowLearning(false);
      setLoading(true);
      const q = await getReplayQuestion(challengeId, pos, language as "fr" | "en");
      if (!q) {
        setError(t("error"));
        setLoading(false);
        return;
      }
      setQuestion(q);
      setAnswers(shuffleAnswers(q));
      setLoading(false);
    },
    [challengeId, language, t],
  );

  // Initial question load (waits for challenge to be set so we know total)
  useEffect(() => {
    if (challenge) {
      loadQuestion(1);
    }
  }, [challenge, loadQuestion]);

  const handleSelect = useCallback(
    async (answer: string) => {
      if (selected || !question || !replayId) return;
      setSelected(answer);
      const isCorrect = answer === question.correct_answer;
      if (isCorrect) correctAnswerFeedback();
      else wrongAnswerFeedback();
      const res = await submitReplayAnswer(replayId, question.position, isCorrect);
      if (res) {
        setCorrectSoFar(res.correct_count);
        if (res.completed) {
          // Defer marking completed until user taps "Next" so they can see feedback
        }
      }
      setTimeout(() => setShowLearning(true), 600);
    },
    [selected, question, replayId],
  );

  const goNext = useCallback(() => {
    buttonPressFeedback();
    if (!challenge) return;
    if (position >= challenge.total_questions) {
      setCompleted(true);
      return;
    }
    const nextPos = position + 1;
    setPosition(nextPos);
    loadQuestion(nextPos);
  }, [challenge, position, loadQuestion]);

  const tryAgain = useCallback(async () => {
    buttonPressFeedback();
    if (!challengeId) return;
    const { startReplay } = await import("../../src/services/weeklyHistory");
    const newId = await startReplay(challengeId);
    if (newId) {
      router.replace({
        pathname: "/weekly/replay",
        params: { replay_id: newId, challenge_id: challengeId },
      } as any);
    }
  }, [challengeId]);

  const themeLabel = useMemo(() => {
    if (!challenge) return "";
    return language === "fr" ? challenge.theme_label_fr : challenge.theme_label_en;
  }, [challenge, language]);

  // ---- Render ----

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.bg }}>
        <Text className="text-white text-base">{error}</Text>
        <Pressable
          onPress={() => router.replace("/weekly/history" as any)}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ backgroundColor: COLORS.surface }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text className="text-white">←</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!challenge || loading || !question) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator color="#fff" />
      </SafeAreaView>
    );
  }

  // Completion screen
  if (completed) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <View
            className="rounded-3xl overflow-hidden"
            style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
          >
            <LinearGradient
              colors={[challenge.color, mixHex(challenge.color, "#000000", 0.55)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 24, alignItems: "center" }}
            >
              <Text style={{ fontSize: 72 }}>🎯</Text>
              <Text className="text-white/85 text-xs font-bold tracking-widest uppercase mt-3">
                {t("weeklyReplayResultTitle")}
              </Text>
              <Text className="text-white text-5xl font-extrabold mt-2">
                {correctSoFar}
                <Text className="text-white/80">/{challenge.total_questions}</Text>
              </Text>
              <Text className="text-white/85 text-sm mt-2 text-center">{themeLabel}</Text>
            </LinearGradient>
          </View>

          {/* Comparison block */}
          <View
            className="mt-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-400 text-sm">{t("weeklyReplayOriginalScore")}</Text>
              <Text className="text-white text-base font-bold">
                {originalScore !== null ? `${originalScore}/${challenge.total_questions}` : "—"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400 text-sm">{t("weeklyReplayThisRun")}</Text>
              <Text className="text-white text-base font-bold">
                {correctSoFar}/{challenge.total_questions}
              </Text>
            </View>
            <Text className="text-cyan-300/80 text-[11px] mt-3 italic">
              ⓘ {t("weeklyReplayNoXp")}
            </Text>
          </View>

          <Pressable
            onPress={tryAgain}
            className="mt-5 rounded-2xl items-center justify-center"
            style={{ backgroundColor: challenge.color, paddingVertical: 14 }}
            accessibilityRole="button"
            accessibilityLabel={t("weeklyReplayTryAgain")}
          >
            <Text className="text-white text-base font-bold">↻ {t("weeklyReplayTryAgain")}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.replace("/weekly/history" as any);
            }}
            className="mt-3 rounded-2xl items-center justify-center"
            style={{ backgroundColor: COLORS.surface, paddingVertical: 14 }}
            accessibilityRole="button"
            accessibilityLabel={t("weeklyHistoryBackToHistory")}
          >
            <Text className="text-white/80 font-semibold">
              ← {t("weeklyHistoryBackToHistory")}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active question screen
  const difficultyColor =
    question.difficulty === 1 ? "#22c55e" : question.difficulty === 2 ? "#facc15" : "#ef4444";
  const difficultyLabel =
    question.difficulty === 1
      ? t("difficultyEasy")
      : question.difficulty === 2
        ? t("difficultyMedium")
        : t("hard");

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text className="text-white text-lg">←</Text>
        </Pressable>
        <View className="flex-1 mx-3">
          <View
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <View
              className="h-1.5 rounded-full"
              style={{
                width: `${(position / challenge.total_questions) * 100}%`,
                backgroundColor: challenge.color,
              }}
            />
          </View>
          <Text className="text-gray-400 text-[10px] mt-1 text-center">
            {position} / {challenge.total_questions} · ✓ {correctSoFar}
          </Text>
        </View>
        <ReplayPill label={t("weeklyReplayLabel")} color={challenge.color} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center gap-2 mb-3">
          <View className="px-2 py-0.5 rounded-sm" style={{ backgroundColor: difficultyColor }}>
            <Text className="text-[10px] font-bold tracking-wider uppercase text-black">
              {difficultyLabel}
            </Text>
          </View>
          <Text style={{ fontSize: 16 }}>{challenge.emoji}</Text>
          <Text className="text-gray-400 text-xs">{themeLabel}</Text>
        </View>

        {question.image_url && (
          <View
            className="mb-3 rounded-2xl overflow-hidden"
            style={{ backgroundColor: COLORS.surface }}
          >
            <QuestionImage uri={question.image_url} />
          </View>
        )}

        <Text className="text-white text-xl font-bold leading-7 mb-4">
          {question.question_text}
        </Text>

        <View className="gap-2.5">
          {answers.map((ans, idx) => {
            const isCorrect = ans === question.correct_answer;
            const isSelected = ans === selected;
            const showState = selected !== null;
            const bg = !showState
              ? COLORS.surface
              : isCorrect
                ? "rgba(34,197,94,0.2)"
                : isSelected
                  ? "rgba(239,68,68,0.2)"
                  : COLORS.surface;
            const border = !showState
              ? "rgba(255,255,255,0.06)"
              : isCorrect
                ? COLORS.success
                : isSelected
                  ? COLORS.error
                  : "rgba(255,255,255,0.06)";
            return (
              <Pressable
                key={ans}
                onPress={() => handleSelect(ans)}
                disabled={selected !== null}
                className="rounded-2xl px-4 py-4 flex-row items-center active:opacity-90"
                style={{ backgroundColor: bg, borderWidth: 1.5, borderColor: border }}
                accessibilityRole="button"
                accessibilityLabel={`${LETTERS[idx]}: ${ans}`}
                accessibilityState={{
                  disabled: selected !== null,
                  selected: isSelected,
                }}
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <Text className="text-white font-bold">{LETTERS[idx]}</Text>
                </View>
                <Text className="text-white text-base flex-1">{ans}</Text>
                {showState && isCorrect && (
                  <Text className="text-green-400 text-lg ml-2">✓</Text>
                )}
                {showState && isSelected && !isCorrect && (
                  <Text className="text-red-400 text-lg ml-2">✗</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {showLearning && question.learning_fact && (
          <View
            className="mt-5 rounded-2xl p-4"
            style={{
              backgroundColor: "rgba(0, 194, 204, 0.08)",
              borderWidth: 1,
              borderColor: "rgba(0, 194, 204, 0.3)",
            }}
          >
            <Text className="text-cyan-300 text-xs font-bold tracking-wider uppercase mb-1">
              💡 {t("weeklyDidYouKnow")}
            </Text>
            <Text className="text-white text-sm leading-5">{question.learning_fact}</Text>
          </View>
        )}

        {selected !== null && (
          <Pressable
            onPress={goNext}
            className="mt-5 rounded-2xl items-center justify-center"
            style={{ backgroundColor: challenge.color, paddingVertical: 16 }}
            accessibilityRole="button"
            accessibilityLabel={
              position >= challenge.total_questions ? t("weeklyFinish") : t("weeklyNext")
            }
          >
            <Text className="text-white text-base font-bold">
              {position >= challenge.total_questions ? t("weeklyFinish") : t("weeklyNext")} →
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const ReplayPill = memo(function ReplayPill({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <View
      className="px-2 py-1 rounded-md"
      style={{ backgroundColor: color }}
    >
      <Text className="text-white text-[10px] font-extrabold tracking-widest uppercase">
        ↻ {label}
      </Text>
    </View>
  );
});
