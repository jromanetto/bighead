import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Icon, IconName } from "./Icon";
import { buttonPressFeedback } from "../../utils/feedback";

type IconButtonVariant = "glass" | "primary" | "ghost";

interface IconButtonProps {
  name: IconName;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: number;
  iconSize?: number;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANT_STYLES: Record<
  IconButtonVariant,
  { bg: string; border: string; borderWidth: number }
> = {
  glass: {
    bg: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
  },
  primary: {
    bg: "#00c2cc",
    border: "transparent",
    borderWidth: 0,
  },
  ghost: {
    bg: "transparent",
    border: "transparent",
    borderWidth: 0,
  },
};

/**
 * Animated icon button with glass effect
 * Used for back buttons, settings, close, etc.
 *
 * @example
 * <IconButton name="ArrowLeft" onPress={goBack} variant="glass" />
 * <IconButton name="Settings" onPress={openSettings} variant="ghost" />
 * <IconButton name="Play" onPress={startGame} variant="primary" />
 */
export function IconButton({
  name,
  onPress,
  variant = "glass",
  size = 44,
  iconSize,
  color = "#ffffff",
  disabled = false,
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);
  const variantStyle = VARIANT_STYLES[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    buttonPressFeedback();
    onPress();
  };

  // Calculate icon size based on button size if not provided
  const calculatedIconSize = iconSize || Math.round(size * 0.45);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          borderWidth: variantStyle.borderWidth,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Icon
        name={name}
        size={calculatedIconSize}
        color={variant === "primary" ? "#0a0a1a" : color}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
