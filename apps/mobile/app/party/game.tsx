import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../../src/stores/gameStore";
import {
  getQuestions,
  formatQuestionsForGame,
} from "../../src/services/questions";
import { getSettings } from "../../src/services/settings";
import { playSound } from "../../src/services/sounds";

export default function PartyGameScreen() {
  const { players: playersParam, questionCount: questionCountParam } =
    useLocalSearchParams<{
      players: string;
      questionCount: string;
    }>();

  const players: string[] = playersParam
    ? JSON.parse(playersParam)
    : ["Player 1", "Player 2"];
  const questionCount = Number(questionCountParam) || 10;

  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const mounted = useRef(true);

  // Use individual primitive selectors only
  const status = useGameStore((state) => state.status);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const questions = useGameStore((state) => state.questions);
  const currentQuestionIndex = useGameStore((state) => state.currentQuestionIndex);
  const totalQuestions = useGameStore((state) => state.totalQuestions);
  const allPlayers = useGameStore((state) => state.players);
  const answers = useGameStore((state) => state.answers);

  // Compute derived values
  const currentQuestion = questions[currentQuestionIndex];
  const currentPlayer = allPlayers[currentPlayerIndex];
  const lastAnswer = answers[answers.length - 1];
  const progress = {
    current: currentQuestionIndex + 1,
    total: totalQuestions,
    percentage: totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0,
  };

  // Load questions on mount
  useEffect(() => {
    mounted.current = true;
    loadQuestions();
    return () => {
      mounted.current = false;
      useGameStore.getState().reset();
    };
  }, []);

  const loadQuestions = async () => {
    try {
      // Get user's language preference
      const settings = await getSettings();
      const language = settings.language || "fr";

      const questions = await getQuestions({ count: questionCount, language });
      const formatted = formatQuestionsForGame(questions);

      if (!mounted.current) return;

      useGameStore.getState().initGame({
        mode: "party",
        questions: formatted,
        players: players,
        timePerQuestion: 20,
      });
    } catch (error) {
      console.error("Error loading questions:", error);

      if (!mounted.current) return;

      // Fallback to mock questions
      const mockQuestions = [
        {
          id: "1",
          categoryId: "1",
          category: "Geography",
          difficulty: 1,
          question: "Which country has the most time zones?",
          answers: ["Russia", "United States", "France", "China"],
          correctIndex: 2,
          explanation: null,
          imageUrl: null,
          imageCredit: null,
        },
        {
          id: "2",
          categoryId: "1",
          category: "Geography",
          difficulty: 1,
          question: "What is the capital of Australia?",
          answers: ["Sydney", "Melbourne", "Canberra", "Perth"],
          correctIndex: 2,
          explanation: null,
          imageUrl: null,
          imageCredit: null,
        },
        {
          id: "3",
          categoryId: "2",
          category: "History",
          difficulty: 1,
          question: "In what year did the French Revolution begin?",
          answers: ["1776", "1789", "1804", "1815"],
          correctIndex: 1,
          explanation: null,
          imageUrl: null,
          imageCredit: null,
        },
        {
          id: "4",
          categoryId: "3",
          category: "Science",
          difficulty: 1,
          question: "What is the chemical symbol for gold?",
          answers: ["Or", "Au", "Ag", "Fe"],
          correctIndex: 1,
          explanation: null,
          imageUrl: null,
          imageCredit: null,
        },
        {
          id: "5",
          categoryId: "4",
          category: "Music",
          difficulty: 1,
          question: "Who sang 'Thriller'?",
          answers: ["Prince", "Michael Jackson", "Madonna", "Whitney Houston"],
          correctIndex: 1,
          explanation: null,
          imageUrl: null,
          imageCredit: null,
        },
      ];

      useGameStore.getState().initGame({
        mode: "party",
        questions: mockQuestions.slice(0, questionCount),
        players: players,
        timePerQuestion: 20,
      });
    }
  };

  // Navigate to results when game ends
  useEffect(() => {
    if (status === "finished") {
      const state = useGameStore.getState();
      router.replace({
        pathname: "/party/result",
        params: {
          players: JSON.stringify(state.players),
        },
      });
    }
  }, [status]);

  const handleReady = () => {
    setWaitingForPlayer(false);
    if (status === "loading") {
      useGameStore.getState().startGame();
    }
  };

  const handleAnswer = (index: number) => {
    if (status !== "playing" || lastAnswer?.questionId === currentQuestion?.id)
      return;

    // Play sound based on answer
    const isCorrect = index === currentQuestion?.correctIndex;
    if (isCorrect) {
      playSound("correct");
    } else {
      playSound("wrong");
    }

    useGameStore.getState().answerQuestion(index);
  };

  const handleNextTurn = () => {
    setWaitingForPlayer(true);
    useGameStore.getState().nextQuestion();
  };

  const handleExit = () => {
    useGameStore.getState().reset();
    router.back();
  };

  const hasAnswered = lastAnswer?.questionId === currentQuestion?.id;

  // Sort players by score for mini leaderboard
  const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);

  // Loading state
  if (status === "idle" || (status === "loading" && !currentPlayer)) {
    return (
      <SafeAreaView className="flex-1 bg-accent-600 items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4 text-lg">
          Loading questions...
        </Text>
      </SafeAreaView>
    );
  }

  // Waiting screen - show who's turn it is
  if (waitingForPlayer) {
    return (
      <SafeAreaView className="flex-1 bg-accent-600">
        <View className="flex-1 items-center justify-center px-6">
          {/* Progress */}
          <Text className="text-white/60 text-lg mb-2">
            Question {progress.current}/{progress.total}
          </Text>

          {/* Hand off message */}
          <Text className="text-white text-xl mb-2">Pass the phone to</Text>
          <Text className="text-white text-5xl font-bold mb-8">
            {currentPlayer?.name || players[currentPlayerIndex]}
          </Text>

          {/* Mini scoreboard */}
          <View className="bg-white/10 rounded-xl p-4 w-full mb-8">
            <Text className="text-white/60 text-sm text-center mb-3">
              Leaderboard
            </Text>
            {sortedPlayers.slice(0, 4).map((player, index) => (
              <View
                key={player.name}
                className={`flex-row justify-between items-center py-2 ${
                  player.name === currentPlayer?.name
                    ? "bg-white/10 rounded-lg px-2 -mx-2"
                    : ""
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-white/60 w-6">{index + 1}.</Text>
                  <Text className="text-white font-medium">{player.name}</Text>
                  {player.name === currentPlayer?.name && (
                    <Text className="text-white/60 ml-2">←</Text>
                  )}
                </View>
                <Text className="text-white font-bold">{player.score}</Text>
              </View>
            ))}
          </View>

          {/* Ready button */}
          <Pressable
            onPress={handleReady}
            className="bg-white rounded-2xl py-4 px-16 active:opacity-80"
          >
            <Text className="text-accent-600 text-xl font-bold">
              I'm ready!
            </Text>
          </Pressable>

          {/* Exit button */}
          <Pressable onPress={handleExit} className="mt-6 p-2">
            <Text className="text-white/60">Exit game</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Question screen
  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-accent-500 items-center justify-center mr-3">
              <Text className="text-white font-bold">
                {currentPlayer?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className="text-accent-400 text-lg font-bold">
                {currentPlayer?.name}
              </Text>
              <Text className="text-gray-400 text-sm">
                {currentPlayer?.score || 0} pts
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">
            {progress.current}/{progress.total}
          </Text>
        </View>

        {/* Progress bar */}
        <View className="h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
          <View
            className="h-full bg-accent-500 rounded-full"
            style={{ width: `${progress.percentage}%` }}
          />
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
              } else if (
                lastAnswer?.selectedAnswer === answer &&
                index !== currentQuestion.correctIndex
              ) {
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
        {hasAnswered && (
          <View className="mt-6">
            {/* Feedback */}
            <View
              className={`rounded-xl py-3 px-4 mb-4 ${
                lastAnswer.isCorrect ? "bg-green-900/50" : "bg-red-900/50"
              }`}
            >
              <Text
                className={`text-center font-bold text-lg ${
                  lastAnswer.isCorrect ? "text-green-400" : "text-red-400"
                }`}
              >
                {lastAnswer.isCorrect
                  ? `Well done ${currentPlayer?.name}! +${lastAnswer.pointsEarned} pts`
                  : `Missed ${currentPlayer?.name}!`}
              </Text>
            </View>

            {/* Next button */}
            <Pressable
              onPress={handleNextTurn}
              className="bg-accent-500 rounded-xl py-4 px-6 active:opacity-80"
            >
              <Text className="text-white text-lg text-center font-bold">
                {progress.current >= progress.total
                  ? "View results"
                  : "Next player"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
