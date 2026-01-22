import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getLeaderboard, type LeaderboardEntry } from "../src/services/games";

// Mock data for when Supabase is unavailable
const mockLeaderboard: LeaderboardEntry[] = [
  { id: "1", username: "QuizMaster", avatar_url: null, total_xp: 15420, level: 12, games_played: 87, rank: 1 },
  { id: "2", username: "BrainStorm", avatar_url: null, total_xp: 14200, level: 11, games_played: 72, rank: 2 },
  { id: "3", username: "Trivia_King", avatar_url: null, total_xp: 13800, level: 10, games_played: 65, rank: 3 },
  { id: "4", username: "SmartCookie", avatar_url: null, total_xp: 12500, level: 9, games_played: 58, rank: 4 },
  { id: "5", username: "KnowledgeNinja", avatar_url: null, total_xp: 11200, level: 8, games_played: 52, rank: 5 },
  { id: "6", username: "QuizWhiz", avatar_url: null, total_xp: 10800, level: 8, games_played: 48, rank: 6 },
  { id: "7", username: "MindBender", avatar_url: null, total_xp: 9500, level: 7, games_played: 42, rank: 7 },
  { id: "8", username: "FactFinder", avatar_url: null, total_xp: 8900, level: 7, games_played: 38, rank: 8 },
  { id: "9", username: "BrainiacX", avatar_url: null, total_xp: 8200, level: 6, games_played: 35, rank: 9 },
  { id: "10", username: "Genius101", avatar_url: null, total_xp: 7800, level: 6, games_played: 32, rank: 10 },
];

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime">("weekly");

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(50);
      if (data.length > 0) {
        setLeaderboard(data);
      } else {
        // Use mock data if no real data
        setLeaderboard(mockLeaderboard);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      // Fallback to mock data
      setLeaderboard(mockLeaderboard);
    }
    setLoading(false);
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getPositionStyle = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10";
    if (rank === 2) return "bg-gray-300/5";
    if (rank === 3) return "bg-orange-500/5";
    return "";
  };

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
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <View className="flex-row justify-center items-end px-6 mb-4 h-32">
                {/* 2nd place */}
                <View className="items-center flex-1">
                  <View className="w-14 h-14 rounded-full bg-gray-700 items-center justify-center mb-2">
                    <Text className="text-xl">
                      {leaderboard[1].username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-2xl">🥈</Text>
                  <Text className="text-white text-sm font-medium mt-1" numberOfLines={1}>
                    {leaderboard[1].username}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {leaderboard[1].total_xp.toLocaleString()} XP
                  </Text>
                </View>

                {/* 1st place */}
                <View className="items-center flex-1 -mt-6">
                  <View className="w-16 h-16 rounded-full bg-yellow-500/20 items-center justify-center mb-2 border-2 border-yellow-500">
                    <Text className="text-2xl">
                      {leaderboard[0].username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-3xl">🥇</Text>
                  <Text className="text-yellow-400 text-sm font-bold mt-1" numberOfLines={1}>
                    {leaderboard[0].username}
                  </Text>
                  <Text className="text-yellow-300/60 text-xs">
                    {leaderboard[0].total_xp.toLocaleString()} XP
                  </Text>
                </View>

                {/* 3rd place */}
                <View className="items-center flex-1">
                  <View className="w-14 h-14 rounded-full bg-gray-700 items-center justify-center mb-2">
                    <Text className="text-xl">
                      {leaderboard[2].username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-2xl">🥉</Text>
                  <Text className="text-white text-sm font-medium mt-1" numberOfLines={1}>
                    {leaderboard[2].username}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {leaderboard[2].total_xp.toLocaleString()} XP
                  </Text>
                </View>
              </View>
            )}

            {/* Full Leaderboard */}
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
              {leaderboard.slice(3).map((player, index) => (
                <View
                  key={player.id}
                  className={`flex-row items-center py-3 px-3 rounded-xl mb-1 ${getPositionStyle(
                    index + 4
                  )}`}
                >
                  <View className="w-10">
                    <Text className="text-gray-500 text-base">#{index + 4}</Text>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center mr-3">
                    <Text className="text-white">
                      {player.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base">{player.username}</Text>
                    <Text className="text-gray-500 text-xs">
                      Niveau {player.level} • {player.games_played} parties
                    </Text>
                  </View>
                  <Text className="text-primary-400 font-bold">
                    {player.total_xp.toLocaleString()}
                  </Text>
                </View>
              ))}
              <View className="h-4" />
            </ScrollView>
          </>
        )}

        {/* Your Position */}
        <View className="px-6 pb-4 pt-3 border-t border-gray-800">
          <View className="flex-row items-center bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-400 w-10">#--</Text>
            <View className="w-10 h-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
              <Text className="text-primary-400">?</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white">Toi (non classé)</Text>
              <Text className="text-gray-500 text-xs">Joue pour apparaître!</Text>
            </View>
            <Text className="text-gray-400">0 XP</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
