import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "../contexts/LanguageContext";
import { COLORS } from "../theme/colors";
import { buttonPressFeedback } from "../utils/feedback";
import { isPrimeTimeLive, msUntilNextPrimeTime, primeTimeLabel } from "../utils/primeTime";
import { getMyTeam, type Team } from "../services/teams";
import { ModeArt, type ModeArtName } from "./icons/ModeArt";

/**
 * Tuiles bento de l'accueil (direction Mix) — série, ligue, club, Prime Time.
 * Majoritairement plates (1 accent/icône par tuile), chiffres tabulaires. Chaque
 * tuile est navigable. Remplace l'ancien "status strip".
 */

function Tile({
  onPress,
  label,
  iconName,
  value,
  sub,
  accent,
  live,
}: {
  onPress: () => void;
  label: string;
  iconName: ModeArtName;
  value: string;
  sub?: string;
  accent: string;
  live?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        buttonPressFeedback();
        onPress();
      }}
      className="rounded-2xl px-4 py-3.5 active:opacity-90"
      style={{
        flexBasis: "48%",
        flexGrow: 1,
        minHeight: 84,
        backgroundColor: live ? "rgba(239,68,68,0.12)" : COLORS.surface,
        borderWidth: 1,
        borderColor: live ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.05)",
        justifyContent: "space-between",
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
    >
      <View className="flex-row items-center" style={{ gap: 7 }}>
        <ModeArt name={iconName} size={26} />
        <Text className="text-[10px] uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
          {label}
        </Text>
      </View>
      <View>
        <Text className="text-lg font-black" style={{ color: accent, fontVariant: ["tabular-nums"] }} numberOfLines={1}>
          {value}
        </Text>
        {sub ? <Text className="text-[10px]" style={{ color: COLORS.textMuted }}>{sub}</Text> : null}
      </View>
    </Pressable>
  );
}

export function HomeBento({ streak }: { streak: number }) {
  const { language } = useTranslation();
  const lang = language === "fr" ? "fr" : "en";
  const [now, setNow] = useState(() => new Date());
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    getMyTeam().then((t) => {
      if (alive) setTeam(t);
    });
    return () => {
      alive = false;
    };
  }, []);

  const live = isPrimeTimeLive(now);
  const untilMin = Math.max(0, Math.round(msUntilNextPrimeTime(now) / 60000));
  const ptValue = live ? (lang === "fr" ? "En cours" : "Live") : primeTimeLabel();
  const ptSub = live
    ? lang === "fr" ? "Joue maintenant" : "Play now"
    : untilMin >= 60
      ? lang === "fr" ? `dans ${Math.floor(untilMin / 60)}h` : `in ${Math.floor(untilMin / 60)}h`
      : lang === "fr" ? `dans ${untilMin} min` : `in ${untilMin} min`;

  return (
    <View className="flex-row flex-wrap" style={{ gap: 10 }}>
      <Tile
        onPress={() => router.push("/league" as any)}
        label={lang === "fr" ? "Série" : "Streak"}
        iconName="streak"
        value={`${streak || 0} ${lang === "fr" ? "j" : "d"}`}
        sub={lang === "fr" ? "Ne la casse pas" : "Keep it alive"}
        accent={COLORS.streak}
      />
      <Tile
        onPress={() => router.push("/league" as any)}
        label={lang === "fr" ? "Ligue" : "League"}
        iconName="league"
        value={lang === "fr" ? "Ta ligue" : "Your league"}
        sub={lang === "fr" ? "Grimpe cette semaine" : "Climb this week"}
        accent={COLORS.gold}
      />
      <Tile
        onPress={() => router.push("/teams" as any)}
        label={lang === "fr" ? "Club" : "Club"}
        iconName="club"
        value={team ? team.name : lang === "fr" ? "Rejoins" : "Join"}
        sub={team ? `${team.member_count} ${lang === "fr" ? "membres" : "members"}` : lang === "fr" ? "Joue en équipe" : "Team up"}
        accent={COLORS.primary}
      />
      <Tile
        onPress={() => router.push("/daily")}
        label={lang === "fr" ? "Prime Time" : "Prime Time"}
        iconName="prime"
        value={ptValue}
        sub={ptSub}
        accent={live ? COLORS.coral : COLORS.text}
        live={live}
      />
    </View>
  );
}

export default HomeBento;
