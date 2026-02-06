import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../../src/stores/gameStore";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { recordPlay } from "../../src/services/dailyLimits";
import {
  getQuestions,
  formatQuestionsForGame,
} from "../../src/services/questions";
import { getSettings } from "../../src/services/settings";
import { playSound } from "../../src/services/sounds";
import { IconButton } from "../../src/components/ui";

// Design colors (same as other screens)
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  purple: "#7c3aed",
  purpleDim: "rgba(124, 58, 237, 0.15)",
  primary: "#00c2cc",
  success: "#22c55e",
  error: "#ef4444",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function PartyGameScreen() {
  const { players: playersParam, questionCount: questionCountParam } =
    useLocalSearchParams<{
      players: string;
      questionCount: string;
    }>();
  const { isPremium } = useAuth();
  const { t } = useTranslation();

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
      // Record the play using daily limits service
      const doRecordPlay = async () => {
        if (!isPremium) {
          try {
            await recordPlay("party");
          } catch (e) {
            console.error("Error recording play:", e);
          }
        }
      };
      doRecordPlay();

      const state = useGameStore.getState();
      router.replace({
        pathname: "/party/result",
        params: {
          players: JSON.stringify(state.players),
        },
      });
    }
  }, [status, isPremium]);

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

  const confirmExit = () => {
    Alert.alert(
      t("exitGame"),
      t("exitGameConfirm"),
      [
        { text: t("cancel"), style: "cancel" },
        { text: t("exit"), style: "destructive", onPress: handleExit },
      ]
    );
  };

  // Loading state
  if (status === "idle" || (status === "loading" && !currentPlayer)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text className="mt-4 text-lg" style={{ color: COLORS.textMuted }}>
          {t("loadingQuestions")}
        </Text>
      </SafeAreaView>
    );
  }

  // Waiting screen - show who's turn it is
  if (waitingForPlayer) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        {/* Header with exit button */}
        <View className="flex-row items-center justify-between px-5 pt-4">
          <IconButton
            name="X"
            onPress={confirmExit}
            variant="glass"
            size={40}
          />
          <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: COLORS.surface }}>
            <Text style={{ color: COLORS.purple }}>
              {progress.current}/{progress.total}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          {/* Hand off message */}
          <Text className="text-lg mb-2" style={{ color: COLORS.textMuted }}>
            {t("passPhoneTo")}
          </Text>
          <Text className="text-5xl font-bold mb-8" style={{ color: COLORS.text }}>
            {currentPlayer?.name || players[currentPlayerIndex]}
          </Text>

          {/* Mini scoreboard */}
          <View className="rounded-2xl p-4 w-full mb-8" style={{ backgroundColor: COLORS.surface }}>
            <Text className="text-sm text-center mb-3" style={{ color: COLORS.textMuted }}>
              {t("leaderboard")}
            </Text>
            {sortedPlayers.slice(0, 4).map((player, index) => (
              <View
                key={player.name}
                className="flex-row justify-between items-center py-2 px-2 rounded-lg mb-1"
                style={{
                  backgroundColor: player.name === currentPlayer?.name ? COLORS.purpleDim : 'transparent',
                }}
              >
                <View className="flex-row items-center">
                  <Text className="w-6" style={{ color: COLORS.textMuted }}>{index + 1}.</Text>
                  <Text className="font-medium" style={{ color: COLORS.text }}>{player.name}</Text>
                  {player.name === currentPlayer?.name && (
                    <Text className="ml-2" style={{ color: COLORS.purple }}>←</Text>
                  )}
                </View>
                <Text className="font-bold" style={{ color: COLORS.text }}>{player.score}</Text>
              </View>
            ))}
          </View>

          {/* Ready button */}
          <Pressable
            onPress={handleReady}
            className="rounded-2xl py-4 px-16 active:opacity-80"
            style={{ backgroundColor: COLORS.purple }}
          >
            <Text className="text-xl font-bold" style={{ color: COLORS.text }}>
              {t("imReady")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Question screen
  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <IconButton
              name="X"
              onPress={confirmExit}
              variant="glass"
              size={40}
              style={{ marginRight: 12 }}
            />
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.purple }}
            >
              <Text className="font-bold" style={{ color: COLORS.text }}>
                {currentPlayer?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className="text-lg font-bold" style={{ color: COLORS.purple }}>
                {currentPlayer?.name}
              </Text>
              <Text className="text-sm" style={{ color: COLORS.textMuted }}>
                {currentPlayer?.score || 0} pts
              </Text>
            </View>
          </View>
          <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: COLORS.surface }}>
            <Text style={{ color: COLORS.textMuted }}>
              {progress.current}/{progress.total}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-2 rounded-full mb-6 overflow-hidden" style={{ backgroundColor: COLORS.surface }}>
          <View
            className="h-full rounded-full"
            style={{ width: `${progress.percentage}%`, backgroundColor: COLORS.purple }}
          />
        </View>

        {/* Question */}
        <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: COLORS.surface }}>
          <Text className="text-xl text-center leading-7" style={{ color: COLORS.text }}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* Answers */}
        <View className="gap-3">
          {currentQuestion.answers.map((answer, index) => {
            let bgColor = COLORS.surfaceLight;
            let borderColor = 'transparent';

            if (hasAnswered) {
              if (index === currentQuestion.correctIndex) {
                bgColor = 'rgba(34, 197, 94, 0.2)';
                borderColor = COLORS.success;
              } else if (
                lastAnswer?.selectedAnswer === answer &&
                index !== currentQuestion.correctIndex
              ) {
                bgColor = 'rgba(239, 68, 68, 0.2)';
                borderColor = COLORS.error;
              }
            }

            return (
              <Pressable
                key={index}
                onPress={() => handleAnswer(index)}
                className="rounded-xl py-4 px-6 active:opacity-80"
                style={{
                  backgroundColor: bgColor,
                  borderWidth: 2,
                  borderColor: borderColor,
                }}
                disabled={hasAnswered}
              >
                <Text className="text-lg text-center" style={{ color: COLORS.text }}>{answer}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Result feedback & Next button */}
        {hasAnswered && (
          <View className="mt-6">
            {/* Feedback */}
            <View
              className="rounded-xl py-3 px-4 mb-4"
              style={{
                backgroundColor: lastAnswer.isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              }}
            >
              <Text
                className="text-center font-bold text-lg"
                style={{ color: lastAnswer.isCorrect ? COLORS.success : COLORS.error }}
              >
                {lastAnswer.isCorrect
                  ? `${t("wellDone")} ${currentPlayer?.name}! +${lastAnswer.pointsEarned} pts`
                  : `${t("missed")} ${currentPlayer?.name}!`}
              </Text>
            </View>

            {/* Next button */}
            <Pressable
              onPress={handleNextTurn}
              className="rounded-xl py-4 px-6 active:opacity-80"
              style={{ backgroundColor: COLORS.purple }}
            >
              <Text className="text-lg text-center font-bold" style={{ color: COLORS.text }}>
                {progress.current >= progress.total
                  ? t("viewResults")
                  : t("nextPlayer")}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
