import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResultScreen() {
  const { score, correct, total } = useLocalSearchParams<{
    score: string;
    correct: string;
    total: string;
  }>();

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        {/* Trophy/Result */}
        <Text className="text-6xl mb-4">🏆</Text>
        <Text className="text-white text-3xl font-bold mb-2">Partie terminée!</Text>

        {/* Score */}
        <View className="bg-gray-800 rounded-2xl p-8 w-full mt-6 items-center">
          <Text className="text-gray-400 text-lg mb-2">Score final</Text>
          <Text className="text-primary-400 text-5xl font-bold">{score || 0}</Text>
          <Text className="text-gray-400 text-lg mt-4">points</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4 mt-6 w-full">
          <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-success-400 text-2xl font-bold">{correct || 0}</Text>
            <Text className="text-gray-400">Correct</Text>
          </View>
          <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-error-400 text-2xl font-bold">
              {Number(total || 0) - Number(correct || 0)}
            </Text>
            <Text className="text-gray-400">Incorrect</Text>
          </View>
          <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-white text-2xl font-bold">
              {Math.round((Number(correct || 0) / Number(total || 1)) * 100)}%
            </Text>
            <Text className="text-gray-400">Précision</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="w-full gap-4 mt-8">
          <Pressable
            onPress={() => router.replace("/game/chain")}
            className="bg-primary-500 rounded-xl py-4 active:opacity-80"
          >
            <Text className="text-white text-lg text-center font-bold">
              Rejouer
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              // TODO: Implement share challenge
              alert("Challenge link coming soon!");
            }}
            className="bg-accent-500 rounded-xl py-4 active:opacity-80"
          >
            <Text className="text-white text-lg text-center font-bold">
              Défier un ami
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
