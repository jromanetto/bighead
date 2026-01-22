import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { createDuel, joinDuel } from "../../src/services/duel";

export default function DuelLobbyScreen() {
  const { user, isAnonymous } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDuel = async () => {
    if (!user || isAnonymous) {
      router.push("/profile");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { duelId, code } = await createDuel(user.id);
      router.push(`/duel/waiting?id=${duelId}&code=${code}`);
    } catch (e) {
      console.error("Error creating duel:", e);
      setError("Erreur lors de la création du duel");
    }
    setLoading(false);
  };

  const handleJoinDuel = async () => {
    if (!user || isAnonymous) {
      router.push("/profile");
      return;
    }

    if (joinCode.length !== 6) {
      setError("Le code doit contenir 6 caractères");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await joinDuel(joinCode, user.id);
      if (result.success && result.duelId) {
        router.push(`/duel/play?id=${result.duelId}`);
      } else {
        setError(result.message);
      }
    } catch (e) {
      console.error("Error joining duel:", e);
      setError("Erreur lors de la connexion au duel");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center pt-4 mb-8">
          <Pressable onPress={() => router.back()} className="p-2 mr-4">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Duel 1v1</Text>
        </View>

        {/* Create Section */}
        <View className="bg-gray-800 rounded-2xl p-6 mb-6">
          <View className="items-center mb-6">
            <Text className="text-5xl mb-4">⚔️</Text>
            <Text className="text-white text-xl font-bold mb-2">
              Créer un duel
            </Text>
            <Text className="text-gray-400 text-center">
              Invite un ami à te défier en temps réel
            </Text>
          </View>

          <Pressable
            onPress={handleCreateDuel}
            disabled={loading}
            className="bg-primary-500 rounded-xl py-4"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Créer une partie
              </Text>
            )}
          </Pressable>
        </View>

        {/* Join Section */}
        <View className="bg-gray-800 rounded-2xl p-6">
          <View className="items-center mb-6">
            <Text className="text-5xl mb-4">🎯</Text>
            <Text className="text-white text-xl font-bold mb-2">
              Rejoindre un duel
            </Text>
            <Text className="text-gray-400 text-center">
              Entre le code de ton adversaire
            </Text>
          </View>

          <TextInput
            value={joinCode}
            onChangeText={(text) => setJoinCode(text.toUpperCase())}
            placeholder="CODE"
            placeholderTextColor="#6B7280"
            maxLength={6}
            autoCapitalize="characters"
            className="bg-gray-700 text-white text-center text-2xl font-bold rounded-xl py-4 mb-4 tracking-widest"
          />

          <Pressable
            onPress={handleJoinDuel}
            disabled={loading || joinCode.length !== 6}
            className={`rounded-xl py-4 ${
              joinCode.length === 6 ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Rejoindre
              </Text>
            )}
          </Pressable>
        </View>

        {/* Error */}
        {error && (
          <View className="bg-red-500/20 rounded-xl p-4 mt-4">
            <Text className="text-red-400 text-center">{error}</Text>
          </View>
        )}

        {/* Anonymous Prompt */}
        {isAnonymous && (
          <View className="mt-6">
            <Pressable
              onPress={() => router.push("/profile")}
              className="bg-orange-500/20 rounded-xl p-4"
            >
              <Text className="text-orange-400 text-center">
                Crée un compte pour défier tes amis ! 🎮
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
