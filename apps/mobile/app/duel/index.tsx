import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image,
  Share,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useMemo, memo } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation, useLanguage } from "../../src/contexts/LanguageContext";
import {
  getMyDuels,
  categorizeAsyncDuel,
  buildDuelShareUrl,
  type AsyncDuelInboxItem,
  type AsyncDuelBucket,
} from "../../src/services/duel";
import { ensureReferralCode } from "../../src/services/referral";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { BottomNavigation } from "../../src/components/BottomNavigation";
import { IconButton } from "../../src/components/ui";

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
  warnDim: "rgba(250, 204, 21, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const STATUS_LABEL: Record<AsyncDuelBucket, { emoji: string; tKey: string; color: string; bgKey: string }> = {
  my_turn: { emoji: "🎯", tKey: "duelMyTurn", color: COLORS.primary, bgKey: "primaryDim" },
  waiting: { emoji: "⏳", tKey: "duelWaiting", color: COLORS.warn, bgKey: "warnDim" },
  finished: { emoji: "✅", tKey: "duelFinished", color: COLORS.success, bgKey: "successDim" },
  expired: { emoji: "❌", tKey: "duelExpired", color: COLORS.error, bgKey: "errorDim" },
  invite_sent: { emoji: "📨", tKey: "duelInviteSent", color: COLORS.textMuted, bgKey: "surfaceLight" },
};

const shareDuelInvite = async (duelId: string, userId: string, lang: string) => {
  buttonPressFeedback();
  let refCode: string | null = null;
  try { refCode = await ensureReferralCode(userId); } catch {}
  const url = buildDuelShareUrl(duelId, refCode);
  const isEN = lang === "en";
  const message = isEN
    ? `🎯 I just challenged you on BigHead! 10 trivia questions, you have 48h. Accept: ${url}`
    : `🎯 Je te défie sur BigHead ! 10 questions, t'as 48h pour répondre. Accepte : ${url}`;
  try { await Share.share({ message, url }); } catch {}
};

interface DuelCardProps {
  duel: AsyncDuelInboxItem;
  bucket: AsyncDuelBucket;
  myUserId: string;
  t: (k: any) => string;
  language: string;
}

const DuelCard = memo(function DuelCard({ duel, bucket, myUserId, t, language }: DuelCardProps) {
  const isWinner = duel.winner_id === myUserId;
  const isDraw = duel.status === "completed" && duel.winner_id === null;
  const meta = STATUS_LABEL[bucket];

  const handlePress = () => {
    buttonPressFeedback();
    if (bucket === "my_turn") {
      router.navigate(`/duel/play?id=${duel.duel_id}`);
    } else {
      router.navigate(`/duel/result?id=${duel.duel_id}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={bucket === "expired"}
      className="flex-row items-center rounded-2xl p-4 mb-3 active:opacity-80"
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor:
          bucket === "my_turn"
            ? `${COLORS.primary}40`
            : "rgba(255,255,255,0.05)",
        opacity: bucket === "expired" ? 0.6 : 1,
      }}
    >
      {/* Avatar */}
      <View
        className="w-12 h-12 rounded-full mr-3 items-center justify-center overflow-hidden"
        style={{ backgroundColor: COLORS.surfaceLight }}
      >
        {duel.opponent_avatar ? (
          <Image source={{ uri: duel.opponent_avatar }} className="w-full h-full" />
        ) : (
          <Text className="text-xl">🧠</Text>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-white font-bold text-base" numberOfLines={1}>
            {duel.opponent_username || "Player"}
          </Text>
          {duel.category && (
            <Text style={{ color: COLORS.textMuted }} className="text-xs ml-2">
              · {duel.category}
            </Text>
          )}
        </View>

        <View className="flex-row items-center">
          <Text className="text-sm mr-1">{meta.emoji}</Text>
          <Text style={{ color: meta.color }} className="text-xs font-semibold">
            {t(meta.tKey)}
          </Text>

          {/* Score visibility */}
          {duel.status === "completed" && (
            <Text className="text-xs ml-2" style={{ color: COLORS.textMuted }}>
              {duel.my_score}/10 · {duel.opponent_score}/10
              {isWinner ? " 🏆" : isDraw ? " 🤝" : ""}
            </Text>
          )}
          {bucket === "waiting" && duel.my_score !== null && (
            <Text className="text-xs ml-2" style={{ color: COLORS.textMuted }}>
              {(t("duelMyScore") as string).replace("{{score}}", String(duel.my_score))}
            </Text>
          )}
        </View>
      </View>

      {/* Share button — surface when waiting for opponent (most useful nudge moment) */}
      {bucket === "waiting" && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            shareDuelInvite(duel.duel_id, myUserId, language);
          }}
          hitSlop={8}
          className="w-9 h-9 rounded-full items-center justify-center mr-1"
          style={{ backgroundColor: COLORS.primaryDim }}
        >
          <Text style={{ color: COLORS.primary }} className="text-base">📲</Text>
        </Pressable>
      )}

      {/* Chevron */}
      <Text style={{ color: COLORS.textMuted }} className="text-lg">
        ›
      </Text>
    </Pressable>
  );
});

interface BucketSectionProps {
  title: string;
  emoji: string;
  items: AsyncDuelInboxItem[];
  bucket: AsyncDuelBucket;
  myUserId: string;
  t: (k: any) => string;
  language: string;
  defaultCollapsed?: boolean;
}

function BucketSection({
  title,
  emoji,
  items,
  bucket,
  myUserId,
  t,
  language,
  defaultCollapsed = false,
}: BucketSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  if (items.length === 0) return null;

  return (
    <View className="mb-5">
      <Pressable
        onPress={() => {
          buttonPressFeedback();
          setCollapsed((c) => !c);
        }}
        className="flex-row items-center justify-between mb-2 px-1"
      >
        <View className="flex-row items-center">
          <Text className="text-base mr-2">{emoji}</Text>
          <Text className="text-white font-bold text-base">{title}</Text>
          <View
            className="ml-2 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: COLORS.surfaceLight }}
          >
            <Text className="text-xs font-bold" style={{ color: COLORS.textMuted }}>
              {items.length}
            </Text>
          </View>
        </View>
        <Text style={{ color: COLORS.textMuted }} className="text-sm">
          {collapsed ? "▾" : "▴"}
        </Text>
      </Pressable>

      {!collapsed &&
        items.map((d) => (
          <DuelCard key={d.duel_id} duel={d} bucket={bucket} myUserId={myUserId} t={t} language={language} />
        ))}
    </View>
  );
}

export default function DuelInboxScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [duels, setDuels] = useState<AsyncDuelInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await getMyDuels();
      setDuels(data);
    } catch (e) {
      console.error("getMyDuels error", e);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const buckets = useMemo(() => {
    const out: Record<AsyncDuelBucket, AsyncDuelInboxItem[]> = {
      my_turn: [],
      waiting: [],
      finished: [],
      expired: [],
      invite_sent: [],
    };
    for (const d of duels) {
      const b = categorizeAsyncDuel(d);
      out[b].push(d);
    }
    // Cap finished to last 10
    out.finished = out.finished.slice(0, 10);
    return out;
  }, [duels]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="flex-row items-center pt-4 mb-4">
          <IconButton
            name="ArrowLeft"
            onPress={() => router.navigate("/(tabs)")}
            variant="glass"
            size={40}
            style={{ marginRight: 12 }}
          />
          <Text className="text-white text-2xl font-black flex-1">
            {t("duelTitle" as any)}
          </Text>
        </View>

        {/* New Duel button */}
        <Pressable
          onPress={() => {
            buttonPressFeedback();
            router.navigate("/duel/new");
          }}
          className="rounded-2xl py-4 mb-5 active:opacity-80"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text
            className="text-center font-bold text-lg"
            style={{ color: COLORS.bg }}
          >
            ⚔️ {t("duelNewDuel" as any)}
          </Text>
        </Pressable>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                tintColor={COLORS.primary}
                onRefresh={() => {
                  setRefreshing(true);
                  load();
                }}
              />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {duels.length === 0 ? (
              <View className="items-center justify-center py-16">
                <Text className="text-6xl mb-4">⚔️</Text>
                <Text style={{ color: COLORS.textMuted }} className="text-center">
                  {t("duelInboxEmpty" as any)}
                </Text>
              </View>
            ) : (
              <>
                <BucketSection
                  title={t("duelMyTurn" as any)}
                  emoji="🎯"
                  items={buckets.my_turn}
                  bucket="my_turn"
                  myUserId={user?.id || ""}
                  t={t as any}
                  language={language}
                />
                <BucketSection
                  title={t("duelWaiting" as any)}
                  emoji="⏳"
                  items={buckets.waiting}
                  bucket="waiting"
                  myUserId={user?.id || ""}
                  t={t as any}
                  language={language}
                />
                <BucketSection
                  title={t("duelFinished" as any)}
                  emoji="✅"
                  items={buckets.finished}
                  bucket="finished"
                  myUserId={user?.id || ""}
                  t={t as any}
                  language={language}
                />
                <BucketSection
                  title={t("duelExpired" as any)}
                  emoji="❌"
                  items={buckets.expired}
                  bucket="expired"
                  myUserId={user?.id || ""}
                  t={t as any}
                  language={language}
                  defaultCollapsed
                />
              </>
            )}
          </ScrollView>
        )}
      </View>

      <BottomNavigation />
    </SafeAreaView>
  );
}
