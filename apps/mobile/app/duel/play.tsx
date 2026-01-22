import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  getDuel,
  getDuelQuestions,
  submitDuelAnswer,
  subscribeToDuel,
  finishDuel,
  type Duel,
  type DuelQuestion,
} from "../../src/services/duel";
import { correctAnswerFeedback, wrongAnswerFeedback } from "../../src/utils/feedback";

export default function DuelPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [duel, setDuel] = useState<Duel | null>(null);
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const startTime = useRef<number>(Date.now());

  // Animation values
  const scale = useSharedValue(1);
  const resultOpacity = useSharedValue(0);

  const isHost = duel?.host_id === user?.id;

  useEffect(() => {
    if (!id) return;

    const loadGame = async () => {
      try {
        const [duelData, questionsData] = await Promise.all([
          getDuel(id),
          getDuelQuestions(id),
        ]);
        setDuel(duelData);
        setQuestions(questionsData);
        startTime.current = Date.now();
      } catch (error) {
        console.error("Error loading game:", error);
      }
      setLoading(false);
    };
    loadGame();

    // Subscribe to duel updates
    const channel = subscribeToDuel(id, (updatedDuel) => {
      setDuel(updatedDuel);
      if (updatedDuel.status === "finished") {
        router.replace(`/duel/result?id=${id}`);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [id]);

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer || !duel || !user || !questions[currentRound]) return;

    setSelectedAnswer(answer);
    const answerTimeMs = Date.now() - startTime.current;

    try {
      const result = await submitDuelAnswer(
        duel.id,
        user.id,
        currentRound + 1,
        answer,
        answerTimeMs
      );

      setIsCorrect(result.isCorrect);

      if (result.isCorrect) {
        await correctAnswerFeedback();
        scale.value = withSequence(withSpring(1.1), withSpring(1));
      } else {
        await wrongAnswerFeedback();
      }

      resultOpacity.value = withTiming(1, { duration: 300 });

      // Wait then go to next round
      setTimeout(() => {
        if (currentRound + 1 >= questions.length) {
          // Finish duel
          finishDuel(duel.id);
        } else {
          setCurrentRound(currentRound + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
          resultOpacity.value = 0;
          startTime.current = Date.now();
        }
      }, 2000);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const animatedResultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const getButtonStyle = (option: string) => {
    if (!selectedAnswer) return "bg-gray-800";
    const currentQ = questions[currentRound];
    if (option === currentQ?.options.correct) return "bg-green-500/30 border-green-500";
    if (option === selectedAnswer && !isCorrect) return "bg-red-500/30 border-red-500";
    return "bg-gray-800 opacity-50";
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-gray-400 mt-4">Chargement du duel...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!duel || questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">❌</Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
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

  const currentQuestion = questions[currentRound];

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header with scores */}
        <View className="flex-row items-center justify-between px-6 pt-4 mb-4">
          <View className="items-center">
            <Text className="text-primary-400 text-xs">TOI</Text>
            <Text className="text-white text-2xl font-bold">
              {isHost ? duel.host_score : duel.guest_score}
            </Text>
          </View>

          <View className="items-center">
            <Text className="text-gray-400 text-xs">ROUND</Text>
            <Text className="text-white text-xl font-bold">
              {currentRound + 1}/{questions.length}
            </Text>
          </View>

          <View className="items-center">
            <Text className="text-red-400 text-xs">ADVERSAIRE</Text>
            <Text className="text-white text-2xl font-bold">
              {isHost ? duel.guest_score : duel.host_score}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="px-6 mb-6">
          <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary-500"
              style={{ width: `${((currentRound + 1) / questions.length) * 100}%` }}
            />
          </View>
        </View>

        {/* Question */}
        <View className="px-6 mb-6">
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

        {/* Result indicator */}
        {selectedAnswer && (
          <Animated.View style={animatedResultStyle} className="px-6 pb-6">
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
                {isCorrect ? "✓ Bonne réponse !" : "✗ Mauvaise réponse"}
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                C'était {currentQuestion.player_name}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
