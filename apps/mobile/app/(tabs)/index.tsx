import { View, Text, Pressable, ScrollView, ImageBackground } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { getDailyStreak, hasCompletedDailyChallenge } from "../../src/services/dailyChallenge";
import { loadFeedbackSettings, buttonPressFeedback } from "../../src/utils/feedback";
import { SmallAvatar } from "../../src/components/ProfileAvatar";

// New QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceActive: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  coral: "#FF6B6B",
  coralDim: "rgba(255, 107, 107, 0.15)",
  purple: "#A16EFF",
  purpleDim: "rgba(161, 110, 255, 0.15)",
  yellow: "#FFD100",
  yellowDim: "rgba(255, 209, 0, 0.15)",
  gold: "#fbbf24",
  goldDim: "rgba(251, 191, 36, 0.15)",
  teal: "#134e4a",
  red: "#450a0a",
  text: "#ffffff",
  textMuted: "#9ca3af",
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

// Stats Pill component
function StatsPill({ icon, value, color }: { icon: string; value: string | number; color: string }) {
  return (
    <View
      className="flex-row items-center px-3 py-1.5 rounded-full"
      style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <Text className="text-base mr-1.5" style={{ color }}>{icon}</Text>
      <Text className="text-sm font-bold text-gray-200">{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user, profile, isAnonymous } = useAuth();
  const { t } = useTranslation();
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState("12m");

  useEffect(() => {
    loadFeedbackSettings(user?.id);
    loadDailyStatus();
  }, [user]);

  const loadDailyStatus = async () => {
    if (user && !isAnonymous) {
      try {
        const [streak, completed] = await Promise.all([
          getDailyStreak(user.id),
          hasCompletedDailyChallenge(user.id),
        ]);
        setDailyStreak(streak);
        setDailyCompleted(completed);
      } catch (error) {
        console.error("Error loading daily status:", error);
      }
    }
  };

  const totalXP = profile?.total_xp || 0;
  const levelData = calculateLevel(totalXP);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Ambient Background Glows */}
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <View
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-60"
          style={{ backgroundColor: `${COLORS.primary}15` }}
        />
        <View
          className="absolute top-40 -right-20 w-80 h-80 rounded-full blur-3xl opacity-50"
          style={{ backgroundColor: `${COLORS.purple}15` }}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/profile");
              }}
              className="active:opacity-80"
            >
              <SmallAvatar userId={user?.id} username={profile?.username} avatarUrl={profile?.avatar_url} size={40} />
            </Pressable>
            <Text className="text-2xl font-bold tracking-tight text-white">
              BigHead
            </Text>
          </View>

          {/* Stats Pills */}
          <View className="flex-row items-center gap-2">
            <StatsPill icon="🔥" value={dailyStreak || 0} color="#f97316" />
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/achievements");
              }}
              className="active:opacity-80"
            >
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-row items-center px-3 py-1.5 rounded-full"
              >
                <Text className="text-xs font-bold mr-1" style={{ color: '#451a03' }}>LVL</Text>
                <Text className="text-sm font-black" style={{ color: '#451a03' }}>{levelData.level}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Main Content */}
        <View className="px-4 flex-col gap-6">
          {/* Featured Section */}
          <View className="flex-col gap-3">
            <View className="flex-row items-baseline justify-between px-1">
              <Text className="text-base font-bold text-gray-100 tracking-wide uppercase">
                {t("featured")}
              </Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${COLORS.primary}15`, borderWidth: 1, borderColor: `${COLORS.primary}30` }}
              >
                <Text className="text-xs font-medium" style={{ color: COLORS.primary }}>
                  {t("new")}
                </Text>
              </View>
            </View>

            {/* Featured Card - Daily Brain */}
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/daily");
              }}
              className="rounded-2xl overflow-hidden active:opacity-95"
              style={{
                height: 176,
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 20,
              }}
            >
              {/* Full Background Gradient */}
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6', '#ec4899', '#f97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              >
                {/* Decorative circles for depth */}
                <View style={{ position: 'absolute', top: 16, right: 16, width: 96, height: 96, borderRadius: 48, backgroundColor: '#fbbf24', opacity: 0.4 }} />
                <View style={{ position: 'absolute', top: 64, right: 80, width: 64, height: 64, borderRadius: 32, backgroundColor: '#ec4899', opacity: 0.5 }} />
                <View style={{ position: 'absolute', bottom: 32, left: 32, width: 80, height: 80, borderRadius: 40, backgroundColor: '#3b82f6', opacity: 0.4 }} />
              </LinearGradient>

              {/* Bottom Gradient Overlay for readability */}
              <LinearGradient
                colors={['transparent', 'rgba(30, 37, 41, 0.7)']}
                locations={[0.3, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />

              {/* Card Content - positioned at bottom */}
              <View className="absolute bottom-0 left-0 right-0 p-5">
                <View className="flex-row justify-between items-end">
                  <View className="flex-col gap-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View
                        className="px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: COLORS.purple }}
                      >
                        <Text className="text-white text-[10px] font-bold tracking-wider uppercase">
                          {dailyCompleted ? t("done") : t("hard")}
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-xs font-medium">
                        ⏱ {timeLeft} {t("left")}
                      </Text>
                    </View>
                    <Text className="text-3xl font-extrabold text-white leading-tight drop-shadow-lg">
                      {t("dailyBrain").split(' ').join('\n')}
                    </Text>
                  </View>

                  <View
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: dailyCompleted ? '#22c55e' : COLORS.primary,
                      shadowColor: dailyCompleted ? '#22c55e' : COLORS.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.5,
                      shadowRadius: 12,
                    }}
                  >
                    <Text className="text-2xl" style={{ color: COLORS.bg }}>
                      {dailyCompleted ? '✓' : '▶'}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Game Modes Section */}
          <View className="flex-col gap-3">
            <Text className="text-base font-bold text-gray-100 tracking-wide uppercase px-1">
              {t("gameModes")}
            </Text>

            {/* Adventure Mode - Main Feature Card */}
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/game/adventure");
              }}
              className="rounded-xl overflow-hidden active:opacity-95"
              style={{ height: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <LinearGradient
                colors={['#1e3a5f', '#2d5a87', '#3b82f6']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <View className="flex-col justify-center flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View
                      className="px-2 py-0.5 rounded-sm"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      <Text className="text-[10px] font-bold tracking-wider uppercase" style={{ color: '#1e3a5f' }}>
                        {t("new").toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-2xl font-black tracking-tight text-white">
                    🏔️ {t("adventure").toUpperCase()}
                  </Text>
                  <Text className="text-blue-200 text-sm font-medium mt-1">
                    {t("climbMountain")}
                  </Text>
                </View>
                <View className="w-16 h-16 rounded-2xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <Text className="text-4xl">🧗</Text>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Two cards row: Solo Run + Family */}
            <View className="flex-row gap-3">
              {/* Solo Run Card */}
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/game/chain");
                }}
                className="flex-1 rounded-xl overflow-hidden active:opacity-95"
                style={{ height: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <LinearGradient
                  colors={['#134e4a', '#0f766e']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={{ flex: 1, padding: 16, flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: 'rgba(94, 234, 212, 0.2)' }}
                  >
                    <Text className="text-xl font-black" style={{ color: '#5eead4' }}>⚡</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-bold tracking-tight text-white">{t("soloRun").toUpperCase()}</Text>
                    <Text className="text-teal-200 text-xs mt-0.5">{t("infiniteMode")}</Text>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Family Mode Card */}
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/game/family");
                }}
                className="flex-1 rounded-xl overflow-hidden active:opacity-95"
                style={{ height: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <LinearGradient
                  colors={['#7c2d12', '#c2410c']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={{ flex: 1, padding: 16, flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)' }}
                  >
                    <Text className="text-xl">👨‍👩‍👧‍👦</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-bold tracking-tight text-white">{t("family").toUpperCase()}</Text>
                    <Text className="text-orange-200 text-xs mt-0.5">{t("familyQuiz")}</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Small Cards Row */}
            <View className="flex-row gap-3">
              {/* Versus Card */}
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/duel");
                }}
                className="flex-1 rounded-xl overflow-hidden active:opacity-95"
                style={{ height: 144, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <LinearGradient
                  colors={['#450a0a', '#7f1d1d']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={{ flex: 1, padding: 16, flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${COLORS.coral}20` }}
                  >
                    <Text className="text-xl font-black" style={{ color: COLORS.coral }}>×</Text>
                  </View>
                  <View>
                    <Text className="text-xl font-bold tracking-tight text-white">{t("versus").toUpperCase()}</Text>
                    <Text className="text-red-200 text-xs mt-0.5">{t("pvpLive")}</Text>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Party Card */}
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/party/setup");
                }}
                className="flex-1 rounded-xl overflow-hidden active:opacity-95"
                style={{ height: 144, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <LinearGradient
                  colors={['#3b0764', '#7c3aed']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={{ flex: 1, padding: 16, flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${COLORS.purple}20` }}
                  >
                    <Text className="text-xl">🎉</Text>
                  </View>
                  <View>
                    <Text className="text-xl font-bold tracking-tight text-white">{t("party").toUpperCase()}</Text>
                    <Text className="text-purple-200 text-xs mt-0.5">{t("localMultiplayer")}</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Level & Achievements Card */}
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/achievements");
              }}
              className="rounded-2xl overflow-hidden active:opacity-95"
              style={{ borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)' }}
            >
              <LinearGradient
                colors={['#451a03', '#78350f', '#92400e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 20 }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  {/* Level Badge */}
                  <View className="flex-row items-center gap-3">
                    <LinearGradient
                      colors={['#fbbf24', '#f59e0b', '#d97706']}
                      className="w-14 h-14 rounded-xl items-center justify-center"
                      style={{
                        shadowColor: '#fbbf24',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                      }}
                    >
                      <Text className="text-[10px] font-bold text-amber-900 opacity-80">LVL</Text>
                      <Text className="text-2xl font-black text-amber-900">{levelData.level}</Text>
                    </LinearGradient>
                    <View>
                      <Text className="text-white font-bold text-lg">{t("level")} {levelData.level}</Text>
                      <Text className="text-amber-200/80 text-sm">{totalXP.toLocaleString()} XP {t("totalXP")}</Text>
                    </View>
                  </View>

                  {/* Trophy icon */}
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}
                  >
                    <Text className="text-2xl">🏆</Text>
                  </View>
                </View>

                {/* XP Progress Bar */}
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-amber-200/70 text-xs">{t("progressToLevel")} {levelData.level + 1}</Text>
                    <Text className="text-amber-200 text-xs font-bold">{levelData.currentXP} / {levelData.nextLevelXP} XP</Text>
                  </View>
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                  >
                    <LinearGradient
                      colors={['#fbbf24', '#f59e0b']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ width: `${levelData.progress}%`, height: '100%', borderRadius: 999 }}
                    />
                  </View>
                </View>

                {/* View Achievements link */}
                <View className="flex-row items-center justify-center mt-4 pt-3" style={{ borderTopWidth: 1, borderTopColor: 'rgba(251, 191, 36, 0.2)' }}>
                  <Text className="text-amber-200 font-semibold text-sm mr-2">{t("viewAchievementsBadges")}</Text>
                  <Text className="text-amber-200">→</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Quick Actions Row */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/stats");
              }}
              className="flex-1 p-3 rounded-lg flex-row items-center gap-3 active:opacity-80"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <View
                className="w-9 h-9 rounded-lg items-center justify-center"
                style={{ backgroundColor: `${COLORS.primary}15` }}
              >
                <Text className="text-lg font-bold" style={{ color: COLORS.primary }}>▮▮▯</Text>
              </View>
              <View>
                <Text className="font-bold text-sm text-white">{t("stats")}</Text>
                <Text className="text-[10px] text-gray-400">{t("yourProgress")}</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/leaderboard");
              }}
              className="flex-1 p-3 rounded-lg flex-row items-center gap-3 active:opacity-80"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <View
                className="w-9 h-9 rounded-lg items-center justify-center"
                style={{ backgroundColor: `${COLORS.yellow}15` }}
              >
                <Text className="text-lg font-bold" style={{ color: COLORS.yellow }}>♛</Text>
              </View>
              <View>
                <Text className="font-bold text-sm text-white">{t("ranking")}</Text>
                <Text className="text-[10px] text-gray-400">{t("topPlayers")}</Text>
              </View>
            </Pressable>
          </View>

          {/* Premium Banner */}
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.push("/premium");
            }}
            className="rounded-xl overflow-hidden active:opacity-95"
            style={{ borderWidth: 1, borderColor: 'rgba(255, 209, 0, 0.3)' }}
          >
            <LinearGradient
              colors={['#7c3aed', '#c026d3', '#f59e0b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">👑</Text>
                <View>
                  <Text className="text-white font-bold text-base">{t("getPremiumAccess")}</Text>
                  <Text className="text-white/70 text-xs">{t("unlockFeaturesRemoveAds")}</Text>
                </View>
              </View>
              <View
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Text className="text-white font-bold text-sm">{t("upgrade")}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
