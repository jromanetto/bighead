import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock leaderboard data
const mockLeaderboard = [
  { rank: 1, username: "QuizMaster", xp: 15420 },
  { rank: 2, username: "BrainStorm", xp: 14200 },
  { rank: 3, username: "Trivia_King", xp: 13800 },
  { rank: 4, username: "SmartCookie", xp: 12500 },
  { rank: 5, username: "KnowledgeNinja", xp: 11200 },
  { rank: 6, username: "QuizWhiz", xp: 10800 },
  { rank: 7, username: "MindBender", xp: 9500 },
  { rank: 8, username: "FactFinder", xp: 8900 },
  { rank: 9, username: "BrainiacX", xp: 8200 },
  { rank: 10, username: "Genius101", xp: 7800 },
];

export default function LeaderboardScreen() {
  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 mb-6">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Classement</Text>
        </View>

        {/* Tabs */}
        <View className="flex-row px-6 mb-6">
          <Pressable className="flex-1 bg-primary-500 rounded-l-xl py-3">
            <Text className="text-white text-center font-bold">Semaine</Text>
          </Pressable>
          <Pressable className="flex-1 bg-gray-700 rounded-r-xl py-3">
            <Text className="text-gray-400 text-center">All-time</Text>
          </Pressable>
        </View>

        {/* Leaderboard */}
        <ScrollView className="flex-1 px-6">
          {mockLeaderboard.map((player, index) => (
            <View
              key={player.rank}
              className={`flex-row items-center py-4 ${
                index < mockLeaderboard.length - 1 ? "border-b border-gray-800" : ""
              }`}
            >
              <View className="w-12">
                {getMedal(player.rank) ? (
                  <Text className="text-2xl">{getMedal(player.rank)}</Text>
                ) : (
                  <Text className="text-gray-400 text-lg">#{player.rank}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg">{player.username}</Text>
              </View>
              <Text className="text-primary-400 font-bold">
                {player.xp.toLocaleString()} XP
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Your Position */}
        <View className="px-6 pb-6 pt-4 border-t border-gray-800">
          <View className="flex-row items-center bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-400 w-12">#--</Text>
            <Text className="text-white flex-1">Toi (non classé)</Text>
            <Text className="text-gray-400">0 XP</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
