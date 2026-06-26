import { View, Text, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { memo, useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { Skeleton, SkeletonCard } from "../../src/components/Skeleton";
import { EmptyState } from "../../src/components/EmptyState";
import {
  getMyChallengeHistory,
  startReplay,
  type HistoryEntry,
} from "../../src/services/weeklyHistory";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  text: "#ffffff",
  textMuted: "#9ca3af",
  border: "rgba(255,255,255,0.06)",
};

export default function WeeklyHistory() {
  const { t, language } = useTranslation();
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getMyChallengeHistory();
    setEntries(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleReplay = useCallback(async (challengeId: string) => {
    if (replayingId) return;
    buttonPressFeedback();
    setReplayingId(challengeId);
    const replayId = await startReplay(challengeId);
    setReplayingId(null);
    if (replayId) {
      router.push({
        pathname: "/weekly/replay",
        params: { replay_id: replayId, challenge_id: challengeId },
      } as any);
    }
  }, [replayingId]);

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
        <Text className="text-white text-base font-semibold">
          {t("weeklyHistoryTitle")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {entries === null ? (
        <View style={{ padding: 16 }}>
          <View style={{ height: 8 }} />
          <SkeletonCard />
          <View style={{ height: 12 }} />
          <SkeletonCard />
          <View style={{ height: 12 }} />
          <SkeletonCard />
        </View>
      ) : entries.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <EmptyState
            emoji="📚"
            title={t("weeklyHistoryEmpty")}
            subtitle={t("weeklyHistoryEmptySubtitle")}
            cta={{
              label: t("backToHome"),
              onPress: () => router.replace("/weekly" as any),
            }}
          />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.challenge_id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <HistoryCard
              entry={item}
              language={language as "fr" | "en"}
              onReplay={handleReplay}
              isLoading={replayingId === item.challenge_id}
              labelYourScore={t("weeklyHistoryYourScore")}
              labelBestReplay={t("weeklyHistoryReplayBest")}
              labelReplay={t("weeklyReplayCta")}
              labelPlay={t("play")}
              labelNotPlayed={t("weeklyHistoryNotPlayed")}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

interface HistoryCardProps {
  entry: HistoryEntry;
  language: "fr" | "en";
  onReplay: (challengeId: string) => void;
  isLoading: boolean;
  labelYourScore: string;
  labelBestReplay: string;
  labelReplay: string;
  labelPlay: string;
  labelNotPlayed: string;
}

const HistoryCard = memo(function HistoryCard({
  entry,
  language,
  onReplay,
  isLoading,
  labelYourScore,
  labelBestReplay,
  labelReplay,
  labelPlay,
  labelNotPlayed,
}: HistoryCardProps) {
  const label = language === "fr" ? entry.theme_label_fr : entry.theme_label_en;
  const score = entry.correct_count;
  const total = entry.total_questions;
  // correct_count null = quiz passé jamais joué (LEFT JOIN côté RPC)
  const hasPlayed = score !== null && score !== undefined;
  const hasReplay = entry.best_replay_score !== null && entry.best_replay_score !== undefined;

  return (
    <View
      className="rounded-2xl flex-row overflow-hidden"
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      {/* Color stripe */}
      <View style={{ width: 6, backgroundColor: entry.color }} />

      {/* Corps cliquable : ouvre le récap (scores + partage) si déjà joué. */}
      <Pressable
        onPress={() => {
          if (!hasPlayed) return;
          buttonPressFeedback();
          router.push({
            pathname: "/weekly/result",
            params: { id: entry.challenge_id, type: entry.challenge_type },
          } as any);
        }}
        disabled={!hasPlayed}
        className="flex-1 flex-row active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel={
          hasPlayed
            ? language === "fr"
              ? `Voir le récap de ${label} et partager`
              : `See recap of ${label} and share`
            : label
        }
      >
        {/* Emoji */}
        <View className="items-center justify-center" style={{ width: 56 }}>
          <Text style={{ fontSize: 32 }}>{entry.emoji}</Text>
        </View>

        {/* Middle */}
        <View className="flex-1 py-3 pr-2">
          <Text className="text-white text-base font-bold" numberOfLines={1}>
            {label}
          </Text>
          <Text className="text-gray-400 text-[11px] mt-0.5">
            {formatDateRange(entry.start_date, entry.end_date)}
          </Text>
          <View className="flex-row items-center mt-1.5 flex-wrap">
            {hasPlayed ? (
              <Text className="text-white text-xs font-semibold">
                {labelYourScore}: {score}/{total}
              </Text>
            ) : (
              <Text className="text-gray-400 text-xs font-semibold">
                {labelNotPlayed}
              </Text>
            )}
            {entry.badge_earned && (
              <Text className="text-yellow-400 text-xs font-semibold ml-2">
                {badgeIcon(entry.badge_earned)} {entry.badge_earned}
              </Text>
            )}
          </View>
          {hasReplay && (
            <Text className="text-cyan-300 text-[11px] mt-1">
              ↻ {labelBestReplay}: {entry.best_replay_score}/{total}
            </Text>
          )}
          {hasPlayed && (
            <Text className="text-[11px] mt-1 font-semibold" style={{ color: entry.color }}>
              {language === "fr" ? "Voir le récap & partager ›" : "See recap & share ›"}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Replay button */}
      <Pressable
        onPress={() => onReplay(entry.challenge_id)}
        disabled={isLoading}
        className="items-center justify-center px-4"
        style={{
          backgroundColor: isLoading ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
          opacity: isLoading ? 0.6 : 1,
        }}
        accessibilityRole="button"
        accessibilityLabel={hasPlayed ? labelReplay : labelPlay}
      >
        {isLoading ? (
          <Skeleton width={20} height={20} rounded={10} />
        ) : (
          <>
            <Text style={{ fontSize: 22, color: entry.color }}>
              {hasPlayed ? "↻" : "▶"}
            </Text>
            <Text className="text-white text-[10px] font-bold mt-0.5 uppercase tracking-wider">
              {hasPlayed ? labelReplay : labelPlay}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
});

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  const sStr = s.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const eStr = e.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return `${sStr} – ${eStr}`;
}

function badgeIcon(badge: string): string {
  const b = badge.toLowerCase();
  if (b.includes("expert") || b.includes("gold")) return "🏆";
  if (b.includes("silver") || b.includes("advanced")) return "🥈";
  if (b.includes("bronze") || b.includes("good")) return "🥉";
  return "🎖";
}
