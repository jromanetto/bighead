import { View, Text, Pressable, Share, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import * as Clipboard from "expo-clipboard";
import { playHaptic } from "../src/utils/feedback";
import { useTranslation } from "../src/contexts/LanguageContext";
import { useAuth } from "../src/contexts/AuthContext";
import { IconButton } from "../src/components/ui";
import {
  ensureReferralCode,
  getReferralStatsV2,
  getShareMessageV2,
  ReferralStatsV2,
} from "../src/services/referral";

// Design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceActive: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function InviteScreen() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStatsV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Try stats first (it lazily ensures the code server-side)
      const s = await getReferralStatsV2();
      if (s) {
        setStats(s);
      } else {
        // Fallback: just fetch a code
        const code = await ensureReferralCode(user.id);
        if (code) {
          setStats({ code, totalInvited: 0, completed: 0, pending: 0 });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleShare = async () => {
    if (!stats?.code) return;
    playHaptic("medium");
    const message = getShareMessageV2(stats.code, language);
    try {
      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCopy = async () => {
    if (!stats?.code) return;
    playHaptic("light");
    await Clipboard.setStringAsync(stats.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 mb-6">
        <IconButton
          name="ArrowLeft"
          onPress={() => router.navigate("/(tabs)")}
          variant="glass"
          size={40}
          style={{ marginRight: 12 }}
        />
        <Text className="text-white text-2xl font-black">
          {t("inviteFriends").toUpperCase()}
        </Text>
      </View>

      <View className="flex-1 px-5">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <>
            {/* Hero illustration */}
            <View className="items-center mb-6">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: COLORS.primaryDim }}
              >
                <Text className="text-5xl">🎁</Text>
              </View>
              <Text className="text-white text-xl font-bold text-center mb-2">
                {t("playWithFriends")}
              </Text>
              <Text
                className="text-center text-sm px-4"
                style={{ color: COLORS.textMuted }}
              >
                {t("referralReward")}
              </Text>
            </View>

            {/* Code card */}
            <View
              className="rounded-2xl p-5 mb-5"
              style={{ backgroundColor: COLORS.surface }}
            >
              <Text
                className="text-xs uppercase font-semibold mb-2"
                style={{ color: COLORS.textMuted, letterSpacing: 1.2 }}
              >
                {t("referralYourCode")}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-3xl font-black"
                  style={{ color: COLORS.primary, letterSpacing: 2 }}
                  selectable
                >
                  {stats?.code ?? "—"}
                </Text>
                <Pressable
                  onPress={handleCopy}
                  className="px-4 py-2 rounded-lg active:opacity-80"
                  style={{ backgroundColor: COLORS.surfaceActive }}
                  disabled={!stats?.code}
                >
                  <Text className="text-white font-semibold text-sm">
                    {copied ? t("referralCopied") : t("referralCopy")}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Stats row */}
            <View className="flex-row mb-6" style={{ gap: 8 }}>
              <StatCard
                value={stats?.totalInvited ?? 0}
                label={t("referralStatsInvited")}
              />
              <StatCard
                value={stats?.completed ?? 0}
                label={t("referralStatsCompleted")}
                accent
              />
              <StatCard
                value={stats?.pending ?? 0}
                label={t("referralStatsPending")}
              />
            </View>

            {/* Share button */}
            <Pressable
              onPress={handleShare}
              disabled={!stats?.code}
              className="flex-row items-center justify-center px-8 py-4 rounded-2xl active:opacity-90"
              style={{
                backgroundColor: COLORS.primary,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                opacity: stats?.code ? 1 : 0.5,
              }}
            >
              <Text className="text-2xl mr-3">📤</Text>
              <Text
                className="font-bold text-lg"
                style={{ color: COLORS.bg }}
              >
                {t("referralShare")}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <View
      className="flex-1 rounded-2xl py-4 items-center"
      style={{ backgroundColor: COLORS.surface }}
    >
      <Text
        className="text-2xl font-black"
        style={{ color: accent ? COLORS.primary : COLORS.text }}
      >
        {value}
      </Text>
      <Text
        className="text-xs mt-1"
        style={{ color: COLORS.textMuted }}
      >
        {label}
      </Text>
    </View>
  );
}
