import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { XPGainBanner } from "../../src/components/XPGainBanner";
import { computeXP, awardXP } from "../../src/services/xp";

export default function TournamentResultScreen() {
  const { id, rank, total, score } = useLocalSearchParams<{
    id: string;
    rank: string;
    total: string;
    score: string;
  }>();
  const { user, refreshProfile } = useAuth();
  const [xpAwarded, setXpAwarded] = useState(false);

  const rankNum = parseInt(rank || "0");
  const totalNum = parseInt(total || "0");
  const scoreNum = parseInt(score || "0");

  const xpGain = computeXP({
    source: "tournament",
    score: scoreNum,
    rank: rankNum,
    totalPlayers: totalNum,
  });

  // Animations
  const trophyScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    trophyScale.value = withDelay(200, withSpring(1, { damping: 8 }));
    contentOpacity.value = withDelay(500, withSpring(1));
  }, []);

  useEffect(() => {
    if (!user || !id || xpAwarded) return;
    awardXP(
      user.id,
      xpGain.total,
      "tournament",
      { tournament_id: id, rank: rankNum, score: scoreNum },
      `tournament:${id}`
    ).then(async (newTotal) => {
      if (newTotal !== null) await refreshProfile();
    });
    setXpAwarded(true);
  }, [user, id, xpAwarded]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const getTrophyEmoji = () => {
    if (rankNum === 1) return "🥇";
    if (rankNum === 2) return "🥈";
    if (rankNum === 3) return "🥉";
    if (rankNum <= 10) return "🏆";
    return "🎮";
  };

  const getMessage = () => {
    if (rankNum === 1) return "Tournament champion!";
    if (rankNum === 2) return "Excellent! So close to the top!";
    if (rankNum === 3) return "Superb performance!";
    if (rankNum <= 10) return "Top 10! Impressive!";
    if (rankNum <= totalNum / 2) return "Well played!";
    return "Keep practicing!";
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 items-center justify-center">
        {/* Trophy */}
        <Animated.View style={trophyStyle} className="mb-8">
          <Text className="text-8xl">{getTrophyEmoji()}</Text>
        </Animated.View>

        {/* Result */}
        <Animated.View style={contentStyle} className="w-full items-center">
          <Text className="text-white text-3xl font-bold mb-2">
            Tournament finished!
          </Text>
          <Text className="text-gray-400 text-center mb-8">
            {getMessage()}
          </Text>

          {/* Stats */}
          <View className="bg-gray-800 rounded-2xl p-6 w-full mb-8">
            <View className="flex-row justify-around mb-6">
              <View className="items-center">
                <Text className="text-gray-400 text-xs mb-1">CLASSEMENT</Text>
                <Text className="text-yellow-400 text-4xl font-bold">
                  #{rankNum}
                </Text>
                <Text className="text-gray-500 text-sm">
                  sur {totalNum}
                </Text>
              </View>

              <View className="w-px bg-gray-700" />

              <View className="items-center">
                <Text className="text-gray-400 text-xs mb-1">SCORE</Text>
                <Text className="text-primary-400 text-4xl font-bold">
                  {scoreNum}
                </Text>
                <Text className="text-gray-500 text-sm">points</Text>
              </View>
            </View>

            {/* Percentile */}
            {totalNum > 0 && (
              <View className="bg-gray-700 rounded-xl p-4">
                <Text className="text-gray-400 text-center text-sm">
                  You are in the{" "}
                  <Text className="text-white font-bold">
                    top {Math.round((rankNum / totalNum) * 100)}%
                  </Text>{" "}
                  of players
                </Text>
              </View>
            )}
          </View>

          {/* XP gained */}
          <View style={{ width: "100%", marginBottom: 24 }}>
            <XPGainBanner gain={xpGain} />
          </View>

          {/* Actions */}
          <View className="w-full">
            <Pressable
              onPress={() => router.replace("/tournament")}
              className="bg-primary-500 rounded-xl py-4 mb-3"
            >
              <Text className="text-white text-center font-bold text-lg">
                📊 View leaderboard
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/")}
              className="bg-gray-800 rounded-xl py-4"
            >
              <Text className="text-white text-center font-bold">
                Back to home
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
