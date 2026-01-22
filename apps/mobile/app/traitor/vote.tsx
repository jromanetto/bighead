import { View, Text, Pressable, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { playHaptic, buttonPressFeedback } from "../../src/utils/feedback";

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

export default function TraitorVoteScreen() {
  const { players: playersParam, traitorIndex: traitorIndexParam, answers: answersParam } =
    useLocalSearchParams<{
      players: string;
      traitorIndex: string;
      answers: string;
    }>();

  const players: string[] = playersParam ? JSON.parse(playersParam) : [];
  const traitorIndex = Number(traitorIndexParam);
  const allAnswers: PlayerAnswer[][] = answersParam ? JSON.parse(answersParam) : [];

  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [votes, setVotes] = useState<number[]>([]);
  const [showingStats, setShowingStats] = useState(true);

  // Calculate stats for each player
  const playerStats = players.map((_, playerIdx) => {
    let correct = 0;
    let total = 0;
    allAnswers.forEach(round => {
      const answer = round.find(a => a.playerId === playerIdx);
      if (answer) {
        total++;
        if (answer.isCorrect) correct++;
      }
    });
    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });

  const handleVote = (votedPlayerIndex: number) => {
    playHaptic("medium");
    const newVotes = [...votes, votedPlayerIndex];
    setVotes(newVotes);

    if (currentVoterIndex < players.length - 1) {
      setCurrentVoterIndex(currentVoterIndex + 1);
      setShowingStats(true);
    } else {
      // All votes collected - go to results
      router.replace({
        pathname: "/traitor/result",
        params: {
          players: playersParam,
          traitorIndex: traitorIndexParam,
          votes: JSON.stringify(newVotes),
          answers: answersParam,
        },
      });
    }
  };

  const handleContinueFromStats = () => {
    buttonPressFeedback();
    setShowingStats(false);
  };

  // Show stats before voting
  if (showingStats) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <ScrollView className="flex-1" contentContainerClassName="px-6 py-6">
          <Text className="text-white text-2xl font-black text-center mb-2">
            Game Complete!
          </Text>
          <Text className="text-gray-400 text-center mb-6">
            Review the results before voting
          </Text>

          {/* Player Stats */}
          <View className="mb-8">
            <Text className="text-white font-bold mb-4">Player Results</Text>
            {players.map((player, idx) => {
              const stats = playerStats[idx];
              return (
                <View
                  key={idx}
                  className="rounded-xl p-4 mb-3"
                  style={{
                    backgroundColor: COLORS.surface,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: COLORS.surfaceLight }}
                      >
                        <Text className="text-white font-bold">
                          {player.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-white font-bold">{player}</Text>
                    </View>
                    <Text
                      className="font-bold text-lg"
                      style={{
                        color: stats.percentage >= 70
                          ? COLORS.green
                          : stats.percentage >= 40
                          ? COLORS.yellow
                          : COLORS.coral,
                      }}
                    >
                      {stats.percentage}%
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className="h-2 flex-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: COLORS.bg }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${stats.percentage}%`,
                          backgroundColor:
                            stats.percentage >= 70
                              ? COLORS.green
                              : stats.percentage >= 40
                              ? COLORS.yellow
                              : COLORS.coral,
                        }}
                      />
                    </View>
                    <Text className="text-gray-400 text-sm ml-3">
                      {stats.correct}/{stats.total}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Hint */}
          <View
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: `${COLORS.coral}20` }}
          >
            <Text style={{ color: COLORS.coral }} className="text-center font-medium">
              The Traitor needed to give wrong answers.{'\n'}
              Who do you suspect?
            </Text>
          </View>

          <Pressable
            onPress={handleContinueFromStats}
            className="rounded-2xl py-4"
            style={{ backgroundColor: COLORS.coral }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              Start Voting
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Voting screen
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-6 py-6">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-gray-400 text-sm mb-2">
            Vote {currentVoterIndex + 1} of {players.length}
          </Text>
          <Text className="text-white text-2xl font-black mb-1">
            {players[currentVoterIndex]}
          </Text>
          <Text className="text-gray-400 text-center">
            Who do you think is the Traitor?
          </Text>
        </View>

        {/* Vote options */}
        <View className="flex-1">
          <Text className="text-white font-bold mb-4">Cast your vote</Text>
          {players.map((player, idx) => {
            // Can't vote for yourself
            if (idx === currentVoterIndex) return null;

            const stats = playerStats[idx];
            return (
              <Pressable
                key={idx}
                onPress={() => handleVote(idx)}
                className="rounded-xl p-4 mb-3 active:opacity-80"
                style={{
                  backgroundColor: COLORS.surface,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: COLORS.surfaceLight }}
                    >
                      <Text className="text-white text-xl font-bold">
                        {player.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-white font-bold text-lg">{player}</Text>
                      <Text className="text-gray-400 text-sm">
                        {stats.correct}/{stats.total} correct ({stats.percentage}%)
                      </Text>
                    </View>
                  </View>
                  <View
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: COLORS.coral }}
                  >
                    <Text className="font-bold" style={{ color: COLORS.bg }}>
                      Vote
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Skip vote option */}
        <Pressable
          onPress={() => handleVote(-1)}
          className="rounded-xl py-3"
          style={{ backgroundColor: COLORS.surfaceLight }}
        >
          <Text className="text-gray-400 text-center font-medium">
            Skip (no vote)
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
