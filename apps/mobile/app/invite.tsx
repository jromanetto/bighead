import { View, Text, Pressable, ScrollView, Share, Alert, TextInput } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { buttonPressFeedback, playHaptic } from "../src/utils/feedback";
import { BottomNavigation } from "../src/components/BottomNavigation";
import {
  getReferralCode,
  getReferralStats,
  getShareMessage,
  copyReferralCode,
  applyReferralCode,
  type ReferralStats,
} from "../src/services/referral";

// Design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.15)",
  gold: "#FFD100",
  goldDim: "rgba(255, 209, 0, 0.2)",
  purple: "#A16EFF",
  coral: "#FF6B6B",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function InviteScreen() {
  const { user, profile, isAnonymous } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, [user]);

  const loadReferralData = async () => {
    if (!user || isAnonymous) {
      setLoading(false);
      return;
    }

    try {
      const [code, referralStats] = await Promise.all([
        getReferralCode(user.id),
        getReferralStats(user.id),
      ]);
      setReferralCode(code);
      setStats(referralStats);
    } catch (error) {
      console.error("Error loading referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;

    playHaptic("light");
    const success = await copyReferralCode(referralCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!referralCode) return;

    playHaptic("medium");
    try {
      await Share.share({
        message: getShareMessage(referralCode),
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleApplyCode = async () => {
    if (!friendCode.trim() || !user) return;

    playHaptic("medium");
    setApplying(true);

    try {
      const result = await applyReferralCode(user.id, friendCode.trim());

      if (result.success) {
        Alert.alert(
          "Success! 🎉",
          "You've earned 500 bonus coins! Your friend earned 500 coins too.",
          [{ text: "Awesome!" }]
        );
        setFriendCode("");
        loadReferralData();
      } else {
        Alert.alert("Oops!", result.error || "Invalid code", [{ text: "OK" }]);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.", [{ text: "OK" }]);
    } finally {
      setApplying(false);
    }
  };

  // Anonymous user prompt
  if (isAnonymous) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center px-5 pt-4 mb-4">
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.back();
              }}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.surface }}
            >
              <Text className="text-white text-lg">←</Text>
            </Pressable>
            <Text className="text-white text-2xl font-black">INVITE FRIENDS</Text>
          </View>

          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-6xl mb-6">🔒</Text>
            <Text className="text-white text-xl font-bold text-center mb-2">
              Create an account
            </Text>
            <Text className="text-center mb-8" style={{ color: COLORS.textMuted }}>
              Sign up to get your referral code and earn 500 coins for each friend you invite!
            </Text>
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/profile");
              }}
              className="px-8 py-4 rounded-xl"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="text-white font-bold text-lg">Create Account</Text>
            </Pressable>
          </View>
        </View>

        <BottomNavigation />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 mb-4">
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.back();
            }}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-white text-lg">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-black">INVITE FRIENDS</Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Reward Banner */}
          <View
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: COLORS.successDim,
              borderWidth: 1,
              borderColor: `${COLORS.success}30`,
            }}
          >
            <View className="flex-row items-center">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: COLORS.success }}
              >
                <Text className="text-3xl">🎁</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">
                  Earn 500 Coins
                </Text>
                <Text style={{ color: COLORS.textMuted }} className="text-sm mt-1">
                  For each friend who joins using your code. They get 500 coins too!
                </Text>
              </View>
            </View>
          </View>

          {/* Your Referral Code */}
          <Text
            className="text-xs uppercase tracking-wider mb-3"
            style={{ color: COLORS.textMuted }}
          >
            Your Referral Code
          </Text>

          <View
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            {loading ? (
              <View className="py-4 items-center">
                <Text style={{ color: COLORS.textMuted }}>Loading...</Text>
              </View>
            ) : (
              <>
                <Pressable
                  onPress={handleCopyCode}
                  className="flex-row items-center justify-center py-4 rounded-xl mb-4"
                  style={{ backgroundColor: COLORS.surfaceLight }}
                >
                  <Text className="text-white text-3xl font-black tracking-widest">
                    {referralCode || "------"}
                  </Text>
                  <View
                    className="ml-4 px-3 py-1 rounded-lg"
                    style={{ backgroundColor: copied ? COLORS.successDim : COLORS.primaryDim }}
                  >
                    <Text
                      className="text-sm font-bold"
                      style={{ color: copied ? COLORS.success : COLORS.primary }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleShare}
                  className="flex-row items-center justify-center py-4 rounded-xl"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <Text className="text-xl mr-2">📤</Text>
                  <Text className="text-white font-bold text-lg">
                    Share with Friends
                  </Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Stats */}
          {stats && (
            <>
              <Text
                className="text-xs uppercase tracking-wider mb-3"
                style={{ color: COLORS.textMuted }}
              >
                Your Stats
              </Text>

              <View className="flex-row gap-3 mb-6">
                <View
                  className="flex-1 rounded-2xl p-4"
                  style={{
                    backgroundColor: COLORS.surface,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Text className="text-3xl font-black text-white">
                    {stats.totalReferrals}
                  </Text>
                  <Text style={{ color: COLORS.textMuted }} className="text-sm mt-1">
                    Friends Invited
                  </Text>
                </View>

                <View
                  className="flex-1 rounded-2xl p-4"
                  style={{
                    backgroundColor: COLORS.surface,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Text className="text-3xl font-black" style={{ color: COLORS.gold }}>
                    {stats.totalCoinsEarned}
                  </Text>
                  <Text style={{ color: COLORS.textMuted }} className="text-sm mt-1">
                    Coins Earned
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Enter Friend's Code */}
          <Text
            className="text-xs uppercase tracking-wider mb-3"
            style={{ color: COLORS.textMuted }}
          >
            Have a Friend's Code?
          </Text>

          <View
            className="rounded-2xl p-5"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Text className="text-white font-medium mb-3">
              Enter your friend's referral code to get 500 bonus coins:
            </Text>

            <View className="flex-row gap-3">
              <TextInput
                value={friendCode}
                onChangeText={setFriendCode}
                placeholder="Enter code"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                className="flex-1 px-4 py-3 rounded-xl text-white font-bold text-center text-lg"
                style={{ backgroundColor: COLORS.surfaceLight }}
                maxLength={10}
              />

              <Pressable
                onPress={handleApplyCode}
                disabled={!friendCode.trim() || applying}
                className="px-6 py-3 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: friendCode.trim() ? COLORS.success : COLORS.surfaceLight,
                  opacity: applying ? 0.6 : 1,
                }}
              >
                <Text
                  className="font-bold"
                  style={{ color: friendCode.trim() ? "#fff" : COLORS.textMuted }}
                >
                  {applying ? "..." : "Apply"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* How it Works */}
          <Text
            className="text-xs uppercase tracking-wider mt-6 mb-3"
            style={{ color: COLORS.textMuted }}
          >
            How It Works
          </Text>

          <View
            className="rounded-2xl p-5"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: COLORS.primaryDim }}
              >
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text className="flex-1 text-white">
                Share your unique code with friends
              </Text>
            </View>

            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: COLORS.primaryDim }}
              >
                <Text className="text-white font-bold">2</Text>
              </View>
              <Text className="flex-1 text-white">
                They sign up and enter your code
              </Text>
            </View>

            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: COLORS.successDim }}
              >
                <Text style={{ color: COLORS.success }} className="font-bold">3</Text>
              </View>
              <Text className="flex-1 text-white">
                You both get 500 bonus coins! 🎉
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <BottomNavigation />
    </SafeAreaView>
  );
}
