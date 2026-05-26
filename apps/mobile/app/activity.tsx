import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "../src/contexts/LanguageContext";
import { ActivityCard } from "../src/components/ActivityCard";
import {
  getActivityFeed,
  type ActivityEvent,
} from "../src/services/activityFeed";
import { Icon } from "../src/components/ui";
import { useAuth } from "../src/contexts/AuthContext";
import { awardXP } from "../src/services/xp";
import { getTodayIsoDate } from "../src/utils/dates";
import { SkeletonCard } from "../src/components/Skeleton";
import { EmptyState } from "../src/components/EmptyState";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  text: "#ffffff",
  textMuted: "#9ca3af",
  primary: "#00c2cc",
};

const PAGE_SIZE = 30;

export default function ActivityScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getActivityFeed(PAGE_SIZE, 0);
    setEvents(data);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  // Reward +2 XP for opening the activity feed (capped 1×/day via dedupe key)
  useEffect(() => {
    if (!user?.id) return;
    const today = getTodayIsoDate(); // YYYY-MM-DD UTC
    awardXP(user.id, 2, "activity_feed_open", { day: today }, `activity_feed_open_${today}`).catch(
      () => {}
    );
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-70"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Icon name="ChevronLeft" size={22} color="#ffffff" />
        </Pressable>
        <Text className="text-lg font-bold text-white">
          {t("activityTitle")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityCard event={item} />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 32,
            gap: 8,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              emoji="🎯"
              title={t("activityEmpty")}
              subtitle={t("activityNoFriends")}
              cta={{
                label: t("activityFeedEmptyCTA"),
                onPress: () => router.push("/(tabs)" as any),
              }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
