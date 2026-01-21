import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function PartySetupScreen() {
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<string[]>(["Joueur 1", "Joueur 2"]);

  const updatePlayerCount = (count: number) => {
    setPlayerCount(count);
    const newPlayers = Array(count)
      .fill(null)
      .map((_, i) => players[i] || `Joueur ${i + 1}`);
    setPlayers(newPlayers);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const startGame = () => {
    // TODO: Start party game with players
    router.push({
      pathname: "/party/game",
      params: { players: JSON.stringify(players) },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-500">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Mode Party</Text>
        </View>

        {/* Player Count */}
        <View className="mb-6">
          <Text className="text-white text-lg mb-3">Nombre de joueurs</Text>
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
                    playerCount === num ? "text-accent-500" : "text-white"
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
          <Text className="text-white text-lg mb-3">Noms des joueurs</Text>
          <View className="gap-2">
            {players.map((player, index) => (
              <TextInput
                key={index}
                value={player}
                onChangeText={(text) => updatePlayerName(index, text)}
                placeholder={`Joueur ${index + 1}`}
                placeholderTextColor="#ffffff80"
                className="bg-white/20 rounded-xl py-3 px-4 text-white"
              />
            ))}
          </View>
        </View>

        {/* Start Button */}
        <View className="flex-1 justify-end pb-6">
          <Pressable
            onPress={startGame}
            className="bg-white rounded-2xl py-4 active:opacity-80"
          >
            <Text className="text-accent-500 text-xl text-center font-bold">
              Commencer la partie
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
