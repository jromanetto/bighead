import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation, useLanguage } from "../../src/contexts/LanguageContext";
import { createAsyncDuel } from "../../src/services/duel";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { IconButton } from "../../src/components/ui";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
  error: "#ef4444",
  errorDim: "rgba(239, 68, 68, 0.15)",
};

const DUEL_CATEGORIES = [
  { id: "general", nameKey: "generalKnowledge", icon: "🧠", color: "#00c2cc" },
  { id: "history", nameKey: "historyCategory", icon: "🏛️", color: "#8B5CF6" },
  { id: "geography", nameKey: "geographyCategory", icon: "🌍", color: "#10B981" },
  { id: "science", nameKey: "scienceCategory", icon: "🔬", color: "#3B82F6" },
  { id: "sports", nameKey: "sportsCategory", icon: "⚽", color: "#F59E0B" },
  { id: "pop-culture", nameKey: "popCulture", icon: "🎬", color: "#EC4899" },
] as const;

type OpponentMode = "random" | "friends";

export default function NewDuelScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [category, setCategory] = useState<(typeof DUEL_CATEGORIES)[number]>(
    DUEL_CATEGORIES[0]
  );
  const [opponentMode, setOpponentMode] = useState<OpponentMode>("random");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    buttonPressFeedback();
    if (!user) {
      setError("Login required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Friends-mode picker not implemented yet → fall back to random.
      // (Friends infra doesn't exist in DB yet — feature flag for later.)
      const duelId = await createAsyncDuel(category.id, language, null);
      router.replace(`/duel/play?id=${duelId}`);
    } catch (e: any) {
      console.error("createAsyncDuel error", e);
      setError(e?.message || "Error creating duel");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="flex-row items-center pt-4 mb-6">
          <IconButton
            name="ArrowLeft"
            onPress={() => router.back()}
            variant="glass"
            size={40}
            style={{ marginRight: 12 }}
          />
          <Text className="text-white text-2xl font-black flex-1">
            {t("duelNewDuel" as any)}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* Category section */}
          <Text
            className="text-xs uppercase tracking-wider mb-3"
            style={{ color: COLORS.textMuted }}
          >
            {t("duelChooseCategory" as any)}
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {DUEL_CATEGORIES.map((c) => {
              const selected = category.id === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    buttonPressFeedback();
                    setCategory(c);
                  }}
                  className="rounded-2xl p-4"
                  style={{
                    width: "47%",
                    backgroundColor: selected ? `${c.color}20` : COLORS.surface,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? c.color : "rgba(255,255,255,0.05)",
                  }}
                >
                  <Text className="text-3xl mb-2">{c.icon}</Text>
                  <Text
                    className="font-bold"
                    style={{ color: selected ? c.color : COLORS.text }}
                  >
                    {t(c.nameKey as any)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Opponent section */}
          <Text
            className="text-xs uppercase tracking-wider mb-3"
            style={{ color: COLORS.textMuted }}
          >
            {t("duelChooseOpponent" as any)}
          </Text>
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              setOpponentMode("random");
            }}
            className="rounded-2xl p-4 mb-3"
            style={{
              backgroundColor:
                opponentMode === "random" ? COLORS.primaryDim : COLORS.surface,
              borderWidth: opponentMode === "random" ? 2 : 1,
              borderColor:
                opponentMode === "random" ? COLORS.primary : "rgba(255,255,255,0.05)",
            }}
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🎲</Text>
              <View className="flex-1">
                <Text className="text-white font-bold">
                  {t("duelOpponentRandom" as any)}
                </Text>
              </View>
              {opponentMode === "random" && (
                <Text style={{ color: COLORS.primary }} className="text-xl">
                  ✓
                </Text>
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              buttonPressFeedback();
              // Friends mode disabled until a friends graph exists.
              setError(t("comingSoon" as any));
            }}
            className="rounded-2xl p-4 mb-3"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
              opacity: 0.6,
            }}
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">👥</Text>
              <View className="flex-1">
                <Text className="text-white font-bold">
                  {t("duelOpponentFriends" as any)}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                  {t("comingSoon" as any)}
                </Text>
              </View>
            </View>
          </Pressable>

          {error && (
            <View
              className="rounded-2xl p-3 mt-2"
              style={{ backgroundColor: COLORS.errorDim }}
            >
              <Text style={{ color: COLORS.error }} className="text-center text-sm">
                {error}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer CTA */}
        <View className="pb-6 pt-2">
          <Pressable
            onPress={handleStart}
            disabled={loading}
            className="rounded-2xl py-4 active:opacity-80"
            style={{ backgroundColor: COLORS.primary }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.bg} />
            ) : (
              <Text
                className="text-center font-bold text-lg"
                style={{ color: COLORS.bg }}
              >
                {t("duelStart" as any)}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
