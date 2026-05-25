import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getActiveWeeklyChallenge,
  getMyWeeklyProgress,
  getNextWeeklyQuestion,
  submitWeeklyAnswer,
  shuffleAnswers,
  dayQuotaRemaining,
  type WeeklyChallenge,
  type WeeklyQuestion,
} from "../../src/services/weeklyChallenge";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { correctAnswerFeedback, wrongAnswerFeedback, buttonPressFeedback } from "../../src/utils/feedback";
import { QuestionImage } from "../../src/components/QuestionImage";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  text: "#ffffff",
  textMuted: "#9ca3af",
  success: "#22c55e",
  error: "#ef4444",
};

const LETTERS = ["A", "B", "C", "D"];

export default function WeeklyPlay() {
  const { t, language } = useTranslation();
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [question, setQuestion] = useState<WeeklyQuestion | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [position, setPosition] = useState(1);
  const [correctSoFar, setCorrectSoFar] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showLearning, setShowLearning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurrent = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    setShowLearning(false);
    const c = await getActiveWeeklyChallenge();
    if (!c) {
      setError(t("weeklyNoneTitle"));
      setLoading(false);
      return;
    }
    setChallenge(c);
    const p = await getMyWeeklyProgress(c.id);
    if (p && p.completed_at) {
      router.replace("/weekly/result" as any);
      return;
    }
    const quota = dayQuotaRemaining(c, p);
    if (!quota.unlimited && quota.remaining === 0) {
      router.replace("/weekly" as any);
      return;
    }
    const nextPos = (p?.current_position ?? 0) + 1;
    setPosition(nextPos);
    setCorrectSoFar(p?.correct_count ?? 0);
    const q = await getNextWeeklyQuestion(c.id, language as "fr" | "en", nextPos);
    if (!q) {
      setError("Question not found");
      setLoading(false);
      return;
    }
    setQuestion(q);
    setAnswers(shuffleAnswers(q));
    setLoading(false);
  }, [language, t]);

  useEffect(() => { loadCurrent(); }, [loadCurrent]);

  const handleSelect = useCallback(async (answer: string) => {
    if (selected || !question || !challenge) return;
    setSelected(answer);
    const isCorrect = answer === question.correct_answer;
    if (isCorrect) correctAnswerFeedback(); else wrongAnswerFeedback();
    const res = await submitWeeklyAnswer(challenge.id, question.position, isCorrect);
    if (res) {
      setCorrectSoFar(res.correct_count);
    }
    setTimeout(() => setShowLearning(true), 600);
  }, [selected, question, challenge]);

  const goNext = useCallback(async () => {
    buttonPressFeedback();
    if (!challenge) return;
    const p = await getMyWeeklyProgress(challenge.id);
    if (p && p.completed_at) {
      router.replace("/weekly/result" as any);
      return;
    }
    const quota = dayQuotaRemaining(challenge, p);
    if (!quota.unlimited && quota.remaining === 0) {
      router.replace("/weekly" as any);
      return;
    }
    loadCurrent();
  }, [challenge, loadCurrent]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator color="#fff" />
      </SafeAreaView>
    );
  }
  if (error || !question || !challenge) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.bg }}>
        <Text className="text-white text-base">{error ?? "Erreur"}</Text>
        <Pressable onPress={() => router.replace("/weekly" as any)} className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: COLORS.surface }}>
          <Text className="text-white">←</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const difficultyColor = question.difficulty === 1 ? "#22c55e" : question.difficulty === 2 ? "#facc15" : "#ef4444";
  const difficultyLabel = question.difficulty === 1 ? t("difficultyEasy") : question.difficulty === 2 ? t("difficultyMedium") : t("hard");

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
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
              style={{ width: `${(position / challenge.total_questions) * 100}%`, backgroundColor: challenge.color }}
            />
          </View>
          <Text className="text-gray-400 text-[10px] mt-1 text-center">
            {position} / {challenge.total_questions} · ✓ {correctSoFar}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center gap-2 mb-3">
          <View className="px-2 py-0.5 rounded-sm" style={{ backgroundColor: difficultyColor }}>
            <Text className="text-[10px] font-bold tracking-wider uppercase text-black">
              {difficultyLabel}
            </Text>
          </View>
          <Text style={{ fontSize: 16 }}>{challenge.emoji}</Text>
          <Text className="text-gray-400 text-xs">
            {language === "fr" ? challenge.theme_label_fr : challenge.theme_label_en}
          </Text>
        </View>

        {question.image_url && (
          <View className="mb-3 rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.surface }}>
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
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <Text className="text-white font-bold">{LETTERS[idx]}</Text>
                </View>
                <Text className="text-white text-base flex-1">{ans}</Text>
                {showState && isCorrect && <Text className="text-green-400 text-lg ml-2">✓</Text>}
                {showState && isSelected && !isCorrect && <Text className="text-red-400 text-lg ml-2">✗</Text>}
              </Pressable>
            );
          })}
        </View>

        {showLearning && question.learning_fact && (
          <View
            className="mt-5 rounded-2xl p-4"
            style={{ backgroundColor: "rgba(0, 194, 204, 0.08)", borderWidth: 1, borderColor: "rgba(0, 194, 204, 0.3)" }}
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
