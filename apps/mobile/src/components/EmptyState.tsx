import { View, Text, Pressable } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { buttonPressFeedback } from "../utils/feedback";

const COLORS = {
  primary: "#00c2cc",
  bg: "#161a1d",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; onPress: () => void };
}

/**
 * Empty state with a large emoji, title, optional subtitle and CTA.
 * Performs a subtle fade-in + slide-up entrance animation.
 */
export function EmptyState({ emoji, title, subtitle, cta }: EmptyStateProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(
      40,
      withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      40,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 32,
        },
      ]}
    >
      <Text style={{ fontSize: 72, marginBottom: 16 }}>{emoji}</Text>
      <Text
        style={{
          color: COLORS.text,
          fontSize: 20,
          fontWeight: "800",
          textAlign: "center",
          marginBottom: subtitle ? 8 : 0,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: COLORS.textMuted,
            textAlign: "center",
            fontSize: 14,
            lineHeight: 20,
            maxWidth: 320,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
      {cta ? (
        <Pressable
          onPress={() => {
            buttonPressFeedback();
            cta.onPress();
          }}
          accessibilityRole="button"
          accessibilityLabel={cta.label}
          style={{
            marginTop: 24,
            backgroundColor: COLORS.primary,
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: COLORS.bg, fontWeight: "800" }}>{cta.label}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

export default EmptyState;
