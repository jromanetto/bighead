import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

// Premium gold-themed colors for confetti
const CONFETTI_COLORS = [
  '#FFD700', // Gold
  '#FFA500', // Orange
  '#FF6B6B', // Coral
  '#00c2cc', // Cyan
  '#A16EFF', // Purple
  '#22c55e', // Green
  '#fbbf24', // Amber
  '#f59e0b', // Yellow
];

interface ConfettiParticle {
  id: number;
  startX: number;
  startY: number;
  color: string;
  size: number;
  delay: number;
  wobbleAmplitude: number;
  rotationSpeed: number;
  shape: 'square' | 'circle' | 'star' | 'ribbon';
  velocity: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
  duration?: number;
  particleCount?: number;
  premium?: boolean;
}

// Basic particle for non-Skia
function BasicConfettiParticle({
  particle,
  height,
  duration,
}: {
  particle: ConfettiParticle;
  height: number;
  duration: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      particle.delay,
      withTiming(1, {
        duration: (duration - particle.delay) * particle.velocity,
        easing: Easing.out(Easing.quad),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [-50, height + 50]);
    const translateX =
      Math.sin(progress.value * 8 * Math.PI) * particle.wobbleAmplitude;
    const opacity = interpolate(progress.value, [0, 0.1, 0.8, 1], [0, 1, 1, 0]);
    const rotate = progress.value * particle.rotationSpeed;
    const scale = interpolate(progress.value, [0, 0.05, 0.2, 0.9, 1], [0, 1.3, 1, 1, 0.3]);

    return {
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
      opacity,
    };
  });

  const shapeStyle = useMemo(() => {
    switch (particle.shape) {
      case 'circle':
        return { borderRadius: particle.size / 2 };
      case 'ribbon':
        return {
          borderRadius: particle.size / 6,
          width: particle.size * 0.4,
          height: particle.size * 1.5,
        };
      case 'star':
        return { borderRadius: particle.size / 4 };
      default:
        return { borderRadius: particle.size / 5 };
    }
  }, [particle.shape, particle.size]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.startX,
          top: particle.startY,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          shadowColor: particle.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 4,
        },
        shapeStyle,
        animatedStyle,
      ]}
    />
  );
}

// Sparkle effect for premium
function SparkleEffect({ width, height }: { width: number; height: number }) {
  const sparkles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height * 0.6,
      size: 4 + Math.random() * 6,
      delay: Math.random() * 1000,
    }));
  }, [width, height]);

  return (
    <>
      {sparkles.map((sparkle) => (
        <SparkleParticle key={sparkle.id} sparkle={sparkle} />
      ))}
    </>
  );
}

function SparkleParticle({ sparkle }: { sparkle: { id: number; x: number; y: number; size: number; delay: number } }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      sparkle.delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        3,
        false
      )
    );
    opacity.value = withDelay(
      sparkle.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(0.3, { duration: 150 }),
          withTiming(1, { duration: 150 }),
          withTiming(0, { duration: 150 })
        ),
        3,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: sparkle.x,
          top: sparkle.y,
          width: sparkle.size,
          height: sparkle.size,
        },
        animatedStyle,
      ]}
    >
      {/* 4-point star shape */}
      <View style={{
        position: 'absolute',
        width: sparkle.size,
        height: 2,
        backgroundColor: '#FFD700',
        top: sparkle.size / 2 - 1,
        borderRadius: 1,
      }} />
      <View style={{
        position: 'absolute',
        width: 2,
        height: sparkle.size,
        backgroundColor: '#FFD700',
        left: sparkle.size / 2 - 1,
        borderRadius: 1,
      }} />
    </Animated.View>
  );
}

// Skia-based confetti (more premium looking)
let SkiaConfetti: React.ComponentType<{ particles: ConfettiParticle[]; duration: number; width: number; height: number }> | null = null;

if (Platform.OS !== 'web') {
  try {
    const {
      Canvas,
      RoundedRect,
      Circle,
      Group,
      Blur,
      LinearGradient,
      vec,
      Skia,
    } = require('@shopify/react-native-skia');

    SkiaConfetti = function SkiaConfettiComponent({
      particles,
      duration,
      width,
      height,
    }: {
      particles: ConfettiParticle[];
      duration: number;
      width: number;
      height: number;
    }) {
      return (
        <Canvas style={{ flex: 1 }}>
          {/* Glow layer */}
          <Group>
            {particles.slice(0, 20).map((particle) => (
              <Circle
                key={`glow-${particle.id}`}
                cx={particle.startX}
                cy={particle.startY}
                r={particle.size * 2}
                color={`${particle.color}40`}
              >
                <Blur blur={8} />
              </Circle>
            ))}
          </Group>
        </Canvas>
      );
    };
  } catch (e) {
    // Skia not available
  }
}

export function ConfettiEffect({
  trigger,
  onComplete,
  duration = 3000,
  particleCount = 60,
  premium = true,
}: ConfettiEffectProps) {
  const { width, height } = useWindowDimensions();
  const [isAnimating, setIsAnimating] = useState(false);
  const [key, setKey] = useState(0);

  // Generate confetti particles with variety
  const particles = useMemo<ConfettiParticle[]>(() => {
    const shapes: ('square' | 'circle' | 'star' | 'ribbon')[] = ['square', 'circle', 'star', 'ribbon'];

    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      startX: Math.random() * width,
      startY: -20 - Math.random() * 100, // Start above screen
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 8 + Math.random() * 10,
      delay: Math.random() * 600,
      wobbleAmplitude: 20 + Math.random() * 40,
      rotationSpeed: 360 + Math.random() * 720,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      velocity: 0.8 + Math.random() * 0.4,
    }));
  }, [width, key, particleCount]);

  // Start animation when triggered
  useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true);
      setKey((k) => k + 1);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, duration + 800);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, onComplete, isAnimating]);

  if (!trigger && !isAnimating) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]} pointerEvents="none">
      {/* Sparkle effects for premium feel */}
      {premium && <SparkleEffect width={width} height={height} />}

      {/* Main confetti particles */}
      {particles.map((particle) => (
        <BasicConfettiParticle
          key={`${key}-${particle.id}`}
          particle={particle}
          height={height}
          duration={duration}
        />
      ))}
    </View>
  );
}

export default ConfettiEffect;
