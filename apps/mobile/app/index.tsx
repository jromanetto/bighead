import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary-500">
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo */}
        <View className="mb-8">
          <Text className="text-6xl font-bold text-white">BIGHEAD</Text>
          <Text className="text-lg text-primary-100 text-center mt-2">
            Le quiz qui te rend plus intelligent
          </Text>
        </View>

        {/* Main Actions */}
        <View className="w-full gap-4">
          <Link href="/game/mode-select" asChild>
            <Pressable className="bg-white rounded-2xl py-4 px-6 items-center active:opacity-80">
              <Text className="text-primary-600 text-xl font-bold">
                Jouer
              </Text>
            </Pressable>
          </Link>

          <Link href="/party/setup" asChild>
            <Pressable className="bg-accent-500 rounded-2xl py-4 px-6 items-center active:opacity-80">
              <Text className="text-white text-xl font-bold">
                Mode Party
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Bottom Actions */}
        <View className="absolute bottom-8 flex-row gap-6">
          <Link href="/profile" asChild>
            <Pressable className="items-center">
              <Text className="text-white text-base">Profil</Text>
            </Pressable>
          </Link>
          <Link href="/leaderboard" asChild>
            <Pressable className="items-center">
              <Text className="text-white text-base">Classement</Text>
            </Pressable>
          </Link>
          <Link href="/settings" asChild>
            <Pressable className="items-center">
              <Text className="text-white text-base">Options</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
