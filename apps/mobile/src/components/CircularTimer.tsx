import { View, Text } from "react-native";
import { useEffect, type ReactNode } from "react";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CircularTimerProps {
  /** Total time of the round (used to normalize progress). */
  totalSeconds: number;
  /** Remaining seconds (drives the animated ring). */
  timeLeft: number;
  /** Outer diameter in px. Defaults to 120. */
  size?: number;
  /** Progress ring color. Defaults to teal "#00c2cc". */
  color?: string;
  /** Stroke width of the ring. Defaults to 8. */
  strokeWidth?: number;
  /** Color used for the time number text. Defaults to white. */
  textColor?: string;
  /** Hide the centered "{timeLeft}s" text (call sites render their own). */
  hideTimeText?: boolean;
  /** Optional content rendered absolutely-centered on top of the ring. */
  children?: ReactNode;
}

/**
 * SVG-based circular countdown timer.
 * Behavior matches the previous inline implementations:
 * - `strokeDashoffset` animates over 300ms with linear easing on `timeLeft` change.
 * - Ring is rotated -90° so progress drains clockwise from the top.
 */
export function CircularTimer({
  totalSeconds,
  timeLeft,
  size = 120,
  color = "#00c2cc",
  strokeWidth = 8,
  textColor = "#ffffff",
  hideTimeText = false,
  children,
}: CircularTimerProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(
    totalSeconds > 0 ? timeLeft / totalSeconds : 0
  );

  useEffect(() => {
    progress.value = withTiming(
      totalSeconds > 0 ? timeLeft / totalSeconds : 0,
      { duration: 300, easing: Easing.linear }
    );
  }, [timeLeft, totalSeconds]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View
      className="relative items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      <View
        className="absolute items-center justify-center"
        style={{ width: size, height: size }}
      >
        {!hideTimeText && (
          <Text
            className="text-4xl font-black leading-none"
            style={{ color: textColor }}
          >
            {timeLeft}
            <Text className="text-lg text-gray-400 font-medium">s</Text>
          </Text>
        )}
        {children}
      </View>
    </View>
  );
}
