import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
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

// Arena colors
const ARENA_COLORS = {
  teal: "#00c2cc",
  tealDim: "rgba(0, 194, 204, 0.15)",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  bg: "#161a1d",
  surface: "#22282c",
  surfaceLight: "#2c3339",
  yellow: "#facc15",
  pink: "#ec4899",
};

const QUESTION_TIME = 15; // seconds per question

// Mock data for preview mode
const MOCK_DUEL: Duel = {
  id: "preview",
  code: "PREVIEW",
  host_id: "preview-host",
  guest_id: "preview-guest",
  status: "playing",
  category: "football",
  rounds_total: 5,
  current_round: 3,
  host_score: 1200,
  guest_score: 1150,
  winner_id: null,
  created_at: new Date().toISOString(),
  started_at: new Date().toISOString(),
  finished_at: null,
};

const MOCK_QUESTIONS: DuelQuestion[] = [
  {
    round_number: 1,
    question_id: "q1",
    question_text: "Which player won the Ballon d'Or 2023?",
    player_name: "Messi",
    options: { A: "Haaland", B: "Mbappé", C: "Messi", D: "Bellingham", correct: "C" },
  },
  {
    round_number: 2,
    question_id: "q2",
    question_text: "Which team won the Champions League 2024?",
    player_name: "Real Madrid",
    options: { A: "Man City", B: "Real Madrid", C: "Bayern", D: "PSG", correct: "B" },
  },
  {
    round_number: 3,
    question_id: "q3",
    question_text: "Who is the all-time top scorer in Premier League history?",
    player_name: "Shearer",
    options: { A: "Rooney", B: "Kane", C: "Shearer", D: "Aguero", correct: "C" },
  },
  {
    round_number: 4,
    question_id: "q4",
    question_text: "In what year did France win their first World Cup?",
    player_name: "1998",
    options: { A: "1998", B: "2018", C: "1984", D: "2000", correct: "A" },
  },
  {
    round_number: 5,
    question_id: "q5",
    question_text: "Which club holds the record for most La Liga titles?",
    player_name: "Real Madrid",
    options: { A: "Barcelona", B: "Real Madrid", C: "Atletico", D: "Valencia", correct: "B" },
  },
];

// Circular Timer Component
function CircularTimer({
  timeLeft,
  totalTime
}: {
  timeLeft: number;
  totalTime: number;
}) {
  const progress = timeLeft / totalTime;
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(1 - progress, {
      duration: 300,
      easing: Easing.linear
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotation.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <View className="relative w-20 h-20 items-center justify-center">
      {/* Background ring */}
      <View
        className="absolute inset-0 rounded-full border-4"
        style={{ borderColor: ARENA_COLORS.surfaceLight }}
      />

      {/* Progress ring (simplified - full circle that fades) */}
      <Animated.View
        className="absolute inset-0 rounded-full border-4"
        style={[
          {
            borderColor: ARENA_COLORS.teal,
            opacity: progress,
          }
        ]}
      />

      {/* Inner circle */}
      <View
        className="absolute rounded-full"
        style={{
          width: 64,
          height: 64,
          backgroundColor: ARENA_COLORS.bg
        }}
      />

      {/* Timer text */}
      <View className="z-10 items-center">
        <Text
          className="text-3xl font-bold text-white"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {String(timeLeft).padStart(2, '0')}
        </Text>
        <Text className="text-[9px] uppercase tracking-widest text-gray-400">
          SEC
        </Text>
      </View>

      {/* Lightning bolt badge */}
      <View
        className="absolute -bottom-3 z-20 rounded-full p-1.5"
        style={{
          backgroundColor: ARENA_COLORS.surfaceLight,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <Text className="text-lg">⚡</Text>
      </View>
    </View>
  );
}

// Player Avatar Component
function PlayerAvatar({
  isYou,
  score,
  isWaiting,
  pointsGained,
  avatarUrl,
}: {
  isYou: boolean;
  score: number;
  isWaiting?: boolean;
  pointsGained?: number;
  avatarUrl?: string;
}) {
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (isWaiting) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [isWaiting]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const borderColor = isYou ? ARENA_COLORS.teal : ARENA_COLORS.surfaceLight;
  const glowColor = isYou ? 'rgba(0, 194, 204, 0.35)' : 'transparent';

  return (
    <View className="items-center gap-3">
      {/* Thinking indicator for opponent */}
      {!isYou && isWaiting && (
        <Animated.View
          style={pulseStyle}
          className="absolute -top-10 right-0"
        >
          <View
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: ARENA_COLORS.surfaceLight,
              borderWidth: 1,
              borderColor: `${ARENA_COLORS.purple}40`,
            }}
          >
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: ARENA_COLORS.purple }}
            />
            <Text
              className="text-[10px] font-bold"
              style={{ color: ARENA_COLORS.purple }}
            >
              Thinking...
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Avatar */}
      <View className="relative">
        <View
          className="w-16 h-16 rounded-full p-0.5"
          style={{
            backgroundColor: isYou ? ARENA_COLORS.teal : 'transparent',
            borderWidth: isYou ? 0 : 2,
            borderColor: borderColor,
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isYou ? 1 : 0,
            shadowRadius: 10,
          }}
        >
          <View
            className="w-full h-full rounded-full overflow-hidden"
            style={{
              backgroundColor: ARENA_COLORS.surface,
              opacity: isYou ? 1 : 0.8,
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-full h-full"
                style={{ opacity: isYou ? 1 : 0.6 }}
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Text className="text-2xl">{isYou ? '😎' : '🤖'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Badge */}
        <View
          className="absolute -bottom-2 left-1/2 px-2 py-0.5 rounded-full"
          style={{
            transform: [{ translateX: -20 }],
            backgroundColor: isYou ? ARENA_COLORS.teal : ARENA_COLORS.surfaceLight,
            borderWidth: isYou ? 0 : 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Text
            className="text-[10px] font-bold"
            style={{ color: isYou ? ARENA_COLORS.bg : '#9ca3af' }}
          >
            {isYou ? 'TOI' : 'RIVAL'}
          </Text>
        </View>
      </View>

      {/* Score */}
      <View className="items-center">
        <Text
          className="text-2xl font-bold leading-none"
          style={{ color: isYou ? 'white' : '#9ca3af' }}
        >
          {score.toLocaleString()}
        </Text>
        {pointsGained && pointsGained > 0 ? (
          <Text
            className="text-[10px] font-medium mt-1"
            style={{ color: ARENA_COLORS.teal }}
          >
            +{pointsGained} pts
          </Text>
        ) : (
          <Text className="text-[10px] font-medium mt-1 text-gray-500">
            {isWaiting ? 'En attente...' : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

// Answer Option Component
function AnswerOption({
  letter,
  text,
  isSelected,
  isCorrect,
  isRevealed,
  onPress,
  disabled,
}: {
  letter: string;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isRevealed: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const pingAnim = useSharedValue(0);

  useEffect(() => {
    if (isSelected && !isRevealed) {
      pingAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 600 })
        ),
        -1,
        false
      );
    }
  }, [isSelected]);

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pingStyle = useAnimatedStyle(() => ({
    opacity: pingAnim.value,
    transform: [{ scale: 1 + pingAnim.value * 0.5 }],
  }));

  let bgColor = ARENA_COLORS.surface;
  let borderColor = 'rgba(255,255,255,0.05)';
  let borderWidth = 1;

  if (isSelected && !isRevealed) {
    bgColor = ARENA_COLORS.tealDim;
    borderColor = ARENA_COLORS.teal;
    borderWidth = 2;
  } else if (isRevealed && isCorrect) {
    bgColor = 'rgba(34, 197, 94, 0.2)';
    borderColor = '#22c55e';
    borderWidth = 2;
  } else if (isRevealed && isSelected && !isCorrect) {
    bgColor = 'rgba(239, 68, 68, 0.2)';
    borderColor = '#ef4444';
    borderWidth = 2;
  } else if (isRevealed) {
    bgColor = ARENA_COLORS.surface;
    borderColor = 'rgba(255,255,255,0.05)';
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        className="relative flex-row items-center justify-center p-4 h-24 rounded-xl overflow-hidden"
        style={{
          backgroundColor: bgColor,
          borderWidth: borderWidth,
          borderColor: borderColor,
          shadowColor: isSelected ? ARENA_COLORS.teal : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isSelected ? 0.5 : 0,
          shadowRadius: 10,
        }}
      >
        {/* Letter badge */}
        <View
          className="absolute top-3 left-3 w-6 h-6 rounded-full items-center justify-center"
          style={{
            backgroundColor: isSelected ? ARENA_COLORS.teal : 'transparent',
            borderWidth: isSelected ? 0 : 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        >
          {isSelected && !isRevealed ? (
            <Text className="text-xs font-bold" style={{ color: ARENA_COLORS.bg }}>✓</Text>
          ) : isRevealed && isCorrect ? (
            <Text className="text-xs font-bold text-green-400">✓</Text>
          ) : isRevealed && isSelected && !isCorrect ? (
            <Text className="text-xs font-bold text-red-400">✗</Text>
          ) : (
            <Text className="text-xs font-bold text-gray-400">{letter}</Text>
          )}
        </View>

        {/* Answer text */}
        <Text
          className="text-lg font-medium text-center"
          style={{
            color: isSelected || (isRevealed && isCorrect) ? 'white' : '#e5e7eb',
            fontWeight: isSelected ? '700' : '500',
          }}
        >
          {text}
        </Text>

        {/* Ping effect for selected */}
        {isSelected && !isRevealed && (
          <Animated.View
            style={[pingStyle, {
              position: 'absolute',
              top: -4,
              right: -4,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: ARENA_COLORS.teal,
            }]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

// Power-up Button Component
function PowerUpButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="items-center gap-1"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{
          backgroundColor: ARENA_COLORS.surfaceLight,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <Text className="text-xl">{icon}</Text>
      </View>
      <Text className="text-[10px] font-medium text-gray-500">{label}</Text>
    </Pressable>
  );
}

// Streak Badge Component
function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;

  return (
    <View
      className="flex-row items-center gap-2 px-4 py-2 rounded-full"
      style={{
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <Text className="text-sm">🔥</Text>
      <Text
        className="text-xs font-bold"
        style={{ color: '#fda4af' }}
      >
        Streak: {streak}
      </Text>
    </View>
  );
}

// Main Component
export default function DuelPlayScreen() {
  const { id, preview } = useLocalSearchParams<{ id: string; preview?: string }>();
  const { user } = useAuth();
  const isPreviewMode = preview === "true" || id === "preview";

  const [duel, setDuel] = useState<Duel | null>(isPreviewMode ? MOCK_DUEL : null);
  const [questions, setQuestions] = useState<DuelQuestion[]>(isPreviewMode ? MOCK_QUESTIONS : []);
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(!isPreviewMode);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [streak, setStreak] = useState(isPreviewMode ? 3 : 0);
  const [pointsGained, setPointsGained] = useState(isPreviewMode ? 150 : 0);
  const startTime = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isHost = isPreviewMode ? true : duel?.host_id === user?.id;
  const myScore = isPreviewMode ? MOCK_DUEL.host_score : (isHost ? duel?.host_score || 0 : duel?.guest_score || 0);
  const opponentScore = isPreviewMode ? MOCK_DUEL.guest_score : (isHost ? duel?.guest_score || 0 : duel?.host_score || 0);

  // Timer logic
  useEffect(() => {
    if (loading || selectedAnswer) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-fail
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, currentRound, selectedAnswer]);

  const handleTimeout = useCallback(async () => {
    if (selectedAnswer || !duel || !user || !questions[currentRound]) return;

    setSelectedAnswer('TIMEOUT');
    setIsCorrect(false);
    setIsRevealed(true);
    setStreak(0);
    await wrongAnswerFeedback();

    setTimeout(() => {
      moveToNextRound();
    }, 2000);
  }, [duel, user, questions, currentRound, selectedAnswer]);

  useEffect(() => {
    // Skip loading in preview mode
    if (isPreviewMode) {
      startTime.current = Date.now();
      return;
    }

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

    const channel = subscribeToDuel(id, (updatedDuel) => {
      setDuel(updatedDuel);
      if (updatedDuel.status === "finished") {
        router.replace(`/duel/result?id=${id}`);
      }
    });

    return () => {
      channel.unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, isPreviewMode]);

  const moveToNextRound = () => {
    if (currentRound + 1 >= questions.length) {
      if (!isPreviewMode) {
        finishDuel(duel!.id);
      } else {
        // In preview mode, just loop back to start
        setCurrentRound(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setIsRevealed(false);
        setPointsGained(0);
        setTimeLeft(QUESTION_TIME);
        startTime.current = Date.now();
      }
    } else {
      setCurrentRound(currentRound + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setIsRevealed(false);
      setPointsGained(0);
      setTimeLeft(QUESTION_TIME);
      startTime.current = Date.now();
    }
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer || !duel || !questions[currentRound]) return;
    if (!isPreviewMode && !user) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(answer);
    const answerTimeMs = Date.now() - startTime.current;

    // Preview mode: check answer locally
    if (isPreviewMode) {
      const currentQ = questions[currentRound];
      const correct = answer === currentQ.options.correct;

      setTimeout(async () => {
        setIsCorrect(correct);
        setIsRevealed(true);

        if (correct) {
          await correctAnswerFeedback();
          setStreak((s) => s + 1);
          const basePoints = 100;
          const timeBonus = Math.floor((timeLeft / QUESTION_TIME) * 50);
          setPointsGained(basePoints + timeBonus);
        } else {
          await wrongAnswerFeedback();
          setStreak(0);
        }

        setTimeout(() => {
          moveToNextRound();
        }, 2000);
      }, 500);
      return;
    }

    // Real mode: submit to API
    try {
      const result = await submitDuelAnswer(
        duel.id,
        user!.id,
        currentRound + 1,
        answer,
        answerTimeMs
      );

      setTimeout(async () => {
        setIsCorrect(result.isCorrect);
        setIsRevealed(true);

        if (result.isCorrect) {
          await correctAnswerFeedback();
          setStreak((s) => s + 1);
          const basePoints = 100;
          const timeBonus = Math.floor((timeLeft / QUESTION_TIME) * 50);
          setPointsGained(basePoints + timeBonus);
        } else {
          await wrongAnswerFeedback();
          setStreak(0);
        }

        setTimeout(() => {
          moveToNextRound();
        }, 2000);
      }, 500);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: ARENA_COLORS.bg }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ARENA_COLORS.teal} />
          <Text className="text-gray-400 mt-4">Loading arena...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!duel || questions.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: ARENA_COLORS.bg }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">❌</Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
            Loading error
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-xl py-4 px-8 mt-6"
            style={{ backgroundColor: ARENA_COLORS.teal }}
          >
            <Text className="font-bold" style={{ color: ARENA_COLORS.bg }}>
              Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentRound];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: ARENA_COLORS.bg }}>
      {/* Background decorative blurs */}
      <View
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '-10%',
          left: '-10%',
          width: '50%',
          height: '30%',
          backgroundColor: `${ARENA_COLORS.teal}15`,
          transform: [{ scale: 2 }],
        }}
      />
      <View
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: '10%',
          right: '-10%',
          width: '40%',
          height: '30%',
          backgroundColor: `${ARENA_COLORS.coral}15`,
          transform: [{ scale: 2 }],
        }}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <Text className="text-gray-400 text-xl">✕</Text>
        </Pressable>

        <View className="items-center">
          <Text className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">
            Live Arena
          </Text>
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: ARENA_COLORS.surfaceLight,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: ARENA_COLORS.teal }}
            >
              Round {currentRound + 1} sur {questions.length}
            </Text>
          </View>
        </View>

        <View className="w-10 h-10" />
      </View>

      {/* Main Game Area */}
      <View className="flex-1 px-5 py-4">
        {/* Scoreboard */}
        <View className="flex-row items-center justify-between mb-6">
          <PlayerAvatar
            isYou={true}
            score={myScore}
            pointsGained={isCorrect ? pointsGained : 0}
          />

          <CircularTimer
            timeLeft={timeLeft}
            totalTime={QUESTION_TIME}
          />

          <PlayerAvatar
            isYou={false}
            score={opponentScore}
            isWaiting={!isRevealed}
          />
        </View>

        {/* Question Card */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: `${ARENA_COLORS.surface}80`,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          {/* Category & Difficulty */}
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-sm">📚</Text>
            <Text
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: ARENA_COLORS.teal }}
            >
              Football • ⚽
            </Text>
          </View>

          {/* Question */}
          <Text className="text-xl font-medium text-white leading-7">
            {currentQuestion.question_text}
          </Text>

          {/* Progress bar */}
          <View
            className="w-full h-1.5 rounded-full mt-6 overflow-hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <LinearGradient
              colors={[ARENA_COLORS.teal, ARENA_COLORS.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: '100%',
                width: `${((currentRound + 1) / questions.length) * 100}%`,
                borderRadius: 9999,
              }}
            />
          </View>
        </View>

        {/* Answer Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {["A", "B", "C", "D"].map((key) => {
            const option = currentQuestion.options[key as keyof typeof currentQuestion.options];
            if (key === "correct" || !option) return null;
            const correctKey = currentQuestion.options.correct;

            return (
              <View key={key} className="w-[48%]">
                <AnswerOption
                  letter={key}
                  text={option}
                  isSelected={selectedAnswer === key}
                  isCorrect={key === correctKey}
                  isRevealed={isRevealed}
                  onPress={() => handleAnswer(key)}
                  disabled={!!selectedAnswer}
                />
              </View>
            );
          })}
        </View>

        {/* Power-ups & Streak */}
        <View className="flex-row items-center justify-center gap-4 pb-4">
          <PowerUpButton
            icon="➖"
            label="50/50"
            onPress={() => {}}
            disabled={true}
          />
          <PowerUpButton
            icon="⏱️"
            label="+Time"
            onPress={() => {}}
            disabled={true}
          />

          <View
            className="h-8 mx-2"
            style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
          />

          <StreakBadge streak={streak} />
        </View>
      </View>
    </SafeAreaView>
  );
}
