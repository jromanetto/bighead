import { useEffect, useMemo, useCallback } from "react";
import { Dimensions, StyleSheet, View, Text, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Design colors
const COLORS = {
  bg: "#161a1d",
  bgDark: "#0d0f10",
  primary: "#00c2cc",
  primaryGlow: "#00e5f0",
  text: "#ffffff",
  textDim: "#9ca3af",
};

interface AnimatedSplashProps {
  onAnimationEnd: () => void;
}

export function AnimatedSplash({ onAnimationEnd }: AnimatedSplashProps) {
  const containerOpacity = useSharedValue(1);
  const brainScale = useSharedValue(0.3);
  const brainOpacity = useSharedValue(0);
  const ring1Scale = useSharedValue(0.5);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.5);
  const ring2Opacity = useSharedValue(0);
  const ring3Scale = useSharedValue(0.5);
  const ring3Opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const glowOpacity = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);

  const handleAnimationComplete = useCallback(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  useEffect(() => {
    // 1. Brain appears with bounce
    brainOpacity.value = withTiming(1, { duration: 500 });
    brainScale.value = withSequence(
      withTiming(1.15, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 })
    );

    // 2. Ring 1 (inner)
    ring1Opacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    ring1Scale.value = withDelay(
      200,
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.95, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      )
    );

    // 3. Ring 2 (middle)
    ring2Opacity.value = withDelay(350, withTiming(0.7, { duration: 400 }));
    ring2Scale.value = withDelay(
      350,
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withRepeat(
          withSequence(
            withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.92, { duration: 1200, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      )
    );

    // 4. Ring 3 (outer)
    ring3Opacity.value = withDelay(500, withTiming(0.4, { duration: 400 }));
    ring3Scale.value = withDelay(
      500,
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withRepeat(
          withSequence(
            withTiming(1.1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.9, { duration: 1400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      )
    );

    // 5. Glow pulse
    glowOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // 6. BIGHEAD text appears
    textOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(
      700,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // 7. Slogan appears
    sloganOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));

    // 8. Fade out after 3.5 seconds
    containerOpacity.value = withDelay(
      3500,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(handleAnimationComplete)();
        }
      })
    );

    // Fallback timeout
    const fallbackTimer = setTimeout(() => {
      handleAnimationComplete();
    }, 4500);

    return () => clearTimeout(fallbackTimer);
  }, [handleAnimationComplete]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const brainStyle = useAnimatedStyle(() => ({
    opacity: brainOpacity.value,
    transform: [{ scale: brainScale.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));

  const ring3Style = useAnimatedStyle(() => ({
    opacity: ring3Opacity.value,
    transform: [{ scale: ring3Scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const sloganStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
  }));

  // Generate particles
  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 140 + (i % 3) * 20;
      items.push({
        left: width / 2 + Math.cos(angle) * radius - 3,
        top: height / 2 - 60 + Math.sin(angle) * radius - 3,
        size: 3 + (i % 3) * 2,
      });
    }
    return items;
  }, []);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Background */}
      <View style={styles.background} />

      {/* Center glow */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Rings */}
      <Animated.View style={[styles.ring, styles.ring3, ring3Style]} />
      <Animated.View style={[styles.ring, styles.ring2, ring2Style]} />
      <Animated.View style={[styles.ring, styles.ring1, ring1Style]} />

      {/* Brain Logo */}
      <Animated.View style={[styles.brainContainer, brainStyle]}>
        {/* Left hemisphere */}
        <View style={[styles.brainHalf, styles.brainLeft]}>
          <View style={[styles.brainLobe, styles.lobeTL]} />
          <View style={[styles.brainLobe, styles.lobeBL]} />
          <View style={[styles.brainLobe, styles.lobeML]} />
        </View>
        {/* Right hemisphere */}
        <View style={[styles.brainHalf, styles.brainRight]}>
          <View style={[styles.brainLobe, styles.lobeTR]} />
          <View style={[styles.brainLobe, styles.lobeBR]} />
          <View style={[styles.brainLobe, styles.lobeMR]} />
        </View>
        {/* Center stem */}
        <View style={styles.brainStem} />
        {/* Neural connections - glowing dots */}
        <View style={[styles.neuron, { top: 15, left: 25 }]} />
        <View style={[styles.neuron, { top: 35, left: 15 }]} />
        <View style={[styles.neuron, { top: 55, left: 28 }]} />
        <View style={[styles.neuron, { top: 15, right: 25 }]} />
        <View style={[styles.neuron, { top: 35, right: 15 }]} />
        <View style={[styles.neuron, { top: 55, right: 28 }]} />
        <View style={[styles.neuron, { top: 25, left: 45 }]} />
        <View style={[styles.neuron, { top: 25, right: 45 }]} />
        {/* Brain glow */}
        <View style={styles.brainGlow} />
      </Animated.View>

      {/* Particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            ring2Style,
            {
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
            },
          ]}
        />
      ))}

      {/* Text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.title}>BIGHEAD</Text>
      </Animated.View>

      {/* Slogan */}
      <Animated.View style={[styles.sloganContainer, sloganStyle]}>
        <Text style={styles.slogan}>Knowledge is power.</Text>
        <Text style={styles.sloganAccent}>Use it.</Text>
        <View style={styles.accentLine} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
  },
  glow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary,
    top: height / 2 - 150,
    left: width / 2 - 90,
    ...Platform.select({
      web: {
        boxShadow: `0 0 80px 40px ${COLORS.primaryGlow}`,
      },
      default: {
        shadowColor: COLORS.primaryGlow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 50,
      },
    }),
    opacity: 0.25,
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 1000,
  },
  ring1: {
    width: 120,
    height: 120,
    top: height / 2 - 120,
    left: width / 2 - 60,
    borderWidth: 3,
  },
  ring2: {
    width: 170,
    height: 170,
    top: height / 2 - 145,
    left: width / 2 - 85,
    borderColor: COLORS.primaryGlow,
    borderWidth: 2,
  },
  ring3: {
    width: 220,
    height: 220,
    top: height / 2 - 170,
    left: width / 2 - 110,
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: `0 0 20px 8px ${COLORS.primary}40`,
      },
      default: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
      },
    }),
  },
  // Brain styles
  brainContainer: {
    position: "absolute",
    top: height / 2 - 100,
    left: width / 2 - 45,
    width: 90,
    height: 80,
  },
  brainGlow: {
    position: "absolute",
    width: 70,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
    top: 10,
    left: 10,
    zIndex: -1,
  },
  brainHalf: {
    position: "absolute",
    width: 40,
    height: 70,
    top: 5,
  },
  brainLeft: {
    left: 5,
  },
  brainRight: {
    right: 5,
  },
  brainLobe: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  lobeTL: {
    width: 32,
    height: 28,
    borderRadius: 16,
    top: 0,
    left: 4,
  },
  lobeBL: {
    width: 28,
    height: 24,
    borderRadius: 14,
    top: 40,
    left: 8,
  },
  lobeML: {
    width: 24,
    height: 20,
    borderRadius: 12,
    top: 22,
    left: 0,
  },
  lobeTR: {
    width: 32,
    height: 28,
    borderRadius: 16,
    top: 0,
    right: 4,
  },
  lobeBR: {
    width: 28,
    height: 24,
    borderRadius: 14,
    top: 40,
    right: 8,
  },
  lobeMR: {
    width: 24,
    height: 20,
    borderRadius: 12,
    top: 22,
    right: 0,
  },
  brainStem: {
    position: "absolute",
    width: 12,
    height: 18,
    backgroundColor: COLORS.primary,
    opacity: 0.25,
    borderRadius: 6,
    bottom: 0,
    left: 39,
  },
  neuron: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryGlow,
    ...Platform.select({
      web: {
        boxShadow: `0 0 6px 2px ${COLORS.primaryGlow}`,
      },
      default: {
        shadowColor: COLORS.primaryGlow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
    }),
  },
  particle: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  textContainer: {
    position: "absolute",
    top: height / 2 + 50,
    alignItems: "center",
  },
  title: {
    fontSize: 52,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 6,
    ...Platform.select({
      web: {
        textShadow: `0 0 30px ${COLORS.primary}, 0 0 60px ${COLORS.primary}60`,
      },
      default: {
        textShadowColor: COLORS.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 25,
      },
    }),
  },
  sloganContainer: {
    position: "absolute",
    top: height / 2 + 115,
    alignItems: "center",
  },
  slogan: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.textDim,
    letterSpacing: 2,
    fontStyle: "italic",
  },
  sloganAccent: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 3,
    marginTop: 4,
  },
  accentLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.primary,
    marginTop: 20,
    opacity: 0.5,
    borderRadius: 1,
  },
});
