import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "../contexts/LanguageContext";
import { buttonPressFeedback } from "../utils/feedback";
import { COLORS } from "../theme/colors";
import {
  isPrimeTimeLive,
  msUntilNextPrimeTime,
  primeTimeLabel,
  formatParticipants,
} from "../utils/primeTime";
import { fetchPrimeTimeStats, type PrimeTimeStats } from "../services/primeTimeStats";

/**
 * Prime Time — l'événement quotidien synchronisé (Vague 2).
 *
 * Basé sur l'horloge réelle (logique pure `primeTime`) : quand la fenêtre 19h
 * est en cours → bandeau "live" rouge qui pousse au jeu ; sinon un compte à
 * rebours discret. Le compteur de participants + percentile viendront du backend
 * (branchés ici quand l'endpoint existe) — pour l'instant on affiche l'état
 * temporel, qui est réel et suffit à créer le rendez-vous.
 */

function formatCountdown(ms: number, lang: "fr" | "en"): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return lang === "fr" ? `dans ${h}h${m > 0 ? String(m).padStart(2, "0") : ""}` : `in ${h}h${m > 0 ? String(m).padStart(2, "0") : ""}`;
  return lang === "fr" ? `dans ${m} min` : `in ${m} min`;
}

export function PrimeTimeBanner() {
  const { language } = useTranslation();
  const lang = language === "fr" ? "fr" : "en";
  const [now, setNow] = useState(() => new Date());
  const [stats, setStats] = useState<PrimeTimeStats | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const live = isPrimeTimeLive(now);
  const untilMs = msUntilNextPrimeTime(now);

  // Récupère participants + percentile quand le Prime Time est en cours.
  useEffect(() => {
    if (!live) return;
    let alive = true;
    fetchPrimeTimeStats().then((s) => {
      if (alive) setStats(s);
    });
    return () => {
      alive = false;
    };
  }, [live]);

  // On ne montre le compte à rebours qu'à l'approche (≤ 3h avant), pour ne pas
  // encombrer l'accueil le reste de la journée. Toujours visible si live.
  const upcomingSoon = !live && untilMs <= 3 * 3600_000;
  if (!live && !upcomingSoon) return null;

  return (
    <Pressable
      onPress={() => {
        buttonPressFeedback();
        router.push("/daily");
      }}
      className="rounded-xl flex-row items-center justify-between px-4 py-3 active:opacity-90"
      style={{
        backgroundColor: live ? "rgba(239,68,68,0.15)" : COLORS.surface,
        borderWidth: 1,
        borderColor: live ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.06)",
      }}
      accessibilityRole="button"
      accessibilityLabel={live ? "Prime Time live" : "Prime Time"}
    >
      <View className="flex-row items-center gap-3">
        <Text className="text-lg">{live ? "🔴" : "⏰"}</Text>
        <View>
          <Text className="font-bold text-white">
            {live
              ? lang === "fr" ? "Prime Time en cours" : "Prime Time is live"
              : `Prime Time · ${primeTimeLabel()}`}
          </Text>
          <Text className="text-[11px]" style={{ color: live ? "#fca5a5" : COLORS.textMuted }}>
            {live
              ? stats && stats.participants > 0
                ? `${formatParticipants(stats.participants, lang)} · ${lang === "fr" ? `tu bats ${stats.percentile}%` : `you beat ${stats.percentile}%`}`
                : lang === "fr" ? "Même question, tout le monde maintenant" : "Same question, everyone now"
              : formatCountdown(untilMs, lang)}
          </Text>
        </View>
      </View>
      <Text className="font-bold" style={{ color: live ? "#ef4444" : COLORS.primary }}>
        {live ? (lang === "fr" ? "Jouer" : "Play") : "→"}
      </Text>
    </Pressable>
  );
}

export default PrimeTimeBanner;
