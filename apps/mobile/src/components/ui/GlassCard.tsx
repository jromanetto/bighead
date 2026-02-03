import { View, ViewStyle, StyleSheet } from "react-native";
import { ReactNode } from "react";

type GlassVariant = "default" | "primary" | "premium" | "success" | "error";

interface GlassCardProps {
  variant?: GlassVariant;
  children: ReactNode;
  style?: ViewStyle;
  padding?: number;
  borderRadius?: number;
}

const VARIANTS: Record<GlassVariant, { bg: string; border: string }> = {
  default: {
    bg: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)",
  },
  primary: {
    bg: "rgba(0, 194, 204, 0.1)",
    border: "rgba(0, 194, 204, 0.3)",
  },
  premium: {
    bg: "rgba(255, 209, 0, 0.1)",
    border: "rgba(255, 209, 0, 0.3)",
  },
  success: {
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
  },
  error: {
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
  },
};

/**
 * Glassmorphism card component
 * Provides consistent glass-effect styling across the app
 *
 * @example
 * <GlassCard variant="default" padding={20}>
 *   <Text>Content here</Text>
 * </GlassCard>
 *
 * <GlassCard variant="premium">
 *   <Text>Premium content</Text>
 * </GlassCard>
 */
export function GlassCard({
  variant = "default",
  children,
  style,
  padding = 20,
  borderRadius = 20,
}: GlassCardProps) {
  const variantStyle = VARIANTS[variant];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          padding,
          borderRadius,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8, // Android shadow
  },
});

// Export variant type for external use
export type { GlassVariant };
