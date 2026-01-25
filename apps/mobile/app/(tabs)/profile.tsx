import { View, Text, Pressable, ActivityIndicator, ScrollView, Alert, Modal, TextInput } from "react-native";
import { router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/contexts/AuthContext";
import { ProfileAvatar } from "../../src/components/ProfileAvatar";
import { getUserStats } from "../../src/services/gameResults";
import { uploadAvatar } from "../../src/services/avatar";
import { buttonPressFeedback } from "../../src/utils/feedback";

// New QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceActive: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  error: "#ef4444",
  yellow: "#FFD100",
  purple: "#A16EFF",
  coral: "#FF6B6B",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// Badge Component
function Badge({ icon, name, unlocked = true }: { icon: string; name: string; unlocked?: boolean }) {
  return (
    <View className="items-center">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-2"
        style={{
          backgroundColor: unlocked ? COLORS.surface : 'rgba(255,255,255,0.05)',
          borderWidth: 2,
          borderColor: unlocked ? COLORS.primary : 'rgba(255,255,255,0.1)',
          opacity: unlocked ? 1 : 0.5,
        }}
      >
        {unlocked ? (
          <Text className="text-3xl">{icon}</Text>
        ) : (
          <Text className="text-2xl">🔒</Text>
        )}
      </View>
      <Text
        className="text-xs text-center"
        style={{ color: unlocked ? COLORS.text : COLORS.textMuted }}
        numberOfLines={2}
      >
        {name}
      </Text>
    </View>
  );
}

// Category Progress Component
function CategoryProgress({
  icon,
  name,
  level,
  xpNeeded,
  percentage,
  color
}: {
  icon: string;
  name: string;
  level: number;
  xpNeeded: number;
  percentage: number;
  color: string;
}) {
  return (
    <View
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-lg items-center justify-center"
            style={{ backgroundColor: `${color}30` }}
          >
            <Text className="text-xl">{icon}</Text>
          </View>
          <View>
            <Text className="text-white font-semibold">{name}</Text>
            <Text className="text-gray-500 text-xs">Lvl {level} • {xpNeeded} XP needed</Text>
          </View>
        </View>
        <Text className="font-bold" style={{ color }}>{percentage}%</Text>
      </View>

      {/* Progress Bar */}
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, profile, isAnonymous, isPremium, isLoading, refreshProfile, updateAvatar, updateUsername } = useAuth();

  const [stats, setStats] = useState({
    totalGames: 0,
    averageAccuracy: 0,
    totalScore: 0,
    bestChain: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  // Load stats when user changes
  useEffect(() => {
    const loadStats = async () => {
      if (!user || isAnonymous) return;

      setLoadingStats(true);
      try {
        const userStats = await getUserStats(user.id);
        setStats({
          totalGames: userStats.totalGames,
          averageAccuracy: userStats.averageAccuracy,
          totalScore: userStats.totalScore,
          bestChain: userStats.bestChain,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [user, isAnonymous]);

  const handleEditUsername = () => {
    setNewUsername(profile?.username || "");
    setShowUsernameModal(true);
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }
    if (newUsername.trim().length < 2) {
      Alert.alert("Error", "Username must be at least 2 characters");
      return;
    }

    setSavingUsername(true);
    try {
      await updateUsername(newUsername.trim());
      setShowUsernameModal(false);
    } catch (error) {
      console.error("Error saving username:", error);
      Alert.alert("Error", "Failed to save username. Please try again.");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleAvatarChange = async (imageUri: string, mimeType?: string) => {
    if (!user) {
      Alert.alert("Error", "Please wait for the app to load.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarUrl = await uploadAvatar(user.id, imageUri, mimeType);
      if (avatarUrl) {
        await updateAvatar(avatarUrl);
      } else {
        Alert.alert("Error", "Failed to upload photo. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const displayName = profile?.username || user?.email?.split("@")[0] || "Guest";
  const displayLevel = profile?.level || 1;
  const displayXP = profile?.total_xp || 0;
  const winRate = stats.averageAccuracy || 85;

  // Calculate formatted XP
  const formatXP = (xp: number) => {
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
    return xp.toString();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Badges data
  const badges = [
    { icon: "⚡", name: "Speed Demon", unlocked: true },
    { icon: "🏛️", name: "History Buff", unlocked: true },
    { icon: "✨", name: "Perfect Streak", unlocked: true },
    { icon: "🏆", name: "Trivia God", unlocked: false },
  ];

  // Category mastery data
  const categories = [
    { icon: "🧪", name: "Science & Nature", level: 8, xpNeeded: 450, percentage: 75, color: COLORS.yellow },
    { icon: "🌍", name: "World Geography", level: 11, xpNeeded: 50, percentage: 90, color: COLORS.coral },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Button */}
        <View className="flex-row justify-end px-6 pt-4">
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.push("/settings");
            }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-xl">⚙️</Text>
          </Pressable>
        </View>

        {/* Avatar Section */}
        <View className="items-center mt-4 mb-6">
          {/* Avatar with Ring */}
          <View className="relative mb-4">
            <ProfileAvatar
              userId={user?.id}
              username={displayName}
              avatarUrl={profile?.avatar_url}
              size={112}
              editable={true}
              onAvatarChange={handleAvatarChange}
              borderColor={COLORS.primary}
            />

            {/* Level Badge */}
            <View
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full flex-row items-center"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="mr-1" style={{ color: COLORS.bg }}>⚡</Text>
              <Text className="font-bold text-xs" style={{ color: COLORS.bg }}>
                LVL {displayLevel}
              </Text>
            </View>

            {/* Uploading indicator */}
            {uploadingAvatar && (
              <View
                className="absolute inset-0 items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 56 }}
              >
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </View>

          {/* Name & Title */}
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              handleEditUsername();
            }}
            className="items-center active:opacity-70"
          >
            <View className="flex-row items-center mb-1">
              <Text className="text-white text-2xl font-black">
                {displayName}
              </Text>
              <Text className="text-gray-500 ml-2">✏️</Text>
            </View>
            <Text className="text-gray-400">
              {isAnonymous ? "Tap to set your name" : "Trivia Titan"}
            </Text>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View className="flex-row mx-6 mb-8">
          <View
            className="flex-1 rounded-xl py-4 items-center mx-1"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Text className="text-gray-400 text-xs mb-1">XP</Text>
            {loadingStats ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text className="text-xl font-black" style={{ color: COLORS.primary }}>
                {formatXP(displayXP)}
              </Text>
            )}
          </View>

          <View
            className="flex-1 rounded-xl py-4 items-center mx-1"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Text className="text-gray-400 text-xs mb-1">Win Rate</Text>
            {loadingStats ? (
              <ActivityIndicator size="small" color={COLORS.purple} />
            ) : (
              <Text className="text-xl font-black" style={{ color: COLORS.purple }}>
                {winRate}%
              </Text>
            )}
          </View>

          <View
            className="flex-1 rounded-xl py-4 items-center mx-1"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Text className="text-gray-400 text-xs mb-1">Quizzes</Text>
            {loadingStats ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text className="text-xl font-black" style={{ color: COLORS.primary }}>
                {stats.totalGames || 42}
              </Text>
            )}
          </View>
        </View>

        {/* Recent Badges */}
        <View className="mx-6 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-bold">Recent Badges</Text>
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/achievements");
              }}
            >
              <Text style={{ color: COLORS.primary }} className="text-sm font-medium">
                View All
              </Text>
            </Pressable>
          </View>

          <View className="flex-row justify-between">
            {badges.map((badge, index) => (
              <Badge key={index} {...badge} />
            ))}
          </View>
        </View>

        {/* Category Mastery */}
        <View className="mx-6 mb-8">
          <Text className="text-white font-bold mb-4">Category Mastery</Text>

          {categories.map((category, index) => (
            <CategoryProgress key={index} {...category} />
          ))}
        </View>

        {/* Premium CTA */}
        {!isPremium && (
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.push("/premium");
            }}
            className="mx-6 mb-6 rounded-2xl p-5 active:opacity-80"
            style={{
              backgroundColor: 'rgba(255, 209, 0, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255, 209, 0, 0.3)',
            }}
          >
            <View className="flex-row items-center">
              <View
                className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(255, 209, 0, 0.2)' }}
              >
                <Text className="text-3xl">👑</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: '#FFD100' }} className="font-bold text-lg">
                  Upgrade to Premium
                </Text>
                <Text style={{ color: COLORS.textMuted }} className="text-sm">
                  Unlock duels, themes & more!
                </Text>
              </View>
              <Text style={{ color: '#FFD100' }} className="text-xl">→</Text>
            </View>
          </Pressable>
        )}
      </ScrollView>

      {/* Username Edit Modal */}
      <Modal
        visible={showUsernameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUsernameModal(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onPress={() => setShowUsernameModal(false)}
        >
          <Pressable
            className="w-80 rounded-2xl p-6"
            style={{ backgroundColor: COLORS.surface }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-white text-xl font-bold mb-4 text-center">
              Change Username
            </Text>

            <TextInput
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter your username"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              maxLength={20}
              className="text-white text-lg rounded-xl px-4 py-3 mb-4"
              style={{ backgroundColor: COLORS.surfaceActive }}
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowUsernameModal(false)}
                className="flex-1 rounded-xl py-3"
                style={{ backgroundColor: COLORS.surfaceActive }}
              >
                <Text className="text-center font-medium" style={{ color: COLORS.textMuted }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveUsername}
                disabled={savingUsername}
                className="flex-1 rounded-xl py-3"
                style={{ backgroundColor: COLORS.primary }}
              >
                {savingUsername ? (
                  <ActivityIndicator color={COLORS.bg} size="small" />
                ) : (
                  <Text className="text-center font-bold" style={{ color: COLORS.bg }}>
                    Save
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
