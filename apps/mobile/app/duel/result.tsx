import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useAuth } from "../../src/contexts/AuthContext";
import { getDuel, type Duel } from "../../src/services/duel";

export default function DuelResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [duel, setDuel] = useState<Duel | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation values
  const trophyScale = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);

  useEffect(() => {
    if (!id) return;

    const loadResult = async () => {
      try {
        const data = await getDuel(id);
        setDuel(data);

        // Trigger animations
        trophyScale.value = withDelay(200, withSpring(1, { damping: 8 }));
        scoreOpacity.value = withDelay(500, withSpring(1));
      } catch (error) {
        console.error("Error loading result:", error);
      }
      setLoading(false);
    };
    loadResult();
  }, [id]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
  }));

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!duel) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">❌</Text>
          <Text className="text-white text-xl font-bold text-center">
            Résultat introuvable
          </Text>
          <Pressable
            onPress={() => router.replace("/")}
            className="bg-primary-500 rounded-xl py-4 px-8 mt-6"
          >
            <Text className="text-white font-bold">Retour à l'accueil</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isHost = duel.host_id === user?.id;
  const myScore = isHost ? duel.host_score : duel.guest_score;
  const opponentScore = isHost ? duel.guest_score : duel.host_score;
  const isWinner = duel.winner_id === user?.id;
  const isDraw = duel.winner_id === null && duel.host_score === duel.guest_score;

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 items-center justify-center">
        {/* Trophy/Result Icon */}
        <Animated.View style={trophyStyle} className="mb-8">
          <Text className="text-8xl">
            {isWinner ? "🏆" : isDraw ? "🤝" : "😢"}
          </Text>
        </Animated.View>

        {/* Result Text */}
        <Text
          className={`text-3xl font-bold mb-2 ${
            isWinner ? "text-yellow-400" : isDraw ? "text-gray-400" : "text-red-400"
          }`}
        >
          {isWinner ? "VICTOIRE !" : isDraw ? "ÉGALITÉ" : "DÉFAITE"}
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          {isWinner
            ? "Tu as dominé ce duel !"
            : isDraw
            ? "Match serré !"
            : "La prochaine sera la bonne !"}
        </Text>

        {/* Score Display */}
        <Animated.View style={scoreStyle} className="w-full">
          <View className="bg-gray-800 rounded-2xl p-6 mb-8">
            <View className="flex-row items-center justify-around">
              {/* Your Score */}
              <View className="items-center">
                <Text className="text-gray-400 text-sm mb-1">TOI</Text>
                <Text
                  className={`text-5xl font-bold ${
                    myScore > opponentScore ? "text-green-400" : "text-white"
                  }`}
                >
                  {myScore}
                </Text>
              </View>

              {/* VS */}
              <View className="items-center">
                <Text className="text-gray-600 text-2xl font-bold">VS</Text>
              </View>

              {/* Opponent Score */}
              <View className="items-center">
                <Text className="text-gray-400 text-sm mb-1">ADVERSAIRE</Text>
                <Text
                  className={`text-5xl font-bold ${
                    opponentScore > myScore ? "text-red-400" : "text-white"
                  }`}
                >
                  {opponentScore}
                </Text>
              </View>
            </View>

            <View className="border-t border-gray-700 mt-4 pt-4">
              <Text className="text-gray-500 text-center text-sm">
                {duel.rounds_total} questions • {duel.category === "general" ? "Culture générale" : duel.category}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View className="w-full">
          <Pressable
            onPress={() => router.replace("/duel")}
            className="bg-primary-500 rounded-xl py-4 mb-3"
          >
            <Text className="text-white text-center font-bold text-lg">
              🎮 Nouveau duel
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            className="bg-gray-800 rounded-xl py-4"
          >
            <Text className="text-white text-center font-bold">
              Retour à l'accueil
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
