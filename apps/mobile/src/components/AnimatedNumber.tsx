import { useEffect, useState } from "react";
import { Text, type TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  style?: TextStyle | TextStyle[];
  prefix?: string;
  suffix?: string;
  formatter?: (n: number) => string;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * Animates a number from the previous value to the new one over `duration` ms.
 * The displayed value is rounded each frame for a counter-style feel.
 *
 * Implementation notes:
 *  - We use a shared value driven by `withTiming` + `useAnimatedReaction` to
 *    push the rounded value back to JS state. This works on iOS / Android.
 *  - Easing: `Easing.out(Easing.cubic)`.
 */
export function AnimatedNumber({
  value,
  duration = 800,
  className,
  style,
  prefix = "",
  suffix = "",
  formatter,
}: AnimatedNumberProps) {
  const progress = useSharedValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    progress.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, progress]);

  useAnimatedReaction(
    () => progress.value,
    (current, previous) => {
      const rounded = Math.round(current);
      if (rounded !== previous) {
        runOnJS(setDisplay)(rounded);
      }
    },
    [value]
  );

  const formatted = formatter ? formatter(display) : display.toLocaleString();

  return (
    <AnimatedText className={className} style={style}>
      {prefix}
      {formatted}
      {suffix}
    </AnimatedText>
  );
}

export default AnimatedNumber;
