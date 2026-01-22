import { View, Text, Pressable, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import type { PartyPlayer } from "../../src/stores/gameStore";

export default function PartyResultScreen() {
  const { players: playersParam } = useLocalSearchParams<{
    players: string;
  }>();

  const players: PartyPlayer[] = playersParam ? JSON.parse(playersParam) : [];

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  const getPositionStyle = (index: number) => {
    if (index === 0) return "bg-yellow-500/20";
    if (index === 1) return "bg-gray-300/10";
    if (index === 2) return "bg-orange-500/10";
    return "";
  };

  const handleShare = async () => {
    const leaderboard = sortedPlayers
      .map((p, i) => `${getMedal(i) || `${i + 1}.`} ${p.name}: ${p.score} pts`)
      .join("\n");

    try {
      await Share.share({
        message: `🎮 BIGHEAD Party Mode!\n\n🏆 ${winner?.name} wins!\n\n${leaderboard}\n\nCan you do better? 🧠`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-600">
      <View className="flex-1 px-6 pt-8">
        {/* Header */}
        <Text className="text-white text-3xl font-bold text-center mb-1">
          Game Over!
        </Text>
        <Text className="text-white/60 text-center mb-6">
          {players.length} players
        </Text>

        {/* Winner Podium */}
        {winner && (
          <View className="items-center mb-6">
            <Text className="text-7xl mb-2">🏆</Text>
            <Text className="text-white text-3xl font-bold">{winner.name}</Text>
            <Text className="text-yellow-300 text-2xl font-medium mt-1">
              {winner.score} points
            </Text>
            <View className="flex-row items-center mt-2 bg-white/10 rounded-full px-4 py-1">
              <Text className="text-white/80 text-sm">
                {winner.correctCount} correct answers
              </Text>
            </View>
          </View>
        )}

        {/* Full Leaderboard */}
        <View className="bg-white/10 rounded-2xl overflow-hidden mb-6">
          <View className="bg-white/10 px-4 py-2">
            <Text className="text-white/60 text-sm font-medium text-center">
              Final standings
            </Text>
          </View>
          {sortedPlayers.map((player, index) => (
            <View
              key={player.name}
              className={`flex-row items-center py-4 px-4 ${getPositionStyle(index)} ${
                index < sortedPlayers.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              {/* Position */}
              <View className="w-10 items-center">
                {index < 3 ? (
                  <Text className="text-2xl">{getMedal(index)}</Text>
                ) : (
                  <Text className="text-white/60 text-lg">{index + 1}</Text>
                )}
              </View>

              {/* Player Info */}
              <View className="flex-1 ml-2">
                <Text
                  className={`text-lg ${
                    index === 0 ? "text-yellow-300 font-bold" : "text-white"
                  }`}
                >
                  {player.name}
                </Text>
                <Text className="text-white/50 text-sm">
                  {player.correctCount} correct
                </Text>
              </View>

              {/* Score */}
              <Text
                className={`text-xl font-bold ${
                  index === 0 ? "text-yellow-300" : "text-white"
                }`}
              >
                {player.score}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="gap-3 mt-auto pb-4">
          <Pressable
            onPress={() => router.replace("/party/setup")}
            className="bg-white rounded-2xl py-4 active:opacity-80"
          >
            <Text className="text-accent-600 text-xl text-center font-bold">
              Play Again
            </Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            className="bg-white/20 rounded-2xl py-4 active:opacity-80"
          >
            <Text className="text-white text-lg text-center font-medium">
              Share results
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            className="py-4 active:opacity-80"
          >
            <Text className="text-white/60 text-center">Back to menu</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
