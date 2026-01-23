import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { buttonPressFeedback } from "../src/utils/feedback";
import {
  getAllAchievements,
  getUserAchievements,
  getAchievementProgress,
  type Achievement,
} from "../src/services/achievements";
import { BottomNavigation } from "../src/components/BottomNavigation";

// New QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.15)",
  gold: "#FFD100",
  goldDim: "rgba(255, 209, 0, 0.2)",
  pink: "#ec4899",
  purple: "#A16EFF",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// Achievement Card component
function AchievementCard({
  achievement,
  unlocked,
  progress,
}: {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number; // 0-100 for in-progress achievements
}) {
  const showProgress = !unlocked && progress !== undefined && progress > 0 && progress < 100;

  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className="w-14 h-14 rounded-xl items-center justify-center mr-4"
          style={{
            backgroundColor: unlocked
              ? COLORS.primaryDim
              : 'rgba(255,255,255,0.05)',
          }}
        >
          <Text className={`text-3xl ${!unlocked ? 'opacity-40' : ''}`}>
            {achievement.icon}
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="font-bold text-base"
              style={{ color: unlocked ? COLORS.text : COLORS.textMuted }}
            >
              {achievement.name}
            </Text>
            <Text
              className="font-bold text-sm"
              style={{ color: COLORS.primary }}
            >
              +{achievement.xp_reward} XP
            </Text>
          </View>
          <Text
            className="text-sm mb-2"
            style={{ color: unlocked ? COLORS.textMuted : '#6b7280' }}
          >
            {achievement.description}
          </Text>

          {/* Progress bar or status */}
          {showProgress && (
            <View className="mt-1">
              <View
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: COLORS.surfaceLight }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: COLORS.primary,
                  }}
                />
              </View>
              <Text className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                {Math.round(progress)}% completed
              </Text>
            </View>
          )}
        </View>

        {/* Status indicator */}
        {unlocked && (
          <View
            className="w-8 h-8 rounded-full items-center justify-center ml-2"
            style={{ backgroundColor: COLORS.success }}
          >
            <Text className="text-white">✓</Text>
          </View>
        )}
        {!unlocked && !showProgress && (
          <View
            className="w-8 h-8 rounded-full items-center justify-center ml-2"
            style={{ backgroundColor: COLORS.surfaceLight }}
          >
            <Text className="text-gray-500">🔒</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function AchievementsScreen() {
  const { user, isAnonymous } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState({ total: 0, unlocked: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allAchievements = await getAllAchievements();
      setAchievements(allAchievements);

      if (user && !isAnonymous) {
        const [userAch, prog] = await Promise.all([
          getUserAchievements(user.id),
          getAchievementProgress(user.id),
        ]);
        setUserAchievements(new Set(userAch.map(a => a.achievement_id)));
        setProgress(prog);
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
    setLoading(false);
  };

  const categories = [
    { code: "all", name: "All" },
    { code: "games", name: "Games" },
    { code: "score", name: "Score" },
    { code: "streak", name: "Social" },
  ];

  const filteredAchievements = achievements.filter(
    a => activeCategory === "all" || a.category === activeCategory
  );

  const isUnlocked = (achievementId: string) => userAchievements.has(achievementId);

  // Calculate total XP from unlocked achievements
  const totalXP = achievements
    .filter(a => isUnlocked(a.id))
    .reduce((sum, a) => sum + a.xp_reward, 0);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 mb-4">
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.back();
            }}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-white text-lg">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-black">Achievements</Text>
        </View>

        {/* Progress Card */}
        <View
          className="mx-5 mb-5 rounded-2xl p-5"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Text
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: COLORS.textMuted }}
          >
            Total Progress
          </Text>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-4xl font-black text-white">
              {progress.unlocked} / {progress.total}
            </Text>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: COLORS.primaryDim }}
            >
              <Text style={{ color: COLORS.primary }} className="font-bold">
                +{totalXP} XP
              </Text>
            </View>
          </View>
          <View
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: COLORS.surfaceLight }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress.percentage}%`,
                backgroundColor: COLORS.primary,
              }}
            />
          </View>
          <Text className="text-sm mt-2" style={{ color: COLORS.textMuted }}>
            Keep it up! You're {progress.total - progress.unlocked} achievements away from becoming a legend.
          </Text>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 mb-4"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.code}
              onPress={() => {
                buttonPressFeedback();
                setActiveCategory(cat.code);
              }}
              className="rounded-full px-5 py-2 mr-2"
              style={{
                backgroundColor: activeCategory === cat.code ? COLORS.primary : COLORS.surface,
              }}
            >
              <Text
                className="font-semibold"
                style={{
                  color: activeCategory === cat.code ? COLORS.bg : COLORS.textMuted,
                }}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Loading */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={isUnlocked(achievement.id)}
              />
            ))}

            {/* Anonymous prompt */}
            {isAnonymous && (
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/profile");
                }}
                className="rounded-2xl p-4 mt-2 mb-4"
                style={{
                  backgroundColor: COLORS.primaryDim,
                  borderWidth: 1,
                  borderColor: `${COLORS.primary}30`,
                }}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">🎮</Text>
                  <View className="flex-1">
                    <Text className="text-white font-bold">Create an account</Text>
                    <Text style={{ color: COLORS.textMuted }} className="text-sm">
                      To unlock and save your achievements
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}

            <View className="h-6" />
          </ScrollView>
        )}

        {/* Bottom Navigation */}
        <BottomNavigation variant="fixed" />
      </View>
    </SafeAreaView>
  );
}
