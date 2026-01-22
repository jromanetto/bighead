import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  getCurrentTournament,
  joinTournament,
  getTournamentLeaderboard,
  type Tournament,
  type TournamentLeaderboardEntry,
} from "../../src/services/tournament";

export default function TournamentScreen() {
  const { user, isAnonymous } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<TournamentLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadTournament();
  }, []);

  const loadTournament = async () => {
    try {
      const data = await getCurrentTournament();
      setTournament(data);

      if (data) {
        const lb = await getTournamentLeaderboard(data.tournament_id, 10);
        setLeaderboard(lb);
      }
    } catch (error) {
      console.error("Error loading tournament:", error);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!tournament || !user || isAnonymous) {
      router.push("/profile");
      return;
    }

    setJoining(true);
    try {
      const result = await joinTournament(tournament.tournament_id);
      if (result.success) {
        router.push(`/tournament/play?id=${tournament.tournament_id}`);
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
    }
    setJoining(false);
  };

  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return "Terminé";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}j ${hours}h restants`;
    return `${hours}h restantes`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">🏆</Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
            Pas de tournoi actif
          </Text>
          <Text className="text-gray-400 text-center mb-8">
            Reviens bientôt pour le prochain tournoi !
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-primary-500 rounded-xl py-4 px-8"
          >
            <Text className="text-white font-bold">Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-6">
        {/* Header */}
        <View className="flex-row items-center pt-4 mb-6">
          <Pressable onPress={() => router.back()} className="p-2 mr-4">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Tournoi</Text>
        </View>

        {/* Tournament Card */}
        <View className="bg-gradient-to-b from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 mb-6 border border-yellow-500/30">
          <View className="items-center mb-4">
            <Text className="text-6xl mb-3">🏆</Text>
            <Text className="text-white text-2xl font-bold text-center">
              {tournament.tournament_name}
            </Text>
            {tournament.tournament_description && (
              <Text className="text-gray-400 text-center mt-2">
                {tournament.tournament_description}
              </Text>
            )}
          </View>

          {/* Status Badge */}
          <View className="flex-row justify-center mb-4">
            <View
              className={`rounded-full px-4 py-2 ${
                tournament.tournament_status === "active"
                  ? "bg-green-500/20"
                  : tournament.tournament_status === "upcoming"
                  ? "bg-blue-500/20"
                  : "bg-gray-500/20"
              }`}
            >
              <Text
                className={`font-bold ${
                  tournament.tournament_status === "active"
                    ? "text-green-400"
                    : tournament.tournament_status === "upcoming"
                    ? "text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {tournament.tournament_status === "active"
                  ? "EN COURS"
                  : tournament.tournament_status === "upcoming"
                  ? "À VENIR"
                  : "TERMINÉ"}
              </Text>
            </View>
          </View>

          {/* Info */}
          <View className="flex-row justify-around mb-6">
            <View className="items-center">
              <Text className="text-gray-400 text-xs">QUESTIONS</Text>
              <Text className="text-white text-xl font-bold">
                {tournament.questions_count}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-400 text-xs">PARTICIPANTS</Text>
              <Text className="text-white text-xl font-bold">
                {tournament.participants_count}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-400 text-xs">PRIX</Text>
              <Text className="text-yellow-400 text-xl font-bold">
                {tournament.prize_xp} XP
              </Text>
            </View>
          </View>

          {/* Time Remaining */}
          <View className="bg-black/20 rounded-xl p-3 mb-4">
            <Text className="text-gray-400 text-center text-sm">
              ⏱️ {formatTimeRemaining(tournament.end_date)}
            </Text>
          </View>

          {/* User Status / Action */}
          {tournament.user_participated ? (
            <View className="bg-green-500/20 rounded-xl p-4">
              <Text className="text-green-400 text-center font-bold mb-1">
                ✓ Tu as participé !
              </Text>
              {tournament.user_rank && (
                <Text className="text-gray-400 text-center">
                  Classement: #{tournament.user_rank} • Score: {tournament.user_score}
                </Text>
              )}
            </View>
          ) : tournament.tournament_status === "active" ? (
            <Pressable
              onPress={handleJoin}
              disabled={joining}
              className="bg-yellow-500 rounded-xl py-4"
            >
              {joining ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text className="text-black text-center font-bold text-lg">
                  Participer maintenant !
                </Text>
              )}
            </Pressable>
          ) : (
            <View className="bg-gray-700 rounded-xl py-4">
              <Text className="text-gray-400 text-center font-bold">
                {tournament.tournament_status === "upcoming"
                  ? "Bientôt disponible"
                  : "Tournoi terminé"}
              </Text>
            </View>
          )}
        </View>

        {/* Leaderboard Preview */}
        {leaderboard.length > 0 && (
          <View className="bg-gray-800 rounded-2xl p-4">
            <Text className="text-white font-bold text-lg mb-4">
              🏅 Top 10 Classement
            </Text>

            {leaderboard.map((entry, index) => (
              <View
                key={entry.user_id}
                className={`flex-row items-center py-3 ${
                  index < leaderboard.length - 1 ? "border-b border-gray-700" : ""
                }`}
              >
                <View className="w-8 items-center">
                  <Text
                    className={`font-bold ${
                      entry.rank === 1
                        ? "text-yellow-400"
                        : entry.rank === 2
                        ? "text-gray-300"
                        : entry.rank === 3
                        ? "text-orange-400"
                        : "text-gray-500"
                    }`}
                  >
                    {entry.rank <= 3
                      ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                      : `#${entry.rank}`}
                  </Text>
                </View>
                <Text className="flex-1 text-white ml-3">{entry.username}</Text>
                <Text className="text-primary-400 font-bold">{entry.score}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Anonymous Prompt */}
        {isAnonymous && (
          <Pressable
            onPress={() => router.push("/profile")}
            className="bg-orange-500/20 rounded-xl p-4 mt-4"
          >
            <Text className="text-orange-400 text-center">
              Crée un compte pour participer aux tournois ! 🏆
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
