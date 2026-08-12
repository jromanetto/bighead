import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { XPGainBanner } from "../../src/components/XPGainBanner";
import { Icon } from "../../src/components/ui";
import { EmptyState } from "../../src/components/EmptyState";
import { AnimatedNumber } from "../../src/components/AnimatedNumber";
import { ConfettiEffect } from "../../src/components/effects/ConfettiEffect";
import { COUNTRIES, countriesByContinent, flagUrl, CONTINENTS, ContinentId } from "../../src/data/geography";
import { filterByDifficulty, GeoDifficulty } from "../../src/data/geographyDifficulty";
import { buildGeoQuiz, GeoMode, GeoQuestion } from "../../src/utils/geographyQuiz";
import { awardXP, type XPGain } from "../../src/services/xp";
import { correctAnswerFeedback, wrongAnswerFeedback, buttonPressFeedback } from "../../src/utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
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

type Phase = "playing" | "feedback" | "done" | "empty";

export default function GeographyQuizScreen() {
  const { user, refreshProfile } = useAuth();
  const { t, language } = useTranslation();
  const params = useLocalSearchParams<{ mode?: string; continent?: string; difficulty?: string }>();
  const mode: GeoMode = params.mode === "capitals" ? "capitals" : "flags";
  const continentParam = (params.continent as string) || "world";
  const isWorld = continentParam === "world";
  const continent: ContinentId | null = isWorld ? null : (continentParam as ContinentId);
  const difficulty: GeoDifficulty =
    params.difficulty === "easy" || params.difficulty === "hard" ? params.difficulty : "medium";
  const lang = language === "fr" ? "fr" : "en";

  const [questions] = useState<GeoQuestion[]>(() => {
    const base = continent ? countriesByContinent(continent) : COUNTRIES;
    const pool = filterByDifficulty(base, difficulty);
    if (pool.length < 4) return [];
    return buildGeoQuiz(mode, pool, lang, TOTAL_QUESTIONS);
  });

  const [phase, setPhase] = useState<Phase>(questions.length ? "playing" : "empty");
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_SEC);
  const [xpGain, setXpGain] = useState<XPGain | null>(null);
  const xpAwardedRef = useRef(false);

  const progress = useSharedValue(1);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  // Start / restart the timer whenever we enter a new question.
  useEffect(() => {
    if (phase !== "playing") {
      stopTimer();
      return;
    }
    setTimeLeft(QUESTION_DURATION_SEC);
    progress.value = 1;
    progress.value = withTiming(
      0,
      { duration: QUESTION_DURATION_SEC * 1000, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(handleTimeout)();
      },
    );
    stopTimer();
    tickRef.current = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          stopTimer();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  const handleTimeout = () => {
    if (phase !== "playing") return;
    setSelected(-1);
    setPhase("feedback");
    void wrongAnswerFeedback();
  };

  const handleAnswer = (answerIdx: number) => {
    if (phase !== "playing") return;
    stopTimer();
    setSelected(answerIdx);
    const q = questions[idx];
    if (!q) return;
    if (answerIdx === q.correctIndex) {
      setCorrectCount((n) => n + 1);
      void correctAnswerFeedback();
    } else {
      void wrongAnswerFeedback();
    }
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

  // Award XP at the end.
  useEffect(() => {
    if (phase !== "done" || xpAwardedRef.current) return;
    xpAwardedRef.current = true;
    const isPerfect = correctCount === questions.length && questions.length > 0;
    const base = correctCount * 10;
    const bonus = isPerfect ? 50 : 0;
    const total = base + bonus;
    const breakdown: XPGain["breakdown"] = [{ label: t("correct"), amount: base }];
    if (isPerfect) breakdown.push({ label: t("audioPerfect"), amount: bonus });
    setXpGain({ base, bonus, total, breakdown });
    if (user && total > 0) {
      awardXP(user.id, total, "geography", {
        mode,
        continent: continentParam,
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

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const continentLabel = CONTINENTS.find((c) => c.id === continent);
  const title = mode === "flags" ? t("geoFlagsTitle") : t("geoCapitalsTitle");

  if (phase === "empty") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.bg }}>
        <EmptyState
          emoji="🌍"
          title={t("geoEmptyTitle")}
          subtitle={t("geoEmptySubtitle")}
          cta={{ label: t("backToHome"), onPress: () => router.back() }}
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
            <Text style={{ fontSize: 64, marginBottom: 12 }}>{isPerfect ? "🏆" : "🌍"}</Text>
            <Text className="text-white text-3xl font-black text-center mb-1">
              {isPerfect ? t("audioPerfect") : t("gameOver")}
            </Text>
            <Text style={{ color: COLORS.textMuted, marginBottom: 24 }}>{title}</Text>

            <View
              className="rounded-2xl px-8 py-6 mb-6 items-center"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}
            >
              <Text style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 4 }}>{t("yourScore")}</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <AnimatedNumber value={correctCount} duration={900} style={{ color: "#ffffff", fontSize: 48, fontWeight: "900" }} />
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
                  router.replace({ pathname: "/geography/quiz", params: { mode, continent: continentParam, difficulty } } as any);
                }}
                className="flex-1 items-center justify-center py-3 rounded-xl active:opacity-90"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text className="font-bold" style={{ color: COLORS.bg }}>{t("playAgain")}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.replace("/geography" as any);
                }}
                className="flex-1 items-center justify-center py-3 rounded-xl active:opacity-90"
                style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
              >
                <Text className="text-white font-bold">{t("geoBackToSection")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = questions[idx];
  if (!q) return null;
  const isFeedback = phase === "feedback";

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <Pressable onPress={() => { buttonPressFeedback(); router.back(); }} className="active:opacity-70">
          <Icon name="ChevronLeft" size={28} color={COLORS.text} />
        </Pressable>
        <View className="items-center">
          <Text style={{ color: COLORS.text, fontWeight: "700" }}>{idx + 1} / {questions.length}</Text>
          {isWorld ? (
            <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>🌐 {t("geoWorld")}</Text>
          ) : continentLabel ? (
            <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
              {continentLabel.emoji} {lang === "fr" ? continentLabel.fr : continentLabel.en}
            </Text>
          ) : null}
        </View>
        <View style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center" }}>
          <Svg width={56} height={56}>
            <Circle cx={28} cy={28} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={4} fill="transparent" />
            <AnimatedCircle
              cx={28} cy={28} r={radius}
              stroke={timeLeft <= 5 ? COLORS.red : COLORS.primary}
              strokeWidth={4} fill="transparent"
              strokeDasharray={`${circumference} ${circumference}`}
              animatedProps={animatedProps}
              strokeLinecap="round"
              transform={`rotate(-90 28 28)`}
            />
          </Svg>
          <Text style={{ position: "absolute", color: timeLeft <= 5 ? COLORS.red : COLORS.text, fontWeight: "800", fontSize: 14 }}>
            {timeLeft}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* Prompt card */}
        <View
          className="rounded-2xl py-8 mb-6 items-center"
          style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}
        >
          {q.mode === "flags" && q.flagCode ? (
            <Image
              source={{ uri: flagUrl(q.flagCode) }}
              style={{ width: 200, height: 132, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.04)" }}
              resizeMode="contain"
              accessibilityLabel={t("geoWhichCountry")}
            />
          ) : (
            <>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🏛️</Text>
              <Text className="text-white text-2xl font-black text-center px-4">{q.promptText}</Text>
            </>
          )}
        </View>

        {/* Question label */}
        <Text className="text-white text-lg font-bold text-center mb-5">
          {q.mode === "flags" ? t("geoWhichCountry") : t("geoWhichCapital")}
        </Text>

        {/* Answers */}
        <View className="flex-col gap-3">
          {q.answers.map((answer, i) => {
            const isSelected = selected === i;
            const isCorrectAnswer = i === q.correctIndex;
            let bg: string = COLORS.surface;
            let borderColor: string = "rgba(255,255,255,0.05)";
            let label = COLORS.text;
            if (isFeedback) {
              if (isCorrectAnswer) { bg = COLORS.greenDim; borderColor = COLORS.green; label = COLORS.green; }
              else if (isSelected) { bg = COLORS.redDim; borderColor = COLORS.red; label = COLORS.red; }
            } else if (isSelected) {
              bg = COLORS.primaryDim; borderColor = COLORS.primary;
            }
            return (
              <Pressable
                key={`${q.id}-${i}`}
                disabled={isFeedback}
                onPress={() => handleAnswer(i)}
                className="active:opacity-90 rounded-xl flex-row items-center"
                style={{ backgroundColor: bg, borderWidth: 1.5, borderColor, paddingHorizontal: 16, paddingVertical: 16, minHeight: 60 }}
              >
                <View className="items-center justify-center mr-3" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <Text style={{ color: label, fontWeight: "800" }}>{LETTER_OPTIONS[i]}</Text>
                </View>
                <Text style={{ color: label, flex: 1, fontSize: 16, fontWeight: "600" }}>{answer}</Text>
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
