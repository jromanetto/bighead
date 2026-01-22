import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { getQuestions, formatQuestionsForGame } from "../../src/services/questions";
import { correctAnswerFeedback, wrongAnswerFeedback, playHaptic } from "../../src/utils/feedback";

// QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  yellow: "#FFD100",
  green: "#22c55e",
  red: "#ef4444",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

interface GameQuestion {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
}

interface PlayerAnswer {
  playerId: number;
  playerName: string;
  answerIndex: number;
  isCorrect: boolean;
}

export default function TraitorGameScreen() {
  const { players: playersParam, questionCount: questionCountParam } =
    useLocalSearchParams<{
      players: string;
      questionCount: string;
    }>();

  const players: string[] = playersParam ? JSON.parse(playersParam) : [];
  const questionCount = Number(questionCountParam) || 10;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [traitorIndex, setTraitorIndex] = useState(-1);
  const [showingTraitor, setShowingTraitor] = useState(true);
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [allAnswers, setAllAnswers] = useState<PlayerAnswer[][]>([]);
  const [currentRoundAnswers, setCurrentRoundAnswers] = useState<PlayerAnswer[]>([]);

  const scale = useSharedValue(1);

  // Load questions and select traitor
  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    try {
      // Select random traitor
      const traitor = Math.floor(Math.random() * players.length);
      setTraitorIndex(traitor);

      // Load questions
      const fetchedQuestions = await getQuestions({ count: questionCount });
      const formatted = formatQuestionsForGame(fetchedQuestions);
      setQuestions(formatted);

      // Initialize answers array
      setAllAnswers(Array(formatted.length).fill(null).map(() => []));
    } catch (error) {
      console.error("Error loading game:", error);
      // Fallback questions
      const fallbackQuestions: GameQuestion[] = [
        { id: "1", question: "What is the capital of France?", answers: ["London", "Paris", "Berlin", "Madrid"], correctIndex: 1 },
        { id: "2", question: "Which planet is closest to the Sun?", answers: ["Venus", "Earth", "Mercury", "Mars"], correctIndex: 2 },
        { id: "3", question: "What is 7 x 8?", answers: ["54", "56", "58", "62"], correctIndex: 1 },
        { id: "4", question: "Who painted the Mona Lisa?", answers: ["Picasso", "Da Vinci", "Van Gogh", "Monet"], correctIndex: 1 },
        { id: "5", question: "What is the largest ocean?", answers: ["Atlantic", "Indian", "Pacific", "Arctic"], correctIndex: 2 },
      ];
      setQuestions(fallbackQuestions.slice(0, questionCount));
      setAllAnswers(Array(Math.min(questionCount, 5)).fill(null).map(() => []));
      setTraitorIndex(Math.floor(Math.random() * players.length));
    }
    setLoading(false);
  };

  const handleReady = () => {
    playHaptic("light");
    if (showingTraitor) {
      setShowingTraitor(false);
      setWaitingForPlayer(true);
    } else {
      setWaitingForPlayer(false);
    }
  };

  const handleAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctIndex;

    // Feedback
    if (isCorrect) {
      await correctAnswerFeedback();
      scale.value = withSequence(withSpring(1.1), withSpring(1));
    } else {
      await wrongAnswerFeedback();
    }

    // Record answer
    const answer: PlayerAnswer = {
      playerId: currentPlayerIndex,
      playerName: players[currentPlayerIndex],
      answerIndex,
      isCorrect,
    };

    const newRoundAnswers = [...currentRoundAnswers, answer];
    setCurrentRoundAnswers(newRoundAnswers);

    // After a short delay, move to next player
    setTimeout(() => {
      if (currentPlayerIndex < players.length - 1) {
        // Next player for same question
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setSelectedAnswer(null);
        setWaitingForPlayer(true);
      } else {
        // All players answered this question
        const newAllAnswers = [...allAnswers];
        newAllAnswers[currentQuestionIndex] = newRoundAnswers;
        setAllAnswers(newAllAnswers);

        if (currentQuestionIndex < questions.length - 1) {
          // Next question
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setCurrentPlayerIndex(0);
          setCurrentRoundAnswers([]);
          setSelectedAnswer(null);
          setWaitingForPlayer(true);
        } else {
          // Game over - go to voting
          router.replace({
            pathname: "/traitor/vote",
            params: {
              players: playersParam,
              traitorIndex: traitorIndex.toString(),
              answers: JSON.stringify(newAllAnswers),
            },
          });
        }
      }
    }, 1500);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Loading
  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.coral} />
          <Text className="text-gray-400 mt-4">Preparing the game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show traitor to the traitor player
  if (showingTraitor) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-2xl font-bold mb-4 text-center">
            Pass the phone to each player secretly
          </Text>
          <View
            className="rounded-2xl p-8 mb-8 w-full items-center"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-5xl mb-4">
              {players[currentPlayerIndex] === players[traitorIndex] ? "🕵️" : "👤"}
            </Text>
            <Text className="text-white text-2xl font-bold mb-2">
              {players[currentPlayerIndex]}
            </Text>
            {currentPlayerIndex === traitorIndex ? (
              <View className="items-center">
                <Text
                  className="text-2xl font-black mb-2"
                  style={{ color: COLORS.coral }}
                >
                  YOU ARE THE TRAITOR!
                </Text>
                <Text className="text-gray-400 text-center">
                  Give wrong answers without being caught!
                </Text>
              </View>
            ) : (
              <View className="items-center">
                <Text
                  className="text-xl font-bold mb-2"
                  style={{ color: COLORS.green }}
                >
                  You are innocent
                </Text>
                <Text className="text-gray-400 text-center">
                  Answer correctly and find the traitor!
                </Text>
              </View>
            )}
          </View>

          <Pressable
            onPress={() => {
              playHaptic("light");
              if (currentPlayerIndex < players.length - 1) {
                setCurrentPlayerIndex(currentPlayerIndex + 1);
              } else {
                setCurrentPlayerIndex(0);
                setShowingTraitor(false);
                setWaitingForPlayer(true);
              }
            }}
            className="w-full rounded-2xl py-4"
            style={{ backgroundColor: COLORS.coral }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              {currentPlayerIndex < players.length - 1 ? "Next Player" : "Start Game"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Waiting for player
  if (waitingForPlayer) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-400 text-lg mb-2">
            Question {currentQuestionIndex + 1}/{questions.length}
          </Text>
          <Text className="text-white text-xl mb-4">Pass the phone to</Text>
          <Text className="text-white text-4xl font-black mb-8">
            {players[currentPlayerIndex]}
          </Text>

          {/* Mini scoreboard showing who answered */}
          <View
            className="w-full rounded-xl p-4 mb-8"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-gray-400 text-sm text-center mb-3">
              Current Round
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {players.map((player, idx) => {
                const answered = currentRoundAnswers.some(a => a.playerId === idx);
                const isCurrent = idx === currentPlayerIndex;
                return (
                  <View
                    key={idx}
                    className="px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: isCurrent
                        ? COLORS.coral
                        : answered
                        ? COLORS.surfaceLight
                        : COLORS.bg,
                      opacity: answered || isCurrent ? 1 : 0.5,
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: isCurrent ? COLORS.bg : COLORS.text }}
                    >
                      {player}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={handleReady}
            className="w-full rounded-2xl py-4"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              I'm Ready!
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Question screen
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 mb-4">
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.coral }}
            >
              <Text className="text-white font-bold">
                {players[currentPlayerIndex].charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-white font-bold text-lg">
              {players[currentPlayerIndex]}
            </Text>
          </View>
          <Text className="text-gray-400">
            Q{currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View
          className="h-2 rounded-full mb-6 overflow-hidden"
          style={{ backgroundColor: COLORS.surface }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              backgroundColor: COLORS.coral,
            }}
          />
        </View>

        {/* Question */}
        <Animated.View
          style={[animatedStyle]}
          className="rounded-2xl p-6 mb-6"
        >
          <View style={{ backgroundColor: COLORS.surface }} className="rounded-2xl p-6">
            <Text className="text-white text-xl text-center leading-7">
              {currentQuestion.question}
            </Text>
          </View>
        </Animated.View>

        {/* Answers */}
        <View className="gap-3">
          {currentQuestion.answers.map((answer, index) => {
            let bgColor = COLORS.surface;
            let borderColor = 'rgba(255,255,255,0.05)';

            if (selectedAnswer !== null) {
              if (index === currentQuestion.correctIndex) {
                bgColor = COLORS.green;
                borderColor = COLORS.green;
              } else if (index === selectedAnswer) {
                bgColor = COLORS.red;
                borderColor = COLORS.red;
              }
            }

            return (
              <Pressable
                key={index}
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className="rounded-xl py-4 px-6"
                style={{
                  backgroundColor: bgColor,
                  borderWidth: 2,
                  borderColor,
                  opacity: selectedAnswer !== null && index !== selectedAnswer && index !== currentQuestion.correctIndex ? 0.5 : 1,
                }}
              >
                <Text
                  className="text-lg text-center"
                  style={{ color: selectedAnswer !== null && (index === currentQuestion.correctIndex || index === selectedAnswer) ? COLORS.bg : COLORS.text }}
                >
                  {answer}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
