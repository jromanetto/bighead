import { View, Text, Pressable, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResultScreen() {
  const { score, correct, total, maxChain } = useLocalSearchParams<{
    score: string;
    correct: string;
    total: string;
    maxChain?: string;
  }>();

  const scoreNum = Number(score || 0);
  const correctNum = Number(correct || 0);
  const totalNum = Number(total || 1);
  const maxChainNum = Number(maxChain || 1);
  const accuracy = Math.round((correctNum / totalNum) * 100);

  // XP earned (simplified calculation)
  const xpEarned = Math.round(scoreNum * 0.1) + correctNum * 5;

  const getPerformanceEmoji = () => {
    if (accuracy >= 90) return "🏆";
    if (accuracy >= 70) return "⭐";
    if (accuracy >= 50) return "👍";
    return "💪";
  };

  const getPerformanceText = () => {
    if (accuracy >= 90) return "Excellent!";
    if (accuracy >= 70) return "Très bien!";
    if (accuracy >= 50) return "Pas mal!";
    return "Continue!";
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `J'ai marqué ${scoreNum} points sur BIGHEAD avec ${accuracy}% de bonnes réponses! Tu peux faire mieux? 🧠🔥`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        {/* Trophy/Result */}
        <Text className="text-7xl mb-4">{getPerformanceEmoji()}</Text>
        <Text className="text-white text-3xl font-bold mb-1">
          {getPerformanceText()}
        </Text>
        <Text className="text-gray-400 text-lg">Partie terminée</Text>

        {/* Score */}
        <View className="bg-gray-800 rounded-2xl p-6 w-full mt-6 items-center">
          <Text className="text-gray-400 text-sm mb-1">Score final</Text>
          <Text className="text-primary-400 text-5xl font-bold">{scoreNum}</Text>
          <Text className="text-gray-500 text-sm mt-1">points</Text>

          {/* XP Earned */}
          <View className="flex-row items-center mt-4 bg-yellow-500/20 rounded-full px-4 py-2">
            <Text className="text-yellow-400 font-bold">+{xpEarned} XP</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mt-4 w-full">
          <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-green-400 text-2xl font-bold">{correctNum}</Text>
            <Text className="text-gray-400 text-xs">Correct</Text>
          </View>
          <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-red-400 text-2xl font-bold">
              {totalNum - correctNum}
            </Text>
            <Text className="text-gray-400 text-xs">Incorrect</Text>
          </View>
          <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-white text-2xl font-bold">{accuracy}%</Text>
            <Text className="text-gray-400 text-xs">Précision</Text>
          </View>
          {maxChainNum > 1 && (
            <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
              <Text className="text-purple-400 text-2xl font-bold">
                {maxChainNum}x
              </Text>
              <Text className="text-gray-400 text-xs">Max Chain</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="w-full gap-3 mt-8">
          <Pressable
            onPress={() => router.replace("/game/chain")}
            className="bg-primary-500 rounded-xl py-4 active:opacity-80"
          >
            <Text className="text-white text-lg text-center font-bold">
              Rejouer
            </Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            className="bg-accent-500 rounded-xl py-4 active:opacity-80"
          >
            <Text className="text-white text-lg text-center font-bold">
              Partager mon score
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            className="bg-gray-700 rounded-xl py-4 active:opacity-80"
          >
            <Text className="text-white text-lg text-center">
              Retour au menu
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
