import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { memo, useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Skeleton, SkeletonStat } from "../../src/components/Skeleton";
import {
  getActiveWeeklyChallenge,
  getMyWeeklyProgress,
  getWeeklyLeaderboard,
  timeUntilEnd,
  type WeeklyChallenge,
  type WeeklyProgress,
  type WeeklyLeaderboardEntry,
} from "../../src/services/weeklyChallenge";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { mixHex } from "../../src/utils/colors";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function WeeklyHome() {
  const { t, language } = useTranslation();
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const c = await getActiveWeeklyChallenge();
    setChallenge(c);
    if (c) {
      const [p, lb] = await Promise.all([getMyWeeklyProgress(c.id), getWeeklyLeaderboard(c.id, 20)]);
      setProgress(p);
      setLeaderboard(lb);
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <Header />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Hero skeleton */}
          <View
            style={{
              borderRadius: 24,
              padding: 20,
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Skeleton width={72} height={72} rounded={36} />
              <View style={{ height: 12 }} />
              <Skeleton width={120} height={10} rounded={5} />
              <View style={{ height: 10 }} />
              <Skeleton width={220} height={22} rounded={6} />
              <View style={{ height: 8 }} />
              <Skeleton width={260} height={12} rounded={5} />
            </View>

            <View style={{ flexDirection: "row", marginTop: 20, marginHorizontal: -4 }}>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </View>

            <View style={{ marginTop: 16 }}>
              <Skeleton width="100%" height={12} rounded={6} />
            </View>
            <View style={{ marginTop: 16 }}>
              <Skeleton width="100%" height={48} rounded={16} />
            </View>
          </View>

          {/* Rules card */}
          <View
            style={{
              borderRadius: 16,
              padding: 16,
              marginTop: 16,
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Skeleton width={140} height={10} rounded={5} />
            <View style={{ height: 10 }} />
            <Skeleton width="100%" height={10} rounded={5} />
            <View style={{ height: 6 }} />
            <Skeleton width="80%" height={10} rounded={5} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <Header />
        <View className="flex-1 items-center justify-center p-6">
          <Text style={{ fontSize: 64 }}>📅</Text>
          <Text className="text-white text-xl font-bold mt-3 text-center">{t("weeklyNoneTitle")}</Text>
          <Text className="text-gray-400 text-center mt-2">{t("weeklyNoneSubtitle")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const label = language === "fr" ? challenge.theme_label_fr : challenge.theme_label_en;
  const description = language === "fr" ? challenge.description_fr : challenge.description_en;
  const position = progress?.current_position ?? 0;
  const completed = position >= challenge.total_questions;
  const { days, hours } = timeUntilEnd(challenge);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Hero */}
        <View
          className="rounded-3xl overflow-hidden"
          style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
        >
          <LinearGradient
            colors={[challenge.color, mixHex(challenge.color, "#000000", 0.5)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20 }}
          >
            <View className="items-center pt-2">
              <Text style={{ fontSize: 64 }}>{challenge.emoji}</Text>
              <Text className="text-white/85 text-[11px] font-bold tracking-widest uppercase mt-2">
                {t("weeklyChallenge")}
              </Text>
              <Text className="text-white text-3xl font-extrabold mt-1 text-center">{label}</Text>
              {description && (
                <Text className="text-white/85 text-sm text-center mt-2">{description}</Text>
              )}
              <Text className="text-white/75 text-xs mt-3">
                ⏱ {days > 0 ? `${days}j ${hours}h ${t("weeklyLeft")}` : `${hours}h ${t("weeklyLeft")}`}
              </Text>
            </View>

            <View className="flex-row gap-2 mt-5">
              <Stat value={`${position}/${challenge.total_questions}`} label={t("weeklyDone")} />
              <Stat value={String(progress?.correct_count ?? 0)} label={t("weeklyCorrect")} />
              <Stat
                value={`🔥${progress?.day_streak ?? 0}`}
                label={t("weeklyDayStreak")}
              />
            </View>

            <View className="mt-5">
              <View
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
              >
                <View
                  className="h-3 rounded-full"
                  style={{
                    width: `${(position / challenge.total_questions) * 100}%`,
                    backgroundColor: "#fff",
                  }}
                />
              </View>
            </View>

            {completed ? (
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/weekly/result" as any);
                }}
                className="mt-5 rounded-2xl items-center justify-center"
                style={{ backgroundColor: "#22c55e", paddingVertical: 14 }}
                accessibilityRole="button"
                accessibilityLabel={t("weeklySeeRecap")}
              >
                <Text className="text-white text-base font-bold">✓ {t("weeklySeeRecap")}</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/weekly/play" as any);
                }}
                className="mt-5 rounded-2xl items-center justify-center"
                style={{ backgroundColor: "#fff", paddingVertical: 14 }}
                accessibilityRole="button"
                accessibilityLabel={position === 0 ? t("weeklyStart") : t("weeklyContinue")}
              >
                <Text style={{ color: challenge.color, fontSize: 16, fontWeight: "800" }}>
                  ▶ {position === 0 ? t("weeklyStart") : t("weeklyContinue")}
                </Text>
              </Pressable>
            )}
          </LinearGradient>
        </View>

        {/* Day rules card */}
        <View
          className="rounded-2xl p-4 mt-4"
          style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}
        >
          <Text className="text-white/90 text-xs font-bold tracking-wider uppercase mb-2">
            {t("weeklyHowItWorks")}
          </Text>
          <Text className="text-gray-400 text-sm leading-5">
            {t("weeklyRules5PerDay")}
          </Text>
        </View>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <View className="mt-4">
            <Text className="text-base font-bold text-gray-100 tracking-wide uppercase mb-2 px-1">
              {t("weeklyLeaderboard")}
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}
            >
              {leaderboard.slice(0, 10).map((entry, i) => (
                <View
                  key={entry.user_id}
                  className="flex-row items-center px-4 py-3"
                  style={{ borderTopWidth: i === 0 ? 0 : 1, borderColor: "rgba(255,255,255,0.04)" }}
                >
                  <Text
                    className="text-base font-bold w-7 text-center"
                    style={{ color: entry.rank <= 3 ? challenge.color : "#9ca3af" }}
                  >
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                  </Text>
                  <Text className="text-white text-sm font-medium ml-3 flex-1" numberOfLines={1}>
                    {entry.username}
                  </Text>
                  {entry.day_streak > 0 && (
                    <Text className="text-orange-400 text-xs font-semibold mr-3">🔥{entry.day_streak}</Text>
                  )}
                  <Text className="text-white text-sm font-bold">
                    {entry.correct_count} / {entry.current_position}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
      <Pressable
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Text className="text-white text-lg">←</Text>
      </Pressable>
      <Text className="text-white text-base font-semibold">Big Head</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const Stat = memo(function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View
      className="flex-1 rounded-xl py-2 items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
    >
      <Text className="text-white text-lg font-extrabold">{value}</Text>
      <Text className="text-white/70 text-[10px] uppercase tracking-wider">{label}</Text>
    </View>
  );
});

