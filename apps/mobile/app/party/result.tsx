import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PartyResultScreen() {
  const { scores: scoresParam, players: playersParam } = useLocalSearchParams<{
    scores: string;
    players: string;
  }>();

  const scores: Record<string, number> = scoresParam ? JSON.parse(scoresParam) : {};
  const players: string[] = playersParam ? JSON.parse(playersParam) : [];

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => scores[b] - scores[a]);

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-500">
      <View className="flex-1 px-6 pt-8">
        {/* Header */}
        <Text className="text-white text-3xl font-bold text-center mb-2">
          Résultats
        </Text>
        <Text className="text-white/60 text-center mb-8">
          Partie terminée!
        </Text>

        {/* Winner */}
        <View className="items-center mb-8">
          <Text className="text-6xl mb-2">🏆</Text>
          <Text className="text-white text-2xl font-bold">{sortedPlayers[0]}</Text>
          <Text className="text-white/80 text-xl">{scores[sortedPlayers[0]]} pts</Text>
        </View>

        {/* Leaderboard */}
        <View className="bg-white/10 rounded-2xl p-4 mb-8">
          {sortedPlayers.map((player, index) => (
            <View
              key={player}
              className={`flex-row items-center py-3 ${
                index < sortedPlayers.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <Text className="text-2xl w-12">{getMedal(index)}</Text>
              <Text className="text-white text-lg flex-1">{player}</Text>
              <Text className="text-white font-bold">{scores[player]} pts</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="gap-4">
          <Pressable
            onPress={() => router.replace("/party/setup")}
            className="bg-white rounded-2xl py-4 active:opacity-80"
          >
            <Text className="text-accent-500 text-xl text-center font-bold">
              Rejouer
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            className="bg-white/20 rounded-2xl py-4 active:opacity-80"
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
