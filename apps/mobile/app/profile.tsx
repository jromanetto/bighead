import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { AuthModal, AuthModalRef } from "../src/components/AuthModal";
import { UpgradePrompt } from "../src/components/UpgradePrompt";
import { getUserStats } from "../src/services/gameResults";

export default function ProfileScreen() {
  const { user, profile, isAnonymous, isLoading, signOut, refreshProfile } = useAuth();
  const authModalRef = useRef<AuthModalRef>(null);

  const [stats, setStats] = useState({
    totalGames: 0,
    averageAccuracy: 0,
    totalScore: 0,
    bestChain: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

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

  const handleOpenAuth = (mode: "login" | "signup" = "login") => {
    authModalRef.current?.open(mode);
  };

  const handleAuthSuccess = async () => {
    await refreshProfile();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const displayName = profile?.username || user?.email?.split("@")[0] || "Invité";
  const displayLevel = profile?.level || 1;
  const displayXP = profile?.total_xp || 0;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Profil</Text>
        </View>

        {/* Profile Card */}
        <View className="bg-gray-800 rounded-2xl p-6 items-center mb-6">
          <View className="w-24 h-24 bg-primary-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-4xl">
              {isAnonymous ? "👤" : displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">
            {isAnonymous ? "Invité" : displayName}
          </Text>
          <Text className="text-gray-400">
            Niveau {displayLevel}
          </Text>
          {!isAnonymous && user?.email && (
            <Text className="text-gray-500 text-sm mt-1">{user.email}</Text>
          )}
        </View>

        {/* Stats - Show for logged in users */}
        {!isAnonymous ? (
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
              {loadingStats ? (
                <ActivityIndicator size="small" color="#0ea5e9" />
              ) : (
                <Text className="text-primary-400 text-2xl font-bold">
                  {stats.totalGames}
                </Text>
              )}
              <Text className="text-gray-400 text-sm">Parties</Text>
            </View>
            <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
              {loadingStats ? (
                <ActivityIndicator size="small" color="#22c55e" />
              ) : (
                <Text className="text-green-400 text-2xl font-bold">
                  {stats.averageAccuracy}%
                </Text>
              )}
              <Text className="text-gray-400 text-sm">Précision</Text>
            </View>
            <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
              {loadingStats ? (
                <ActivityIndicator size="small" color="#f59e0b" />
              ) : (
                <Text className="text-yellow-400 text-2xl font-bold">
                  {displayXP}
                </Text>
              )}
              <Text className="text-gray-400 text-sm">XP Total</Text>
            </View>
          </View>
        ) : (
          // Stats placeholder for anonymous
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
              <Text className="text-gray-600 text-2xl font-bold">-</Text>
              <Text className="text-gray-400 text-sm">Parties</Text>
            </View>
            <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
              <Text className="text-gray-600 text-2xl font-bold">-</Text>
              <Text className="text-gray-400 text-sm">Précision</Text>
            </View>
            <View className="flex-1 bg-gray-800 rounded-xl p-4 items-center">
              <Text className="text-gray-600 text-2xl font-bold">-</Text>
              <Text className="text-gray-400 text-sm">XP Total</Text>
            </View>
          </View>
        )}

        {/* Best Chain */}
        {!isAnonymous && stats.bestChain > 0 && (
          <View className="bg-gray-800 rounded-xl p-4 mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-sm">Meilleur Chain</Text>
              <Text className="text-purple-400 text-xl font-bold">
                {stats.bestChain}x
              </Text>
            </View>
            <Text className="text-4xl">🔥</Text>
          </View>
        )}

        {/* Login/Signup CTA for anonymous users */}
        {isAnonymous && (
          <UpgradePrompt
            variant="card"
            onPress={() => handleOpenAuth("signup")}
            message="Crée un compte pour sauvegarder ta progression et apparaître dans le classement"
          />
        )}

        {/* Logout button for logged in users */}
        {!isAnonymous && (
          <View className="mt-auto mb-6">
            <Pressable
              onPress={handleSignOut}
              className="bg-gray-800 border border-gray-700 rounded-xl py-4 active:opacity-80"
            >
              <Text className="text-gray-400 text-center font-medium">
                Se déconnecter
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Auth Modal */}
      <AuthModal ref={authModalRef} onSuccess={handleAuthSuccess} />
    </SafeAreaView>
  );
}
