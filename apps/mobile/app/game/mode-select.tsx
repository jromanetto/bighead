import { View, Text, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { IconButton } from "../../src/components/ui";

// QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  yellow: "#FFD100",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function ModeSelectScreen() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <IconButton
            name="ArrowLeft"
            onPress={() => router.back()}
            variant="glass"
            size={40}
            style={{ marginRight: 16 }}
          />
          <Text className="text-white text-2xl font-bold">Choose a Mode</Text>
        </View>

        {/* Game Modes */}
        <View className="gap-4">
          {/* Chain Reaction */}
          <Link href="/game/chain" asChild>
            <Pressable
              onPress={() => buttonPressFeedback()}
              className="rounded-2xl p-6 active:opacity-80"
              style={{ backgroundColor: COLORS.purple }}
            >
              <View className="flex-row items-center mb-2">
                <Text className="text-3xl mr-3">⚡</Text>
                <Text className="text-white text-2xl font-bold">
                  Chain Reaction
                </Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                Chain correct answers to increase your multiplier. One mistake = reset!
              </Text>
              <View className="flex-row mt-4 gap-2">
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-sm">Solo</Text>
                </View>
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-sm">Endless</Text>
                </View>
              </View>
            </Pressable>
          </Link>

          {/* Traitor Mode - NOW AVAILABLE */}
          <Link href="/traitor" asChild>
            <Pressable
              onPress={() => buttonPressFeedback()}
              className="rounded-2xl p-6 active:opacity-80"
              style={{ backgroundColor: COLORS.coral }}
            >
              <View className="flex-row items-center mb-2">
                <Text className="text-3xl mr-3">🕵️</Text>
                <Text className="text-white text-2xl font-bold">
                  Traitor
                </Text>
                <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <Text className="text-white text-xs font-bold">NEW</Text>
                </View>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                One of you is a traitor! Answer questions and vote to find them.
              </Text>
              <View className="flex-row mt-4 gap-2">
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-sm">3-6 Players</Text>
                </View>
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-sm">Local</Text>
                </View>
              </View>
            </Pressable>
          </Link>

          {/* Auction Duel - NOW AVAILABLE */}
          <Link href="/auction" asChild>
            <Pressable
              onPress={() => buttonPressFeedback()}
              className="rounded-2xl p-6 active:opacity-80"
              style={{ backgroundColor: COLORS.yellow }}
            >
              <View className="flex-row items-center mb-2">
                <Text className="text-3xl mr-3">💰</Text>
                <Text style={{ color: COLORS.bg }} className="text-2xl font-bold">
                  Auction Duel
                </Text>
                <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <Text style={{ color: COLORS.bg }} className="text-xs font-bold">NEW</Text>
                </View>
              </View>
              <Text style={{ color: 'rgba(0,0,0,0.7)' }}>
                Bid your time to choose categories. The highest bidder picks!
              </Text>
              <View className="flex-row mt-4 gap-2">
                <View style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} className="rounded-full px-3 py-1">
                  <Text style={{ color: COLORS.bg }} className="text-sm">2 Players</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} className="rounded-full px-3 py-1">
                  <Text style={{ color: COLORS.bg }} className="text-sm">Local</Text>
                </View>
              </View>
            </Pressable>
          </Link>

          {/* Party Mode */}
          <Link href="/party/setup" asChild>
            <Pressable
              onPress={() => buttonPressFeedback()}
              className="rounded-2xl p-6 active:opacity-80"
              style={{
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <View className="flex-row items-center mb-2">
                <Text className="text-3xl mr-3">🎉</Text>
                <Text className="text-white text-2xl font-bold">
                  Party Mode
                </Text>
              </View>
              <Text style={{ color: COLORS.textMuted }}>
                Classic quiz with friends. Pass the phone and compete!
              </Text>
              <View className="flex-row mt-4 gap-2">
                <View style={{ backgroundColor: COLORS.surfaceLight }} className="rounded-full px-3 py-1">
                  <Text className="text-gray-300 text-sm">2-8 Players</Text>
                </View>
                <View style={{ backgroundColor: COLORS.surfaceLight }} className="rounded-full px-3 py-1">
                  <Text className="text-gray-300 text-sm">Local</Text>
                </View>
              </View>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
