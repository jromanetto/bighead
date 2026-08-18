import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "../contexts/LanguageContext";
import { COLORS } from "../theme/colors";
import { buttonPressFeedback } from "../utils/feedback";

/**
 * Hero "Question du jour" — direction Mix (hero doux façon Zen).
 *
 * Remplace l'ancien hero multi-dégradé criard par une carte calme, mono-accent
 * teal, avec Mia (🦉) en filigrane. Le geste central, reposant et lisible.
 */
export function HomeHeroDaily({
  dailyCompleted,
  timeLeft,
  streak,
}: {
  dailyCompleted: boolean;
  timeLeft: string;
  streak: number;
}) {
  const { language } = useTranslation();
  const lang = language === "fr" ? "fr" : "en";

  return (
    <Pressable
      onPress={() => {
        buttonPressFeedback();
        router.push("/daily");
      }}
      className="rounded-3xl overflow-hidden active:opacity-95"
      accessibilityRole="button"
      accessibilityLabel={lang === "fr" ? "Question du jour" : "Question of the day"}
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: "rgba(0,194,204,0.28)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 22,
      }}
    >
      {/* Voile teal très doux (un seul accent, pas 4 couleurs) */}
      <LinearGradient
        colors={["rgba(0,194,204,0.16)", "rgba(0,194,204,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {/* Mia en filigrane */}
      <Text style={{ position: "absolute", right: -6, bottom: -18, fontSize: 104, opacity: 0.08 }}>🦉</Text>

      <View className="p-5">
        <Text className="text-[11px] font-bold tracking-widest uppercase" style={{ color: COLORS.primary }}>
          {lang === "fr" ? "Question du jour" : "Question of the day"}
        </Text>
        <Text className="text-3xl font-black text-white mt-1.5">
          {dailyCompleted
            ? lang === "fr" ? "Bien joué !" : "Nice one!"
            : lang === "fr" ? "On y va ?" : "Ready?"}
        </Text>
        <Text className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
          {dailyCompleted
            ? lang === "fr" ? "Reviens demain pour la prochaine" : "Come back tomorrow for the next one"
            : `${lang === "fr" ? "1 question · 30 s · +50 XP" : "1 question · 30s · +50 XP"} · ⏱ ${timeLeft}`}
        </Text>

        <View className="flex-row items-center gap-2.5 mt-4">
          <View className="flex-1 rounded-2xl py-3.5 items-center" style={{ backgroundColor: dailyCompleted ? COLORS.surfaceActive : COLORS.primary }}>
            <Text className="font-black" style={{ color: dailyCompleted ? COLORS.text : COLORS.bg }}>
              {dailyCompleted ? (lang === "fr" ? "Revoir" : "Review") : (lang === "fr" ? "Jouer" : "Play")}
            </Text>
          </View>
          <View className="rounded-2xl py-3.5 px-4 flex-row items-center gap-1.5" style={{ backgroundColor: COLORS.surfaceActive, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
            <Text style={{ color: COLORS.streak }}>🔥</Text>
            <Text className="font-black text-white">{streak || 0}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default HomeHeroDaily;
