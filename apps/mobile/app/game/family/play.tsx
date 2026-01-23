import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getFamilyQuestions } from "../../../src/services/adventure";
import { buttonPressFeedback, playHaptic } from "../../../src/utils/feedback";
import { playSound } from "../../../src/services/sounds";
import {
  Category,
  AgeGroup,
  QuestionCount,
  getCategoryInfo,
} from "../../../src/types/adventure";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.2)",
  error: "#ef4444",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

interface Question {
  id: string;
  question_text: string;
  correct_answer: string;
  category: string;
}

export default function FamilyPlayScreen() {
  const { minAge, questionCount, category } = useLocalSearchParams<{
    minAge: string;
    questionCount: string;
    category: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentQuestion = questions[currentIndex];
  const categoryInfo = category !== "mix" ? getCategoryInfo(category as Category) : null;
  const isUnlimited = questionCount === "unlimited";
  const totalQuestions = isUnlimited ? questions.length : parseInt(questionCount);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const limit = isUnlimited ? 100 : parseInt(questionCount);
        const fetchedQuestions = await getFamilyQuestions(
          category as Category | "mix",
          parseInt(minAge),
          limit
        );
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error loading questions:", error);
        // Mock questions fallback
        setQuestions([
          {
            id: "1",
            question_text: "Quelle est la capitale de la France ?",
            correct_answer: "Paris",
            category: "geographie",
          },
          {
            id: "2",
            question_text: "Combien font 2 + 2 ?",
            correct_answer: "4",
            category: "culture_generale",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [minAge, questionCount, category]);

  const handleReveal = () => {
    buttonPressFeedback();
    playSound("buttonPress");
    setIsAnswerRevealed(true);
  };

  const handleCorrect = () => {
    buttonPressFeedback();
    playSound("correct");
    playHaptic("success");
    setScore((prev) => prev + 1);
    goToNext();
  };

  const handleIncorrect = () => {
    buttonPressFeedback();
    playSound("wrong");
    goToNext();
  };

  const goToNext = () => {
    setIsAnswerRevealed(false);

    if (currentIndex + 1 >= questions.length) {
      setGameOver(true);
      playSound("levelUp");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleExit = () => {
    buttonPressFeedback();
    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.bg }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted }} className="mt-4">
          Préparation des questions...
        </Text>
      </SafeAreaView>
    );
  }

  // Game Over Screen
  if (gameOver) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: COLORS.bg }}
      >
        <Text className="text-6xl mb-4">🎉</Text>
        <Text className="text-white text-3xl font-black text-center mb-2">
          BRAVO !
        </Text>
        <Text style={{ color: COLORS.textMuted }} className="text-center mb-8 text-lg">
          Partie terminée
        </Text>

        {/* Final Score */}
        <View
          className="w-full p-6 rounded-2xl mb-8 items-center"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text style={{ color: COLORS.textMuted }} className="text-sm mb-2">
            SCORE DU GROUPE
          </Text>
          <Text
            className="text-5xl font-black"
            style={{ color: COLORS.success }}
          >
            {score}
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-lg">
            bonnes réponses sur {questions.length}
          </Text>

          {/* Percentage */}
          <View className="mt-4 flex-row items-center">
            <View
              className="h-3 rounded-full flex-1 mr-3"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${(score / questions.length) * 100}%`,
                  backgroundColor: COLORS.success,
                }}
              />
            </View>
            <Text style={{ color: COLORS.success }} className="font-bold">
              {Math.round((score / questions.length) * 100)}%
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleExit}
          className="px-12 py-4 rounded-2xl"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
            Retour à l'accueil
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
        <Pressable
          onPress={handleExit}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-white text-xl">×</Text>
        </Pressable>

        {/* Progress */}
        <Text style={{ color: COLORS.textMuted }} className="font-medium">
          Question {currentIndex + 1}
          {!isUnlimited && `/${totalQuestions}`}
        </Text>

        {/* Score */}
        <View
          className="flex-row items-center px-4 py-2 rounded-full"
          style={{ backgroundColor: COLORS.successDim }}
        >
          <Text className="text-lg mr-2">✅</Text>
          <Text style={{ color: COLORS.success }} className="font-bold">
            {score}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-5 justify-center">
        {/* Category Badge */}
        {currentQuestion && (
          <View className="items-center mb-6">
            <View
              className="px-4 py-2 rounded-full flex-row items-center"
              style={{
                backgroundColor: COLORS.surface,
              }}
            >
              <Text className="text-xl mr-2">
                {categoryInfo?.icon ||
                  getCategoryInfo(currentQuestion.category as Category)?.icon ||
                  "🎯"}
              </Text>
              <Text style={{ color: COLORS.textMuted }} className="font-medium">
                {categoryInfo?.nameFr ||
                  getCategoryInfo(currentQuestion.category as Category)?.nameFr ||
                  "Culture Générale"}
              </Text>
            </View>
          </View>
        )}

        {/* Question Card */}
        <View
          className="rounded-3xl p-8"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Text className="text-white text-2xl font-bold text-center leading-relaxed">
            "{currentQuestion?.question_text}"
          </Text>
        </View>

        {/* Answer Section */}
        {!isAnswerRevealed ? (
          <Pressable
            onPress={handleReveal}
            className="mt-8 py-6 rounded-2xl items-center active:opacity-80"
            style={{
              backgroundColor: COLORS.primaryDim,
              borderWidth: 2,
              borderColor: COLORS.primary,
              borderStyle: "dashed",
            }}
          >
            <Text className="text-4xl mb-2">👆</Text>
            <Text style={{ color: COLORS.primary }} className="font-bold text-lg">
              TAP POUR RÉVÉLER
            </Text>
          </Pressable>
        ) : (
          <View className="mt-8">
            {/* Answer Reveal */}
            <View
              className="p-6 rounded-2xl items-center mb-6"
              style={{
                backgroundColor: COLORS.successDim,
                borderWidth: 2,
                borderColor: COLORS.success,
              }}
            >
              <Text style={{ color: COLORS.textMuted }} className="text-sm mb-2">
                RÉPONSE
              </Text>
              <Text
                className="text-2xl font-black text-center"
                style={{ color: COLORS.success }}
              >
                {currentQuestion?.correct_answer}
              </Text>
            </View>

            {/* Did someone get it? */}
            <Text
              className="text-center mb-4 font-medium"
              style={{ color: COLORS.textMuted }}
            >
              Quelqu'un a trouvé ?
            </Text>

            <View className="flex-row gap-4">
              <Pressable
                onPress={handleCorrect}
                className="flex-1 py-4 rounded-2xl items-center flex-row justify-center active:opacity-80"
                style={{ backgroundColor: COLORS.success }}
              >
                <Text className="text-2xl mr-2">✅</Text>
                <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
                  OUI +1
                </Text>
              </Pressable>

              <Pressable
                onPress={handleIncorrect}
                className="flex-1 py-4 rounded-2xl items-center flex-row justify-center active:opacity-80"
                style={{ backgroundColor: COLORS.surface }}
              >
                <Text className="text-2xl mr-2">❌</Text>
                <Text className="font-bold text-lg" style={{ color: COLORS.text }}>
                  NON
                </Text>
              </Pressable>
            </View>

            {/* Skip to next without scoring */}
            <Pressable
              onPress={goToNext}
              className="mt-4 py-3 items-center"
            >
              <Text style={{ color: COLORS.textMuted }}>
                Question suivante →
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Footer hint */}
      <View className="px-5 pb-6">
        <Text className="text-center text-sm" style={{ color: COLORS.textMuted }}>
          Le narrateur lit la question à voix haute
        </Text>
      </View>
    </SafeAreaView>
  );
}
