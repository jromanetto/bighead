import { View, Text, Pressable, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useCallback } from "react";
import { buttonPressFeedback } from "../../../src/utils/feedback";
import { useAuth } from "../../../src/contexts/AuthContext";
import { LimitReachedModal, LimitReachedModalRef } from "../../../src/components/LimitReachedModal";
import { canPlay, getRemainingPlays, DAILY_LIMITS } from "../../../src/services/dailyLimits";
import {
  Category,
  AgeGroup,
  QuestionCount,
  CATEGORIES,
  AGE_GROUPS,
  QUESTION_COUNTS,
} from "../../../src/types/adventure";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function FamilyConfigScreen() {
  const { isPremium } = useAuth();
  const [selectedAge, setSelectedAge] = useState<AgeGroup>(12);
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(20);
  const [selectedCategory, setSelectedCategory] = useState<Category | "mix">("mix");
  const [canPlayGame, setCanPlayGame] = useState(true);
  const [remaining, setRemaining] = useState<number>(DAILY_LIMITS.family);
  const limitModalRef = useRef<LimitReachedModalRef>(null);

  // Load daily limits when screen focuses
  useFocusEffect(
    useCallback(() => {
      const loadLimits = async () => {
        const canPlayNow = await canPlay("family");
        const remainingPlays = await getRemainingPlays("family");
        setCanPlayGame(isPremium || canPlayNow);
        setRemaining(remainingPlays);
      };
      loadLimits();
    }, [isPremium])
  );

  const handleStart = () => {
    buttonPressFeedback();
    // Check limits before starting
    if (!canPlayGame && !isPremium) {
      limitModalRef.current?.open("family");
      return;
    }
    router.push({
      pathname: "/game/family/play",
      params: {
        minAge: selectedAge.toString(),
        questionCount: selectedCount.toString(),
        category: selectedCategory,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 mb-6">
        <View className="flex-row items-center">
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
          <View>
            <Text className="text-white text-2xl font-black">👨‍👩‍👧‍👦 MODE FAMILLE</Text>
            <Text style={{ color: COLORS.textMuted }} className="text-xs">
              Quiz à voix haute en groupe
            </Text>
          </View>
        </View>
        {/* Plays Counter */}
        {!isPremium && (
          <View
            className="flex-row items-center px-3 py-2 rounded-xl"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-lg mr-2">🎯</Text>
            <Text style={{ color: canPlayGame ? COLORS.primary : "#ef4444" }}>
              {remaining}/{DAILY_LIMITS.family}
            </Text>
          </View>
        )}
        {isPremium && (
          <View
            className="flex-row items-center px-3 py-2 rounded-xl"
            style={{ backgroundColor: "rgba(255, 209, 0, 0.15)" }}
          >
            <Text className="text-lg mr-2">👑</Text>
            <Text style={{ color: "#FFD700" }}>Illimité</Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Age Selection */}
        <View className="mb-8">
          <Text className="text-white font-bold mb-3">Âge minimum des joueurs</Text>
          <Text style={{ color: COLORS.textMuted }} className="text-sm mb-4">
            Les questions seront adaptées à cet âge
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {AGE_GROUPS.map((age) => (
              <Pressable
                key={age.value}
                onPress={() => {
                  buttonPressFeedback();
                  setSelectedAge(age.value);
                }}
                className="px-4 py-3 rounded-xl"
                style={{
                  backgroundColor:
                    selectedAge === age.value ? COLORS.primary : COLORS.surface,
                  borderWidth: 1,
                  borderColor:
                    selectedAge === age.value
                      ? COLORS.primary
                      : "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  className="font-bold"
                  style={{
                    color: selectedAge === age.value ? COLORS.bg : COLORS.text,
                  }}
                >
                  {age.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Question Count */}
        <View className="mb-8">
          <Text className="text-white font-bold mb-3">Nombre de questions</Text>
          <View className="flex-row gap-2">
            {QUESTION_COUNTS.map((count) => (
              <Pressable
                key={count.value}
                onPress={() => {
                  buttonPressFeedback();
                  setSelectedCount(count.value);
                }}
                className="flex-1 py-4 rounded-xl items-center"
                style={{
                  backgroundColor:
                    selectedCount === count.value ? COLORS.primary : COLORS.surface,
                  borderWidth: 1,
                  borderColor:
                    selectedCount === count.value
                      ? COLORS.primary
                      : "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  className="font-bold text-lg"
                  style={{
                    color: selectedCount === count.value ? COLORS.bg : COLORS.text,
                  }}
                >
                  {count.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Category Selection */}
        <View className="mb-8">
          <Text className="text-white font-bold mb-3">Catégorie</Text>

          {/* Mix Option - Featured */}
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              setSelectedCategory("mix");
            }}
            className="p-5 rounded-2xl mb-4 flex-row items-center"
            style={{
              backgroundColor: selectedCategory === "mix" ? COLORS.primaryDim : COLORS.surface,
              borderWidth: 2,
              borderColor: selectedCategory === "mix" ? COLORS.primary : "rgba(255,255,255,0.1)",
            }}
          >
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mr-4"
              style={{
                backgroundColor: selectedCategory === "mix"
                  ? `${COLORS.primary}30`
                  : "rgba(255,255,255,0.1)",
              }}
            >
              <Text className="text-3xl">🎲</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">Mix de tout</Text>
              <Text style={{ color: COLORS.textMuted }} className="text-sm">
                Recommandé - Questions variées
              </Text>
            </View>
            {selectedCategory === "mix" && (
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text style={{ color: COLORS.bg }} className="font-bold">✓</Text>
              </View>
            )}
          </Pressable>

          {/* Categories Grid */}
          <View className="flex-row flex-wrap">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.code}
                onPress={() => {
                  buttonPressFeedback();
                  setSelectedCategory(cat.code);
                }}
                className="w-[48%] m-[1%] p-4 rounded-2xl"
                style={{
                  backgroundColor:
                    selectedCategory === cat.code ? `${cat.color}20` : COLORS.surface,
                  borderWidth: 2,
                  borderColor:
                    selectedCategory === cat.code ? cat.color : "rgba(255,255,255,0.08)",
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: `${cat.color}25`,
                    }}
                  >
                    <Text className="text-xl">{cat.icon}</Text>
                  </View>
                  {selectedCategory === cat.code && (
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Text style={{ color: COLORS.bg }} className="text-xs font-bold">✓</Text>
                    </View>
                  )}
                </View>
                <Text
                  className="font-bold"
                  style={{
                    color: selectedCategory === cat.code ? cat.color : COLORS.text,
                  }}
                >
                  {cat.nameFr}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View
          className="p-4 rounded-2xl mb-6"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Text className="text-white font-bold mb-2">Comment jouer ?</Text>
          <View className="gap-2">
            <View className="flex-row items-start">
              <Text style={{ color: COLORS.primary }} className="mr-2">1.</Text>
              <Text style={{ color: COLORS.textMuted }}>
                Le narrateur lit la question à voix haute
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text style={{ color: COLORS.primary }} className="mr-2">2.</Text>
              <Text style={{ color: COLORS.textMuted }}>
                Les autres joueurs répondent oralement
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text style={{ color: COLORS.primary }} className="mr-2">3.</Text>
              <Text style={{ color: COLORS.textMuted }}>
                Tap pour révéler la réponse
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text style={{ color: COLORS.primary }} className="mr-2">4.</Text>
              <Text style={{ color: COLORS.textMuted }}>
                Comptez les bonnes réponses du groupe !
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View className="px-5 pb-8">
        <Pressable
          onPress={handleStart}
          className="py-5 rounded-2xl items-center active:opacity-80"
          style={{ backgroundColor: canPlayGame || isPremium ? COLORS.primary : "#FFD700" }}
        >
          <Text className="text-xl font-black" style={{ color: COLORS.bg }}>
            {canPlayGame || isPremium ? "🎉 C'EST PARTI !" : "👑 PASSER PREMIUM"}
          </Text>
        </Pressable>
      </View>

      {/* Limit Reached Modal */}
      <LimitReachedModal ref={limitModalRef} />
    </SafeAreaView>
  );
}
