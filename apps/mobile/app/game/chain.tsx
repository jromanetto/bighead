import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import { useGameStore } from "../../src/stores/gameStore";
import {
  getQuestions,
  formatQuestionsForGame,
} from "../../src/services/questions";

export default function ChainGameScreen() {
  // Use shallow selectors for state only
  const status = useGameStore((state) => state.status);
  const score = useGameStore((state) => state.score);
  const chain = useGameStore((state) => state.chain);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const currentQuestionIndex = useGameStore((state) => state.currentQuestionIndex);
  const questions = useGameStore((state) => state.questions);
  const totalQuestions = useGameStore((state) => state.totalQuestions);
  const answers = useGameStore((state) => state.answers);

  const currentQuestion = questions[currentQuestionIndex];
  const lastAnswer = answers[answers.length - 1];
  const hasAnswered = lastAnswer?.questionId === currentQuestion?.id;
  const progress = {
    current: currentQuestionIndex + 1,
    total: totalQuestions,
    percentage: totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0,
  };

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);

  // Load questions on mount
  useEffect(() => {
    mounted.current = true;
    loadQuestions();

    return () => {
      mounted.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      useGameStore.getState().reset();
    };
  }, []);

  const loadQuestions = async () => {
    try {
      const fetchedQuestions = await getQuestions({ count: 10 });
      const formatted = formatQuestionsForGame(fetchedQuestions);

      if (!mounted.current) return;

      useGameStore.getState().initGame({
        mode: "chain_solo",
        questions: formatted,
        timePerQuestion: 15,
      });

      setTimeout(() => {
        if (mounted.current) {
          useGameStore.getState().startGame();
        }
      }, 500);
    } catch (error) {
      console.error("Error loading questions:", error);

      if (!mounted.current) return;

      // Fallback to mock questions
      const mockQuestions = [
        { id: "1", categoryId: "1", difficulty: 1, question: "Quelle est la capitale de l'Australie?", answers: ["Sydney", "Melbourne", "Canberra", "Perth"], correctIndex: 2, explanation: null },
        { id: "2", categoryId: "1", difficulty: 1, question: "En quelle année a eu lieu la Révolution française?", answers: ["1776", "1789", "1804", "1815"], correctIndex: 1, explanation: null },
        { id: "3", categoryId: "2", difficulty: 1, question: "Quel est le symbole chimique de l'or?", answers: ["Or", "Au", "Ag", "Fe"], correctIndex: 1, explanation: null },
        { id: "4", categoryId: "3", difficulty: 1, question: "Combien de joueurs y a-t-il dans une équipe de football?", answers: ["10", "11", "12", "9"], correctIndex: 1, explanation: null },
        { id: "5", categoryId: "4", difficulty: 1, question: "Qui a chanté 'Thriller'?", answers: ["Prince", "Michael Jackson", "Madonna", "Whitney Houston"], correctIndex: 1, explanation: null },
      ];

      useGameStore.getState().initGame({
        mode: "chain_solo",
        questions: mockQuestions,
        timePerQuestion: 15,
      });

      setTimeout(() => {
        if (mounted.current) {
          useGameStore.getState().startGame();
        }
      }, 500);
    }
  };

  // Timer effect
  useEffect(() => {
    if (status === "playing") {
      timerRef.current = setInterval(() => {
        useGameStore.getState().tick();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  // Navigate to results when game ends
  useEffect(() => {
    if (status === "finished") {
      const state = useGameStore.getState();
      router.replace({
        pathname: "/game/result",
        params: {
          score: state.score.toString(),
          correct: state.correctCount.toString(),
          total: state.totalQuestions.toString(),
          maxChain: state.maxChain.toString(),
        },
      });
    }
  }, [status]);

  const handleAnswer = (index: number) => {
    if (status !== "playing" || hasAnswered) return;
    useGameStore.getState().answerQuestion(index);
  };

  const handleNextQuestion = () => {
    useGameStore.getState().nextQuestion();
  };

  const handleExit = () => {
    useGameStore.getState().reset();
    router.back();
  };

  const getChainColor = (chainValue: number) => {
    if (chainValue >= 10) return "bg-red-600";
    if (chainValue >= 8) return "bg-orange-600";
    if (chainValue >= 5) return "bg-purple-500";
    if (chainValue >= 3) return "bg-blue-500";
    if (chainValue >= 2) return "bg-green-500";
    return "bg-gray-500";
  };

  const getChainMultiplier = (chainValue: number): number => {
    if (chainValue >= 10) return 10;
    if (chainValue >= 8) return 8;
    if (chainValue >= 5) return 5;
    if (chainValue >= 3) return 3;
    if (chainValue >= 2) return 2;
    return 1;
  };

  // Loading state
  if (status === "loading" || status === "idle" || !currentQuestion) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="text-white mt-4 text-lg">Chargement des questions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Pressable onPress={handleExit} className="p-2">
            <Text className="text-white text-2xl">×</Text>
          </Pressable>
          <Text className="text-white text-lg font-medium">
            Question {progress.current}/{progress.total}
          </Text>
          <View className={`${getChainColor(chain)} rounded-full px-4 py-2 min-w-[60px] items-center`}>
            <Text className="text-white font-bold text-lg">
              {getChainMultiplier(chain)}x
            </Text>
          </View>
        </View>

        {/* Score & Timer */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-gray-400 text-sm">Score</Text>
            <Text className="text-white text-3xl font-bold">{score}</Text>
          </View>
          <View className={`rounded-full w-16 h-16 items-center justify-center ${timeRemaining <= 5 ? "bg-red-500" : "bg-gray-700"}`}>
            <Text className="text-white text-2xl font-bold">{timeRemaining}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
          <View className="h-full bg-primary-500 rounded-full" style={{ width: `${progress.percentage}%` }} />
        </View>

        {/* Question */}
        <View className="bg-gray-800 rounded-2xl p-6 mb-6">
          <Text className="text-white text-xl text-center leading-7">
            {currentQuestion.question}
          </Text>
        </View>

        {/* Answers */}
        <View className="gap-3">
          {currentQuestion.answers.map((answer, index) => {
            let bgColor = "bg-gray-700";
            let borderColor = "border-transparent";

            if (hasAnswered) {
              if (index === currentQuestion.correctIndex) {
                bgColor = "bg-green-600";
                borderColor = "border-green-400";
              } else if (lastAnswer?.selectedAnswer === answer && index !== currentQuestion.correctIndex) {
                bgColor = "bg-red-600";
                borderColor = "border-red-400";
              }
            }

            return (
              <Pressable
                key={index}
                onPress={() => handleAnswer(index)}
                className={`${bgColor} border-2 ${borderColor} rounded-xl py-4 px-6 active:opacity-80`}
                disabled={hasAnswered}
              >
                <Text className="text-white text-lg text-center">{answer}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Result feedback & Next button */}
        {hasAnswered && lastAnswer && (
          <View className="mt-6">
            <View className={`rounded-xl py-3 px-4 mb-4 ${lastAnswer.isCorrect ? "bg-green-900/50" : "bg-red-900/50"}`}>
              <Text className={`text-center font-bold text-lg ${lastAnswer.isCorrect ? "text-green-400" : "text-red-400"}`}>
                {lastAnswer.isCorrect ? `+${lastAnswer.pointsEarned} points!` : "Mauvaise réponse!"}
              </Text>
              {lastAnswer.isCorrect && chain > 1 && (
                <Text className="text-center text-green-300 text-sm mt-1">
                  Chain x{getChainMultiplier(chain)}!
                </Text>
              )}
              {!lastAnswer.isCorrect && (
                <Text className="text-center text-gray-400 text-sm mt-1">Chain reset</Text>
              )}
            </View>

            <Pressable onPress={handleNextQuestion} className="bg-primary-500 rounded-xl py-4 px-6 active:opacity-80">
              <Text className="text-white text-lg text-center font-bold">
                {progress.current >= progress.total ? "Voir les résultats" : "Question suivante"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
