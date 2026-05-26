import { View, type DimensionValue } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolateColor,
  Easing,
} from "react-native-reanimated";

/**
 * Color tokens shared across skeleton compositions.
 * Aligned with the dark theme used in the rest of the app.
 */
const COLORS = {
  base: "#252e33",
  highlight: "#2f3a40",
  surface: "#1E2529",
  textMuted: "rgba(255,255,255,0.05)",
};

interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  rounded?: number;
  className?: string;
  style?: any;
}

/**
 * Animated pulse block — base building primitive for all skeleton screens.
 * Pulses between #252e33 → #2f3a40 over ~800ms.
 */
export function Skeleton({
  width = "100%",
  height,
  rounded = 8,
  className,
  style,
}: SkeletonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.base, COLORS.highlight]
    ),
    opacity: 0.6 + progress.value * 0.4,
  }));

  return (
    <Animated.View
      className={className}
      style={[
        {
          width,
          height,
          borderRadius: rounded,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Generic card-shaped skeleton. Matches default card padding of the app.
 */
export function SkeletonCard() {
  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.textMuted,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Skeleton width={40} height={40} rounded={20} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="70%" height={12} rounded={6} />
          <View style={{ height: 8 }} />
          <Skeleton width="40%" height={10} rounded={5} />
        </View>
      </View>
    </View>
  );
}

/**
 * Row mimicking a leaderboard entry: rank + avatar + name/sub + score.
 */
export function SkeletonLeaderboardRow() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
        marginBottom: 8,
      }}
    >
      <Skeleton width={16} height={14} rounded={4} />
      <View style={{ width: 12 }} />
      <Skeleton width={40} height={40} rounded={20} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="60%" height={12} rounded={6} />
        <View style={{ height: 6 }} />
        <Skeleton width="35%" height={10} rounded={5} />
      </View>
      <Skeleton width={56} height={16} rounded={6} />
    </View>
  );
}

/**
 * Small stat pill skeleton (used as part of larger compositions).
 */
export function SkeletonStat() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 8,
        marginHorizontal: 4,
        alignItems: "center",
      }}
    >
      <Skeleton width={36} height={10} rounded={5} />
      <View style={{ height: 8 }} />
      <Skeleton width={48} height={18} rounded={6} />
    </View>
  );
}

export default Skeleton;
