import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { getQuestions, formatQuestionsForGame } from "../../src/services/questions";
import { correctAnswerFeedback, wrongAnswerFeedback, playHaptic, buttonPressFeedback } from "../../src/utils/feedback";
import { playSound } from "../../src/services/sounds";

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

const CATEGORIES = [
  { id: "history", name: "History", icon: "📜" },
  { id: "geography", name: "Geography", icon: "🌍" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "sports", name: "Sports", icon: "⚽" },
  { id: "entertainment", name: "Entertainment", icon: "🎬" },
];

interface GameQuestion {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  category?: string;
}

type GamePhase = "loading" | "bidding" | "category" | "question" | "result" | "gameOver";

export default function AuctionGameScreen() {
  const { player1, player2, rounds: roundsParam } = useLocalSearchParams<{
    player1: string;
    player2: string;
    rounds: string;
  }>();

  const totalRounds = Number(roundsParam) || 5;
  const players = [player1 || "Player 1", player2 || "Player 2"];

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [currentRound, setCurrentRound] = useState(0);

  // Time budgets (in seconds)
  const [timeBudgets, setTimeBudgets] = useState([30, 30]);
  const [currentBids, setCurrentBids] = useState([0, 0]);
  const [biddingPlayer, setBiddingPlayer] = useState(0);

  // Auction winner
  const [auctionWinner, setAuctionWinner] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Question phase
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerTime, setAnswerTime] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<{ answer: number; time: number; correct: boolean }[]>([]);

  // Scores
  const [scores, setScores] = useState([0, 0]);

  // Animation
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const fetched = await getQuestions({ count: totalRounds * 2 });
      const formatted = formatQuestionsForGame(fetched);
      setQuestions(formatted);
    } catch (error) {
      // Fallback questions
      const fallback: GameQuestion[] = Array(totalRounds).fill(null).map((_, i) => ({
        id: String(i),
        question: `Question ${i + 1}: What is 2 + ${i}?`,
        answers: [String(2 + i), String(3 + i), String(4 + i), String(1 + i)],
        correctIndex: 0,
      }));
      setQuestions(fallback);
    }
    setLoading(false);
    setPhase("bidding");
  };

  const handleBid = (amount: number) => {
    playHaptic("light");
    const newBids = [...currentBids];
    const maxBid = timeBudgets[biddingPlayer];

    // Bid must be higher than opponent's bid and within budget
    const minBid = currentBids[1 - biddingPlayer] + 1;
    const actualBid = Math.min(Math.max(amount, minBid), maxBid);

    newBids[biddingPlayer] = actualBid;
    setCurrentBids(newBids);
  };

  const handlePass = () => {
    buttonPressFeedback();
    // Current player passes, other player wins
    const winner = 1 - biddingPlayer;
    const winningBid = currentBids[winner];

    // Deduct time from winner
    const newBudgets = [...timeBudgets];
    newBudgets[winner] -= winningBid;
    setTimeBudgets(newBudgets);

    setAuctionWinner(winner);
    setPhase("category");
  };

  const handleConfirmBid = () => {
    buttonPressFeedback();
    // Switch to other player
    const nextPlayer = 1 - biddingPlayer;

    // Check if next player can bid higher
    const minRequiredBid = currentBids[biddingPlayer] + 1;
    if (timeBudgets[nextPlayer] < minRequiredBid) {
      // Next player can't bid, current player wins
      const winningBid = currentBids[biddingPlayer];
      const newBudgets = [...timeBudgets];
      newBudgets[biddingPlayer] -= winningBid;
      setTimeBudgets(newBudgets);
      setAuctionWinner(biddingPlayer);
      setPhase("category");
    } else {
      setBiddingPlayer(nextPlayer);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    buttonPressFeedback();
    setSelectedCategory(categoryId);
    setCurrentPlayerIndex(0);
    setWaitingForPlayer(true);
    setPlayerAnswers([]);
    setPhase("question");
  };

  const handleReady = () => {
    playHaptic("light");
    setWaitingForPlayer(false);
    setAnswerTime(Date.now());
  };

  const handleAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    const time = Date.now() - answerTime;
    setSelectedAnswer(answerIndex);

    const currentQuestion = questions[currentRound];
    const isCorrect = answerIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      playSound("correct");
      await correctAnswerFeedback();
    } else {
      playSound("wrong");
      await wrongAnswerFeedback();
    }

    const newAnswers = [...playerAnswers, { answer: answerIndex, time, correct: isCorrect }];
    setPlayerAnswers(newAnswers);

    setTimeout(() => {
      if (currentPlayerIndex === 0) {
        // First player done, move to second
        setCurrentPlayerIndex(1);
        setWaitingForPlayer(true);
        setSelectedAnswer(null);
      } else {
        // Both players done, show round result
        setPhase("result");
      }
    }, 1500);
  };

  const handleNextRound = () => {
    buttonPressFeedback();

    // Calculate round winner
    const p1 = playerAnswers[0];
    const p2 = playerAnswers[1];

    const newScores = [...scores];

    if (p1.correct && !p2.correct) {
      newScores[0]++;
    } else if (!p1.correct && p2.correct) {
      newScores[1]++;
    } else if (p1.correct && p2.correct) {
      // Both correct - faster wins
      if (p1.time < p2.time) {
        newScores[0]++;
      } else {
        newScores[1]++;
      }
    }
    // If both wrong, no one scores

    setScores(newScores);

    if (currentRound + 1 >= totalRounds) {
      setPhase("gameOver");
    } else {
      // Reset for next round
      setCurrentRound(currentRound + 1);
      setCurrentBids([0, 0]);
      setBiddingPlayer(0);
      setAuctionWinner(-1);
      setSelectedCategory("");
      setPhase("bidding");
    }
  };

  // Loading
  if (loading || phase === "loading") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.yellow} />
          <Text className="text-gray-400 mt-4">Preparing auction...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Game Over
  if (phase === "gameOver") {
    const winner = scores[0] > scores[1] ? 0 : scores[1] > scores[0] ? 1 : -1;

    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">{winner === -1 ? "🤝" : "🏆"}</Text>
          <Text className="text-white text-3xl font-black text-center mb-2">
            {winner === -1 ? "It's a Tie!" : `${players[winner]} Wins!`}
          </Text>

          <View className="flex-row items-center gap-8 my-8">
            <View className="items-center">
              <Text style={{ color: COLORS.primary }} className="font-bold mb-1">
                {players[0]}
              </Text>
              <Text className="text-white text-4xl font-black">{scores[0]}</Text>
            </View>
            <Text className="text-gray-500 text-2xl">-</Text>
            <View className="items-center">
              <Text style={{ color: COLORS.coral }} className="font-bold mb-1">
                {players[1]}
              </Text>
              <Text className="text-white text-4xl font-black">{scores[1]}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.replace("/auction")}
            className="w-full rounded-2xl py-4 mb-3"
            style={{ backgroundColor: COLORS.yellow }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              Play Again
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            className="w-full py-4"
          >
            <Text className="text-gray-400 text-center">Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Bidding Phase
  if (phase === "bidding") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-6">
          {/* Header */}
          <View className="flex-row items-center justify-between pt-4 mb-4">
            <Text className="text-gray-400">Round {currentRound + 1}/{totalRounds}</Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center">
                <Text style={{ color: COLORS.primary }} className="font-bold mr-1">
                  {players[0]}
                </Text>
                <Text className="text-white font-bold">{timeBudgets[0]}s</Text>
              </View>
              <View className="flex-row items-center">
                <Text style={{ color: COLORS.coral }} className="font-bold mr-1">
                  {players[1]}
                </Text>
                <Text className="text-white font-bold">{timeBudgets[1]}s</Text>
              </View>
            </View>
          </View>

          {/* Scores */}
          <View className="flex-row justify-center items-center mb-6">
            <Text className="text-white text-2xl font-bold">{scores[0]}</Text>
            <Text className="text-gray-500 mx-4">-</Text>
            <Text className="text-white text-2xl font-bold">{scores[1]}</Text>
          </View>

          {/* Bidding UI */}
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400 mb-2">AUCTION</Text>
            <Text
              className="text-2xl font-bold mb-4"
              style={{ color: biddingPlayer === 0 ? COLORS.primary : COLORS.coral }}
            >
              {players[biddingPlayer]}'s Turn
            </Text>

            {/* Current bids */}
            <View
              className="w-full rounded-2xl p-6 mb-6"
              style={{ backgroundColor: COLORS.surface }}
            >
              <View className="flex-row justify-between mb-4">
                <View className="items-center">
                  <Text className="text-gray-400 text-sm">{players[0]}</Text>
                  <Text style={{ color: COLORS.primary }} className="text-3xl font-black">
                    {currentBids[0]}s
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-gray-400 text-sm">{players[1]}</Text>
                  <Text style={{ color: COLORS.coral }} className="text-3xl font-black">
                    {currentBids[1]}s
                  </Text>
                </View>
              </View>

              {/* Bid buttons */}
              <View className="flex-row gap-2 mb-4">
                {[1, 3, 5, 10].map((amount) => {
                  const minBid = currentBids[1 - biddingPlayer] + amount;
                  const disabled = minBid > timeBudgets[biddingPlayer];

                  return (
                    <Pressable
                      key={amount}
                      onPress={() => handleBid(currentBids[1 - biddingPlayer] + amount)}
                      disabled={disabled}
                      className="flex-1 py-3 rounded-xl items-center"
                      style={{
                        backgroundColor: disabled ? COLORS.surfaceLight : COLORS.yellow,
                        opacity: disabled ? 0.5 : 1,
                      }}
                    >
                      <Text
                        className="font-bold"
                        style={{ color: disabled ? COLORS.textMuted : COLORS.bg }}
                      >
                        +{amount}s
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Current player's bid display */}
              <Text className="text-center text-gray-400 mb-4">
                Your bid: <Text className="text-white font-bold">{currentBids[biddingPlayer]}s</Text>
              </Text>
            </View>

            {/* Action buttons */}
            <View className="w-full gap-3">
              {currentBids[biddingPlayer] > currentBids[1 - biddingPlayer] && (
                <Pressable
                  onPress={handleConfirmBid}
                  className="rounded-2xl py-4"
                  style={{ backgroundColor: COLORS.yellow }}
                >
                  <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
                    Confirm Bid ({currentBids[biddingPlayer]}s)
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={handlePass}
                className="rounded-2xl py-4"
                style={{ backgroundColor: COLORS.surface }}
              >
                <Text className="text-white text-center font-bold">
                  Pass (Opponent wins)
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Category Selection
  if (phase === "category") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-6 py-6">
          <Text className="text-gray-400 text-center mb-2">
            {players[auctionWinner]} won the auction!
          </Text>
          <Text className="text-white text-2xl font-bold text-center mb-8">
            Choose a Category
          </Text>

          <View className="gap-3">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => handleSelectCategory(cat.id)}
                className="rounded-xl p-4 flex-row items-center active:opacity-80"
                style={{
                  backgroundColor: COLORS.surface,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <Text className="text-3xl mr-4">{cat.icon}</Text>
                <Text className="text-white text-lg font-bold">{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Waiting for player
  if (phase === "question" && waitingForPlayer) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-400 mb-2">Round {currentRound + 1}</Text>
          <Text className="text-white text-xl mb-4">Pass the phone to</Text>
          <Text
            className="text-4xl font-black mb-8"
            style={{ color: currentPlayerIndex === 0 ? COLORS.primary : COLORS.coral }}
          >
            {players[currentPlayerIndex]}
          </Text>

          <Pressable
            onPress={handleReady}
            className="w-full rounded-2xl py-4"
            style={{ backgroundColor: currentPlayerIndex === 0 ? COLORS.primary : COLORS.coral }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              I'm Ready!
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Question
  if (phase === "question") {
    const currentQuestion = questions[currentRound];

    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-6">
          {/* Header */}
          <View className="flex-row items-center justify-between pt-4 mb-4">
            <Text
              className="font-bold"
              style={{ color: currentPlayerIndex === 0 ? COLORS.primary : COLORS.coral }}
            >
              {players[currentPlayerIndex]}
            </Text>
            <Text className="text-gray-400">Q{currentRound + 1}/{totalRounds}</Text>
          </View>

          {/* Question */}
          <View
            className="rounded-2xl p-6 mb-6"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-white text-xl text-center leading-7">
              {currentQuestion.question}
            </Text>
          </View>

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
                  }}
                >
                  <Text
                    className="text-lg text-center"
                    style={{
                      color: selectedAnswer !== null && (index === currentQuestion.correctIndex || index === selectedAnswer)
                        ? COLORS.bg
                        : COLORS.text,
                    }}
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

  // Round Result
  if (phase === "result") {
    const p1 = playerAnswers[0];
    const p2 = playerAnswers[1];

    let roundWinner = -1;
    if (p1.correct && !p2.correct) roundWinner = 0;
    else if (!p1.correct && p2.correct) roundWinner = 1;
    else if (p1.correct && p2.correct) roundWinner = p1.time < p2.time ? 0 : 1;

    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-400 mb-2">Round {currentRound + 1} Result</Text>
          <Text className="text-white text-2xl font-bold mb-6">
            {roundWinner === -1 ? "No Winner" : `${players[roundWinner]} Wins!`}
          </Text>

          {/* Player results */}
          <View className="w-full gap-4 mb-8">
            {[0, 1].map((idx) => {
              const answer = playerAnswers[idx];
              const isWinner = roundWinner === idx;

              return (
                <View
                  key={idx}
                  className="rounded-xl p-4 flex-row items-center justify-between"
                  style={{
                    backgroundColor: isWinner ? `${COLORS.green}20` : COLORS.surface,
                    borderWidth: isWinner ? 2 : 1,
                    borderColor: isWinner ? COLORS.green : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">{answer.correct ? "✓" : "✗"}</Text>
                    <View>
                      <Text className="text-white font-bold">{players[idx]}</Text>
                      <Text className="text-gray-400 text-sm">
                        {answer.correct ? `${(answer.time / 1000).toFixed(2)}s` : "Wrong"}
                      </Text>
                    </View>
                  </View>
                  {isWinner && (
                    <Text className="text-2xl">🏆</Text>
                  )}
                </View>
              );
            })}
          </View>

          <Pressable
            onPress={handleNextRound}
            className="w-full rounded-2xl py-4"
            style={{ backgroundColor: COLORS.yellow }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              {currentRound + 1 >= totalRounds ? "See Final Results" : "Next Round"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}
