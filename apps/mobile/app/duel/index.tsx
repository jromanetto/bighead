import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView, Modal } from "react-native";
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

// Available categories for duels
const DUEL_CATEGORIES = [
  { id: "general", name: "General Knowledge", icon: "🧠", color: "#00c2cc" },
  { id: "history", name: "History", icon: "🏛️", color: "#8B5CF6" },
  { id: "geography", name: "Geography", icon: "🌍", color: "#10B981" },
  { id: "science", name: "Science", icon: "🔬", color: "#3B82F6" },
  { id: "sports", name: "Sports", icon: "⚽", color: "#F59E0B" },
  { id: "pop-culture", name: "Pop Culture", icon: "🎬", color: "#EC4899" },
];

export default function DuelLobbyScreen() {
  const { user, isPremium } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(DUEL_CATEGORIES[0]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleCreateDuel = async () => {
    buttonPressFeedback();
    if (!isPremium) {
      router.push("/premium");
      return;
    }

    if (!user) {
      setError("You must be logged in");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { duelId, code } = await createDuel(user.id, selectedCategory.id);
      router.push(`/duel/waiting?id=${duelId}&code=${code}`);
    } catch (e) {
      console.error("Error creating duel:", e);
      setError("Error creating duel");
    }
    setLoading(false);
  };

  const handleJoinDuel = async () => {
    buttonPressFeedback();
    if (!isPremium) {
      router.push("/premium");
      return;
    }

    if (!user) {
      setError("You must be logged in");
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

          {/* Category selector */}
          <View className="mb-4">
            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2">
              Category
            </Text>
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                setShowCategoryPicker(true);
              }}
              className="flex-row items-center rounded-xl py-3 px-4"
              style={{ backgroundColor: COLORS.surfaceLight }}
            >
              <Text className="text-xl mr-2">{selectedCategory.icon}</Text>
              <Text className="text-white flex-1">{selectedCategory.name}</Text>
              <Text className="text-gray-400">▼</Text>
            </Pressable>
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

        {/* Premium Prompt */}
        {!isPremium && (
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.push("/premium");
            }}
            className="rounded-2xl p-4 mt-4 active:opacity-80"
            style={{
              backgroundColor: 'rgba(255, 209, 0, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255, 209, 0, 0.3)',
            }}
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">👑</Text>
              <View className="flex-1">
                <Text style={{ color: '#FFD100' }} className="font-bold">
                  Premium Required
                </Text>
                <Text style={{ color: COLORS.textMuted }} className="text-sm">
                  Unlock duels and challenge your friends!
                </Text>
              </View>
              <Text style={{ color: '#FFD100' }}>→</Text>
            </View>
          </Pressable>
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

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowCategoryPicker(false)}
        >
          <Pressable
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: COLORS.surface }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-12 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: COLORS.surfaceLight }} />

            <Text className="text-white text-xl font-bold mb-4">Choose a category</Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {DUEL_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    buttonPressFeedback();
                    setSelectedCategory(category);
                    setShowCategoryPicker(false);
                  }}
                  className="flex-row items-center p-4 rounded-xl mb-2"
                  style={{
                    backgroundColor: selectedCategory.id === category.id
                      ? `${category.color}20`
                      : COLORS.surfaceLight,
                    borderWidth: selectedCategory.id === category.id ? 1 : 0,
                    borderColor: category.color,
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${category.color}30` }}
                  >
                    <Text className="text-2xl">{category.icon}</Text>
                  </View>
                  <Text
                    className="text-lg font-medium flex-1"
                    style={{ color: selectedCategory.id === category.id ? category.color : COLORS.text }}
                  >
                    {category.name}
                  </Text>
                  {selectedCategory.id === category.id && (
                    <Text style={{ color: category.color }} className="text-xl">✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <View style={{ height: 20 }} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
