import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { createDuel, joinDuel } from "../../src/services/duel";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { BottomNavigation } from "../../src/components/BottomNavigation";

// New QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  error: "#ef4444",
  errorDim: "rgba(239, 68, 68, 0.15)",
  coral: "#FF6B6B",
  coralDim: "rgba(255, 107, 107, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function DuelLobbyScreen() {
  const { user, isAnonymous } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDuel = async () => {
    buttonPressFeedback();
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
      setError("Error creating duel");
    }
    setLoading(false);
  };

  const handleJoinDuel = async () => {
    buttonPressFeedback();
    if (!user || isAnonymous) {
      router.push("/profile");
      return;
    }

    if (joinCode.length !== 6) {
      setError("Code must be 6 characters");
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
      setError("Error joining duel");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="flex-row items-center pt-4 mb-6">
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
          <Text className="text-white text-2xl font-black">Duel 1v1</Text>
        </View>

        {/* Create Section */}
        <View
          className="rounded-2xl p-6 mb-4"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <View className="items-center mb-6">
            <Text className="text-5xl mb-4">⚔️</Text>
            <Text className="text-white text-xl font-bold mb-2">
              Create a duel
            </Text>
            <Text className="text-gray-400 text-center text-sm">
              Challenge a friend in real-time on your football knowledge
            </Text>
          </View>

          {/* Category selector (cosmetic) */}
          <View className="mb-4">
            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2">
              Category
            </Text>
            <View
              className="flex-row items-center rounded-xl py-3 px-4"
              style={{ backgroundColor: COLORS.surfaceLight }}
            >
              <Text className="text-xl mr-2">⚽</Text>
              <Text className="text-white flex-1">General Knowledge</Text>
              <Text className="text-gray-400">▼</Text>
            </View>
          </View>

          <Pressable
            onPress={handleCreateDuel}
            disabled={loading}
            className="rounded-2xl py-4 active:opacity-80"
            style={{ backgroundColor: COLORS.primary }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.bg} />
            ) : (
              <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
                Create a game
              </Text>
            )}
          </Pressable>
        </View>

        {/* Join Section */}
        <View
          className="rounded-2xl p-6 mb-4"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <View className="items-center mb-6">
            <Text className="text-5xl mb-4">🎯</Text>
            <Text className="text-white text-xl font-bold mb-2">
              Join a duel
            </Text>
            <Text className="text-gray-400 text-center text-sm">
              Enter the code shared by your opponent to start the match
            </Text>
          </View>

          <TextInput
            value={joinCode}
            onChangeText={(text) => setJoinCode(text.toUpperCase())}
            placeholder="CODE"
            placeholderTextColor="#6B7280"
            maxLength={6}
            autoCapitalize="characters"
            className="text-white text-center text-2xl font-bold rounded-xl py-4 mb-4 tracking-widest"
            style={{ backgroundColor: COLORS.surfaceLight }}
          />

          <Pressable
            onPress={handleJoinDuel}
            disabled={loading || joinCode.length !== 6}
            className="rounded-2xl py-4 active:opacity-80"
            style={{
              backgroundColor: joinCode.length === 6 ? COLORS.surface : COLORS.surfaceLight,
              borderWidth: joinCode.length === 6 ? 1 : 0,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className="text-center font-bold text-lg"
                style={{ color: joinCode.length === 6 ? COLORS.text : COLORS.textMuted }}
              >
                Join
              </Text>
            )}
          </Pressable>
        </View>

        {/* Error */}
        {error && (
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: COLORS.errorDim }}
          >
            <Text style={{ color: COLORS.error }} className="text-center">{error}</Text>
          </View>
        )}

        {/* Anonymous Prompt */}
        {isAnonymous && (
          <View
            className="rounded-2xl p-4 mt-4"
            style={{
              backgroundColor: COLORS.coralDim,
              borderWidth: 1,
              borderColor: `${COLORS.coral}30`,
            }}
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🎮</Text>
              <Text style={{ color: COLORS.coral }} className="flex-1">
                Create an account to challenge your friends and save your stats!
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View className="mt-auto pb-4 items-center">
          <Text className="text-gray-600 text-xs">
            BIGHEAD V1.0.0 • MADE WITH ❤️
          </Text>
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
}
