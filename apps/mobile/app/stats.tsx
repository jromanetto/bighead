import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { supabase } from "../src/services/supabase";
import { buttonPressFeedback } from "../src/utils/feedback";
import { IconButton } from "../src/components/ui";

// QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  yellow: "#FFD100",
  green: "#22c55e",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

interface UserStats {
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  bestChain: number;
  totalXP: number;
  level: number;
  dailyStreak: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  categoryStats: {
    category: string;
    correct: number;
    total: number;
    accuracy: number;
  }[];
  recentGames: {
    id: string;
    mode: string;
    score: number;
    correct_count: number;
    total_questions: number;
    created_at: string;
  }[];
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <View
      className="flex-1 rounded-xl p-4"
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View className="flex-row items-center mb-2">
        <Text className="text-2xl mr-2">{icon}</Text>
        <Text className="text-2xl font-black" style={{ color }}>{value}</Text>
      </View>
      <Text className="text-sm" style={{ color: COLORS.textMuted }}>{label}</Text>
    </View>
  );
}

function CategoryBar({ category, correct, total, accuracy }: { category: string; correct: number; total: number; accuracy: number }) {
  const categoryIcons: Record<string, string> = {
    history: "📜",
    geography: "🌍",
    science: "🔬",
    sports: "⚽",
    entertainment: "🎬",
    technology: "💻",
    food: "🍕",
    art: "🎨",
    music: "🎵",
    animals: "🐾",
    nature: "🌿",
    literature: "📚",
    movies: "🎬",
    general: "🧠",
  };

  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center">
          <Text className="text-lg mr-2">{categoryIcons[category] || "📝"}</Text>
          <Text className="text-white font-medium capitalize">{category}</Text>
        </View>
        <Text style={{ color: COLORS.textMuted }}>{correct}/{total} ({accuracy}%)</Text>
      </View>
      <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.surfaceLight }}>
        <View
          className="h-full rounded-full"
          style={{
            width: `${accuracy}%`,
            backgroundColor: accuracy >= 70 ? COLORS.green : accuracy >= 40 ? COLORS.yellow : COLORS.coral,
          }}
        />
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch game results
      const { data: gameResults } = await supabase
        .from("game_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch achievements
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id);

      const { data: allAchievements } = await supabase
        .from("achievements")
        .select("id");

      // Fetch questions seen by category
      const { data: questionsSeen } = await supabase
        .from("user_questions_seen")
        .select(`
          question_id,
          last_correct,
          questions:question_id (category)
        `)
        .eq("user_id", user.id);

      // Calculate stats
      const games = (gameResults || []) as any[];
      const totalGames = games.length;
      const totalCorrect = games.reduce((sum, g) => sum + (g.correct_count || 0), 0);
      const totalQuestions = games.reduce((sum, g) => sum + (g.total_questions || 0), 0);
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const bestChain = games.reduce((max, g) => Math.max(max, g.max_chain || 0), 0);

      // Calculate category stats
      const categoryMap = new Map<string, { correct: number; total: number }>();
      questionsSeen?.forEach((qs: any) => {
        const category = qs.questions?.category || "general";
        const current = categoryMap.get(category) || { correct: 0, total: 0 };
        current.total++;
        if (qs.last_correct) current.correct++;
        categoryMap.set(category, current);
      });

      const categoryStats = Array.from(categoryMap.entries())
        .map(([category, { correct, total }]) => ({
          category,
          correct,
          total,
          accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);

      setStats({
        totalGames,
        totalCorrect,
        totalQuestions,
        accuracy,
        bestChain,
        totalXP: profile?.total_xp || 0,
        level: profile?.level || 1,
        dailyStreak: (profile as any)?.daily_streak || 0,
        achievementsUnlocked: userAchievements?.length || 0,
        totalAchievements: allAchievements?.length || 0,
        categoryStats,
        recentGames: (gameResults?.slice(0, 5) || []) as any,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <IconButton
            name="ArrowLeft"
            onPress={() => router.back()}
            variant="glass"
            size={40}
            style={{ marginRight: 16 }}
          />
          <Text className="text-white text-2xl font-black">Your Stats</Text>
        </View>

        {/* Level & XP */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ color: COLORS.textMuted }} className="text-sm mb-1">Level</Text>
              <Text className="text-4xl font-black" style={{ color: COLORS.yellow }}>
                {stats?.level || 1}
              </Text>
            </View>
            <View className="items-end">
              <Text style={{ color: COLORS.textMuted }} className="text-sm mb-1">Total XP</Text>
              <Text className="text-2xl font-bold text-white">
                {(stats?.totalXP || 0).toLocaleString()}
              </Text>
            </View>
          </View>
          <View className="mt-4">
            <View className="flex-row justify-between mb-1">
              <Text style={{ color: COLORS.textMuted }} className="text-xs">Progress to Level {(stats?.level || 1) + 1}</Text>
              <Text style={{ color: COLORS.textMuted }} className="text-xs">{((stats?.totalXP || 0) % 1000)} / 1000 XP</Text>
            </View>
            <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.surfaceLight }}>
              <View
                className="h-full rounded-full"
                style={{
                  width: `${((stats?.totalXP || 0) % 1000) / 10}%`,
                  backgroundColor: COLORS.yellow,
                }}
              />
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <StatCard label="Games Played" value={stats?.totalGames || 0} icon="🎮" color={COLORS.primary} />
          <StatCard label="Accuracy" value={`${stats?.accuracy || 0}%`} icon="🎯" color={COLORS.green} />
        </View>

        <View className="flex-row gap-3 mb-6">
          <StatCard label="Best Chain" value={stats?.bestChain || 0} icon="🔥" color={COLORS.coral} />
          <StatCard label="Daily Streak" value={stats?.dailyStreak || 0} icon="📅" color={COLORS.yellow} />
        </View>

        {/* Achievements */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="flex-1 rounded-xl p-4"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg mb-1">🏆</Text>
                <Text className="text-xl font-bold text-white">
                  {stats?.achievementsUnlocked || 0}/{stats?.totalAchievements || 0}
                </Text>
                <Text className="text-sm" style={{ color: COLORS.textMuted }}>Achievements</Text>
              </View>
              <Pressable
                onPress={() => {
                  buttonPressFeedback();
                  router.push("/achievements");
                }}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: COLORS.surfaceLight }}
              >
                <Text className="text-white font-medium">View All</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Category Performance */}
        {stats?.categoryStats && stats.categoryStats.length > 0 && (
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-4">Category Performance</Text>
            <View
              className="rounded-xl p-4"
              style={{
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
              }}
            >
              {stats.categoryStats.slice(0, 6).map((cat) => (
                <CategoryBar
                  key={cat.category}
                  category={cat.category}
                  correct={cat.correct}
                  total={cat.total}
                  accuracy={cat.accuracy}
                />
              ))}
            </View>
          </View>
        )}

        {/* Recent Games */}
        {stats?.recentGames && stats.recentGames.length > 0 && (
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-4">Recent Games</Text>
            {stats.recentGames.map((game) => (
              <View
                key={game.id}
                className="rounded-xl p-4 mb-3"
                style={{
                  backgroundColor: COLORS.surface,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white font-medium capitalize">{game.mode.replace("_", " ")}</Text>
                    <Text style={{ color: COLORS.textMuted }} className="text-sm">
                      {game.correct_count}/{game.total_questions} correct
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl font-bold" style={{ color: COLORS.primary }}>
                      {game.score.toLocaleString()}
                    </Text>
                    <Text style={{ color: COLORS.textMuted }} className="text-xs">
                      {new Date(game.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
