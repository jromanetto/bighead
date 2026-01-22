import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getLeaderboard, getWeeklyLeaderboard, getUserRank, type LeaderboardEntry } from "../src/services/games";
import { useAuth } from "../src/contexts/AuthContext";

export default function LeaderboardScreen() {
  const { user, profile, isAnonymous } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime">("alltime");
  const [userRank, setUserRank] = useState<{ rank: number; total_xp: number } | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  useEffect(() => {
    if (user && !isAnonymous) {
      loadUserRank();
    }
  }, [user, isAnonymous]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = activeTab === "weekly"
        ? await getWeeklyLeaderboard(50)
        : await getLeaderboard(50);
      setLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setLeaderboard([]);
    }
    setLoading(false);
  };

  const loadUserRank = async () => {
    if (!user) return;
    try {
      const rank = await getUserRank(user.id);
      setUserRank(rank);
    } catch (error) {
      console.error("Error loading user rank:", error);
    }
  };

  const getPositionStyle = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10";
    if (rank === 2) return "bg-gray-300/5";
    if (rank === 3) return "bg-orange-500/5";
    return "";
  };

  const isCurrentUser = (playerId: string) => user?.id === playerId;

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 mb-4">
          <Pressable onPress={() => router.back()} className="mr-4 p-2">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Classement</Text>
        </View>

        {/* Tabs */}
        <View className="flex-row px-6 mb-4">
          <Pressable
            onPress={() => setActiveTab("weekly")}
            className={`flex-1 rounded-l-xl py-3 ${
              activeTab === "weekly" ? "bg-primary-500" : "bg-gray-700"
            }`}
          >
            <Text
              className={`text-center font-bold ${
                activeTab === "weekly" ? "text-white" : "text-gray-400"
              }`}
            >
              Cette semaine
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("alltime")}
            className={`flex-1 rounded-r-xl py-3 ${
              activeTab === "alltime" ? "bg-primary-500" : "bg-gray-700"
            }`}
          >
            <Text
              className={`text-center font-bold ${
                activeTab === "alltime" ? "text-white" : "text-gray-400"
              }`}
            >
              Tout temps
            </Text>
          </Pressable>
        </View>

        {/* Loading state */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text className="text-gray-400 mt-4">Chargement...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-6xl mb-4">🏆</Text>
            <Text className="text-white text-xl font-bold text-center mb-2">
              Pas encore de classement
            </Text>
            <Text className="text-gray-400 text-center">
              {activeTab === "weekly"
                ? "Aucun joueur cette semaine. Sois le premier !"
                : "Joue des parties pour apparaître dans le classement !"}
            </Text>
            <Pressable
              onPress={() => router.push("/game/chain")}
              className="bg-primary-500 rounded-xl py-3 px-8 mt-6"
            >
              <Text className="text-white font-bold">Jouer maintenant</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Top 3 Podium - only show if we have 3+ players */}
            {leaderboard.length >= 3 ? (
              <View className="flex-row justify-center items-end px-6 mb-4 h-32">
                {/* 2nd place */}
                <View className="items-center flex-1">
                  <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${
                    isCurrentUser(leaderboard[1].id) ? "bg-primary-500" : "bg-gray-700"
                  }`}>
                    <Text className="text-xl text-white">
                      {leaderboard[1].username?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                  <Text className="text-2xl">🥈</Text>
                  <Text className={`text-sm font-medium mt-1 ${
                    isCurrentUser(leaderboard[1].id) ? "text-primary-400" : "text-white"
                  }`} numberOfLines={1}>
                    {leaderboard[1].username || "Joueur"}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {leaderboard[1].total_xp?.toLocaleString() || 0} XP
                  </Text>
                </View>

                {/* 1st place */}
                <View className="items-center flex-1 -mt-6">
                  <View className={`w-16 h-16 rounded-full items-center justify-center mb-2 border-2 ${
                    isCurrentUser(leaderboard[0].id)
                      ? "bg-primary-500/20 border-primary-500"
                      : "bg-yellow-500/20 border-yellow-500"
                  }`}>
                    <Text className="text-2xl text-white">
                      {leaderboard[0].username?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                  <Text className="text-3xl">🥇</Text>
                  <Text className={`text-sm font-bold mt-1 ${
                    isCurrentUser(leaderboard[0].id) ? "text-primary-400" : "text-yellow-400"
                  }`} numberOfLines={1}>
                    {leaderboard[0].username || "Joueur"}
                  </Text>
                  <Text className="text-yellow-300/60 text-xs">
                    {leaderboard[0].total_xp?.toLocaleString() || 0} XP
                  </Text>
                </View>

                {/* 3rd place */}
                <View className="items-center flex-1">
                  <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${
                    isCurrentUser(leaderboard[2].id) ? "bg-primary-500" : "bg-gray-700"
                  }`}>
                    <Text className="text-xl text-white">
                      {leaderboard[2].username?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                  <Text className="text-2xl">🥉</Text>
                  <Text className={`text-sm font-medium mt-1 ${
                    isCurrentUser(leaderboard[2].id) ? "text-primary-400" : "text-white"
                  }`} numberOfLines={1}>
                    {leaderboard[2].username || "Joueur"}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {leaderboard[2].total_xp?.toLocaleString() || 0} XP
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Full Leaderboard */}
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
              {/* Show all players if less than 3, otherwise show from 4th position */}
              {(leaderboard.length < 3 ? leaderboard : leaderboard.slice(3)).map((player, index) => {
                const actualRank = leaderboard.length < 3 ? index + 1 : index + 4;
                return (
                <View
                  key={player.id}
                  className={`flex-row items-center py-3 px-3 rounded-xl mb-1 ${
                    isCurrentUser(player.id) ? "bg-primary-500/20" : getPositionStyle(actualRank)
                  }`}
                >
                  <View className="w-10">
                    <Text className={`text-base ${
                      isCurrentUser(player.id) ? "text-primary-400" : "text-gray-500"
                    }`}>#{actualRank}</Text>
                  </View>
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    isCurrentUser(player.id) ? "bg-primary-500" : "bg-gray-700"
                  }`}>
                    <Text className="text-white">
                      {player.username?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base ${
                      isCurrentUser(player.id) ? "text-primary-400 font-bold" : "text-white"
                    }`}>
                      {player.username || "Joueur"}
                      {isCurrentUser(player.id) && " (Toi)"}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {activeTab === "alltime"
                        ? `Niveau ${player.level || 1} • ${player.games_played || 0} parties`
                        : `${player.games_played || 0} parties cette semaine`
                      }
                    </Text>
                  </View>
                  <Text className={`font-bold ${
                    isCurrentUser(player.id) ? "text-primary-400" : "text-primary-400"
                  }`}>
                    {player.total_xp?.toLocaleString() || 0}
                  </Text>
                </View>
                );
              })}
              <View className="h-4" />
            </ScrollView>
          </>
        )}

        {/* Your Position */}
        <View className="px-6 pb-4 pt-3 border-t border-gray-800">
          {isAnonymous ? (
            <Pressable
              onPress={() => router.push("/profile")}
              className="flex-row items-center bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl p-4"
            >
              <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center mr-3">
                <Text className="text-gray-400">?</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">Crée un compte</Text>
                <Text className="text-gray-400 text-xs">Pour apparaître dans le classement</Text>
              </View>
              <Text className="text-primary-400">→</Text>
            </Pressable>
          ) : userRank ? (
            <View className="flex-row items-center bg-primary-500/10 rounded-xl p-4 border border-primary-500/30">
              <Text className="text-primary-400 w-10 font-bold">#{userRank.rank}</Text>
              <View className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center mr-3">
                <Text className="text-white font-bold">
                  {profile?.username?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">{profile?.username || "Toi"}</Text>
                <Text className="text-gray-400 text-xs">Ta position actuelle</Text>
              </View>
              <Text className="text-primary-400 font-bold">{userRank.total_xp.toLocaleString()} XP</Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-gray-800 rounded-xl p-4">
              <Text className="text-gray-400 w-10">#--</Text>
              <View className="w-10 h-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
                <Text className="text-primary-400">
                  {profile?.username?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white">{profile?.username || "Toi"} (non classé)</Text>
                <Text className="text-gray-500 text-xs">Joue pour apparaître!</Text>
              </View>
              <Text className="text-gray-400">0 XP</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
