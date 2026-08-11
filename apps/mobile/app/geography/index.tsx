import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { IconButton } from "../../src/components/ui";
import { CONTINENTS, ContinentId } from "../../src/data/geography";
import { GeoMode } from "../../src/utils/geographyQuiz";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const MODES: { id: GeoMode; emoji: string; titleKey: string; descKey: string }[] = [
  { id: "flags", emoji: "🚩", titleKey: "geoFlags", descKey: "geoFlagsDesc" },
  { id: "capitals", emoji: "🏛️", titleKey: "geoCapitals", descKey: "geoCapitalsDesc" },
];

export default function GeographyHomeScreen() {
  const { t, language } = useTranslation();
  const [mode, setMode] = useState<GeoMode>("flags");

  const start = (continent: ContinentId) => {
    buttonPressFeedback();
    router.push({ pathname: "/geography/quiz", params: { mode, continent } } as any);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 mb-4">
        <IconButton name="ArrowLeft" onPress={() => router.back()} variant="glass" size={40} style={{ marginRight: 12 }} />
        <View>
          <Text className="text-white text-2xl font-black">🌍 {t("geoSectionTitle")}</Text>
          <Text style={{ color: COLORS.textMuted }} className="text-xs">{t("geoSectionSubtitle")}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Mode selector */}
        <Text className="text-white font-bold mb-3">{t("geoModeLabel")}</Text>
        <View className="flex-row gap-3 mb-8">
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => { buttonPressFeedback(); setMode(m.id); }}
                className="flex-1 p-4 rounded-2xl"
                style={{
                  backgroundColor: active ? COLORS.primaryDim : COLORS.surface,
                  borderWidth: 2,
                  borderColor: active ? COLORS.primary : "rgba(255,255,255,0.08)",
                }}
              >
                <Text className="text-3xl mb-2">{m.emoji}</Text>
                <Text className="font-bold" style={{ color: active ? COLORS.primary : COLORS.text }}>
                  {t(m.titleKey as any)}
                </Text>
                <Text style={{ color: COLORS.textMuted }} className="text-xs mt-1">{t(m.descKey as any)}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Continent picker */}
        <Text className="text-white font-bold mb-1">{t("geoContinentLabel")}</Text>
        <Text style={{ color: COLORS.textMuted }} className="text-sm mb-4">{t("geoContinentHint")}</Text>
        <View className="gap-3">
          {CONTINENTS.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => start(c.id)}
              className="flex-row items-center p-5 rounded-2xl active:opacity-80"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
            >
              <View className="w-14 h-14 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: COLORS.primaryDim }}>
                <Text className="text-3xl">{c.emoji}</Text>
              </View>
              <Text className="flex-1 text-white font-bold text-lg">{language === "fr" ? c.fr : c.en}</Text>
              <Text style={{ color: COLORS.primary, fontSize: 22 }}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
