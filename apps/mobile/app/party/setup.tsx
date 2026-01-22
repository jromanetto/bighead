import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

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
    // Filter out empty names and use defaults
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
    <SafeAreaView className="flex-1 bg-accent-600">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="mr-4 p-2">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <View>
            <Text className="text-white text-2xl font-bold">Party Mode</Text>
            <Text className="text-white/70 text-sm">
              One phone, multiple players
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Player Count */}
          <View className="mb-6">
            <Text className="text-white text-lg font-medium mb-3">
              Number of players
            </Text>
            <View className="flex-row gap-2">
              {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => updatePlayerCount(num)}
                  className={`flex-1 py-3 rounded-xl ${
                    playerCount === num ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <Text
                    className={`text-center font-bold ${
                      playerCount === num ? "text-accent-600" : "text-white"
                    }`}
                  >
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Player Names */}
          <View className="mb-6">
            <Text className="text-white text-lg font-medium mb-3">
              Player names
            </Text>
            <View className="gap-2">
              {players.map((player, index) => (
                <View key={index} className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                    <Text className="text-white font-bold">{index + 1}</Text>
                  </View>
                  <TextInput
                    value={player}
                    onChangeText={(text) => updatePlayerName(index, text)}
                    placeholder={`Player ${index + 1}`}
                    placeholderTextColor="#ffffff60"
                    className="flex-1 bg-white/20 rounded-xl py-3 px-4 text-white"
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Question Count */}
          <View className="mb-6">
            <Text className="text-white text-lg font-medium mb-3">
              Number of questions
            </Text>
            <View className="flex-row gap-2">
              {QUESTION_COUNTS.map((count) => (
                <Pressable
                  key={count}
                  onPress={() => setQuestionCount(count)}
                  className={`flex-1 py-3 rounded-xl ${
                    questionCount === count ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <Text
                    className={`text-center font-bold ${
                      questionCount === count ? "text-accent-600" : "text-white"
                    }`}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text className="text-white/60 text-sm mt-2 text-center">
              {Math.ceil(questionCount / playerCount)} questions per player
            </Text>
          </View>

          {/* Game Info */}
          <View className="bg-white/10 rounded-xl p-4 mb-6">
            <Text className="text-white font-bold mb-2">How to play</Text>
            <Text className="text-white/80 text-sm leading-5">
              Each player answers in turn. The phone shows who should answer.
              Pass the phone to the next player after each question.
              The player with the most points wins!
            </Text>
          </View>
        </ScrollView>

        {/* Start Button */}
        <View className="pb-4">
          <Pressable
            onPress={startGame}
            className="bg-white rounded-2xl py-4 active:opacity-80"
          >
            <Text className="text-accent-600 text-xl text-center font-bold">
              Start Game
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
