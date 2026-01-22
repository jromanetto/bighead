import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { buttonPressFeedback, playHaptic } from "../../src/utils/feedback";

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

export default function AuctionSetupScreen() {
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [rounds, setRounds] = useState(5);

  const handleStartGame = () => {
    buttonPressFeedback();

    if (!player1Name.trim() || !player2Name.trim()) {
      return;
    }

    router.push({
      pathname: "/auction/game",
      params: {
        player1: player1Name.trim(),
        player2: player2Name.trim(),
        rounds: rounds.toString(),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center pt-4 mb-6">
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.back();
            }}
            className="p-2 mr-4"
          >
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <View>
            <Text className="text-white text-2xl font-black">Auction Duel</Text>
            <Text style={{ color: COLORS.textMuted }} className="text-sm">
              Bid time to choose categories
            </Text>
          </View>
        </View>

        {/* How to Play */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Text className="text-white font-bold text-lg mb-3">How to Play</Text>
          <View className="gap-2">
            <Text style={{ color: COLORS.textMuted }}>
              1. Both players start with <Text style={{ color: COLORS.yellow }}>30 seconds</Text> of time
            </Text>
            <Text style={{ color: COLORS.textMuted }}>
              2. <Text style={{ color: COLORS.yellow }}>Bid your time</Text> to win the right to choose the category
            </Text>
            <Text style={{ color: COLORS.textMuted }}>
              3. The winner picks the category but <Text style={{ color: COLORS.coral }}>loses the bid time</Text>
            </Text>
            <Text style={{ color: COLORS.textMuted }}>
              4. Both players answer - fastest correct answer wins the round
            </Text>
          </View>
        </View>

        {/* Player Names */}
        <View className="mb-6">
          <Text className="text-white font-bold mb-3">Players</Text>
          <View className="gap-3">
            <View
              className="flex-row items-center rounded-xl overflow-hidden"
              style={{
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <View
                className="w-12 h-12 items-center justify-center"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text className="text-2xl">👤</Text>
              </View>
              <TextInput
                value={player1Name}
                onChangeText={setPlayer1Name}
                placeholder="Player 1"
                placeholderTextColor={COLORS.textMuted}
                className="flex-1 px-4 py-3 text-white text-base"
                maxLength={15}
              />
            </View>

            <View
              className="flex-row items-center rounded-xl overflow-hidden"
              style={{
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <View
                className="w-12 h-12 items-center justify-center"
                style={{ backgroundColor: COLORS.coral }}
              >
                <Text className="text-2xl">👤</Text>
              </View>
              <TextInput
                value={player2Name}
                onChangeText={setPlayer2Name}
                placeholder="Player 2"
                placeholderTextColor={COLORS.textMuted}
                className="flex-1 px-4 py-3 text-white text-base"
                maxLength={15}
              />
            </View>
          </View>
        </View>

        {/* Rounds */}
        <View className="mb-8">
          <Text className="text-white font-bold mb-3">Number of Rounds</Text>
          <View className="flex-row gap-2">
            {[3, 5, 7, 10].map((count) => (
              <Pressable
                key={count}
                onPress={() => {
                  playHaptic("light");
                  setRounds(count);
                }}
                className="flex-1 py-4 rounded-xl items-center"
                style={{
                  backgroundColor: rounds === count ? COLORS.yellow : COLORS.surface,
                  borderWidth: 1,
                  borderColor: rounds === count ? COLORS.yellow : 'rgba(255,255,255,0.05)',
                }}
              >
                <Text
                  className="text-xl font-bold"
                  style={{ color: rounds === count ? COLORS.bg : COLORS.text }}
                >
                  {count}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <View className="flex-1" />
        <Pressable
          onPress={handleStartGame}
          className="rounded-2xl py-4 mb-6 active:opacity-80"
          style={{ backgroundColor: COLORS.yellow }}
        >
          <Text
            className="text-center font-bold text-lg"
            style={{ color: COLORS.bg }}
          >
            Start Auction
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
