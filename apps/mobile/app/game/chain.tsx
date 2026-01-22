import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../src/stores/gameStore";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  getQuestions,
  getUnseenQuestions,
  formatQuestionsForGame,
  markQuestionSeen,
  checkAndGenerateQuestions,
} from "../../src/services/questions";
import { playSound } from "../../src/services/sounds";

// New QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceActive: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.2)",
  error: "#ef4444",
  errorDim: "rgba(239, 68, 68, 0.2)",
  yellow: "#FFD100",
  purple: "#A16EFF",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const LETTER_OPTIONS = ['A', 'B', 'C', 'D'];

// Circular Timer Component - uses two half-circle technique for smooth progress
function CircularTimer({ timeRemaining, totalTime, questionNumber }: {
  timeRemaining: number;
  totalTime: number;
  questionNumber: number;
}) {
  const isLow = timeRemaining <= 5;
  const color = isLow ? COLORS.error : COLORS.primary;

  // Progress from 0 to 1 (1 = full circle, 0 = empty)
  const progress = timeRemaining / totalTime;

  // Calculate rotation for the two half-circles
  // First half (right side): rotates from 0 to 180 degrees for first 50% of progress
  // Second half (left side): rotates from 0 to 180 degrees for last 50% of progress
  const rightHalfRotation = progress > 0.5 ? 180 : (progress * 2) * 180;
  const leftHalfRotation = progress > 0.5 ? ((progress - 0.5) * 2) * 180 : 0;

  const SIZE = 120;
  const STROKE = 8;

  return (
    <View className="relative items-center justify-center" style={{ width: SIZE + 20, height: SIZE + 20 }}>
      {/* Background Circle */}
      <View
        className="absolute rounded-full"
        style={{
          width: SIZE,
          height: SIZE,
          borderWidth: STROKE,
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      />

      {/* Progress Circle using clip technique */}
      {/* Right half container */}
      <View
        className="absolute overflow-hidden"
        style={{
          width: SIZE / 2,
          height: SIZE,
          right: 10,
          top: 10,
        }}
      >
        <View
          className="absolute rounded-full"
          style={{
            width: SIZE,
            height: SIZE,
            borderWidth: STROKE,
            borderColor: color,
            right: 0,
            transform: [{ rotate: `${-180 + rightHalfRotation}deg` }],
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
          }}
        />
      </View>

      {/* Left half container */}
      <View
        className="absolute overflow-hidden"
        style={{
          width: SIZE / 2,
          height: SIZE,
          left: 10,
          top: 10,
        }}
      >
        <View
          className="absolute rounded-full"
          style={{
            width: SIZE,
            height: SIZE,
            borderWidth: STROKE,
            borderColor: progress > 0.5 ? color : 'transparent',
            left: 0,
            transform: [{ rotate: `${leftHalfRotation}deg` }],
            borderRightColor: 'transparent',
            borderTopColor: 'transparent',
          }}
        />
      </View>

      {/* Glow effect */}
      <View
        className="absolute rounded-full"
        style={{
          width: SIZE,
          height: SIZE,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
        }}
      />

      {/* Timer Content */}
      <View className="items-center justify-center">
        <Text
          className="text-4xl font-black leading-none"
          style={{ color: isLow ? COLORS.error : COLORS.text }}
        >
          {timeRemaining}
          <Text className="text-lg text-gray-400 font-medium">s</Text>
        </Text>
        <Text
          className="text-xs font-bold tracking-widest uppercase mt-1"
          style={{ color: isLow ? COLORS.error : COLORS.primary }}
        >
          Q{questionNumber}
        </Text>
      </View>
    </View>
  );
}

// Answer Option Component with Letter Badge
function AnswerOption({
  answer,
  index,
  onPress,
  disabled,
  isSelected,
  isCorrect,
  showResult
}: {
  answer: string;
  index: number;
  onPress: () => void;
  disabled: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  showResult: boolean;
}) {
  let bgColor = COLORS.surface;
  let borderColor = 'rgba(255,255,255,0.05)';
  let letterBgColor = 'rgba(255,255,255,0.05)';
  let letterBorderColor = 'rgba(255,255,255,0.1)';
  let letterTextColor = COLORS.text;

  if (showResult) {
    if (isCorrect) {
      bgColor = COLORS.successDim;
      borderColor = COLORS.success;
      letterBgColor = COLORS.success;
      letterTextColor = COLORS.bg;
    } else if (isSelected && !isCorrect) {
      bgColor = COLORS.errorDim;
      borderColor = COLORS.error;
      letterBgColor = COLORS.error;
      letterTextColor = COLORS.bg;
    }
  } else if (isSelected) {
    bgColor = COLORS.surfaceActive;
    borderColor = `${COLORS.primary}50`;
    letterBgColor = COLORS.primary;
    letterBorderColor = COLORS.primary;
    letterTextColor = COLORS.bg;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="rounded-xl p-4 flex-row items-center gap-4 active:opacity-90"
      style={{
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: borderColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      {/* Letter Badge */}
      <View
        className="w-10 h-10 rounded-lg items-center justify-center"
        style={{
          backgroundColor: letterBgColor,
          borderWidth: 1,
          borderColor: letterBorderColor,
        }}
      >
        <Text className="font-bold text-lg" style={{ color: letterTextColor }}>
          {LETTER_OPTIONS[index]}
        </Text>
      </View>

      {/* Answer Text */}
      <Text className="text-lg font-medium text-white/90 flex-1 text-left">
        {answer}
      </Text>

      {/* Check Icon */}
      {showResult && isCorrect && (
        <Text className="text-xl" style={{ color: COLORS.success }}>✓</Text>
      )}
    </Pressable>
  );
}

// Lifeline Button Component
function LifelineButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-col items-center justify-center w-16 h-14 rounded-full active:opacity-70"
    >
      <Text className="text-2xl opacity-70">{icon}</Text>
      <Text className="text-[10px] font-bold text-white/50 mt-0.5">{label}</Text>
    </Pressable>
  );
}

export default function ChainGameScreen() {
  const { user } = useAuth();
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

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate level based on score
  useEffect(() => {
    setLevel(Math.floor(score / 500) + 1);
  }, [score]);

  // Reset selected index when question changes
  useEffect(() => {
    setSelectedIndex(null);
  }, [currentQuestionIndex]);

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
      // Check if we need to generate new questions for logged in users
      if (user?.id) {
        checkAndGenerateQuestions(user.id, "en").catch(console.error);
      }

      // Fetch questions - prioritize unseen for logged in users
      const fetchedQuestions = user?.id
        ? await getUnseenQuestions(user.id, undefined, 10, "en")
        : await getQuestions({ count: 10 });
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

      const mockQuestions = [
        { id: "1", categoryId: "1", category: "Football", difficulty: 1, question: "Which club won the Champions League in 2021 with N'Golo Kanté as the midfield engine?", answers: ["Paris Saint-Germain", "Manchester City", "Chelsea FC", "Real Madrid"], correctIndex: 2, explanation: null, imageUrl: null, imageCredit: null },
        { id: "2", categoryId: "1", category: "Football", difficulty: 1, question: "Which player holds the record for most goals in a single Ligue 1 season?", answers: ["Zlatan Ibrahimović", "Josip Skoblar", "Kylian Mbappé", "Jean-Pierre Papin"], correctIndex: 1, explanation: null, imageUrl: null, imageCredit: null },
        { id: "3", categoryId: "2", category: "Football", difficulty: 1, question: "In what year did Zinédine Zidane score his two goals in the World Cup final?", answers: ["1998", "2002", "2006", "1994"], correctIndex: 0, explanation: null, imageUrl: null, imageCredit: null },
        { id: "4", categoryId: "3", category: "Football", difficulty: 1, question: "Which goalkeeper holds the Premier League clean sheet record?", answers: ["Peter Schmeichel", "Petr Čech", "Edwin van der Sar", "David Seaman"], correctIndex: 2, explanation: null, imageUrl: null, imageCredit: null },
        { id: "5", categoryId: "4", category: "Football", difficulty: 1, question: "How many Ballon d'Or awards has Lionel Messi won?", answers: ["6", "7", "8", "5"], correctIndex: 2, explanation: null, imageUrl: null, imageCredit: null },
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

  // Play game start sound
  useEffect(() => {
    if (status === "playing" && currentQuestionIndex === 0) {
      playSound("gameStart");
    }
  }, [status]);

  // Timer effect with tick sound
  useEffect(() => {
    if (status === "playing") {
      timerRef.current = setInterval(() => {
        const currentTime = useGameStore.getState().timeRemaining;
        // Play tick sound when time is low
        if (currentTime <= 5 && currentTime > 0) {
          playSound("tick");
        }
        // Play timeout sound when time runs out
        if (currentTime === 1) {
          playSound("timeout");
        }
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
      playSound("gameOver");
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
    setSelectedIndex(index);

    const isCorrect = index === currentQuestion.correctIndex;

    // Play sound based on answer
    if (isCorrect) {
      playSound("correct");
      // Play chain sound if we're building a streak
      if (chain >= 2) {
        setTimeout(() => playSound("chain"), 300);
      }
    } else {
      playSound("wrong");
    }

    useGameStore.getState().answerQuestion(index);

    // Track question as seen for logged in users
    if (user?.id && currentQuestion?.id) {
      markQuestionSeen(user.id, currentQuestion.id, isCorrect).catch(console.error);
    }
  };

  const handleNextQuestion = () => {
    playSound("buttonPress");
    useGameStore.getState().nextQuestion();
  };

  const handleExit = () => {
    useGameStore.getState().reset();
    router.back();
  };

  // Loading state
  if (status === "loading" || status === "idle" || !currentQuestion) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="text-white mt-4 text-lg">Loading questions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Background Elements */}
      <View className="absolute inset-0 pointer-events-none">
        <View
          className="absolute -top-10 -left-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: COLORS.primary }}
        />
        <View
          className="absolute -bottom-10 -right-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: COLORS.purple }}
        />
      </View>

      <View className="flex-1 relative">
        {/* Top HUD */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          {/* Exit Button */}
          <Pressable
            onPress={handleExit}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-white text-xl">×</Text>
          </Pressable>

          {/* Level Badge */}
          <View
            className="px-4 py-2 rounded-full flex-row items-center gap-2"
            style={{
              backgroundColor: 'rgba(30, 37, 41, 0.7)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text className="text-xl" style={{ color: COLORS.yellow }}>⭐</Text>
            <Text className="text-sm font-bold tracking-wide text-white">LEVEL {level}</Text>
          </View>

          {/* Points Badge */}
          <View
            className="px-4 py-2 rounded-full flex-row items-center gap-2"
            style={{
              backgroundColor: 'rgba(30, 37, 41, 0.7)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text className="text-xl" style={{ color: COLORS.primary }}>🏆</Text>
            <Text className="text-sm font-bold tracking-wide text-white">{score.toLocaleString()} PTS</Text>
          </View>
        </View>

        {/* Timer Section */}
        <View className="items-center py-4">
          <CircularTimer
            timeRemaining={timeRemaining}
            totalTime={15}
            questionNumber={currentQuestionIndex + 1}
          />
        </View>

        {/* Question Card */}
        <View className="px-6 mb-6">
          <View
            className="rounded-2xl relative overflow-hidden"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
            }}
          >
            {/* Question Image (if available) */}
            {currentQuestion.imageUrl && (
              <View className="relative">
                <Image
                  source={{ uri: currentQuestion.imageUrl }}
                  className="w-full h-40"
                  resizeMode="cover"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(false)}
                />
                {/* Image credit overlay */}
                {currentQuestion.imageCredit && (
                  <View className="absolute bottom-0 right-0 px-2 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <Text className="text-[9px] text-white/60">{currentQuestion.imageCredit}</Text>
                  </View>
                )}
              </View>
            )}

            <View className="p-6">
              {/* Cyan Left Border */}
              <View
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: COLORS.primary }}
              />

              <Text className="text-2xl font-bold leading-tight text-white">
                {currentQuestion.question}
              </Text>

              <View
                className="h-1 w-12 rounded-full mt-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              />
            </View>
          </View>
        </View>

        {/* Answer Options */}
        <View className="px-6 flex-col gap-3">
          {currentQuestion.answers.map((answer, index) => (
            <AnswerOption
              key={index}
              answer={answer}
              index={index}
              onPress={() => handleAnswer(index)}
              disabled={hasAnswered}
              isSelected={selectedIndex === index || lastAnswer?.selectedAnswer === answer}
              isCorrect={index === currentQuestion.correctIndex}
              showResult={hasAnswered}
            />
          ))}
        </View>

        {/* Result Feedback & Next Button */}
        {hasAnswered && lastAnswer && (
          <View className="px-6 mt-6">
            <Pressable
              onPress={handleNextQuestion}
              className="rounded-2xl py-4 px-6 active:opacity-80 flex-row items-center justify-center"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="text-lg font-bold mr-2" style={{ color: COLORS.bg }}>
                {currentQuestionIndex + 1 >= totalQuestions ? "View results" : "Next question"}
              </Text>
              <Text style={{ color: COLORS.bg }}>→</Text>
            </Pressable>
          </View>
        )}

        {/* Lifeline Dock */}
        {!hasAnswered && (
          <View className="absolute bottom-8 left-0 right-0 items-center px-4">
            <View
              className="p-1.5 rounded-full flex-row items-center gap-1"
              style={{
                backgroundColor: 'rgba(30, 37, 41, 0.7)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
              }}
            >
              <LifelineButton icon="◐" label="50/50" onPress={() => {}} />
              <View className="w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <LifelineButton icon="💡" label="HINT" onPress={() => {}} />
              <View className="w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <LifelineButton icon="⏭" label="SKIP" onPress={() => {}} />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
