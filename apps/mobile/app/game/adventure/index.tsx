import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../src/contexts/AuthContext";
import { MountainProgress } from "../../../src/components/MountainProgress";
import { CategoryWheel } from "../../../src/components/CategoryWheel";
import {
  getOrCreateProgress,
  canPlay,
  getDailyAttempts,
} from "../../../src/services/adventure";
import {
  AdventureProgress,
  Category,
  CATEGORIES,
  MAX_FREE_ATTEMPTS,
} from "../../../src/types/adventure";
import { buttonPressFeedback } from "../../../src/utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  gold: "#FFD700",
  goldDim: "rgba(255, 209, 0, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
  error: "#ef4444",
};

type ViewMode = "mountain" | "wheel";

export default function AdventureScreen() {
  const { user, isPremium, isAnonymous } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<AdventureProgress | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_FREE_ATTEMPTS);
  const [canPlayGame, setCanPlayGame] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("mountain");

  const loadProgress = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userProgress = await getOrCreateProgress(user.id);
      setProgress(userProgress);

      const playStatus = await canPlay(user.id, isPremium);
      setCanPlayGame(playStatus.canPlay);
      setAttemptsRemaining(playStatus.attemptsRemaining);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  }, [user, isPremium]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleCategorySelected = (category: Category) => {
    if (!progress) return;

    // Navigate to play screen with category and tier
    router.push({
      pathname: "/game/adventure/play",
      params: {
        category,
        tier: progress.tier,
      },
    });
  };

  const handleStartWheel = () => {
    if (!canPlayGame && !isPremium) {
      // Show upgrade prompt
      router.push("/premium");
      return;
    }
    buttonPressFeedback();
    setViewMode("wheel");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted }} className="mt-4">
          Chargement...
        </Text>
      </SafeAreaView>
    );
  }

  if (isAnonymous) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-row items-center px-5 pt-4 mb-6">
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
          <Text className="text-white text-2xl font-black">AVENTURE</Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🔒</Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
            Créez un compte pour jouer
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-center mb-6">
            Le mode Aventure nécessite un compte pour sauvegarder votre progression.
          </Text>
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.push("/profile");
            }}
            className="px-8 py-4 rounded-2xl"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
              Créer un compte
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 mb-2">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              if (viewMode === "wheel") {
                setViewMode("mountain");
              } else {
                router.back();
              }
            }}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-white text-lg">←</Text>
          </Pressable>
          <View>
            <Text className="text-white text-xl font-black">
              {viewMode === "mountain" ? "🏔️ MONTAGNE" : "🎡 TIRAGE"}
            </Text>
            <Text style={{ color: COLORS.textMuted }} className="text-xs">
              de la Connaissance
            </Text>
          </View>
        </View>

        {/* Attempts Counter */}
        {!isPremium && (
          <View
            className="flex-row items-center px-3 py-2 rounded-xl"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-lg mr-2">🎯</Text>
            <Text style={{ color: canPlayGame ? COLORS.primary : COLORS.error }}>
              {attemptsRemaining}/{MAX_FREE_ATTEMPTS}
            </Text>
          </View>
        )}
        {isPremium && (
          <View
            className="flex-row items-center px-3 py-2 rounded-xl"
            style={{ backgroundColor: COLORS.goldDim }}
          >
            <Text className="text-lg mr-2">👑</Text>
            <Text style={{ color: COLORS.gold }}>Illimité</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === "mountain" && progress && (
          <>
            {/* Mountain Visualization */}
            <MountainProgress
              tier={progress.tier}
              level={progress.level}
              completedCategories={progress.completed_categories.length}
              totalCategories={CATEGORIES.length}
            />

            {/* Categories Progress */}
            <View className="px-5 mt-6">
              <Text className="text-white font-bold mb-3">
                Catégories complétées ({progress.completed_categories.length}/{CATEGORIES.length})
              </Text>
              <View className="flex-row flex-wrap">
                {CATEGORIES.map((cat) => {
                  const isCompleted = progress.completed_categories.includes(cat.code);
                  return (
                    <View
                      key={cat.code}
                      className="w-10 h-10 rounded-full items-center justify-center m-1"
                      style={{
                        backgroundColor: isCompleted ? `${cat.color}30` : COLORS.surfaceLight,
                        borderWidth: 2,
                        borderColor: isCompleted ? cat.color : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text className="text-lg">{isCompleted ? "✓" : cat.icon}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Start Button */}
            <View className="px-5 mt-8">
              <Pressable
                onPress={handleStartWheel}
                className="py-5 rounded-2xl items-center active:opacity-80"
                style={{
                  backgroundColor: canPlayGame || isPremium ? COLORS.primary : COLORS.surfaceLight,
                }}
              >
                <Text
                  className="text-xl font-black"
                  style={{ color: canPlayGame || isPremium ? COLORS.bg : COLORS.textMuted }}
                >
                  {canPlayGame || isPremium ? "🎡 LANCER LA ROUE" : "⏰ REVIENS DEMAIN"}
                </Text>
                {!canPlayGame && !isPremium && (
                  <Text style={{ color: COLORS.textMuted }} className="text-sm mt-1">
                    ou passe en Premium pour jouer illimité
                  </Text>
                )}
              </Pressable>

              {/* Premium CTA */}
              {!isPremium && (
                <Pressable
                  onPress={() => {
                    buttonPressFeedback();
                    router.push("/premium");
                  }}
                  className="mt-4 p-4 rounded-2xl flex-row items-center"
                  style={{
                    backgroundColor: COLORS.goldDim,
                    borderWidth: 1,
                    borderColor: "rgba(255, 209, 0, 0.3)",
                  }}
                >
                  <Text className="text-3xl mr-3">👑</Text>
                  <View className="flex-1">
                    <Text style={{ color: COLORS.gold }} className="font-bold">
                      Passe Premium
                    </Text>
                    <Text style={{ color: COLORS.textMuted }} className="text-sm">
                      Tentatives illimitées chaque jour
                    </Text>
                  </View>
                  <Text style={{ color: COLORS.gold }}>→</Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        {viewMode === "wheel" && progress && (
          <View className="flex-1 px-5 pt-8">
            <CategoryWheel
              completedCategories={progress.completed_categories as Category[]}
              onCategorySelected={handleCategorySelected}
              disabled={!canPlayGame && !isPremium}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
