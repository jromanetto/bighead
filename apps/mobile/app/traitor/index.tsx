import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { buttonPressFeedback, playHaptic } from "../../src/utils/feedback";
import { IconButton } from "../../src/components/ui";

// QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  yellow: "#FFD100",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function TraitorSetupScreen() {
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array(6).fill("").map((_, i) => `Player ${i + 1}`)
  );
  const [questionCount, setQuestionCount] = useState(10);

  const handlePlayerCountChange = (count: number) => {
    playHaptic("light");
    setPlayerCount(count);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    buttonPressFeedback();
    const activePlayers = playerNames.slice(0, playerCount).filter(n => n.trim());

    if (activePlayers.length < 3) {
      return; // Need at least 3 players
    }

    router.push({
      pathname: "/traitor/game",
      params: {
        players: JSON.stringify(activePlayers),
        questionCount: questionCount.toString(),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-6">
        {/* Header */}
        <View className="flex-row items-center pt-4 mb-6">
          <IconButton
            name="ArrowLeft"
            onPress={() => router.back()}
            variant="glass"
            size={40}
            style={{ marginRight: 16 }}
          />
          <View>
            <Text className="text-white text-2xl font-black">Traitor Mode</Text>
            <Text style={{ color: COLORS.textMuted }} className="text-sm">
              Find the impostor among you
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
              1. One player is secretly the <Text style={{ color: COLORS.coral }}>Traitor</Text>
            </Text>
            <Text style={{ color: COLORS.textMuted }}>
              2. Everyone answers quiz questions together
            </Text>
            <Text style={{ color: COLORS.textMuted }}>
              3. The Traitor must give <Text style={{ color: COLORS.coral }}>wrong answers</Text> without being caught
            </Text>
            <Text style={{ color: COLORS.textMuted }}>
              4. At the end, vote to find the Traitor!
            </Text>
          </View>
        </View>

        {/* Player Count */}
        <View className="mb-6">
          <Text className="text-white font-bold mb-3">Number of Players</Text>
          <View className="flex-row gap-2">
            {[3, 4, 5, 6].map((count) => (
              <Pressable
                key={count}
                onPress={() => handlePlayerCountChange(count)}
                className="flex-1 py-4 rounded-xl items-center"
                style={{
                  backgroundColor: playerCount === count ? COLORS.primary : COLORS.surface,
                  borderWidth: 1,
                  borderColor: playerCount === count ? COLORS.primary : 'rgba(255,255,255,0.05)',
                }}
              >
                <Text
                  className="text-xl font-bold"
                  style={{ color: playerCount === count ? COLORS.bg : COLORS.text }}
                >
                  {count}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Player Names */}
        <View className="mb-6">
          <Text className="text-white font-bold mb-3">Player Names</Text>
          <View className="gap-3">
            {Array.from({ length: playerCount }).map((_, index) => (
              <View
                key={index}
                className="flex-row items-center rounded-xl overflow-hidden"
                style={{
                  backgroundColor: COLORS.surface,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <View
                  className="w-12 h-12 items-center justify-center"
                  style={{ backgroundColor: COLORS.surfaceLight }}
                >
                  <Text style={{ color: COLORS.primary }} className="font-bold">
                    {index + 1}
                  </Text>
                </View>
                <TextInput
                  value={playerNames[index]}
                  onChangeText={(text) => handleNameChange(index, text)}
                  placeholder={`Player ${index + 1}`}
                  placeholderTextColor={COLORS.textMuted}
                  className="flex-1 px-4 py-3 text-white text-base"
                  maxLength={15}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Question Count */}
        <View className="mb-8">
          <Text className="text-white font-bold mb-3">Questions</Text>
          <View className="flex-row gap-2">
            {[5, 10, 15, 20].map((count) => (
              <Pressable
                key={count}
                onPress={() => {
                  playHaptic("light");
                  setQuestionCount(count);
                }}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: questionCount === count ? COLORS.purple : COLORS.surface,
                  borderWidth: 1,
                  borderColor: questionCount === count ? COLORS.purple : 'rgba(255,255,255,0.05)',
                }}
              >
                <Text
                  className="font-bold"
                  style={{ color: questionCount === count ? COLORS.bg : COLORS.text }}
                >
                  {count}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <Pressable
          onPress={handleStartGame}
          className="rounded-2xl py-4 active:opacity-80"
          style={{ backgroundColor: COLORS.coral }}
        >
          <Text
            className="text-center font-bold text-lg"
            style={{ color: COLORS.bg }}
          >
            Start Game
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
