import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { memo, useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  resolveWeeklyChallenge,
  getMyWeeklyProgress,
  getWeeklyLeaderboard,
  shareWeeklyChallenge,
  type WeeklyChallenge,
  type WeeklyChallengeType,
  type WeeklyProgress,
  type WeeklyLeaderboardEntry,
} from "../../src/services/weeklyChallenge";
import { shareResultCard } from "../../src/services/shareResult";
import { WeeklyShareCard } from "../../src/components/WeeklyShareCard";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { mixHex } from "../../src/utils/colors";
import { AnimatedNumber } from "../../src/components/AnimatedNumber";
import { ConfettiEffect } from "../../src/components/effects/ConfettiEffect";

const COLORS = { bg: "#161a1d", surface: "#1E2529", text: "#ffffff", textMuted: "#9ca3af" };

function getBadge(correctCount: number): { emoji: string; label: string; color: string } | null {
  if (correctCount >= 27) return { emoji: "🏆", label: "Expert", color: "#fbbf24" };
  if (correctCount >= 24) return { emoji: "🥈", label: "Advanced", color: "#94a3b8" };
  if (correctCount >= 18) return { emoji: "🥉", label: "Good", color: "#a16eff" };
  return null;
}

export default function WeeklyResult() {
  const { t, language } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();
  const challengeId = params.id ?? null;
  const challengeType: WeeklyChallengeType = params.type === "news" ? "news" : "themed";
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<View>(null);

  useEffect(() => {
    (async () => {
      const c = await resolveWeeklyChallenge({ id: challengeId, type: challengeType });
      setChallenge(c);
      if (c) {
        const [p, lb] = await Promise.all([getMyWeeklyProgress(c.id), getWeeklyLeaderboard(c.id, 20)]);
        setProgress(p);
        setLeaderboard(lb);
      }
      setLoading(false);
    })();
  }, [challengeId, challengeType]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator color="#fff" />
      </SafeAreaView>
    );
  }

  if (!challenge || !progress) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <Text className="text-white">No data</Text>
        <Pressable onPress={() => router.replace("/weekly" as any)} className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: COLORS.surface }}>
          <Text className="text-white">←</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const label = language === "fr" ? challenge.theme_label_fr : challenge.theme_label_en;
  const score = progress.correct_count;
  const total = challenge.total_questions;
  const pct = Math.round((score / total) * 100);
  const badge = getBadge(score);
  const myEntry = leaderboard.find((e) => e.correct_count === score && e.current_position === progress.current_position);

  const hasBadge = !!badge;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <ConfettiEffect trigger={hasBadge} />
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
            <Text style={{ fontSize: 80 }}>{badge?.emoji ?? "🎯"}</Text>
            <Text className="text-white/85 text-xs font-bold tracking-widest uppercase mt-3">
              {t("weeklyYourScore")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4 }}>
              <AnimatedNumber
                value={score}
                duration={900}
                style={{ color: "#ffffff", fontSize: 60, fontWeight: "800" }}
              />
              <Text className="text-white text-6xl font-extrabold">/{total}</Text>
            </View>
            <Text className="text-white/90 text-base font-semibold mt-1">{pct}%</Text>
            {badge && (
              <View
                className="rounded-full px-3 py-1 mt-3"
                style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
              >
                <Text className="text-white text-xs font-bold tracking-wider uppercase">
                  {badge.emoji} {t("weeklyBadge")} {badge.label}
                </Text>
              </View>
            )}
            <Text className="text-white/85 text-sm mt-4 text-center">{label}</Text>
            <View className="flex-row gap-2 mt-5 w-full">
              <Stat value={`🔥 ${progress.best_day_streak}`} label={t("weeklyBestStreak")} />
              {progress.final_xp_awarded > 0 && (
                <Stat value={`+${progress.final_xp_awarded}`} label="XP" />
              )}
              {myEntry && <Stat value={`#${myEntry.rank}`} label={t("weeklyRank")} />}
            </View>
          </LinearGradient>
        </View>

        {/* Partager mon score : capture le visuel et ouvre la feuille native
            (Story Instagram, WhatsApp en image, etc.). Lien de download imprimé
            sur l'image. */}
        <Pressable
          onPress={async () => {
            buttonPressFeedback();
            setSharing(true);
            await shareResultCard(cardRef, label);
            setSharing(false);
          }}
          disabled={sharing}
          className="mt-4 rounded-2xl flex-row items-center justify-center active:opacity-90"
          style={{ backgroundColor: challenge.color, paddingVertical: 16, opacity: sharing ? 0.6 : 1 }}
          accessibilityRole="button"
          accessibilityLabel={language === "fr" ? "Partager mon score" : "Share my score"}
        >
          <Text style={{ fontSize: 18, marginRight: 8 }}>📸</Text>
          <Text className="font-bold text-base text-white">
            {language === "fr" ? "Partager mon score" : "Share my score"}
          </Text>
        </Pressable>

        {/* Défier un ami : message + lien cliquable (WhatsApp, iMessage…). */}
        <Pressable
          onPress={() => { buttonPressFeedback(); shareWeeklyChallenge(challenge, language); }}
          className="mt-3 rounded-2xl flex-row items-center justify-center active:opacity-90"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            borderWidth: 1.5,
            borderColor: challenge.color,
            paddingVertical: 14,
          }}
          accessibilityRole="button"
          accessibilityLabel={language === "fr" ? "Défier un ami" : "Challenge a friend"}
        >
          <Text style={{ fontSize: 18, marginRight: 8 }}>📤</Text>
          <Text className="font-bold text-base" style={{ color: challenge.color }}>
            {language === "fr" ? "Défier un ami" : "Challenge a friend"}
          </Text>
        </Pressable>

        {progress.completed_at ? (
          <Text className="text-gray-400 text-center mt-4 text-sm">
            {progress.final_xp_awarded > 0 ? t("weeklyXpAwarded") : t("weeklyXpPending")}
          </Text>
        ) : (
          <Pressable
            onPress={() => { buttonPressFeedback(); router.replace({ pathname: "/weekly/play", params: { id: challenge.id, type: challengeType } } as any); }}
            className="mt-4 rounded-2xl items-center justify-center"
            style={{ backgroundColor: challenge.color, paddingVertical: 14 }}
          >
            <Text className="text-white font-bold">→ {t("weeklyContinue")}</Text>
          </Pressable>
        )}

        {leaderboard.length > 0 && (
          <View className="mt-6">
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
                  <Text className="text-base font-bold w-7 text-center" style={{ color: entry.rank <= 3 ? challenge.color : "#9ca3af" }}>
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                  </Text>
                  <Text className="text-white text-sm font-medium ml-3 flex-1" numberOfLines={1}>
                    {entry.username}
                  </Text>
                  <Text className="text-white text-sm font-bold">{entry.correct_count}/{entry.current_position}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          className="mt-6 rounded-2xl items-center justify-center"
          style={{ backgroundColor: COLORS.surface, paddingVertical: 14 }}
        >
          <Text className="text-white/80 font-semibold">{t("backToHome")}</Text>
        </Pressable>
      </ScrollView>

      {/* Carte hors-écran, capturée à la demande pour le partage (jamais visible). */}
      <View style={{ position: "absolute", left: -10000, top: 0 }} pointerEvents="none">
        <WeeklyShareCard
          ref={cardRef}
          data={{
            color: challenge.color,
            emoji: badge?.emoji ?? "🎯",
            score,
            total,
            pct,
            badgeLabel: badge?.label ?? null,
            themeLabel: label,
            difficulty: challenge.target_difficulty,
            language,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const Stat = memo(function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 rounded-xl py-2 items-center" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
      <Text className="text-white text-base font-extrabold">{value}</Text>
      <Text className="text-white/70 text-[10px] uppercase tracking-wider">{label}</Text>
    </View>
  );
});

