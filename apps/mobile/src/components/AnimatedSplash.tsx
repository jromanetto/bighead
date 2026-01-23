import { useEffect, useMemo, useCallback, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Text as SkiaText,
  useFont,
  vec,
  Rect,
  BlurMask,
  RadialGradient,
} from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Design colors
const COLORS = {
  bg: "#161a1d",
  bgDark: "#0d0f10",
  primary: "#00c2cc",
  primaryGlow: "#00e5f0",
  text: "#ffffff",
};

interface AnimatedSplashProps {
  onAnimationEnd: () => void;
}

export function AnimatedSplash({ onAnimationEnd }: AnimatedSplashProps) {
  // Animation state for Skia (driven by Reanimated via state updates)
  const [ringScale1, setRingScale1] = useState(0.5);
  const [ringScale2, setRingScale2] = useState(0.5);
  const [ringScale3, setRingScale3] = useState(0.5);
  const [ringOpacity1, setRingOpacity1] = useState(0);
  const [ringOpacity2, setRingOpacity2] = useState(0);
  const [ringOpacity3, setRingOpacity3] = useState(0);
  const [glowPulse, setGlowPulse] = useState(0);
  const [textOpacity, setTextOpacity] = useState(0);
  const [logoOpacity, setLogoOpacity] = useState(0);

  // Reanimated values for smooth container fade
  const containerOpacity = useSharedValue(1);

  // Load fonts
  const font = useFont(
    require("@shopify/react-native-skia/src/skia/__tests__/assets/Roboto-Bold.ttf"),
    52
  );

  const smallFont = useFont(
    require("@shopify/react-native-skia/src/skia/__tests__/assets/Roboto-Medium.ttf"),
    14
  );

  const handleAnimationComplete = useCallback(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  useEffect(() => {
    // Sequence animations using setTimeout for state updates
    // 1. Logo fade in
    const t1 = setTimeout(() => setLogoOpacity(1), 50);

    // 2. Ring 1
    const t2 = setTimeout(() => {
      setRingOpacity1(1);
      setRingScale1(1);
    }, 150);

    // 3. Ring 2
    const t3 = setTimeout(() => {
      setRingOpacity2(0.7);
      setRingScale2(1);
    }, 300);

    // 4. Ring 3
    const t4 = setTimeout(() => {
      setRingOpacity3(0.4);
      setRingScale3(1);
    }, 450);

    // 5. Glow
    const t5 = setTimeout(() => setGlowPulse(1), 600);

    // 6. Text
    const t6 = setTimeout(() => setTextOpacity(1), 700);

    // 7. Fade out
    containerOpacity.value = withDelay(
      3000,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(handleAnimationComplete)();
        }
      })
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  // Generate particles
  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      items.push({
        angle,
        baseRadius: 120 + (i % 3) * 25,
        size: 2 + Math.random() * 3,
      });
    }
    return items;
  }, []);

  if (!font || !smallFont) {
    return (
      <Animated.View style={[styles.container, containerStyle]}>
        <View style={styles.fallback} />
      </Animated.View>
    );
  }

  const centerX = width / 2;
  const centerY = height / 2 - 30;

  // Calculate text position to center it
  const textWidth = font.measureText("BIGHEAD").width;
  const subtitleWidth = smallFont.measureText("FOOTBALL QUIZ").width;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Canvas style={styles.canvas}>
        {/* Background gradient */}
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, height)}
            colors={[COLORS.bgDark, COLORS.bg, COLORS.bgDark]}
          />
        </Rect>

        {/* Center glow */}
        <Group opacity={glowPulse}>
          <Circle cx={centerX} cy={centerY} r={80}>
            <RadialGradient
              c={vec(centerX, centerY)}
              r={80}
              colors={[COLORS.primaryGlow, "transparent"]}
            />
          </Circle>
        </Group>

        {/* Outer ring - ring 3 */}
        <Group
          transform={[
            { translateX: centerX },
            { translateY: centerY },
            { scale: ringScale3 },
            { translateX: -centerX },
            { translateY: -centerY },
          ]}
          opacity={ringOpacity3}
        >
          <Circle
            cx={centerX}
            cy={centerY}
            r={100}
            color={COLORS.primary}
            style="stroke"
            strokeWidth={1}
          >
            <BlurMask blur={8} style="solid" />
          </Circle>
        </Group>

        {/* Middle ring - ring 2 */}
        <Group
          transform={[
            { translateX: centerX },
            { translateY: centerY },
            { scale: ringScale2 },
            { translateX: -centerX },
            { translateY: -centerY },
          ]}
          opacity={ringOpacity2}
        >
          <Circle
            cx={centerX}
            cy={centerY}
            r={70}
            color={COLORS.primaryGlow}
            style="stroke"
            strokeWidth={2}
          >
            <BlurMask blur={4} style="solid" />
          </Circle>
        </Group>

        {/* Inner ring - ring 1 */}
        <Group
          transform={[
            { translateX: centerX },
            { translateY: centerY },
            { scale: ringScale1 },
            { translateX: -centerX },
            { translateY: -centerY },
          ]}
          opacity={ringOpacity1}
        >
          <Circle
            cx={centerX}
            cy={centerY}
            r={45}
            color={COLORS.primary}
            style="stroke"
            strokeWidth={3}
          />
        </Group>

        {/* Center filled circle */}
        <Group opacity={logoOpacity}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={30}
            color={COLORS.primary}
            opacity={0.2}
          />
          <Circle
            cx={centerX}
            cy={centerY}
            r={15}
            color={COLORS.primary}
            opacity={0.4}
          />
        </Group>

        {/* Floating particles */}
        {particles.map((particle, index) => {
          const px = centerX + Math.cos(particle.angle) * particle.baseRadius;
          const py = centerY + Math.sin(particle.angle) * particle.baseRadius;
          return (
            <Group key={index} opacity={ringOpacity2}>
              <Circle
                cx={px}
                cy={py}
                r={particle.size}
                color={COLORS.primary}
                opacity={0.6}
              >
                <BlurMask blur={2} style="solid" />
              </Circle>
            </Group>
          );
        })}

        {/* BIGHEAD text with glow effect */}
        <Group opacity={textOpacity}>
          {/* Text glow layer 1 - outer glow */}
          <SkiaText
            x={centerX - textWidth / 2}
            y={centerY + 120}
            text="BIGHEAD"
            font={font}
            color={COLORS.primary}
            opacity={0.3}
          >
            <BlurMask blur={20} style="solid" />
          </SkiaText>

          {/* Text glow layer 2 - inner glow */}
          <SkiaText
            x={centerX - textWidth / 2}
            y={centerY + 120}
            text="BIGHEAD"
            font={font}
            color={COLORS.primaryGlow}
            opacity={0.5}
          >
            <BlurMask blur={8} style="solid" />
          </SkiaText>

          {/* Main text */}
          <SkiaText
            x={centerX - textWidth / 2}
            y={centerY + 120}
            text="BIGHEAD"
            font={font}
            color={COLORS.text}
          />

          {/* Subtitle */}
          <SkiaText
            x={centerX - subtitleWidth / 2}
            y={centerY + 150}
            text="FOOTBALL QUIZ"
            font={smallFont}
            color={COLORS.primary}
            opacity={0.9}
          />
        </Group>

        {/* Bottom accent line */}
        <Group opacity={textOpacity}>
          <Rect
            x={centerX - 40}
            y={centerY + 165}
            width={80}
            height={2}
            color={COLORS.primary}
            opacity={0.5}
          >
            <BlurMask blur={4} style="solid" />
          </Rect>
        </Group>
      </Canvas>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
    zIndex: 999,
  },
  canvas: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
