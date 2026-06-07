import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { getAsyncDuelQuestions, type Duel } from "../../src/services/duel";
import { ConfettiEffect } from "../../src/components/effects/ConfettiEffect";
import { AnimatedNumber } from "../../src/components/AnimatedNumber";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.15)",
  error: "#ef4444",
  errorDim: "rgba(239, 68, 68, 0.15)",
  warn: "#facc15",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function DuelResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [duel, setDuel] = useState<Duel | null>(null);
  const [loading, setLoading] = useState(true);

  const trophyScale = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { duel } = await getAsyncDuelQuestions(id);
        setDuel(duel);
        trophyScale.value = withDelay(200, withSpring(1, { damping: 8 }));
        scoreOpacity.value = withDelay(500, withSpring(1));
        // The server already awarded XP on completion via submit_async_duel_play.
        // Just refresh the profile so the new total_xp shows.
        try { await refreshProfile(); } catch {}
      } catch (e) {
        console.error("load result error", e);
      }
      setLoading(false);
    })();
  }, [id]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));
  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
  }));

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!duel) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">❌</Text>
          <Text className="text-white text-xl font-bold">{t("error" as any)}</Text>
          <Pressable
            onPress={() => router.replace("/duel")}
            className="rounded-xl py-4 px-8 mt-6"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="font-bold" style={{ color: COLORS.bg }}>
              {t("backToHome" as any)}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isHost = duel.host_id === user?.id;
  const myScore = (isHost ? duel.host_score : duel.guest_score) ?? 0;
  const opponentScore = (isHost ? duel.guest_score : duel.host_score) ?? 0;
  const opponentPlayedAt = isHost ? duel.guest_played_at : duel.host_played_at;
  const isCompleted = duel.status === "completed";
  const isExpired = duel.status === "expired";
  const isWaiting = duel.status === "awaiting_opponent";
  const isWinner = isCompleted && duel.winner_id === user?.id;
  const isDraw = isCompleted && duel.winner_id === null;

  // Per-question comparison (only when completed)
  const hostAnswers = (duel as any).host_answers as Array<{ is_correct: boolean }> | null;
  const guestAnswers = (duel as any).guest_answers as Array<{ is_correct: boolean }> | null;
  const myAnswers = isHost ? hostAnswers : guestAnswers;
  const oppAnswers = isHost ? guestAnswers : hostAnswers;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <ConfettiEffect trigger={isWinner} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Trophy / waiting icon */}
        <Animated.View style={trophyStyle} className="mb-6 items-center">
          <Text className="text-8xl">
            {isExpired ? "⌛" : isWaiting ? "⏳" : isWinner ? "🏆" : isDraw ? "🤝" : "😢"}
          </Text>
        </Animated.View>

        {/* Title */}
        <Text
          className="text-3xl font-bold mb-2 text-center"
          style={{
            color: isWaiting
              ? COLORS.warn
              : isExpired
              ? COLORS.error
              : isWinner
              ? COLORS.warn
              : isDraw
              ? COLORS.textMuted
              : COLORS.error,
          }}
        >
          {isWaiting
            ? t("duelWaiting" as any)
            : isExpired
            ? t("duelExpired" as any)
            : isWinner
            ? t("duelYouWon" as any)
            : isDraw
            ? t("duelTie" as any)
            : t("duelYouLost" as any)}
        </Text>

        {/* Subtitle */}
        {isWaiting ? (
          <Text
            className="text-center mb-8"
            style={{ color: COLORS.textMuted }}
          >
            {(t("duelWaitingForX" as any) as string).replace("{{name}}", t("opponent" as any))}
          </Text>
        ) : isCompleted ? (
          <Text
            className="text-center mb-8"
            style={{ color: COLORS.textMuted }}
          >
            {isWinner
              ? t("victoryMessage" as any)
              : isDraw
              ? t("drawMessage" as any)
              : t("defeatMessage" as any)}
          </Text>
        ) : null}

        {/* Score card */}
        <Animated.View style={scoreStyle}>
          <View
            className="rounded-2xl p-6 mb-6"
            style={{ backgroundColor: COLORS.surface }}
          >
            <View className="flex-row items-center justify-around">
              {/* Me */}
              <View className="items-center">
                <Text style={{ color: COLORS.textMuted }} className="text-xs mb-1">
                  {t("you" as any)}
                </Text>
                <AnimatedNumber
                  value={myScore}
                  duration={900}
                  className="text-5xl font-bold"
                  style={{
                    color:
                      isCompleted && myScore > opponentScore
                        ? COLORS.success
                        : "white",
                  }}
                />
                <Text style={{ color: COLORS.textMuted }} className="text-xs">/ 10</Text>
              </View>

              <Text className="text-2xl font-bold" style={{ color: COLORS.textMuted }}>
                VS
              </Text>

              {/* Opponent */}
              <View className="items-center">
                <Text style={{ color: COLORS.textMuted }} className="text-xs mb-1">
                  {t("opponent" as any)}
                </Text>
                {/* Hide opponent score until completed */}
                {isCompleted ? (
                  <AnimatedNumber
                    value={opponentScore}
                    duration={900}
                    className="text-5xl font-bold"
                    style={{
                      color:
                        opponentScore > myScore ? COLORS.error : "white",
                    }}
                  />
                ) : (
                  <Text className="text-5xl font-bold" style={{ color: COLORS.textMuted }}>
                    ?
                  </Text>
                )}
                <Text style={{ color: COLORS.textMuted }} className="text-xs">/ 10</Text>
              </View>
            </View>

            {/* Tile-by-tile recap (only completed) */}
            {isCompleted && myAnswers && oppAnswers && (
              <View className="mt-6 pt-4" style={{ borderTopWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}>
                <Text style={{ color: COLORS.textMuted }} className="text-xs mb-2 text-center">
                  {t("questionSummaryTitle" as any)}
                </Text>
                <View className="flex-row justify-center flex-wrap gap-2">
                  {myAnswers.map((m, i) => {
                    const o = oppAnswers[i];
                    return (
                      <View
                        key={i}
                        className="rounded-lg px-2 py-1"
                        style={{
                          backgroundColor:
                            m.is_correct && o?.is_correct
                              ? COLORS.successDim
                              : m.is_correct
                              ? COLORS.primaryDim
                              : o?.is_correct
                              ? COLORS.errorDim
                              : COLORS.surfaceLight,
                        }}
                      >
                        <Text
                          className="text-[10px] font-bold"
                          style={{ color: COLORS.text }}
                        >
                          {i + 1}: {m.is_correct ? "✓" : "✗"} / {o?.is_correct ? "✓" : "✗"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* XP earned indicator */}
            {isCompleted && (
              <View
                className="mt-4 pt-4 items-center"
                style={{ borderTopWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: COLORS.primary }}
                >
                  {(t("duelXpWon" as any) as string).replace(
                    "{{amount}}",
                    String(isWinner ? 50 : isDraw ? 30 : 25)
                  )}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Buttons */}
        <Pressable
          onPress={() => router.replace("/duel")}
          className="rounded-2xl py-4 mb-3"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text
            className="text-center font-bold text-lg"
            style={{ color: COLORS.bg }}
          >
            {t("duelNewDuel" as any)}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/")}
          className="rounded-2xl py-4"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-center font-bold text-white">
            {t("backToHome" as any)}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
