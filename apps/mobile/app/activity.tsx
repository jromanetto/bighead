import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  RefreshControl,
  ActivityIndicator,
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
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
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-6">
              <Text className="text-5xl mb-3">👥</Text>
              <Text className="text-base font-semibold text-white text-center">
                {t("activityEmpty")}
              </Text>
              <Text
                className="text-sm mt-1 text-center"
                style={{ color: COLORS.textMuted }}
              >
                {t("activityNoFriends")}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
