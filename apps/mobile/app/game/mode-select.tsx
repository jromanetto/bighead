import { View, Text, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModeSelectScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Choisir un mode</Text>
        </View>

        {/* Game Modes */}
        <View className="gap-4">
          {/* Chain Reaction */}
          <Link href="/game/chain" asChild>
            <Pressable className="bg-gradient-to-r from-chain-5 to-chain-8 bg-purple-600 rounded-2xl p-6 active:opacity-80">
              <Text className="text-white text-2xl font-bold mb-2">
                Chain Reaction
              </Text>
              <Text className="text-purple-100">
                Chain correct answers to increase your multiplier. One mistake = reset!
              </Text>
              <View className="flex-row mt-4 gap-2">
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-sm">Solo</Text>
                </View>
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-sm">1v1</Text>
                </View>
              </View>
            </Pressable>
          </Link>

          {/* Coming Soon: Other modes */}
          <View className="bg-gray-800 rounded-2xl p-6 opacity-50">
            <Text className="text-gray-400 text-2xl font-bold mb-2">
              Traitor
            </Text>
            <Text className="text-gray-500">
              Find the traitor among players. Coming soon!
            </Text>
            <View className="mt-4">
              <View className="bg-gray-700 rounded-full px-3 py-1 self-start">
                <Text className="text-gray-400 text-sm">Coming soon</Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-800 rounded-2xl p-6 opacity-50">
            <Text className="text-gray-400 text-2xl font-bold mb-2">
              Auction Duel
            </Text>
            <Text className="text-gray-500">
              Bet your time to choose your questions. Coming soon!
            </Text>
            <View className="mt-4">
              <View className="bg-gray-700 rounded-full px-3 py-1 self-start">
                <Text className="text-gray-400 text-sm">Coming soon</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
