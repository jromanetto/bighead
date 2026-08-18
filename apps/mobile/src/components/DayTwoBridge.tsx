import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "../contexts/LanguageContext";
import { useNotificationContext } from "../contexts/NotificationContext";
import { COLORS } from "../theme/colors";
import { buttonPressFeedback } from "../utils/feedback";
import { loadFavThemes, primaryFavTheme } from "../utils/favThemes";
import { logEvent } from "../services/analytics";

/**
 * Pont jour-1 → jour-2 (le levier #1 contre le one-and-done).
 *
 * Affiché à la fin de la question du jour : célèbre la série, donne un rendez-vous
 * concret (demain), tease le thème de demain avec les favoris choisis à
 * l'onboarding, et demande la notif AU BON MOMENT (juste après une réussite,
 * cadré comme un rappel — pas un cold-prompt).
 */
export function DayTwoBridge({ streak }: { streak: number }) {
  const { language } = useTranslation();
  const lang = language === "fr" ? "fr" : "en";
  const L = (fr: string, en: string) => (lang === "fr" ? fr : en);
  const { permissionStatus, requestPermission } = useNotificationContext();
  const [themeLabel, setThemeLabel] = useState<string | null>(null);
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    loadFavThemes().then((ids) => {
      const p = primaryFavTheme(ids);
      if (p) setThemeLabel(lang === "fr" ? p.fr : p.en);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const granted = permissionStatus === "granted";
  const canAsk = !granted && !asked;

  const onRemind = async () => {
    buttonPressFeedback();
    setAsked(true);
    try {
      const ok = await requestPermission();
      logEvent(ok ? "notif_permission_granted" : "notif_permission_denied", { source: "day2_bridge" });
    } catch {
      /* ne casse jamais l'écran de résultat */
    }
  };

  const title =
    streak <= 1
      ? L("🔥 Série lancée !", "🔥 Streak started!")
      : L(`🔥 Série de ${streak} jours`, `🔥 ${streak}-day streak`);

  const tomorrow = themeLabel
    ? L(`Demain : une question ${themeLabel} 👀`, `Tomorrow: a ${themeLabel} question 👀`)
    : L("Reviens demain pour la prochaine question 👀", "Come back tomorrow for the next question 👀");

  return (
    <View
      className="rounded-2xl px-5 py-5 mb-4 w-full"
      style={{ backgroundColor: "rgba(249, 115, 22, 0.12)", borderWidth: 1, borderColor: "rgba(249, 115, 22, 0.35)" }}
    >
      <Text className="font-black text-lg text-center" style={{ color: COLORS.streak }}>{title}</Text>
      <Text className="text-center mt-1" style={{ color: COLORS.text }}>
        {L("Reviens demain pour la garder.", "Come back tomorrow to keep it going.")}
      </Text>
      <Text className="text-center text-sm mt-1" style={{ color: COLORS.textMuted }}>{tomorrow}</Text>

      {canAsk ? (
        <Pressable
          onPress={onRemind}
          className="rounded-xl py-3 mt-4 items-center active:opacity-80"
          style={{ backgroundColor: COLORS.streak }}
          accessibilityRole="button"
          accessibilityLabel={L("Me rappeler demain", "Remind me tomorrow")}
        >
          <Text className="font-black" style={{ color: "#1a0f04" }}>
            🔔 {L("Me rappeler la question de demain", "Remind me about tomorrow's question")}
          </Text>
        </Pressable>
      ) : granted ? (
        <Text className="text-center text-sm mt-3" style={{ color: COLORS.streak }}>
          🔔 {L("Rappel activé — à demain !", "Reminder on — see you tomorrow!")}
        </Text>
      ) : null}
    </View>
  );
}

export default DayTwoBridge;
