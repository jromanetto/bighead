import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Profil</Text>
        </View>

        {/* Profile Card */}
        <View className="bg-gray-800 rounded-2xl p-6 items-center mb-6">
          <View className="w-24 h-24 bg-primary-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-4xl">👤</Text>
          </View>
          <Text className="text-white text-2xl font-bold">Invité</Text>
          <Text className="text-gray-400">Niveau 1</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-primary-400 text-2xl font-bold">0</Text>
            <Text className="text-gray-400 text-sm">Parties</Text>
          </View>
          <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-success-400 text-2xl font-bold">0%</Text>
            <Text className="text-gray-400 text-sm">Précision</Text>
          </View>
          <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
            <Text className="text-accent-400 text-2xl font-bold">0</Text>
            <Text className="text-gray-400 text-sm">XP Total</Text>
          </View>
        </View>

        {/* Login CTA */}
        <View className="bg-primary-500/20 rounded-2xl p-6 items-center">
          <Text className="text-white text-lg mb-2">
            Connecte-toi pour sauvegarder ta progression
          </Text>
          <Pressable className="bg-primary-500 rounded-xl py-3 px-6 mt-2 active:opacity-80">
            <Text className="text-white font-bold">Se connecter</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
