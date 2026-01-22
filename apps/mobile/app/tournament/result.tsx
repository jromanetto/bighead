import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useEffect } from "react";

export default function TournamentResultScreen() {
  const { id, rank, total, score } = useLocalSearchParams<{
    id: string;
    rank: string;
    total: string;
    score: string;
  }>();

  const rankNum = parseInt(rank || "0");
  const totalNum = parseInt(total || "0");
  const scoreNum = parseInt(score || "0");

  // Animations
  const trophyScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    trophyScale.value = withDelay(200, withSpring(1, { damping: 8 }));
    contentOpacity.value = withDelay(500, withSpring(1));
  }, []);

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
    if (rankNum === 1) return "Champion du tournoi !";
    if (rankNum === 2) return "Excellent ! Tu frôles le sommet !";
    if (rankNum === 3) return "Superbe performance !";
    if (rankNum <= 10) return "Top 10 ! Impressionnant !";
    if (rankNum <= totalNum / 2) return "Bien joué !";
    return "Continue à t'entraîner !";
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
            Tournoi terminé !
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
                  Tu fais partie du{" "}
                  <Text className="text-white font-bold">
                    top {Math.round((rankNum / totalNum) * 100)}%
                  </Text>{" "}
                  des joueurs
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View className="w-full">
            <Pressable
              onPress={() => router.replace("/tournament")}
              className="bg-primary-500 rounded-xl py-4 mb-3"
            >
              <Text className="text-white text-center font-bold text-lg">
                📊 Voir le classement
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/")}
              className="bg-gray-800 rounded-xl py-4"
            >
              <Text className="text-white text-center font-bold">
                Retour à l'accueil
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
