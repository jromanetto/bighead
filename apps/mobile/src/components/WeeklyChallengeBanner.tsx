import { View, Text, Pressable } from "react-native";
import { useEffect, useState, memo } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  getActiveWeeklyChallenge,
  getMyWeeklyProgress,
  timeUntilEnd,
  type WeeklyChallenge,
  type WeeklyChallengeType,
  type WeeklyProgress,
} from "../services/weeklyChallenge";
import { useTranslation } from "../contexts/LanguageContext";
import { buttonPressFeedback } from "../utils/feedback";
import { mixHex } from "../utils/colors";
import { categoryMeta } from "../utils/categoryLabel";
import { difficultyMeta } from "../utils/difficultyLabel";

type Props = {
  /** Legacy: fetch the active challenge of this type internally. */
  type?: WeeklyChallengeType;
  /** Render directly with a pre-fetched challenge (preferred for lists). */
  challenge?: WeeklyChallenge;
  /** Slightly more compact card (smaller padding, smaller fonts). */
  compact?: boolean;
};

// Memoized: takes a single `type` or pre-fetched `challenge` prop.
function WeeklyChallengeBannerInner({ type, challenge: challengeProp, compact = false }: Props) {
  const { t, language } = useTranslation();
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(challengeProp ?? null);
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [loaded, setLoaded] = useState(!!challengeProp);

  // Sync external challenge prop changes (e.g. when parent reloads).
  useEffect(() => {
    if (challengeProp) {
      setChallenge(challengeProp);
      setLoaded(true);
    }
  }, [challengeProp]);

  // Fetch progress for the current challenge (whether passed in or fetched here).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // If no challenge passed, fall back to legacy fetch-by-type behavior.
      if (!challengeProp) {
        const c = await getActiveWeeklyChallenge(type ?? "themed");
        if (cancelled) return;
        setChallenge(c);
        if (c) {
          const p = await getMyWeeklyProgress(c.id);
          if (!cancelled) setProgress(p);
        }
        if (!cancelled) setLoaded(true);
      } else {
        const p = await getMyWeeklyProgress(challengeProp.id);
        if (!cancelled) setProgress(p);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, challengeProp]);

  if (!loaded || !challenge) return null;

  const isActive = challenge.status === "active";
  const label = language === "fr" ? challenge.theme_label_fr : challenge.theme_label_en;
  const cat = challenge.challenge_type === "themed" ? categoryMeta(challenge.target_category) : null;
  const diff = challenge.challenge_type === "themed" ? difficultyMeta(challenge.target_difficulty) : null;
  const description = language === "fr" ? challenge.description_fr : challenge.description_en;
  const position = progress?.current_position ?? 0;
  const correctCount = progress?.correct_count ?? 0;
  const total = challenge.total_questions;
  const progressPct = total > 0 ? Math.round((position / total) * 100) : 0;
  const completed = position >= total && total > 0;

  // Time label only meaningful for active challenges
  const { days, hours } = timeUntilEnd(challenge);
  const timeLabel = isActive
    ? days > 0
      ? `${days}j ${hours}h`
      : hours > 0
        ? `${hours}h`
        : t("weeklyEndsSoon")
    : null;

  const isNews = challenge.challenge_type === "news" || challenge.theme_slug === "news";
  const tagLabel = isNews ? t("weeklyNewsTag") : t("weeklyChallenge");

  const padding = compact ? 12 : 16;
  const emojiSize = compact ? 44 : 56;
  const emojiFont = compact ? 22 : 28;
  const titleClass = compact
    ? "text-white text-base font-extrabold leading-tight"
    : "text-white text-xl font-extrabold leading-tight";
  const ctaSize = compact ? 40 : 48;

  const onPress = () => {
    buttonPressFeedback();
    if (isActive) {
      // Carry the clicked challenge's id: several challenges of the same type
      // can be active the same week, so resolving by type alone opens the wrong
      // quiz. `type` is kept as a fallback for legacy entry points.
      router.push({
        pathname: "/weekly",
        params: { id: challenge.id, type: isNews ? "news" : "themed" },
      } as any);
    } else {
      // closed / archived → history screen handles replay flow
      router.push("/weekly/history" as any);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl overflow-hidden active:opacity-95"
      style={{
        marginBottom: compact ? 10 : 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        opacity: isActive ? 1 : 0.85,
      }}
    >
      <LinearGradient
        colors={
          isActive
            ? [challenge.color, mixHex(challenge.color, "#000000", 0.4)]
            : [
                mixHex(challenge.color, "#000000", 0.45),
                mixHex(challenge.color, "#000000", 0.7),
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding }}
      >
        {/* Grayscale overlay for closed/archived */}
        {!isActive && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(20,24,28,0.35)",
            }}
          />
        )}

        <View className="flex-row items-center gap-3" style={{ marginBottom: compact ? 8 : 12 }}>
          <View
            className="rounded-2xl items-center justify-center"
            style={{
              width: emojiSize,
              height: emojiSize,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          >
            <Text style={{ fontSize: emojiFont }}>{challenge.emoji}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <View
                className="px-2 py-0.5 rounded-sm"
                style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
              >
                <Text className="text-white text-[10px] font-bold tracking-wider uppercase">
                  {tagLabel}
                </Text>
              </View>
              {timeLabel && (
                <Text className="text-white/80 text-[11px] font-medium">⏱ {timeLabel}</Text>
              )}
            </View>
            <Text className={titleClass} numberOfLines={1}>
              {label}
            </Text>
            {(cat || diff) && (
              <View className="flex-row items-center mt-1" style={{ gap: 6, flexWrap: "wrap" }}>
                {cat && (
                  <View className="px-2 py-0.5 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                    <Text className="text-white text-[10px] font-bold tracking-wider uppercase">
                      {cat.emoji} {language === "fr" ? cat.fr : cat.en}
                    </Text>
                  </View>
                )}
                {diff && (
                  <View className="px-2 py-0.5 rounded-sm" style={{ backgroundColor: diff.color }}>
                    <Text className="text-white text-[10px] font-black tracking-wider uppercase">
                      {language === "fr" ? diff.fr : diff.en}
                    </Text>
                  </View>
                )}
              </View>
            )}
            {description && !compact && (
              <Text className="text-white/75 text-xs mt-0.5" numberOfLines={1}>
                {description}
              </Text>
            )}
          </View>
          <View
            className="rounded-full items-center justify-center"
            style={{
              width: ctaSize,
              height: ctaSize,
              backgroundColor: completed
                ? "#22c55e"
                : isActive
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.85)",
            }}
          >
            <Text
              style={{
                fontSize: compact ? 18 : 22,
                color: completed ? "#fff" : challenge.color,
              }}
            >
              {completed ? "✓" : isActive ? "▶" : "↻"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-white/90 text-[11px] font-semibold">
            {position}/{total} · ✓ {correctCount}
          </Text>
          {isActive && (progress?.day_streak ?? 0) > 0 && (
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

export const WeeklyChallengeBanner = memo(WeeklyChallengeBannerInner);
