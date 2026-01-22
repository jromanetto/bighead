import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  getTournamentQuestions,
  submitTournamentResult,
  type TournamentQuestion,
} from "../../src/services/tournament";
import { correctAnswerFeedback, wrongAnswerFeedback } from "../../src/utils/feedback";

export default function TournamentPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<TournamentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);

  const questionStartTime = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation
  const timerWidth = useSharedValue(100);

  useEffect(() => {
    if (!id) return;

    const loadQuestions = async () => {
      try {
        const data = await getTournamentQuestions(id);
        setQuestions(data);
        startTimer();
      } catch (error) {
        console.error("Error loading questions:", error);
      }
      setLoading(false);
    };
    loadQuestions();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const startTimer = () => {
    questionStartTime.current = Date.now();
    setTimeLeft(15);
    timerWidth.value = withTiming(0, { duration: 15000 });

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit wrong answer
          handleAnswer("timeout");
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer) return;

    stopTimer();
    setSelectedAnswer(answer);

    const currentQuestion = questions[currentIndex];
    const answerTimeMs = Date.now() - questionStartTime.current;
    const correct = answer === currentQuestion.options.correct;

    setIsCorrect(correct);
    setTotalTimeMs((prev) => prev + answerTimeMs);

    if (correct) {
      await correctAnswerFeedback();
      // Score based on speed (faster = more points)
      const timeBonus = Math.max(0, 15000 - answerTimeMs);
      const questionScore = 100 + Math.floor(timeBonus / 100);
      setScore((prev) => prev + questionScore);
      setCorrectCount((prev) => prev + 1);
    } else {
      await wrongAnswerFeedback();
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        finishTournament();
      } else {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        timerWidth.value = 100;
        startTimer();
      }
    }, 1500);
  };

  const finishTournament = async () => {
    if (!id) return;

    try {
      const result = await submitTournamentResult(
        id,
        score,
        correctCount,
        totalTimeMs
      );
      router.replace(
        `/tournament/result?id=${id}&rank=${result.rank}&total=${result.totalParticipants}&score=${score}`
      );
    } catch (error) {
      console.error("Error submitting result:", error);
      router.replace("/tournament");
    }
  };

  const timerStyle = useAnimatedStyle(() => ({
    width: `${timerWidth.value}%`,
  }));

  const getButtonStyle = (option: string) => {
    if (!selectedAnswer) return "bg-gray-800";
    const currentQ = questions[currentIndex];
    if (option === currentQ?.options.correct) return "bg-green-500/30 border-green-500";
    if (option === selectedAnswer && !isCorrect) return "bg-red-500/30 border-red-500";
    return "bg-gray-800 opacity-50";
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-gray-400 mt-4">Chargement du tournoi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">❌</Text>
          <Text className="text-white text-xl font-bold text-center">
            Erreur de chargement
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-primary-500 rounded-xl py-4 px-8 mt-6"
          >
            <Text className="text-white font-bold">Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400">
              Question {currentIndex + 1}/{questions.length}
            </Text>
            <Text className="text-yellow-400 font-bold">
              Score: {score}
            </Text>
          </View>

          {/* Timer Bar */}
          <View className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
            <Animated.View
              style={timerStyle}
              className={`h-full ${timeLeft <= 5 ? "bg-red-500" : "bg-primary-500"}`}
            />
          </View>

          <Text
            className={`text-center font-bold ${
              timeLeft <= 5 ? "text-red-400" : "text-gray-400"
            }`}
          >
            {timeLeft}s
          </Text>
        </View>

        {/* Question */}
        <View className="px-6 py-6">
          <View className="bg-gray-800 rounded-2xl p-6">
            <Text className="text-gray-400 text-center text-sm mb-2">
              QUI EST-CE ?
            </Text>
            <Text className="text-white text-lg text-center leading-7">
              {currentQuestion.question_text}
            </Text>
          </View>
        </View>

        {/* Options */}
        <View className="px-6 flex-1">
          {["A", "B", "C", "D"].map((key) => {
            const option = currentQuestion.options[key as keyof typeof currentQuestion.options];
            if (key === "correct") return null;
            return (
              <Pressable
                key={key}
                onPress={() => handleAnswer(key)}
                disabled={!!selectedAnswer}
                className={`rounded-xl p-4 mb-3 border-2 border-transparent ${getButtonStyle(key)}`}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center mr-3">
                    <Text className="text-white font-bold">{key}</Text>
                  </View>
                  <Text className="text-white flex-1">{option}</Text>
                  {selectedAnswer && key === currentQuestion.options.correct && (
                    <Text className="text-green-400">✓</Text>
                  )}
                  {selectedAnswer === key && !isCorrect && (
                    <Text className="text-red-400">✗</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Answer feedback */}
        {selectedAnswer && (
          <View className="px-6 pb-6">
            <View
              className={`rounded-xl p-3 ${
                isCorrect ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              <Text
                className={`text-center font-bold ${
                  isCorrect ? "text-green-400" : "text-red-400"
                }`}
              >
                {isCorrect ? "✓ Correct !" : `✗ C'était ${currentQuestion.player_name}`}
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
