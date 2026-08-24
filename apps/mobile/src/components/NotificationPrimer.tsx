import { Modal, View, Text, Pressable } from "react-native";
import { useTranslation } from "../contexts/LanguageContext";
import { COLORS } from "../theme/colors";
import { buttonPressFeedback } from "../utils/feedback";

/**
 * Pré-prompt notif (soft-prompt) — modal Mia AVANT le dialogue OS.
 *
 * Sur iOS le dialogue système ne s'affiche qu'UNE fois : le déclencher à froid =
 * refus fréquent + permission grillée à vie. Ce modal cadre le bénéfice et ne
 * lance le vrai dialogue OS que si l'utilisateur tape « Activer » (« Plus tard »
 * ne grille rien → re-proposable). C'est LE levier de rétention (les users
 * notifiables sont ~3× plus collants).
 */
export function NotificationPrimer({
  visible,
  onEnable,
  onLater,
}: {
  visible: boolean;
  onEnable: () => void;
  onLater: () => void;
}) {
  const { language } = useTranslation();
  const lang = language === "fr" ? "fr" : "en";
  const L = (fr: string, en: string) => (lang === "fr" ? fr : en);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View
          className="w-full rounded-3xl p-6 items-center"
          style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Text style={{ fontSize: 52 }}>🦉</Text>
          <Text className="text-white text-xl font-black text-center mt-2">
            {L("Ne rate pas ta série", "Don't lose your streak")}
          </Text>
          <Text className="text-center mt-2" style={{ color: COLORS.textMuted, lineHeight: 20 }}>
            {L(
              "Je te préviens chaque jour pour ta question — 10 secondes, et ta série reste en vie. 🔥",
              "I'll ping you each day for your question — 10 seconds, and your streak stays alive. 🔥",
            )}
          </Text>

          <Pressable
            onPress={() => { buttonPressFeedback(); onEnable(); }}
            className="w-full rounded-2xl py-3.5 items-center mt-5 active:opacity-85"
            style={{ backgroundColor: COLORS.streak }}
            accessibilityRole="button"
          >
            <Text className="font-black text-base" style={{ color: "#1a0f04" }}>
              🔔 {L("Activer les rappels", "Turn on reminders")}
            </Text>
          </Pressable>
          <Pressable onPress={() => { buttonPressFeedback(); onLater(); }} hitSlop={8} className="py-2.5 mt-1 active:opacity-60">
            <Text style={{ color: COLORS.textMuted }} className="text-sm">
              {L("Plus tard", "Maybe later")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default NotificationPrimer;
