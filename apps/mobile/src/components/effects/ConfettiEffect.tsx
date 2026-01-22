import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

const CONFETTI_COUNT = 30;
const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#d946ef', '#fbbf24'];

interface ConfettiParticle {
  id: number;
  startX: number;
  color: string;
  size: number;
  delay: number;
  wobbleAmplitude: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
  duration?: number;
}

function ConfettiParticleView({
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
        duration: duration - particle.delay,
        easing: Easing.out(Easing.quad),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [50, height + 50]);
    const translateX =
      Math.sin(progress.value * 6 * Math.PI) * particle.wobbleAmplitude;
    const opacity = interpolate(progress.value, [0, 0.7, 1], [1, 1, 0]);
    const rotate = progress.value * 540;
    const scale = interpolate(progress.value, [0, 0.1, 0.8, 1], [1, 1.2, 1, 0.5]);

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

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.startX,
          top: 0,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.size / 4,
        },
        animatedStyle,
      ]}
    />
  );
}

export function ConfettiEffect({
  trigger,
  onComplete,
  duration = 2500,
}: ConfettiEffectProps) {
  const { width, height } = useWindowDimensions();
  const [isAnimating, setIsAnimating] = useState(false);
  const [key, setKey] = useState(0);

  // Generate confetti particles
  const particles = useMemo<ConfettiParticle[]>(() => {
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      startX: Math.random() * (width - 20),
      color: COLORS[i % COLORS.length],
      size: 8 + Math.random() * 8,
      delay: Math.random() * 300,
      wobbleAmplitude: 15 + Math.random() * 30,
    }));
  }, [width, key]);

  // Start animation when triggered
  useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true);
      setKey((k) => k + 1);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, duration + 500);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, onComplete, isAnimating]);

  if (!trigger && !isAnimating) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]} pointerEvents="none">
      {particles.map((particle) => (
        <ConfettiParticleView
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
