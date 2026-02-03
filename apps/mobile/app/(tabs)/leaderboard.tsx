import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getLeaderboard, getWeeklyLeaderboard, getUserRank, type LeaderboardEntry } from "../../src/services/games";
import { useAuth } from "../../src/contexts/AuthContext";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { SmallAvatar } from "../../src/components/ProfileAvatar";
import { IconButton } from "../../src/components/ui";

// New QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  gold: "#FFD100",
  goldDim: "rgba(255, 209, 0, 0.2)",
  silver: "#9ca3af",
  bronze: "#f97316",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// Rank Badge component
function RankBadge({ rank }: { rank: number }) {
  let bgColor = COLORS.surfaceLight;
  let textColor = COLORS.text;

  if (rank === 1) {
    bgColor = COLORS.gold;
    textColor = COLORS.bg;
  } else if (rank === 2) {
    bgColor = COLORS.silver;
    textColor = COLORS.bg;
  } else if (rank === 3) {
    bgColor = COLORS.bronze;
    textColor = COLORS.bg;
  }

  return (
    <View
      className="rounded-full items-center justify-center"
      style={{
        width: 24,
        height: 24,
        backgroundColor: bgColor,
        position: 'absolute',
        bottom: -4,
        right: -4,
      }}
    >
      <Text className="text-xs font-bold" style={{ color: textColor }}>#{rank}</Text>
    </View>
  );
}

// Leaderboard Row component
function LeaderboardRow({
  player,
  rank,
  isCurrentUser
}: {
  player: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}) {
  return (
    <View
      className="flex-row items-center py-3 px-4 rounded-2xl mb-2"
      style={{
        backgroundColor: isCurrentUser ? COLORS.primaryDim : COLORS.surface,
        borderWidth: isCurrentUser ? 1 : 0,
        borderColor: isCurrentUser ? `${COLORS.primary}40` : 'transparent',
      }}
    >
      <Text
        className="w-8 text-base"
        style={{ color: isCurrentUser ? COLORS.primary : COLORS.textMuted }}
      >
        {rank}
      </Text>
      <SmallAvatar
        userId={player.id}
        username={player.username}
        avatarUrl={player.avatar_url}
        size={40}
        isCurrentUser={isCurrentUser}
      />
      <View className="flex-1 ml-3">
        <Text
          className="font-semibold"
          style={{ color: isCurrentUser ? COLORS.primary : COLORS.text }}
        >
          {player.username || "Player"}
        </Text>
      </View>
      <Text className="font-bold" style={{ color: COLORS.text }}>
        {player.total_xp?.toLocaleString() || 0}
        <Text style={{ color: COLORS.textMuted }}> XP</Text>
      </Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { user, profile, isAnonymous } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime">("weekly");
  const [userRank, setUserRank] = useState<{ rank: number; total_xp: number } | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  useEffect(() => {
    if (user && !isAnonymous) {
      loadUserRank();
    }
  }, [user, isAnonymous]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = activeTab === "weekly"
        ? await getWeeklyLeaderboard(50)
        : await getLeaderboard(50);
      setLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setLeaderboard([]);
    }
    setLoading(false);
  };

  const loadUserRank = async () => {
    if (!user) return;
    try {
      const rank = await getUserRank(user.id);
      setUserRank(rank);
    } catch (error) {
      console.error("Error loading user rank:", error);
    }
  };

  const isCurrentUser = (playerId: string) => user?.id === playerId;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 mb-4">
        <IconButton
          name="ArrowLeft"
          onPress={() => router.back()}
          variant="glass"
          size={40}
          style={{ marginRight: 12 }}
        />
        <Text className="text-white text-2xl font-black">LEADERBOARD</Text>
      </View>

        {/* Tabs */}
        <View
          className="flex-row mx-5 mb-6 rounded-2xl p-1"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              setActiveTab("weekly");
            }}
            className="flex-1 rounded-xl py-3"
            style={{
              backgroundColor: activeTab === "weekly" ? COLORS.primary : 'transparent',
            }}
          >
            <Text
              className="text-center font-bold"
              style={{
                color: activeTab === "weekly" ? COLORS.bg : COLORS.textMuted,
              }}
            >
              This Week
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              setActiveTab("alltime");
            }}
            className="flex-1 rounded-xl py-3"
            style={{
              backgroundColor: activeTab === "alltime" ? COLORS.primary : 'transparent',
            }}
          >
            <Text
              className="text-center font-bold"
              style={{
                color: activeTab === "alltime" ? COLORS.bg : COLORS.textMuted,
              }}
            >
              All Time
            </Text>
          </Pressable>
        </View>

        {/* Loading state */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="text-gray-400 mt-4">Loading...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-6xl mb-4">🏆</Text>
            <Text className="text-white text-xl font-bold text-center mb-2">
              No leaderboard yet
            </Text>
            <Text className="text-gray-400 text-center">
              {activeTab === "weekly"
                ? "No players this week. Be the first!"
                : "Play games to appear on the leaderboard!"}
            </Text>
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/game/chain");
              }}
              className="rounded-2xl py-4 px-8 mt-6"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="font-bold" style={{ color: COLORS.bg }}>Play Now</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <View className="flex-row justify-center items-end px-5 mb-6" style={{ height: 140 }}>
                {/* 2nd place */}
                <View className="items-center flex-1">
                  <View className="relative">
                    <SmallAvatar
                      userId={leaderboard[1].id}
                      username={leaderboard[1].username}
                      avatarUrl={leaderboard[1].avatar_url}
                      size={56}
                      isCurrentUser={isCurrentUser(leaderboard[1].id)}
                      ringColor={COLORS.silver}
                    />
                    <RankBadge rank={2} />
                  </View>
                  <Text
                    className="text-sm font-medium mt-2"
                    style={{ color: isCurrentUser(leaderboard[1].id) ? COLORS.primary : COLORS.text }}
                    numberOfLines={1}
                  >
                    {leaderboard[1].username || "Joueur"}
                  </Text>
                  <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                    {leaderboard[1].total_xp?.toLocaleString() || 0} XP
                  </Text>
                </View>

                {/* 1st place */}
                <View className="items-center flex-1 -mt-8">
                  <Text className="text-2xl mb-2">👑</Text>
                  <View className="relative">
                    <SmallAvatar
                      userId={leaderboard[0].id}
                      username={leaderboard[0].username}
                      avatarUrl={leaderboard[0].avatar_url}
                      size={72}
                      isCurrentUser={isCurrentUser(leaderboard[0].id)}
                      ringColor={COLORS.gold}
                    />
                    <RankBadge rank={1} />
                  </View>
                  <Text
                    className="text-sm font-bold mt-2"
                    style={{ color: isCurrentUser(leaderboard[0].id) ? COLORS.primary : COLORS.gold }}
                    numberOfLines={1}
                  >
                    {leaderboard[0].username || "Joueur"}
                  </Text>
                  <Text style={{ color: COLORS.gold }} className="text-xs">
                    {leaderboard[0].total_xp?.toLocaleString() || 0} XP
                  </Text>
                </View>

                {/* 3rd place */}
                <View className="items-center flex-1">
                  <View className="relative">
                    <SmallAvatar
                      userId={leaderboard[2].id}
                      username={leaderboard[2].username}
                      avatarUrl={leaderboard[2].avatar_url}
                      size={56}
                      isCurrentUser={isCurrentUser(leaderboard[2].id)}
                      ringColor={COLORS.bronze}
                    />
                    <RankBadge rank={3} />
                  </View>
                  <Text
                    className="text-sm font-medium mt-2"
                    style={{ color: isCurrentUser(leaderboard[2].id) ? COLORS.primary : COLORS.text }}
                    numberOfLines={1}
                  >
                    {leaderboard[2].username || "Joueur"}
                  </Text>
                  <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                    {leaderboard[2].total_xp?.toLocaleString() || 0} XP
                  </Text>
                </View>
              </View>
            )}

            {/* Full Leaderboard */}
            <ScrollView className="flex-1 px-5" contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
              {(leaderboard.length < 3 ? leaderboard : leaderboard.slice(3)).map((player, index) => {
                const actualRank = leaderboard.length < 3 ? index + 1 : index + 4;
                return (
                  <LeaderboardRow
                    key={player.id}
                    player={player}
                    rank={actualRank}
                    isCurrentUser={isCurrentUser(player.id)}
                  />
                );
              })}
            </ScrollView>
          </>
        )}

      {/* Current User Position */}
      {!loading && userRank && (
        <View
          className="mx-5 mb-24 rounded-2xl p-4 flex-row items-center"
          style={{
            backgroundColor: COLORS.primary,
          }}
        >
            <View
            className="rounded-full items-center justify-center mr-3"
            style={{
              width: 32,
              height: 32,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text className="font-bold" style={{ color: COLORS.bg }}>{userRank.rank}</Text>
          </View>
          <SmallAvatar
            userId={user?.id}
            username={profile?.username}
            avatarUrl={profile?.avatar_url}
            size={40}
          />
          <View className="flex-1 ml-3">
            <Text className="font-bold" style={{ color: COLORS.bg }}>
              YOU ({profile?.username || "PLAYER"})
            </Text>
            <Text style={{ color: 'rgba(17,24,39,0.7)' }} className="text-xs">
              {Math.max(0, ((userRank.rank > 1 && leaderboard[userRank.rank - 2]?.total_xp) || 0) - userRank.total_xp)} XP to next rank!
            </Text>
          </View>
          <Text className="font-bold" style={{ color: COLORS.bg }}>
            {userRank.total_xp.toLocaleString()} XP
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
