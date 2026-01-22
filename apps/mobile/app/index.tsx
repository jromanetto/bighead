import { View, Text, Pressable, ScrollView, ImageBackground } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../src/contexts/AuthContext";
import { getDailyStreak, hasCompletedDailyChallenge } from "../src/services/dailyChallenge";
import { loadFeedbackSettings, buttonPressFeedback } from "../src/utils/feedback";

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
  teal: "#134e4a",
  red: "#450a0a",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// Avatar component
function UserAvatar({ username, size = 40 }: { username?: string | null; size?: number }) {
  const initial = username?.charAt(0).toUpperCase() || "?";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: COLORS.primary,
      }}
      className="items-center justify-center overflow-hidden"
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.purple]}
        className="absolute inset-0"
      />
      <Text className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}

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

  const coins = profile?.total_xp || 1250;

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
        contentContainerClassName="pb-24"
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
              <UserAvatar username={profile?.username} size={40} />
            </Pressable>
            <Text className="text-2xl font-bold tracking-tight text-white">
              BigHead
            </Text>
          </View>

          {/* Stats Pills */}
          <View className="flex-row items-center gap-2">
            <StatsPill icon="🔥" value={dailyStreak || 12} color="#f97316" />
            <StatsPill icon="💰" value={coins.toLocaleString()} color={COLORS.yellow} />
          </View>
        </View>

        {/* Main Content */}
        <View className="px-4 flex-col gap-6">
          {/* Featured Section */}
          <View className="flex-col gap-3">
            <View className="flex-row items-baseline justify-between px-1">
              <Text className="text-base font-bold text-gray-100 tracking-wide uppercase">
                Featured
              </Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${COLORS.primary}15`, borderWidth: 1, borderColor: `${COLORS.primary}30` }}
              >
                <Text className="text-xs font-medium" style={{ color: COLORS.primary }}>
                  New
                </Text>
              </View>
            </View>

            {/* Featured Card */}
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/daily");
              }}
              className="rounded-2xl overflow-hidden active:opacity-95"
              style={{
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
              }}
            >
              {/* Gradient Background */}
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-32"
              />

              {/* Card Content */}
              <View className="p-5 -mt-8">
                <View className="flex-row justify-between items-end">
                  <View className="flex-col gap-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View
                        className="px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: COLORS.purple }}
                      >
                        <Text className="text-white text-[10px] font-bold tracking-wider uppercase">
                          {dailyCompleted ? "Done" : "Hard"}
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-xs font-medium flex-row items-center">
                        ⏱ {timeLeft} left
                      </Text>
                    </View>
                    <Text className="text-3xl font-extrabold text-white leading-tight">
                      Daily{'\n'}Challenge
                    </Text>
                  </View>

                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: dailyCompleted ? '#22c55e' : COLORS.primary,
                      shadowColor: dailyCompleted ? '#22c55e' : COLORS.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
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
              Game Modes
            </Text>

            {/* Solo Run - Large Card */}
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/game/chain");
              }}
              className="h-32 rounded-xl overflow-hidden active:opacity-95"
              style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <LinearGradient
                colors={['#134e4a', '#0f766e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-1 p-5 flex-row items-center justify-between"
              >
                <View className="flex-col justify-center">
                  <Text className="text-2xl font-bold italic tracking-tighter text-white">
                    SOLO RUN
                  </Text>
                  <Text className="text-teal-200 text-sm font-medium mt-1">
                    Endless mode • Beat the clock
                  </Text>
                </View>
                <Text className="text-5xl opacity-80" style={{ color: '#5eead4' }}>⚡</Text>
              </LinearGradient>
            </Pressable>

            {/* Small Cards Row */}
            <View className="flex-row gap-3">
              {/* Versus Card */}
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/duel");
                }}
                className="flex-1 h-36 rounded-xl overflow-hidden active:opacity-95"
                style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <LinearGradient
                  colors={['#450a0a', '#7f1d1d']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  className="flex-1 p-4 flex-col justify-between"
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${COLORS.coral}30` }}
                  >
                    <Text className="text-2xl" style={{ color: COLORS.coral }}>⚔️</Text>
                  </View>
                  <View>
                    <Text className="text-xl font-bold tracking-tight text-white">VERSUS</Text>
                    <Text className="text-red-200 text-xs mt-0.5">PvP Live</Text>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Themes Card */}
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/achievements");
                }}
                className="flex-1 h-36 rounded-xl overflow-hidden active:opacity-95"
                style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <LinearGradient
                  colors={['#3b0764', '#6b21a8']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  className="flex-1 p-4 flex-col justify-between"
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${COLORS.purple}30` }}
                  >
                    <Text className="text-2xl" style={{ color: COLORS.purple }}>🎯</Text>
                  </View>
                  <View>
                    <Text className="text-xl font-bold tracking-tight text-white">THEMES</Text>
                    <Text className="text-purple-200 text-xs mt-0.5">Explore</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* Quick Actions Row 1 */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/party/setup");
              }}
              className="flex-1 p-3 rounded-lg flex-row items-center gap-3 active:opacity-80"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <View
                className="p-2 rounded-md"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
              >
                <Text className="text-xl" style={{ color: '#60a5fa' }}>👥</Text>
              </View>
              <View>
                <Text className="font-bold text-sm text-white">Party</Text>
                <Text className="text-[10px] text-gray-400">Local multiplayer</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/challenge");
              }}
              className="flex-1 p-3 rounded-lg flex-row items-center gap-3 active:opacity-80"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <View
                className="p-2 rounded-md"
                style={{ backgroundColor: `${COLORS.coral}30` }}
              >
                <Text className="text-xl" style={{ color: COLORS.coral }}>🤝</Text>
              </View>
              <View>
                <Text className="font-bold text-sm text-white">Challenge</Text>
                <Text className="text-[10px] text-gray-400">Friends battle</Text>
              </View>
            </Pressable>
          </View>

          {/* Quick Actions Row 2 */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/leaderboard");
              }}
              className="flex-1 p-3 rounded-lg flex-row items-center gap-3 active:opacity-80"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <View
                className="p-2 rounded-md"
                style={{ backgroundColor: `${COLORS.yellow}30` }}
              >
                <Text className="text-xl" style={{ color: COLORS.yellow }}>🏆</Text>
              </View>
              <View>
                <Text className="font-bold text-sm text-white">Leaderboard</Text>
                <Text className="text-[10px] text-gray-400">Top players</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/stats");
              }}
              className="flex-1 p-3 rounded-lg flex-row items-center gap-3 active:opacity-80"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <View
                className="p-2 rounded-md"
                style={{ backgroundColor: `${COLORS.primary}30` }}
              >
                <Text className="text-xl" style={{ color: COLORS.primary }}>📊</Text>
              </View>
              <View>
                <Text className="font-bold text-sm text-white">Stats</Text>
                <Text className="text-[10px] text-gray-400">Your progress</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <View className="absolute bottom-6 left-4 right-4">
        <View
          className="h-16 rounded-full flex-row justify-between items-center px-2"
          style={{
            backgroundColor: 'rgba(30, 37, 41, 0.85)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
          }}
        >
          {/* Home - Active */}
          <Pressable className="flex-1 items-center justify-center">
            <View
              className="w-12 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}30` }}
            >
              <Text className="text-2xl">🏠</Text>
            </View>
          </Pressable>

          {/* Trophy */}
          <Link href="/leaderboard" asChild>
            <Pressable className="flex-1 items-center justify-center">
              <View className="w-12 h-10 rounded-full items-center justify-center">
                <Text className="text-2xl opacity-50">🏆</Text>
              </View>
            </Pressable>
          </Link>

          {/* Divider */}
          <View className="w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

          {/* Profile */}
          <Link href="/profile" asChild>
            <Pressable className="flex-1 items-center justify-center">
              <View className="w-12 h-10 rounded-full items-center justify-center">
                <Text className="text-2xl opacity-50">👤</Text>
              </View>
            </Pressable>
          </Link>

          {/* Settings */}
          <Link href="/settings" asChild>
            <Pressable className="flex-1 items-center justify-center">
              <View className="w-12 h-10 rounded-full items-center justify-center">
                <Text className="text-2xl opacity-50">⚙️</Text>
              </View>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
