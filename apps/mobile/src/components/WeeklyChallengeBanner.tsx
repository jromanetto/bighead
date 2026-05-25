import { View, Text, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  getActiveWeeklyChallenge,
  getMyWeeklyProgress,
  timeUntilEnd,
  type WeeklyChallenge,
  type WeeklyProgress,
} from "../services/weeklyChallenge";
import { useTranslation } from "../contexts/LanguageContext";
import { buttonPressFeedback } from "../utils/feedback";

export function WeeklyChallengeBanner() {
  const { t, language } = useTranslation();
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const c = await getActiveWeeklyChallenge();
      setChallenge(c);
      if (c) setProgress(await getMyWeeklyProgress(c.id));
      setLoaded(true);
    })();
  }, []);

  if (!loaded || !challenge) return null;

  const label = language === "fr" ? challenge.theme_label_fr : challenge.theme_label_en;
  const description = language === "fr" ? challenge.description_fr : challenge.description_en;
  const position = progress?.current_position ?? 0;
  const correctCount = progress?.correct_count ?? 0;
  const total = challenge.total_questions;
  const progressPct = Math.round((position / total) * 100);
  const { days, hours } = timeUntilEnd(challenge);
  const completed = position >= total;

  const timeLabel =
    days > 0 ? `${days}j ${hours}h` : hours > 0 ? `${hours}h` : t("weeklyEndsSoon");

  return (
    <Pressable
      onPress={() => {
        buttonPressFeedback();
        router.push("/weekly" as any);
      }}
      className="rounded-2xl overflow-hidden active:opacity-95"
      style={{
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      }}
    >
      <LinearGradient
        colors={[challenge.color, mixHex(challenge.color, "#000000", 0.4)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 16 }}
      >
        <View className="flex-row items-center gap-3 mb-3">
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <Text style={{ fontSize: 28 }}>{challenge.emoji}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <View
                className="px-2 py-0.5 rounded-sm"
                style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
              >
                <Text className="text-white text-[10px] font-bold tracking-wider uppercase">
                  {t("weeklyChallenge")}
                </Text>
              </View>
              <Text className="text-white/80 text-[11px] font-medium">⏱ {timeLabel}</Text>
            </View>
            <Text
              className="text-white text-xl font-extrabold leading-tight"
              numberOfLines={1}
            >
              {label}
            </Text>
            {description && (
              <Text className="text-white/75 text-xs mt-0.5" numberOfLines={1}>
                {description}
              </Text>
            )}
          </View>
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: completed ? "#22c55e" : "rgba(255,255,255,0.95)" }}
          >
            <Text style={{ fontSize: 22, color: completed ? "#fff" : challenge.color }}>
              {completed ? "✓" : "▶"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-white/90 text-[11px] font-semibold">
            {position}/{total} · ✓ {correctCount}
          </Text>
          {(progress?.day_streak ?? 0) > 0 && (
            <Text className="text-white/90 text-[11px] font-semibold">
              🔥 {progress?.day_streak} {t("weeklyDayStreakShort")}
            </Text>
          )}
        </View>
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        >
          <View
            className="h-2 rounded-full"
            style={{
              width: `${progressPct}%`,
              backgroundColor: "#ffffff",
            }}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function mixHex(a: string, b: string, ratio: number): string {
  const pa = parseInt(a.replace("#", ""), 16);
  const pb = parseInt(b.replace("#", ""), 16);
  const ar = (pa >> 16) & 0xff;
  const ag = (pa >> 8) & 0xff;
  const ab = pa & 0xff;
  const br = (pb >> 16) & 0xff;
  const bg = (pb >> 8) & 0xff;
  const bb = pb & 0xff;
  const r = Math.round(ar * (1 - ratio) + br * ratio);
  const g = Math.round(ag * (1 - ratio) + bg * ratio);
  const bl = Math.round(ab * (1 - ratio) + bb * ratio);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}
