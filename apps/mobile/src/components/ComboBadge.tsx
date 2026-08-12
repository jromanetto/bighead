import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/**
 * Juice: a "🔥 x3" combo badge that pops each time the combo grows. Rewards
 * chaining correct answers — the little dopamine hit that makes a quiz feel
 * premium. Hidden below a 2-combo so it only celebrates a real streak.
 */
export function ComboBadge({ combo }: { combo: number }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (combo >= 2) {
      scale.value = withSequence(withSpring(1.35, { damping: 6 }), withSpring(1));
      glow.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0.5, { duration: 300 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.6 + glow.value * 0.4,
  }));

  if (combo < 2) return null;

  return (
    <Animated.View
      style={[
        {
          alignSelf: "center",
          backgroundColor: "rgba(249, 115, 22, 0.18)",
          borderColor: "rgba(249, 115, 22, 0.5)",
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 5,
          marginBottom: 10,
        },
        style,
      ]}
    >
      <Text style={{ color: "#fb923c", fontWeight: "900", fontSize: 14 }}>🔥 Combo x{combo}</Text>
    </Animated.View>
  );
}

export default ComboBadge;
