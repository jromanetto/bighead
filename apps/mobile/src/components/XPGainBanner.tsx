import { View, Text } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import type { XPGain } from "../services/xp";

interface Props {
  gain: XPGain;
  delayMs?: number;
  compact?: boolean;
  showBreakdown?: boolean;
}

/**
 * Visual XP gain banner used by all game-mode result screens.
 * Animates in with a spring + scale pulse.
 */
export function XPGainBanner({ gain, delayMs = 300, compact = false, showBreakdown = true }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 300 }));
    scale.value = withDelay(
      delayMs,
      withSequence(
        withSpring(1.08, { damping: 8, stiffness: 120 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      )
    );
  }, [delayMs]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[animStyle, { width: "100%" }]}
      accessibilityLabel={`Earned ${gain.total} XP`}
    >
      <LinearGradient
        colors={["#FFD700", "#FFA500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20,
          padding: compact ? 12 : 18,
          shadowColor: "#FFD700",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Text style={{ fontSize: compact ? 24 : 32 }}>⚡</Text>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                color: "#1a1a1a",
                fontSize: compact ? 22 : 32,
                fontWeight: "900",
                letterSpacing: -0.5,
              }}
            >
              +{gain.total.toLocaleString()} XP
            </Text>
            {!compact && showBreakdown && gain.breakdown.length > 0 && (
              <Text style={{ color: "#1a1a1a", fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                {gain.breakdown
                  .filter((b) => b.amount !== 0)
                  .map((b) => `${b.label} +${b.amount}`)
                  .join(" · ")}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
