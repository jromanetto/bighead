import { useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { useNotificationContext } from "../contexts/NotificationContext";
import { buttonPressFeedback } from "../utils/feedback";
import { daysUntilNextChallenge, nextChallengeLabel } from "../utils/nextChallenge";
import { logEvent } from "../services/analytics";

/**
 * Demande de notif en contexte, à la fin du défi hebdo (le mode que tout le monde
 * joue). Le bénéfice est concret — « nouveau défi demain » — et c'est le joueur
 * qui tape : pas de dialogue OS à froid. Si la permission est déjà refusée au
 * niveau OS, le bouton ouvre les Réglages (le dialogue ne peut plus s'afficher).
 */
export function WeeklyNotifCard({
  endDate,
  color,
  language,
}: {
  endDate: string;
  color: string;
  language: string;
}) {
  const lang = language === "fr" ? "fr" : "en";
  const L = (fr: string, en: string) => (lang === "fr" ? fr : en);
  const { permissionStatus, requestPermission } = useNotificationContext();
  const [done, setDone] = useState(false);

  // Rien tant que le statut n'est pas connu, ni si c'est déjà accordé.
  if (permissionStatus !== "undetermined" && permissionStatus !== "denied") return null;
  if (done) {
    return (
      <Text className="text-center mt-4 text-sm font-bold" style={{ color }}>
        {L("🔔 C'est noté, on te prévient !", "🔔 Got it, we'll let you know!")}
      </Text>
    );
  }

  const denied = permissionStatus === "denied";
  const when = nextChallengeLabel(daysUntilNextChallenge(endDate), lang);

  const onPress = async () => {
    buttonPressFeedback();
    try {
      if (denied) {
        logEvent("notif_open_settings", { source: "weekly_result" });
        await Linking.openSettings();
        return;
      }
      const ok = await requestPermission();
      logEvent(ok ? "notif_permission_granted" : "notif_permission_denied", { source: "weekly_result" });
      if (ok) setDone(true);
    } catch {
      /* ne casse jamais l'écran de résultat */
    }
  };

  return (
    <View
      className="mt-4 rounded-2xl p-4"
      style={{ backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: color }}
    >
      <Text className="text-white font-black text-base">
        {L(`🔔 Nouveau défi ${when}`, `🔔 New challenge ${when}`)}
      </Text>
      <Text className="text-sm mt-1" style={{ color: "#9ca3af", lineHeight: 19 }}>
        {denied
          ? L(
              "Tes notifs sont coupées. Réactive-les pour savoir quand le prochain sort.",
              "Your notifications are off. Turn them on to know when the next one drops.",
            )
          : L(
              "On te prévient dès qu'il sort, pour jouer avant les autres ?",
              "Want a heads-up as soon as it drops, so you can play first?",
            )}
      </Text>
      <Pressable
        onPress={onPress}
        className="mt-3 rounded-xl items-center active:opacity-85"
        style={{ backgroundColor: color, paddingVertical: 12 }}
        accessibilityRole="button"
      >
        <Text className="text-white font-bold">
          {denied ? L("Ouvrir les Réglages", "Open Settings") : L("Me prévenir", "Notify me")}
        </Text>
      </Pressable>
    </View>
  );
}

export default WeeklyNotifCard;
