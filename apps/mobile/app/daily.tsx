import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  SlideInRight,
} from "react-native-reanimated";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getNextSurvivalQuestion,
  hasPlayedDailySurvivalToday,
  submitDailySurvival,
  getDailyStreak,
  getTodaysDailyQuestion,
  type DailyQuestion,
} from "../src/services/dailyChallenge";
import { correctAnswerFeedback, wrongAnswerFeedback } from "../src/utils/feedback";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_SURVIVAL_KEY = "@bighead_daily_survival";

export default function DailyBrainScreen() {
  const { user, isAnonymous } = useAuth();
  const params = useLocalSearchParams<{ fromNotification?: string }>();
  const [loading, setLoading] = useState(true);
  const [isDailyQuestion, setIsDailyQuestion] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<DailyQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const answeredQuestionIds = useRef<string[]>([]);
  const startTime = useRef<number>(Date.now());
  const questionStartTime = useRef<number>(Date.now());

  // Animation values
  const scale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    checkAndLoad();
  }, [user]);

  const checkAndLoad = async () => {
    setLoading(true);
    try {
      // Check if already played today
      if (user && !isAnonymous) {
        const { played, score: todayScore } = await hasPlayedDailySurvivalToday(user.id);
        if (played) {
          setAlreadyPlayed(true);
          setPreviousScore(todayScore || 0);
          const currentStreak = await getDailyStreak(user.id);
          setStreak(currentStreak);
          setLoading(false);
          return;
        }
      } else {
        // For anonymous users, check AsyncStorage
        const today = new Date().toISOString().split("T")[0];
        const stored = await AsyncStorage.getItem(DAILY_SURVIVAL_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.date === today) {
            setAlreadyPlayed(true);
            setPreviousScore(data.score || 0);
            setLoading(false);
            return;
          }
        }
      }

      // Start the game
      startTime.current = Date.now();

      // If coming from notification, load today's daily question first
      if (params.fromNotification === "true") {
        const dailyQ = await getTodaysDailyQuestion();
        if (dailyQ) {
          setCurrentQuestion(dailyQ);
          setQuestionNumber(1);
          setIsDailyQuestion(true);
          questionStartTime.current = Date.now();
          answeredQuestionIds.current.push(dailyQ.id);
          setLoading(false);
          return;
        }
      }

      // Otherwise load a random question
      await loadNextQuestion();
    } catch (error) {
      console.error("Error loading daily survival:", error);
    }
    setLoading(false);
  };

  const loadNextQuestion = useCallback(async () => {
    const question = await getNextSurvivalQuestion(answeredQuestionIds.current);
    if (question) {
      setCurrentQuestion(question);
      setQuestionNumber((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      questionStartTime.current = Date.now();

      // Reset progress bar animation
      progressWidth.value = 0;
    } else {
      // No more questions available - end game
      await endGame(score);
    }
  }, [score]);

  const handleAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctIndex;
    setIsCorrect(correct);

    answeredQuestionIds.current.push(currentQuestion.id);

    if (correct) {
      await correctAnswerFeedback();
      scale.value = withSequence(withSpring(1.1), withSpring(1));
      setScore((prev) => prev + 1);

      // After the daily question, continue with random questions
      if (isDailyQuestion) {
        setIsDailyQuestion(false);
      }

      // Load next question after delay
      setTimeout(() => {
        loadNextQuestion();
      }, 1000);
    } else {
      await wrongAnswerFeedback();
      // Game over on wrong answer
      setTimeout(() => {
        endGame(score);
      }, 1500);
    }
  };

  const endGame = async (finalScore: number) => {
    setGameOver(true);
    const totalTimeMs = Date.now() - startTime.current;

    // Save result
    if (user && !isAnonymous) {
      try {
        const result = await submitDailySurvival(user.id, finalScore, totalTimeMs);
        setXpEarned(result.xpEarned);
        setStreak(result.newStreak);
        setIsNewRecord(result.isNewRecord);
      } catch (error) {
        console.error("Error saving result:", error);
      }
    } else {
      // Save for anonymous users in AsyncStorage
      const today = new Date().toISOString().split("T")[0];
      await AsyncStorage.setItem(
        DAILY_SURVIVAL_KEY,
        JSON.stringify({ date: today, score: finalScore })
      );
    }
  };

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getButtonStyle = (index: number) => {
    if (selectedAnswer === null) return "bg-gray-800 border-gray-700";
    if (index === currentQuestion?.correctIndex)
      return "bg-green-500/30 border-green-500";
    if (index === selectedAnswer && !isCorrect)
      return "bg-red-500/30 border-red-500";
    return "bg-gray-800 opacity-50 border-gray-700";
  };

  // Already played today
  if (alreadyPlayed) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-primary-500/20 w-24 h-24 rounded-full items-center justify-center mb-6">
            <Text className="text-5xl">🎯</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Deja joue aujourd'hui !
          </Text>
          <Text className="text-gray-400 text-center mb-4">
            Ton score : {previousScore} points
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            Reviens demain pour un nouveau Daily Brain
          </Text>

          {/* Streak */}
          {streak > 0 && (
            <View className="bg-orange-500/20 rounded-xl px-6 py-4 mb-8">
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">🔥</Text>
                <View>
                  <Text className="text-orange-400 font-bold text-xl">
                    {streak} jours
                  </Text>
                  <Text className="text-orange-300/60 text-sm">Serie en cours</Text>
                </View>
              </View>
            </View>
          )}

          <Pressable
            onPress={() => router.back()}
            className="bg-primary-500 rounded-xl py-4 px-8"
          >
            <Text className="text-white font-bold text-lg">Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Game Over screen
  if (gameOver) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={FadeIn.duration(500)}
            className="items-center"
          >
            <View
              className={`w-28 h-28 rounded-full items-center justify-center mb-6 ${
                score >= 10 ? "bg-yellow-500/20" : "bg-primary-500/20"
              }`}
            >
              <Text className="text-6xl">{score >= 10 ? "🏆" : "💪"}</Text>
            </View>

            <Text className="text-white text-3xl font-bold text-center mb-2">
              {score >= 20 ? "Incroyable !" : score >= 10 ? "Bien joue !" : "Fin de partie"}
            </Text>

            <Text className="text-gray-400 text-center mb-6">
              {score === 0
                ? "Pas facile... Reviens demain !"
                : score === 1
                ? "1 bonne reponse"
                : `${score} bonnes reponses`}
            </Text>

            {/* Score display */}
            <View className="bg-gray-800 rounded-2xl px-8 py-6 mb-6 items-center">
              <Text className="text-gray-400 text-sm mb-1">SCORE</Text>
              <Text className="text-white text-5xl font-bold">{score}</Text>
              {isNewRecord && (
                <View className="bg-yellow-500/20 rounded-full px-4 py-1 mt-2">
                  <Text className="text-yellow-400 font-bold">
                    Nouveau record !
                  </Text>
                </View>
              )}
            </View>

            {/* XP earned */}
            {xpEarned > 0 && (
              <View className="bg-primary-500/20 rounded-xl px-6 py-3 mb-4">
                <Text className="text-primary-400 font-bold text-lg">
                  +{xpEarned} XP
                </Text>
              </View>
            )}

            {/* Streak */}
            {streak > 0 && (
              <View className="bg-orange-500/20 rounded-xl px-6 py-4 mb-8">
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-3">🔥</Text>
                  <View>
                    <Text className="text-orange-400 font-bold text-xl">
                      {streak} jours
                    </Text>
                    <Text className="text-orange-300/60 text-sm">
                      Serie en cours
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Anonymous prompt */}
            {isAnonymous && (
              <Pressable
                onPress={() => router.push("/profile")}
                className="bg-gray-800 rounded-xl p-4 mb-6"
              >
                <Text className="text-gray-400 text-center text-sm">
                  Cree un compte pour sauvegarder ton score et ta serie 🔥
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.back()}
              className="bg-primary-500 rounded-xl py-4 px-8"
            >
              <Text className="text-white font-bold text-lg">Retour</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Loading
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-gray-400 mt-4">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No question available
  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">🎯</Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
            Aucune question disponible
          </Text>
          <Text className="text-gray-400 text-center mb-8">
            Reviens plus tard !
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-primary-500 rounded-xl py-4 px-8"
          >
            <Text className="text-white font-bold">Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Game in progress
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 mb-4">
          <Pressable onPress={() => router.back()} className="p-2">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>

          <View className="flex-row items-center">
            <View className="bg-gray-800 rounded-full px-4 py-2 mr-3">
              <Text className="text-white font-bold">Q{questionNumber}</Text>
            </View>
            <View className="bg-primary-500/20 rounded-full px-4 py-2">
              <Text className="text-primary-400 font-bold">{score} pts</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <View className="px-6 mb-6">
          <Text className="text-primary-400 text-sm font-bold mb-1">
            DAILY BRAIN
          </Text>
          <Text className="text-white text-xl font-bold">
            {isDailyQuestion ? "Question du jour" : "Mode Survie"} - 1 erreur = fin
          </Text>
        </View>

        {/* Question */}
        <Animated.View
          key={currentQuestion.id}
          entering={SlideInRight.duration(300)}
          className="px-6 mb-6"
        >
          <View className="bg-gray-800 rounded-2xl p-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-primary-400 text-sm font-bold uppercase">
                {currentQuestion.category}
              </Text>
              <Text className="text-gray-500 text-sm">
                Diff. {currentQuestion.difficulty}
              </Text>
            </View>
            <Text className="text-white text-lg text-center leading-7">
              {currentQuestion.question}
            </Text>
          </View>
        </Animated.View>

        {/* Options */}
        <View className="px-6 flex-1">
          {currentQuestion.answers.map((answer, index) => (
            <Animated.View
              key={`${currentQuestion.id}-${index}`}
              entering={SlideInRight.duration(300).delay(index * 50)}
            >
              <Pressable
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`rounded-xl p-4 mb-3 border-2 ${getButtonStyle(index)}`}
              >
                <Animated.View
                  style={
                    selectedAnswer === index && isCorrect
                      ? animatedScaleStyle
                      : undefined
                  }
                  className="flex-row items-center"
                >
                  <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center mr-3">
                    <Text className="text-white font-bold">
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text className="text-white flex-1 text-base">{answer}</Text>
                  {selectedAnswer !== null &&
                    index === currentQuestion.correctIndex && (
                      <Text className="text-green-400 text-xl">✓</Text>
                    )}
                  {selectedAnswer === index && !isCorrect && (
                    <Text className="text-red-400 text-xl">✗</Text>
                  )}
                </Animated.View>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Feedback message */}
        {selectedAnswer !== null && (
          <View className="px-6 pb-6">
            <View
              className={`rounded-xl p-4 ${
                isCorrect ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              <Text
                className={`text-center font-bold text-lg ${
                  isCorrect ? "text-green-400" : "text-red-400"
                }`}
              >
                {isCorrect ? "Correct ! Question suivante..." : "Perdu !"}
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
