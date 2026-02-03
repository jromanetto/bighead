import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../src/contexts/AuthContext";
import { useTranslation } from "../src/contexts/LanguageContext";
import type { TranslationKey } from "../src/i18n/translations";
import { buttonPressFeedback } from "../src/utils/feedback";
import {
  getAllAchievements,
  getUserAchievements,
  getAchievementProgress,
  type Achievement,
} from "../src/services/achievements";

// Design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.15)",
  gold: "#FFD100",
  goldDim: "rgba(255, 209, 0, 0.15)",
  purple: "#a855f7",
  purpleDim: "rgba(168, 85, 247, 0.15)",
  coral: "#FF6B6B",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
};

// XP required for each level (exponential growth)
const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calculate level from total XP
const calculateLevel = (totalXP: number): { level: number; currentXP: number; nextLevelXP: number; progress: number } => {
  let level = 1;
  let xpRemaining = totalXP;

  while (xpRemaining >= getXPForLevel(level)) {
    xpRemaining -= getXPForLevel(level);
    level++;
  }

  const nextLevelXP = getXPForLevel(level);
  const progress = (xpRemaining / nextLevelXP) * 100;

  return { level, currentXP: xpRemaining, nextLevelXP, progress };
};

// Category icons and colors
const categoryConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  all: { icon: "🏆", color: COLORS.gold, bgColor: COLORS.goldDim },
  games: { icon: "🎮", color: COLORS.primary, bgColor: COLORS.primaryDim },
  score: { icon: "⚡", color: COLORS.coral, bgColor: "rgba(255, 107, 107, 0.15)" },
  streak: { icon: "🔥", color: "#f97316", bgColor: "rgba(249, 115, 22, 0.15)" },
  special: { icon: "⭐", color: COLORS.purple, bgColor: COLORS.purpleDim },
};

// Achievement Card component
function AchievementCard({
  achievement,
  unlocked,
  progress,
  t,
}: {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number;
  t: (key: TranslationKey) => string;
}) {
  const showProgress = !unlocked && progress !== undefined && progress > 0 && progress < 100;
  const config = categoryConfig[achievement.category] || categoryConfig.all;

  return (
    <Pressable
      className="rounded-2xl p-4 mb-3 active:opacity-90"
      style={{
        backgroundColor: unlocked ? COLORS.surface : COLORS.surface,
        borderWidth: 1,
        borderColor: unlocked ? `${config.color}30` : 'rgba(255,255,255,0.05)',
      }}
    >
      <View className="flex-row items-center">
        {/* Icon with glow effect for unlocked */}
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
          style={{
            backgroundColor: unlocked ? config.bgColor : 'rgba(255,255,255,0.05)',
            shadowColor: unlocked ? config.color : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: unlocked ? 0.5 : 0,
            shadowRadius: 12,
          }}
        >
          <Text className={`text-3xl ${!unlocked ? 'opacity-30 grayscale' : ''}`}>
            {achievement.icon}
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text
              className="font-bold text-base flex-1"
              style={{ color: unlocked ? COLORS.text : COLORS.textDim }}
            >
              {achievement.name}
            </Text>
            {unlocked && (
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: COLORS.success }}
              >
                <Text className="text-white text-xs">✓</Text>
              </View>
            )}
          </View>

          <Text
            className="text-sm mb-2"
            style={{ color: unlocked ? COLORS.textMuted : COLORS.textDim }}
            numberOfLines={2}
          >
            {achievement.description}
          </Text>

          {/* XP Reward Badge */}
          <View className="flex-row items-center gap-2">
            <View
              className="flex-row items-center px-2 py-1 rounded-md"
              style={{ backgroundColor: unlocked ? COLORS.goldDim : 'rgba(255,255,255,0.05)' }}
            >
              <Text className="text-sm mr-1">💎</Text>
              <Text
                className="font-bold text-sm"
                style={{ color: unlocked ? COLORS.gold : COLORS.textDim }}
              >
                {achievement.xp_reward} XP
              </Text>
            </View>

            {/* Progress bar for in-progress achievements */}
            {showProgress && (
              <View className="flex-1 flex-row items-center gap-2">
                <View
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: COLORS.surfaceLight }}
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </View>
                <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                  {Math.round(progress)}%
                </Text>
              </View>
            )}

            {!unlocked && !showProgress && (
              <Text className="text-xs" style={{ color: COLORS.textDim }}>🔒 {t("locked")}</Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function AchievementsScreen() {
  const { user, profile, isAnonymous } = useAuth();
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Set<string>>(new Set());
  const [progressData, setProgressData] = useState({ total: 0, unlocked: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Calculate level from XP
  const totalXP = profile?.total_xp || 0;
  const levelData = calculateLevel(totalXP);

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
        setProgressData(prog);
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
    setLoading(false);
  };

  const categories = [
    { code: "all", name: t("all") },
    { code: "games", name: t("games") },
    { code: "score", name: t("score") },
    { code: "streak", name: t("streaks") },
    { code: "special", name: t("special") },
  ];

  const filteredAchievements = achievements.filter(
    a => activeCategory === "all" || a.category === activeCategory
  );

  // Sort: unlocked first, then by XP reward
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    const aUnlocked = userAchievements.has(a.id);
    const bUnlocked = userAchievements.has(b.id);
    if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
    return b.xp_reward - a.xp_reward;
  });

  const isUnlocked = (achievementId: string) => userAchievements.has(achievementId);

  // Calculate total XP from achievements
  const achievementXP = achievements
    .filter(a => isUnlocked(a.id))
    .reduce((sum, a) => sum + a.xp_reward, 0);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Background gradient */}
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <View
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: COLORS.gold }}
        />
        <View
          className="absolute top-60 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: COLORS.purple }}
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
          <Text className="text-white text-2xl font-black flex-1">{t("achievements")}</Text>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: COLORS.goldDim }}
          >
            <Text style={{ color: COLORS.gold }} className="font-bold text-sm">
              {progressData.unlocked}/{progressData.total}
            </Text>
          </View>
        </View>

        {/* Level & XP Hero Card */}
        <View className="mx-5 mb-5">
          <LinearGradient
            colors={['#7c3aed', '#a855f7', '#c084fc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-1"
          >
            <View
              className="rounded-[22px] p-5"
              style={{ backgroundColor: COLORS.bg }}
            >
              <View className="flex-row items-center mb-4">
                {/* Level Badge */}
                <LinearGradient
                  colors={['#fbbf24', '#f59e0b', '#d97706']}
                  className="w-20 h-20 rounded-2xl items-center justify-center mr-4"
                >
                  <Text className="text-white text-xs font-bold opacity-80">{t("level").toUpperCase()}</Text>
                  <Text className="text-white text-3xl font-black">{levelData.level}</Text>
                </LinearGradient>

                {/* XP Info */}
                <View className="flex-1">
                  <Text className="text-white text-2xl font-black">
                    {totalXP.toLocaleString()} XP
                  </Text>
                  <Text style={{ color: COLORS.textMuted }} className="text-sm mt-1">
                    {t("totalExperienceEarned")}
                  </Text>
                </View>
              </View>

              {/* Progress to next level */}
              <View>
                <View className="flex-row justify-between mb-2">
                  <Text style={{ color: COLORS.textMuted }} className="text-xs">
                    {t("progressToLevel")} {levelData.level + 1}
                  </Text>
                  <Text style={{ color: COLORS.gold }} className="text-xs font-bold">
                    {levelData.currentXP} / {levelData.nextLevelXP} XP
                  </Text>
                </View>
                <View
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: COLORS.surfaceLight }}
                >
                  <LinearGradient
                    colors={['#fbbf24', '#f59e0b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: `${levelData.progress}%`, height: '100%', borderRadius: 999 }}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3 mx-5 mb-5">
          <View
            className="flex-1 rounded-xl p-4"
            style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-lg">🏆</Text>
              <Text className="text-2xl font-black text-white">{progressData.unlocked}</Text>
            </View>
            <Text style={{ color: COLORS.textMuted }} className="text-xs">{t("unlocked")}</Text>
          </View>

          <View
            className="flex-1 rounded-xl p-4"
            style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-lg">💎</Text>
              <Text className="text-2xl font-black" style={{ color: COLORS.gold }}>{achievementXP}</Text>
            </View>
            <Text style={{ color: COLORS.textMuted }} className="text-xs">{t("xpFromBadges")}</Text>
          </View>

          <View
            className="flex-1 rounded-xl p-4"
            style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-lg">📊</Text>
              <Text className="text-2xl font-black" style={{ color: COLORS.primary }}>{progressData.percentage}%</Text>
            </View>
            <Text style={{ color: COLORS.textMuted }} className="text-xs">{t("completed")}</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {categories.map((cat) => {
            const config = categoryConfig[cat.code] || categoryConfig.all;
            const isActive = activeCategory === cat.code;
            return (
              <Pressable
                key={cat.code}
                onPress={() => {
                  buttonPressFeedback();
                  setActiveCategory(cat.code);
                }}
                className="flex-row items-center rounded-full px-4 py-2 mr-2"
                style={{
                  backgroundColor: isActive ? config.bgColor : COLORS.surface,
                  borderWidth: 1,
                  borderColor: isActive ? `${config.color}50` : 'rgba(255,255,255,0.05)',
                }}
              >
                <Text className="mr-2">{config.icon}</Text>
                <Text
                  className="font-semibold"
                  style={{ color: isActive ? config.color : COLORS.textMuted }}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Achievements List */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View className="px-5 pb-8">
            {sortedAchievements.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-5xl mb-4">🔍</Text>
                <Text className="text-white font-bold text-lg">{t("noAchievementsFound")}</Text>
                <Text style={{ color: COLORS.textMuted }} className="text-sm">
                  {t("tryDifferentCategory")}
                </Text>
              </View>
            ) : (
              sortedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={isUnlocked(achievement.id)}
                  t={t}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
