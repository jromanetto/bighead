import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getAllAchievements,
  getUserAchievements,
  getAchievementProgress,
  type Achievement,
  type UserAchievement,
} from "../src/services/achievements";

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
    { code: "all", name: "Tous", icon: "🏆" },
    { code: "games", name: "Parties", icon: "🎮" },
    { code: "score", name: "Score", icon: "⭐" },
    { code: "streak", name: "Chaînes", icon: "🔥" },
    { code: "special", name: "Spécial", icon: "💎" },
  ];

  const filteredAchievements = achievements.filter(
    a => activeCategory === "all" || a.category === activeCategory
  );

  const isUnlocked = (achievementId: string) => userAchievements.has(achievementId);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 mb-4">
          <Pressable onPress={() => router.back()} className="mr-4 p-2">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Succès</Text>
        </View>

        {/* Progress */}
        <View className="px-6 mb-4">
          <View className="bg-gray-800 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-bold">Progression</Text>
              <Text className="text-primary-400 font-bold">
                {progress.unlocked}/{progress.total}
              </Text>
            </View>
            <View className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </View>
            <Text className="text-gray-400 text-xs mt-1 text-right">
              {progress.percentage}% complété
            </Text>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.code}
              onPress={() => setActiveCategory(cat.code)}
              className={`px-4 py-2 rounded-xl mr-2 flex-row items-center ${
                activeCategory === cat.code ? "bg-primary-500" : "bg-gray-800"
              }`}
            >
              <Text className="mr-1">{cat.icon}</Text>
              <Text
                className={`font-medium ${
                  activeCategory === cat.code ? "text-white" : "text-gray-400"
                }`}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Loading */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0ea5e9" />
          </View>
        ) : (
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            {filteredAchievements.map((achievement) => {
              const unlocked = isUnlocked(achievement.id);
              return (
                <View
                  key={achievement.id}
                  className={`flex-row items-center p-4 rounded-xl mb-3 ${
                    unlocked ? "bg-primary-500/20 border border-primary-500/30" : "bg-gray-800"
                  }`}
                >
                  <View
                    className={`w-14 h-14 rounded-xl items-center justify-center mr-4 ${
                      unlocked ? "bg-primary-500/30" : "bg-gray-700"
                    }`}
                  >
                    <Text className={`text-2xl ${!unlocked && "opacity-30"}`}>
                      {achievement.icon}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-bold mb-1 ${
                        unlocked ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {achievement.name}
                    </Text>
                    <Text
                      className={`text-sm ${
                        unlocked ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {achievement.description}
                    </Text>
                  </View>
                  <View className="items-end">
                    {unlocked ? (
                      <View className="bg-green-500/20 px-3 py-1 rounded-full">
                        <Text className="text-green-400 text-xs font-bold">✓</Text>
                      </View>
                    ) : (
                      <Text className="text-primary-400 font-bold text-sm">
                        +{achievement.xp_reward} XP
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Anonymous prompt */}
            {isAnonymous && (
              <Pressable
                onPress={() => router.push("/profile")}
                className="bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl p-4 mt-4 mb-6"
              >
                <Text className="text-white font-bold mb-1">Crée un compte</Text>
                <Text className="text-gray-400 text-sm">
                  Pour débloquer et sauvegarder tes succès
                </Text>
              </Pressable>
            )}

            <View className="h-6" />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
