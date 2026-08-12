import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useTranslation } from "../src/contexts/LanguageContext";
import { IconButton } from "../src/components/ui";
import { EmptyState } from "../src/components/EmptyState";
import { Skeleton } from "../src/components/Skeleton";
import { getCategoryMastery, CategoryMastery } from "../src/services/mastery";
import { masteryEmoji, overallMastery, MasteryResult } from "../src/utils/mastery";
import { buttonPressFeedback } from "../src/utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const TIER_LABEL: Record<string, string> = {
  none: "—", bronze: "Bronze", silver: "Argent", gold: "Or", platinum: "Platine",
};
const TIER_LABEL_EN: Record<string, string> = {
  none: "—", bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum",
};

export default function MasteryScreen() {
  const { user, isAnonymous } = useAuth();
  const { language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CategoryMastery[]>([]);

  useEffect(() => {
    (async () => {
      if (!user?.id) { setLoading(false); return; }
      const data = await getCategoryMastery(user.id);
      setItems(data);
      setLoading(false);
    })();
  }, [user?.id]);

  const tierLabel = (tier: string) => (language === "fr" ? TIER_LABEL[tier] : TIER_LABEL_EN[tier]);
  const overall = Math.round(
    overallMastery(items.map((i) => ({ index: i.index } as MasteryResult))) * 100,
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-row items-center px-5 pt-4 mb-4">
        <IconButton name="ArrowLeft" onPress={() => router.back()} variant="glass" size={40} style={{ marginRight: 12 }} />
        <View>
          <Text className="text-white text-2xl font-black">🏅 {language === "fr" ? "Maîtrise" : "Mastery"}</Text>
          <Text style={{ color: COLORS.textMuted }} className="text-xs">
            {language === "fr" ? "Deviens expert de chaque catégorie" : "Master every category"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="px-5 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={64} rounded={16} />
          ))}
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState
            emoji="🏅"
            title={language === "fr" ? "Rien à maîtriser… encore" : "Nothing to master… yet"}
            subtitle={
              isAnonymous
                ? (language === "fr" ? "Joue quelques parties pour bâtir ta maîtrise." : "Play a few games to build your mastery.")
                : (language === "fr" ? "Joue pour débloquer tes premiers paliers." : "Play to unlock your first tiers.")
            }
            cta={{ label: language === "fr" ? "Jouer" : "Play", onPress: () => router.replace("/") }}
          />
        </View>
      ) : (
        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Overall */}
          <View className="rounded-2xl p-5 mb-5 items-center" style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{language === "fr" ? "Maîtrise globale" : "Overall mastery"}</Text>
            <Text style={{ color: COLORS.primary, fontSize: 44, fontWeight: "900" }}>{overall}%</Text>
            <View className="w-full h-2 rounded-full mt-2" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
              <View style={{ width: `${overall}%`, height: "100%", borderRadius: 999, backgroundColor: COLORS.primary }} />
            </View>
          </View>

          {/* Per-category */}
          <View className="gap-3">
            {items.map((c) => {
              const acc = Math.round(c.accuracy * 100);
              return (
                <View key={c.code} className="rounded-2xl p-4" style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
                  <View className="flex-row items-center mb-2">
                    <View className="w-11 h-11 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${c.color}22` }}>
                      <Text className="text-2xl">{c.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-base">{c.name}</Text>
                      <Text style={{ color: COLORS.textMuted }} className="text-xs">
                        {acc}% · {c.played} {language === "fr" ? "questions" : "questions"}
                      </Text>
                    </View>
                    <View className="flex-row items-center px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <Text className="mr-1">{masteryEmoji(c.tier)}</Text>
                      <Text style={{ color: c.tier === "none" ? COLORS.textMuted : c.color, fontWeight: "700", fontSize: 12 }}>
                        {tierLabel(c.tier)}
                      </Text>
                    </View>
                  </View>
                  <View className="w-full h-1.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                    <View style={{ width: `${acc}%`, height: "100%", borderRadius: 999, backgroundColor: c.color }} />
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
