import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { buttonPressFeedback } from "../../src/utils/feedback";

// Design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  purple: "#7c3aed",
  purpleDim: "rgba(124, 58, 237, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function PartySetupScreen() {
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<string[]>(["Player 1", "Player 2"]);
  const [questionCount, setQuestionCount] = useState(10);

  const updatePlayerCount = (count: number) => {
    setPlayerCount(count);
    const newPlayers = Array(count)
      .fill(null)
      .map((_, i) => players[i] || `Player ${i + 1}`);
    setPlayers(newPlayers);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const startGame = () => {
    buttonPressFeedback();
    const validPlayers = players.map(
      (p, i) => p.trim() || `Player ${i + 1}`
    );
    router.push({
      pathname: "/party/game",
      params: {
        players: JSON.stringify(validPlayers),
        questionCount: questionCount.toString(),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Background glow */}
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <View
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-40"
          style={{ backgroundColor: `${COLORS.purple}30` }}
        />
      </View>

      <View className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.back();
            }}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-white text-lg">←</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-white text-2xl font-black">Party Mode</Text>
            <Text style={{ color: COLORS.textMuted }} className="text-sm">
              One phone, multiple players
            </Text>
          </View>
          <Text className="text-4xl">🎉</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Player Count Card */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <Text className="text-white font-bold text-base mb-4">
              Number of players
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => {
                    buttonPressFeedback();
                    updatePlayerCount(num);
                  }}
                  className="rounded-xl items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: playerCount === num ? COLORS.purple : COLORS.surfaceLight,
                  }}
                >
                  <Text
                    className="font-bold text-base"
                    style={{ color: playerCount === num ? '#fff' : COLORS.textMuted }}
                  >
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Player Names Card */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <Text className="text-white font-bold text-base mb-4">
              Player names
            </Text>
            <View className="gap-3">
              {players.map((player, index) => (
                <View key={index} className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={['#7c3aed', '#a855f7']}
                    className="w-10 h-10 rounded-full items-center justify-center"
                  >
                    <Text className="text-white font-bold">{index + 1}</Text>
                  </LinearGradient>
                  <TextInput
                    value={player}
                    onChangeText={(text) => updatePlayerName(index, text)}
                    placeholder={`Player ${index + 1}`}
                    placeholderTextColor={COLORS.textMuted}
                    className="flex-1 rounded-xl py-3 px-4 text-white font-medium"
                    style={{ backgroundColor: COLORS.surfaceLight }}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Question Count Card */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <Text className="text-white font-bold text-base mb-4">
              Number of questions
            </Text>
            <View className="flex-row gap-3">
              {QUESTION_COUNTS.map((count) => (
                <Pressable
                  key={count}
                  onPress={() => {
                    buttonPressFeedback();
                    setQuestionCount(count);
                  }}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: questionCount === count ? COLORS.purple : COLORS.surfaceLight,
                  }}
                >
                  <Text
                    className="font-bold"
                    style={{ color: questionCount === count ? '#fff' : COLORS.textMuted }}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: COLORS.textMuted }} className="text-sm mt-3 text-center">
              {Math.ceil(questionCount / playerCount)} questions per player
            </Text>
          </View>

          {/* How to Play Card */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: COLORS.purpleDim, borderWidth: 1, borderColor: `${COLORS.purple}30` }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-lg">💡</Text>
              <Text className="text-white font-bold">How to play</Text>
            </View>
            <Text style={{ color: COLORS.textMuted }} className="text-sm leading-5">
              Each player answers in turn. The phone shows who should answer.
              Pass the phone to the next player after each question.
              The player with the most points wins!
            </Text>
          </View>

          <View className="h-4" />
        </ScrollView>

        {/* Start Button */}
        <View className="pb-4">
          <Pressable
            onPress={startGame}
            className="rounded-2xl overflow-hidden active:opacity-90"
          >
            <LinearGradient
              colors={['#7c3aed', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 items-center"
            >
              <Text className="text-white text-xl font-bold">
                Start Game 🎮
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
