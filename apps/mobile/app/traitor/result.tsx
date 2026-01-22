import { View, Text, Pressable, ScrollView, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { buttonPressFeedback, playHaptic } from "../../src/utils/feedback";

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

interface PlayerAnswer {
  playerId: number;
  playerName: string;
  answerIndex: number;
  isCorrect: boolean;
}

export default function TraitorResultScreen() {
  const { players: playersParam, traitorIndex: traitorIndexParam, votes: votesParam, answers: answersParam } =
    useLocalSearchParams<{
      players: string;
      traitorIndex: string;
      votes: string;
      answers: string;
    }>();

  const players: string[] = playersParam ? JSON.parse(playersParam) : [];
  const traitorIndex = Number(traitorIndexParam);
  const votes: number[] = votesParam ? JSON.parse(votesParam) : [];
  const allAnswers: PlayerAnswer[][] = answersParam ? JSON.parse(answersParam) : [];

  // Animation values
  const revealScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    revealScale.value = withDelay(300, withSpring(1, { damping: 8 }));
    contentOpacity.value = withDelay(800, withSpring(1));
    playHaptic("success");
  }, []);

  const revealStyle = useAnimatedStyle(() => ({
    transform: [{ scale: revealScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Count votes for each player
  const voteCounts = players.map((_, idx) =>
    votes.filter(v => v === idx).length
  );

  // Find who got the most votes
  const maxVotes = Math.max(...voteCounts);
  const mostVotedIndex = voteCounts.indexOf(maxVotes);

  // Determine winner
  const traitorCaught = mostVotedIndex === traitorIndex && maxVotes > 0;
  const traitorName = players[traitorIndex];

  // Calculate traitor stats
  const traitorStats = (() => {
    let correct = 0;
    let total = 0;
    allAnswers.forEach(round => {
      const answer = round.find(a => a.playerId === traitorIndex);
      if (answer) {
        total++;
        if (answer.isCorrect) correct++;
      }
    });
    return { correct, total, wrong: total - correct };
  })();

  const handleShare = async () => {
    buttonPressFeedback();
    try {
      await Share.share({
        message: `We played Traitor Mode on BIGHEAD!\n\n${
          traitorCaught
            ? `We caught the traitor: ${traitorName}!`
            : `${traitorName} fooled everyone as the traitor!`
        }\n\nCan you find the traitor among your friends?`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-6">
        {/* Result Header */}
        <View className="items-center mb-6">
          <Animated.View style={revealStyle}>
            <Text className="text-8xl mb-4">
              {traitorCaught ? "🎉" : "🕵️"}
            </Text>
          </Animated.View>

          <Text
            className="text-3xl font-black text-center mb-2"
            style={{ color: traitorCaught ? COLORS.green : COLORS.coral }}
          >
            {traitorCaught ? "TRAITOR CAUGHT!" : "TRAITOR WINS!"}
          </Text>

          <Text className="text-gray-400 text-center">
            {traitorCaught
              ? "The group successfully identified the traitor!"
              : "The traitor fooled everyone!"}
          </Text>
        </View>

        {/* Traitor Reveal */}
        <Animated.View style={contentStyle}>
          <View
            className="rounded-2xl p-6 mb-6 items-center"
            style={{
              backgroundColor: traitorCaught ? `${COLORS.green}20` : `${COLORS.coral}20`,
              borderWidth: 2,
              borderColor: traitorCaught ? COLORS.green : COLORS.coral,
            }}
          >
            <Text className="text-gray-400 text-sm mb-2">THE TRAITOR WAS</Text>
            <Text className="text-white text-3xl font-black mb-2">
              {traitorName}
            </Text>
            <View className="flex-row items-center gap-4 mt-2">
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: COLORS.coral }}>
                  {traitorStats.wrong}
                </Text>
                <Text className="text-gray-400 text-xs">Wrong</Text>
              </View>
              <View className="w-px h-8" style={{ backgroundColor: COLORS.surfaceLight }} />
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: COLORS.green }}>
                  {traitorStats.correct}
                </Text>
                <Text className="text-gray-400 text-xs">Correct</Text>
              </View>
            </View>
          </View>

          {/* Vote Results */}
          <View className="mb-6">
            <Text className="text-white font-bold mb-4">Vote Results</Text>
            {players.map((player, idx) => {
              const voteCount = voteCounts[idx];
              const isTraitor = idx === traitorIndex;
              const wasMostVoted = idx === mostVotedIndex && maxVotes > 0;

              return (
                <View
                  key={idx}
                  className="rounded-xl p-4 mb-3 flex-row items-center justify-between"
                  style={{
                    backgroundColor: isTraitor ? `${COLORS.coral}20` : COLORS.surface,
                    borderWidth: isTraitor ? 2 : 1,
                    borderColor: isTraitor ? COLORS.coral : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: isTraitor ? COLORS.coral : COLORS.surfaceLight,
                      }}
                    >
                      <Text
                        className="font-bold"
                        style={{ color: isTraitor ? COLORS.bg : COLORS.text }}
                      >
                        {player.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-white font-bold">{player}</Text>
                        {isTraitor && (
                          <View
                            className="px-2 py-0.5 rounded"
                            style={{ backgroundColor: COLORS.coral }}
                          >
                            <Text className="text-xs font-bold" style={{ color: COLORS.bg }}>
                              TRAITOR
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-400 text-sm">
                        {voteCount} vote{voteCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>

                  {wasMostVoted && (
                    <Text className="text-2xl">
                      {isTraitor ? "✓" : "✗"}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.replace("/traitor");
              }}
              className="rounded-2xl py-4"
              style={{ backgroundColor: COLORS.coral }}
            >
              <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
                Play Again
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShare}
              className="rounded-2xl py-4"
              style={{ backgroundColor: COLORS.surface }}
            >
              <Text className="text-white text-center font-bold">
                Share Results
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.replace("/");
              }}
              className="py-4"
            >
              <Text className="text-gray-400 text-center">
                Back to Home
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
