import { View, Text, Pressable, ScrollView, ActivityIndicator, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getFriendChallenge, getChallengeLeaderboard, FriendChallenge, ChallengeAttempt } from "../../src/services/friendChallenge";
import { buttonPressFeedback } from "../../src/utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  yellow: "#FFD100",
  green: "#22c55e",
  gold: "#fbbf24",
  silver: "#9ca3af",
  bronze: "#d97706",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function ChallengeLeaderboardScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<FriendChallenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeAttempt[]>([]);

  useEffect(() => {
    loadData();
  }, [code]);

  const loadData = async () => {
    if (!code) {
      router.back();
      return;
    }

    try {
      const [challengeData, leaderboardData] = await Promise.all([
        getFriendChallenge(code),
        getChallengeLeaderboard(code),
      ]);

      setChallenge(challengeData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!challenge) return;

    try {
      await Share.share({
        message: `Can you beat my score on this BigHead challenge? 🧠\n\nUse code: ${code}\n\nDownload the app to play!`,
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { color: COLORS.gold, icon: "🥇" };
      case 2:
        return { color: COLORS.silver, icon: "🥈" };
      case 3:
        return { color: COLORS.bronze, icon: "🥉" };
      default:
        return { color: COLORS.textMuted, icon: null };
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
      <ScrollView className="flex-1" contentContainerClassName="px-6 pt-4 pb-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.back();
              }}
              className="mr-4"
            >
              <Text className="text-white text-2xl">←</Text>
            </Pressable>
            <Text className="text-white text-2xl font-black">Leaderboard</Text>
          </View>
          <Pressable
            onPress={handleShare}
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-white">📤 Share</Text>
          </Pressable>
        </View>

        {/* Challenge Info */}
        {challenge && (
          <View
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: COLORS.surface }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text style={{ color: COLORS.textMuted }} className="text-sm mb-1">
                  Challenge Code
                </Text>
                <Text className="text-white text-xl font-bold tracking-wider">
                  {code}
                </Text>
              </View>
              <View className="items-end">
                <Text style={{ color: COLORS.textMuted }} className="text-sm mb-1">
                  Category
                </Text>
                <Text className="text-white font-medium capitalize">
                  {challenge.category}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-white/10">
              <Text style={{ color: COLORS.textMuted }}>
                {challenge.question_count} questions
              </Text>
              <Text style={{ color: COLORS.textMuted }}>
                {leaderboard.length} players
              </Text>
            </View>
          </View>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <View className="flex-row items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            <View className="items-center">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${COLORS.silver}20` }}
              >
                <Text className="text-2xl">🥈</Text>
              </View>
              <Text className="text-white font-bold text-sm" numberOfLines={1}>
                {leaderboard[1]?.player_name}
              </Text>
              <Text style={{ color: COLORS.silver }} className="font-bold">
                {leaderboard[1]?.score.toLocaleString()}
              </Text>
              <View
                className="w-16 h-20 rounded-t-lg mt-2"
                style={{ backgroundColor: COLORS.surface }}
              />
            </View>

            {/* 1st Place */}
            <View className="items-center -mt-4">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${COLORS.gold}20` }}
              >
                <Text className="text-3xl">🥇</Text>
              </View>
              <Text className="text-white font-bold" numberOfLines={1}>
                {leaderboard[0]?.player_name}
              </Text>
              <Text style={{ color: COLORS.gold }} className="text-lg font-bold">
                {leaderboard[0]?.score.toLocaleString()}
              </Text>
              <View
                className="w-20 h-28 rounded-t-lg mt-2"
                style={{ backgroundColor: COLORS.primary }}
              />
            </View>

            {/* 3rd Place */}
            <View className="items-center">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${COLORS.bronze}20` }}
              >
                <Text className="text-2xl">🥉</Text>
              </View>
              <Text className="text-white font-bold text-sm" numberOfLines={1}>
                {leaderboard[2]?.player_name}
              </Text>
              <Text style={{ color: COLORS.bronze }} className="font-bold">
                {leaderboard[2]?.score.toLocaleString()}
              </Text>
              <View
                className="w-16 h-16 rounded-t-lg mt-2"
                style={{ backgroundColor: COLORS.surface }}
              />
            </View>
          </View>
        )}

        {/* Full Leaderboard */}
        <View className="gap-2">
          {leaderboard.map((entry, index) => {
            const rankStyle = getRankStyle(index + 1);

            return (
              <View
                key={entry.id}
                className="flex-row items-center p-4 rounded-xl"
                style={{
                  backgroundColor: COLORS.surface,
                  borderWidth: index < 3 ? 1 : 0,
                  borderColor: index < 3 ? `${rankStyle.color}40` : "transparent",
                }}
              >
                {/* Rank */}
                <View className="w-10 items-center">
                  {rankStyle.icon ? (
                    <Text className="text-xl">{rankStyle.icon}</Text>
                  ) : (
                    <Text style={{ color: rankStyle.color }} className="font-bold">
                      {index + 1}
                    </Text>
                  )}
                </View>

                {/* Player Info */}
                <View className="flex-1 ml-3">
                  <Text className="text-white font-bold">{entry.player_name}</Text>
                  <Text style={{ color: COLORS.textMuted }} className="text-sm">
                    {entry.correct_count}/{challenge?.question_count || 10} correct
                  </Text>
                </View>

                {/* Score */}
                <Text
                  className="font-bold text-lg"
                  style={{ color: index < 3 ? rankStyle.color : COLORS.text }}
                >
                  {entry.score.toLocaleString()}
                </Text>
              </View>
            );
          })}

          {leaderboard.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-5xl mb-4">🏜️</Text>
              <Text className="text-white font-bold text-lg mb-2">
                No players yet
              </Text>
              <Text style={{ color: COLORS.textMuted }} className="text-center">
                Be the first to complete this challenge!
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="mt-8 gap-3">
          <Pressable
            onPress={() => router.push({
              pathname: "/challenge/play",
              params: { code },
            })}
            className="rounded-xl py-4"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              Play Again
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/challenge")}
            className="py-4"
          >
            <Text className="text-center text-white">Back to Challenges</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
