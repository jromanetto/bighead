import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { buttonPressFeedback } from "../../../src/utils/feedback";
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
  const [selectedAge, setSelectedAge] = useState<AgeGroup>(12);
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(20);
  const [selectedCategory, setSelectedCategory] = useState<Category | "mix">("mix");

  const handleStart = () => {
    buttonPressFeedback();
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
        <View>
          <Text className="text-white text-2xl font-black">👨‍👩‍👧‍👦 MODE FAMILLE</Text>
          <Text style={{ color: COLORS.textMuted }} className="text-xs">
            Quiz à voix haute en groupe
          </Text>
        </View>
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

          {/* Mix Option */}
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              setSelectedCategory("mix");
            }}
            className="p-4 rounded-xl mb-3 flex-row items-center"
            style={{
              backgroundColor: selectedCategory === "mix" ? COLORS.primaryDim : COLORS.surface,
              borderWidth: 2,
              borderColor: selectedCategory === "mix" ? COLORS.primary : "rgba(255,255,255,0.1)",
            }}
          >
            <Text className="text-3xl mr-4">🎲</Text>
            <View className="flex-1">
              <Text className="text-white font-bold">Mix de tout</Text>
              <Text style={{ color: COLORS.textMuted }} className="text-sm">
                Recommandé - Questions variées
              </Text>
            </View>
            {selectedCategory === "mix" && (
              <Text style={{ color: COLORS.primary }} className="text-xl">
                ✓
              </Text>
            )}
          </Pressable>

          {/* Categories */}
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.code}
                onPress={() => {
                  buttonPressFeedback();
                  setSelectedCategory(cat.code);
                }}
                className="px-3 py-2 rounded-xl flex-row items-center"
                style={{
                  backgroundColor:
                    selectedCategory === cat.code ? `${cat.color}30` : COLORS.surface,
                  borderWidth: 1,
                  borderColor:
                    selectedCategory === cat.code ? cat.color : "rgba(255,255,255,0.1)",
                }}
              >
                <Text className="text-lg mr-2">{cat.icon}</Text>
                <Text
                  className="font-medium"
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
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-xl font-black" style={{ color: COLORS.bg }}>
            🎉 C'EST PARTI !
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
