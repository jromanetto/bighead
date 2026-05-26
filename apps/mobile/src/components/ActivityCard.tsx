import { View, Text } from "react-native";
import { SmallAvatar } from "./ProfileAvatar";
import { useTranslation } from "../contexts/LanguageContext";
import type { ActivityEvent } from "../services/activityFeed";

const COLORS = {
  surface: "#1E2529",
  border: "rgba(255,255,255,0.06)",
  text: "#ffffff",
  textMuted: "#9ca3af",
  primary: "#00c2cc",
};

function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

function timeAgo(iso: string, t: (k: any) => string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.max(1, Math.floor((now - then) / 1000));
  if (diffSec < 60) return t("activityTimeAgoJust");
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return fmt(t("activityTimeAgoMinutes"), { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return fmt(t("activityTimeAgoHours"), { count: hours });
  const days = Math.floor(hours / 24);
  return fmt(t("activityTimeAgoDays"), { count: days });
}

function eventIcon(type: ActivityEvent["event_type"]): string {
  switch (type) {
    case "level_up":
      return "⬆️";
    case "achievement_unlocked":
    case "badge_earned":
      return "🏅";
    case "weekly_completed":
      return "🏆";
    case "high_score":
    case "streak_milestone":
      return "🔥";
    case "referral_completed":
      return "🤝";
    default:
      return "✨";
  }
}

function renderEventText(
  event: ActivityEvent,
  t: (k: any) => string,
): string {
  const name = event.username || t("activitySomeone");
  switch (event.event_type) {
    case "level_up":
      return fmt(t("activityEventLevelUp"), {
        name,
        level: event.payload?.new_level ?? "?",
      });
    case "achievement_unlocked":
    case "badge_earned":
      return fmt(t("activityEventAchievement"), {
        name,
        achievement: event.payload?.name || "—",
      });
    case "weekly_completed":
      return fmt(t("activityEventWeeklyComplete"), {
        name,
        theme: event.payload?.theme || "",
      });
    case "streak_milestone":
      return fmt(t("activityEventStreakMilestone"), {
        name,
        streak: event.payload?.streak ?? "?",
      });
    case "referral_completed":
      return fmt(t("activityEventReferralComplete"), { name });
    case "high_score":
      return fmt(t("activityEventHighScore"), {
        name,
        score: event.payload?.score ?? "",
      });
    default:
      return name;
  }
}

export function ActivityCard({ event }: { event: ActivityEvent }) {
  const { t } = useTranslation();
  return (
    <View
      className="flex-row items-center gap-3 p-3 rounded-xl"
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <SmallAvatar
        userId={event.user_id}
        username={event.username || undefined}
        avatarUrl={event.avatar_url || undefined}
        size={40}
      />
      <View className="flex-1">
        <Text className="text-sm text-white leading-snug" numberOfLines={2}>
          <Text>{eventIcon(event.event_type)} </Text>
          {renderEventText(event, t as any)}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
          {timeAgo(event.created_at, t as any)}
        </Text>
      </View>
    </View>
  );
}
