import { View, Text, Pressable, ActivityIndicator, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { useAuth } from "../../src/contexts/AuthContext";
import { getFriendChallenge, submitChallengeAttempt, FriendChallenge } from "../../src/services/friendChallenge";
import { getQuestions, formatQuestionsForGame, FormattedQuestion } from "../../src/services/questions";
import { getSettings } from "../../src/services/settings";
import { correctAnswerFeedback, wrongAnswerFeedback, playHaptic } from "../../src/utils/feedback";
import { playSound } from "../../src/services/sounds";

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

export default function ChallengePlayScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<FriendChallenge | null>(null);
  const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(0);
  const [gameState, setGameState] = useState<"loading" | "name" | "playing" | "result">("loading");
  const [playerName, setPlayerName] = useState(profile?.username || "");
  const [submitResult, setSubmitResult] = useState<{ rank: number; totalAttempts: number } | null>(null);

  const questionStartTime = useRef(Date.now());
  const scale = useSharedValue(1);

  useEffect(() => {
    loadChallenge();
  }, [code]);

  const loadChallenge = async () => {
    if (!code) {
      router.back();
      return;
    }

    try {
      const challengeData = await getFriendChallenge(code);
      if (!challengeData) {
        router.back();
        return;
      }

      setChallenge(challengeData);

      // Get user's language preference
      const settings = await getSettings(user?.id);
      const language = settings.language || "fr";

      // Load questions for this challenge
      const fetchedQuestions = await getQuestions({
        count: challengeData.question_count,
        categoryId: challengeData.category,
        language,
      });
      const formatted = formatQuestionsForGame(fetchedQuestions);
      setQuestions(formatted);

      // If user is logged in, use their username
      if (profile?.username) {
        setPlayerName(profile.username);
        setGameState("playing");
        playSound("gameStart");
      } else {
        setGameState("name");
      }
    } catch (error) {
      console.error("Error loading challenge:", error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStartWithName = () => {
    if (!playerName.trim()) return;
    playHaptic("light");
    playSound("gameStart");
    setGameState("playing");
    questionStartTime.current = Date.now();
  };

  const handleAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    const answerTime = Date.now() - questionStartTime.current;
    setTotalTimeMs((prev) => prev + answerTime);
    setSelectedAnswer(answerIndex);

    const currentQuestion = questions[currentIndex];
    const isCorrect = answerIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      playSound("correct");
      await correctAnswerFeedback();
      setScore((prev) => prev + 100 + Math.max(0, 50 - Math.floor(answerTime / 100)));
      setCorrectCount((prev) => prev + 1);
      scale.value = withSequence(withSpring(1.1), withSpring(1));
    } else {
      playSound("wrong");
      await wrongAnswerFeedback();
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        questionStartTime.current = Date.now();
      } else {
        handleGameEnd();
      }
    }, 1500);
  };

  const handleGameEnd = async () => {
    playSound("gameOver");
    setGameState("result");

    // Submit result
    try {
      const result = await submitChallengeAttempt(
        code!,
        user?.id || null,
        playerName,
        score,
        correctCount,
        totalTimeMs
      );
      setSubmitResult(result);
    } catch (error) {
      console.error("Error submitting result:", error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Loading state
  if (loading || gameState === "loading") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="text-white mt-4">Loading challenge...</Text>
      </SafeAreaView>
    );
  }

  // Name input for anonymous users
  if (gameState === "name") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-6 items-center justify-center">
          <Text className="text-5xl mb-4">👋</Text>
          <Text className="text-white text-2xl font-bold mb-2">What's your name?</Text>
          <Text style={{ color: COLORS.textMuted }} className="text-center mb-8">
            Enter your name to appear on the leaderboard
          </Text>

          <TextInput
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Your name"
            placeholderTextColor={COLORS.textMuted}
            maxLength={20}
            className="w-full text-center text-xl py-4 rounded-xl mb-6"
            style={{
              backgroundColor: COLORS.surface,
              color: COLORS.text,
            }}
          />

          <Pressable
            onPress={handleStartWithName}
            disabled={!playerName.trim()}
            className="w-full rounded-xl py-4"
            style={{
              backgroundColor: playerName.trim() ? COLORS.primary : COLORS.surfaceLight,
            }}
          >
            <Text
              className="text-center font-bold text-lg"
              style={{ color: playerName.trim() ? COLORS.bg : COLORS.textMuted }}
            >
              Start Challenge
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Result screen
  if (gameState === "result") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-6 items-center justify-center">
          {/* Result Icon */}
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${COLORS.primary}20` }}
          >
            <Text className="text-5xl">
              {correctCount >= questions.length * 0.8 ? "🏆" : correctCount >= questions.length * 0.5 ? "⭐" : "💪"}
            </Text>
          </View>

          <Text className="text-white text-2xl font-bold mb-2">Challenge Complete!</Text>

          {submitResult && (
            <Text style={{ color: COLORS.primary }} className="text-lg mb-6">
              You ranked #{submitResult.rank} of {submitResult.totalAttempts} players
            </Text>
          )}

          {/* Score Card */}
          <View
            className="w-full rounded-2xl p-6 mb-6"
            style={{ backgroundColor: COLORS.surface }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ color: COLORS.textMuted }}>Final Score</Text>
              <Text className="text-3xl font-black" style={{ color: COLORS.yellow }}>
                {score.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ color: COLORS.textMuted }}>Correct Answers</Text>
              <Text className="text-xl font-bold text-white">
                {correctCount}/{questions.length}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text style={{ color: COLORS.textMuted }}>Accuracy</Text>
              <Text
                className="text-xl font-bold"
                style={{
                  color: (correctCount / questions.length) >= 0.7 ? COLORS.green : COLORS.coral,
                }}
              >
                {Math.round((correctCount / questions.length) * 100)}%
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="w-full gap-3">
            <Pressable
              onPress={() => router.push({
                pathname: "/challenge/leaderboard",
                params: { code },
              })}
              className="w-full rounded-xl py-4"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
                View Leaderboard
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/challenge")}
              className="w-full py-4"
            >
              <Text className="text-center text-white">Back to Challenges</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Playing state
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 mb-4">
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.purple }}
            >
              <Text className="text-white font-bold">
                {playerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className="text-white font-bold">{playerName}</Text>
              <Text style={{ color: COLORS.textMuted }} className="text-sm">
                {score} pts
              </Text>
            </View>
          </View>
          <Text style={{ color: COLORS.textMuted }}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View
          className="h-2 rounded-full mb-6 overflow-hidden"
          style={{ backgroundColor: COLORS.surface }}
        >
          <View
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: COLORS.primary }}
          />
        </View>

        {/* Question */}
        <Animated.View style={[animatedStyle]} className="mb-6">
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-white text-xl text-center leading-7">
              {currentQuestion.question}
            </Text>
          </View>
        </Animated.View>

        {/* Answers */}
        <View className="gap-3">
          {currentQuestion.answers.map((answer, index) => {
            let bgColor = COLORS.surface;
            let borderColor = "rgba(255,255,255,0.05)";

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
                  style={{
                    color: selectedAnswer !== null && (index === currentQuestion.correctIndex || index === selectedAnswer) ? COLORS.bg : COLORS.text,
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
