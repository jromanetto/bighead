import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConfettiEffect } from "../../../src/components/effects/ConfettiEffect";
import { useAuth } from "../../../src/contexts/AuthContext";
import { MountainProgress } from "../../../src/components/MountainProgress";
import { CategoryWheel } from "../../../src/components/CategoryWheel";
import {
  getOrCreateProgress,
  canPlay,
} from "../../../src/services/adventure";
import {
  AdventureProgress,
  Category,
  CATEGORIES,
  MAX_FREE_ATTEMPTS,
} from "../../../src/types/adventure";
import { buttonPressFeedback } from "../../../src/utils/feedback";

const STORAGE_KEY = "adventure_progress";
const ATTEMPTS_KEY = "adventure_attempts";

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
  const { user, isPremium, isAnonymous, refreshProfile, profile } = useAuth();
  const { completedCategory } = useLocalSearchParams<{ completedCategory?: Category }>();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<AdventureProgress | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_FREE_ATTEMPTS);
  const [canPlayGame, setCanPlayGame] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("mountain");
  const [showCelebration, setShowCelebration] = useState(false);
  const [justCompletedCategory, setJustCompletedCategory] = useState<Category | null>(null);

  // Handle celebration when returning from successful game
  useEffect(() => {
    if (completedCategory) {
      setJustCompletedCategory(completedCategory);
      setShowCelebration(true);
      // Clear celebration after animation
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setJustCompletedCategory(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [completedCategory]);

  // Refresh profile when screen gains focus (to get latest premium status)
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
      // Try to load from local storage first (works for all users)
      const storedProgress = await AsyncStorage.getItem(STORAGE_KEY);
      const storedAttempts = await AsyncStorage.getItem(ATTEMPTS_KEY);

      if (storedProgress) {
        setProgress(JSON.parse(storedProgress));
      } else {
        // Initialize default progress
        const defaultProgress: AdventureProgress = {
          user_id: user?.id || "guest",
          tier: "homer",
          level: 1,
          completed_categories: [],
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProgress));
        setProgress(defaultProgress);
      }

      // Check daily attempts from local storage
      const today = new Date().toISOString().split("T")[0];
      if (storedAttempts) {
        const attempts = JSON.parse(storedAttempts);
        if (attempts.date === today) {
          const remaining = Math.max(0, MAX_FREE_ATTEMPTS - attempts.used);
          setAttemptsRemaining(remaining);
          setCanPlayGame(isPremium || remaining > 0);
        } else {
          // New day, reset attempts
          await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ date: today, used: 0 }));
          setAttemptsRemaining(MAX_FREE_ATTEMPTS);
          setCanPlayGame(true);
        }
      } else {
        await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ date: today, used: 0 }));
        setAttemptsRemaining(MAX_FREE_ATTEMPTS);
        setCanPlayGame(true);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
      // Fallback to default
      setProgress({
        user_id: user?.id || "guest",
        tier: "homer",
        level: 1,
        completed_categories: [],
      });
      setCanPlayGame(true);
    } finally {
      setLoading(false);
    }
  }, [user, isPremium]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // React to premium status changes immediately
  useEffect(() => {
    if (isPremium) {
      setCanPlayGame(true);
    }
  }, [isPremium]);

  const handleCategorySelected = (category: Category) => {
    if (!progress) return;

    // Navigate to play screen with category, tier and level
    router.push({
      pathname: "/game/adventure/play",
      params: {
        category,
        tier: progress.tier,
        level: progress.level.toString(),
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


  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Celebration confetti when returning from successful game */}
      <ConfettiEffect trigger={showCelebration} particleCount={100} />

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
              completedCategories={progress.completed_categories as Category[]}
              totalCategories={CATEGORIES.length}
              avatarUrl={profile?.avatar_url}
              username={profile?.username}
              justCompletedCategory={justCompletedCategory}
            />

            {/* Start Button */}
            <View className="px-5 mt-8">
              <Pressable
                onPress={() => {
                  if (canPlayGame || isPremium) {
                    handleStartWheel();
                  } else {
                    // Navigate to premium when out of attempts
                    buttonPressFeedback();
                    router.push("/premium");
                  }
                }}
                className="py-5 rounded-2xl items-center active:opacity-80"
                style={{
                  backgroundColor: canPlayGame || isPremium ? COLORS.primary : COLORS.gold,
                }}
              >
                <Text
                  className="text-xl font-black"
                  style={{ color: COLORS.bg }}
                >
                  {canPlayGame || isPremium ? "🎡 LANCER LA ROUE" : "👑 PASSER PREMIUM"}
                </Text>
                {!canPlayGame && !isPremium && (
                  <Text style={{ color: COLORS.bg, opacity: 0.8 }} className="text-sm mt-1">
                    Pour jouer en illimité
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
              tier={progress.tier}
              level={progress.level}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
