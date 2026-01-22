# Advanced Effects for BIGHEAD

Guide pour integrer des effets visuels avances avec **React Native Gesture Handler** et **React Native Skia**.

---

## 1. Etat Actuel

### Dependances installees
```json
{
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "^4.2.1"
}
```

### Usage actuel
- `GestureHandlerRootView` wrapper dans `_layout.tsx`
- `enablePanDownToClose` sur le BottomSheet (AuthModal)
- Animations basiques avec Reanimated (`withSpring`, `withTiming`)

### A installer pour effets avances
```bash
npx expo install @shopify/react-native-skia
```

---

## 2. React Native Gesture Handler - Effets Possibles

### 2.1 Swipe Cards (Questions)

Au lieu de boutons, les questions pourraient etre des cartes swipables:
- **Swipe droite** = Reponse A
- **Swipe gauche** = Reponse B
- **Swipe haut** = Reponse C
- **Swipe bas** = Reponse D

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

function SwipeableQuestionCard({ question, onAnswer }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      rotation.value = e.translationX / 20; // Rotation effet
    })
    .onEnd((e) => {
      const threshold = 150;

      if (Math.abs(e.translationX) > threshold) {
        // Swipe horizontal: A (droite) ou B (gauche)
        const answer = e.translationX > 0 ? 0 : 1;
        runOnJS(onAnswer)(answer);
      } else if (Math.abs(e.translationY) > threshold) {
        // Swipe vertical: C (haut) ou D (bas)
        const answer = e.translationY < 0 ? 2 : 3;
        runOnJS(onAnswer)(answer);
      } else {
        // Reset position
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle} className="bg-gray-800 rounded-2xl p-6">
        <Text className="text-white text-xl text-center">{question.text}</Text>
        {/* Indicateurs de direction */}
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-green-400 opacity-50">→ A</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
```

### 2.2 Pull-to-Refresh avec Bounce

```tsx
const pullGesture = Gesture.Pan()
  .onUpdate((e) => {
    if (e.translationY > 0) {
      // Effet elastique
      pullDistance.value = Math.sqrt(e.translationY) * 10;
    }
  })
  .onEnd(() => {
    if (pullDistance.value > 60) {
      runOnJS(onRefresh)();
    }
    pullDistance.value = withSpring(0);
  });
```

### 2.3 Long Press pour Power-ups

```tsx
const longPressGesture = Gesture.LongPress()
  .minDuration(500)
  .onStart(() => {
    // Activer le power-up (ex: 50/50, indice)
    runOnJS(activatePowerUp)();
    // Haptic feedback
    runOnJS(playHaptic)('success');
  });
```

### 2.4 Double Tap pour Skip

```tsx
const doubleTapGesture = Gesture.Tap()
  .numberOfTaps(2)
  .onEnd(() => {
    runOnJS(skipQuestion)();
  });
```

---

## 3. React Native Skia - Effets Visuels

### 3.1 Installation

```bash
npx expo install @shopify/react-native-skia
```

### 3.2 Confetti sur Bonne Reponse

```tsx
import {
  Canvas,
  Circle,
  vec,
  useValue,
  useComputedValue,
  useTiming,
} from '@shopify/react-native-skia';

const CONFETTI_COUNT = 50;
const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#d946ef'];

function ConfettiEffect({ trigger }) {
  const progress = useValue(0);

  useEffect(() => {
    if (trigger) {
      progress.current = 0;
      // Animate from 0 to 1 over 2 seconds
      useTiming(progress, { to: 1, duration: 2000 });
    }
  }, [trigger]);

  const confetti = useMemo(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      x: Math.random() * 390,
      startY: -20,
      endY: 844 + 50,
      size: 4 + Math.random() * 8,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.5,
      wobble: Math.random() * 100,
    })),
    [trigger]
  );

  return (
    <Canvas style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {confetti.map((c, i) => {
        const y = useComputedValue(() => {
          const p = Math.max(0, progress.current - c.delay) / (1 - c.delay);
          return c.startY + (c.endY - c.startY) * p;
        }, [progress]);

        const x = useComputedValue(() => {
          return c.x + Math.sin(progress.current * 10 + c.wobble) * 30;
        }, [progress]);

        return (
          <Circle
            key={i}
            cx={x}
            cy={y}
            r={c.size}
            color={c.color}
          />
        );
      })}
    </Canvas>
  );
}
```

### 3.3 Score Particles (+100 XP)

```tsx
import { Canvas, Text as SkiaText, useFont } from '@shopify/react-native-skia';

function ScoreParticle({ points, x, y, onComplete }) {
  const opacity = useValue(1);
  const translateY = useValue(0);
  const scale = useValue(1);

  useEffect(() => {
    // Animate up and fade out
    useTiming(translateY, { to: -100, duration: 1000 });
    useTiming(opacity, { to: 0, duration: 1000, easing: Easing.out(Easing.ease) });
    useTiming(scale, { to: 1.5, duration: 500 });

    setTimeout(onComplete, 1000);
  }, []);

  const font = useFont(require('./fonts/Inter-Bold.ttf'), 24);

  return (
    <Canvas style={{ position: 'absolute', left: x - 50, top: y - 20, width: 100, height: 100 }}>
      <SkiaText
        x={50}
        y={30}
        text={`+${points}`}
        font={font}
        color="#22c55e"
        opacity={opacity}
        transform={[
          { translateY: translateY.current },
          { scale: scale.current },
        ]}
      />
    </Canvas>
  );
}
```

### 3.4 Glow Effect sur Multiplier

```tsx
import { Canvas, Circle, Shadow, BlurMask } from '@shopify/react-native-skia';

function GlowingMultiplier({ value, color }) {
  const pulse = useValue(1);

  useEffect(() => {
    // Continuous pulse animation
    const loop = () => {
      useTiming(pulse, { to: 1.2, duration: 500 });
      setTimeout(() => {
        useTiming(pulse, { to: 1, duration: 500 });
        setTimeout(loop, 500);
      }, 500);
    };
    loop();
  }, []);

  return (
    <Canvas style={{ width: 80, height: 80 }}>
      {/* Glow layer */}
      <Circle cx={40} cy={40} r={30 * pulse.current} color={color}>
        <BlurMask blur={15} style="normal" />
      </Circle>
      {/* Main circle */}
      <Circle cx={40} cy={40} r={25} color={color} />
    </Canvas>
  );
}
```

### 3.5 Timer avec Shader Gradient

```tsx
import { Canvas, Circle, SweepGradient, vec } from '@shopify/react-native-skia';

function TimerCircle({ timeRemaining, totalTime }) {
  const progress = timeRemaining / totalTime;
  const danger = timeRemaining <= 5;

  return (
    <Canvas style={{ width: 64, height: 64 }}>
      {/* Background */}
      <Circle cx={32} cy={32} r={30} color="#374151" />

      {/* Progress arc */}
      <Circle cx={32} cy={32} r={30} style="stroke" strokeWidth={4}>
        <SweepGradient
          c={vec(32, 32)}
          colors={danger ? ['#ef4444', '#f97316'] : ['#0ea5e9', '#22c55e']}
          start={0}
          end={progress * 360}
        />
      </Circle>
    </Canvas>
  );
}
```

### 3.6 Streak Fire Effect

```tsx
import { Canvas, Path, useValue, useComputedValue } from '@shopify/react-native-skia';

function FireEffect({ intensity = 1 }) {
  const time = useValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      time.current += 0.1;
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const flames = useComputedValue(() => {
    // Generate dynamic flame paths based on time
    const paths = [];
    for (let i = 0; i < 5 * intensity; i++) {
      const x = 20 + i * 10;
      const height = 30 + Math.sin(time.current + i) * 15;
      paths.push(`M${x},50 Q${x + 5},${50 - height} ${x + 10},50`);
    }
    return paths;
  }, [time]);

  return (
    <Canvas style={{ width: 80, height: 60 }}>
      {flames.current.map((pathStr, i) => (
        <Path
          key={i}
          path={pathStr}
          color={i % 2 === 0 ? '#f97316' : '#fbbf24'}
          style="fill"
        />
      ))}
    </Canvas>
  );
}
```

---

## 4. Effets Recommandes pour BIGHEAD

### Par Ecran

| Ecran | Effet | Technologie |
|-------|-------|-------------|
| **Game Chain** | Swipe cards pour reponses | Gesture Handler |
| **Game Chain** | Timer avec gradient animé | Skia |
| **Game Chain** | Glow sur multiplier | Skia |
| **Correct Answer** | Confetti explosion | Skia |
| **Correct Answer** | Score particles (+X) | Skia |
| **Wrong Answer** | Shake animation | Reanimated |
| **Result** | Confetti si >80% | Skia |
| **Streak** | Fire effect animé | Skia |
| **Achievement Unlock** | Glow + confetti | Skia |
| **Onboarding** | Swipe horizontal | Gesture Handler |
| **Leaderboard** | Pull-to-refresh | Gesture Handler |

### Interactions Tactiles

| Geste | Action | Feedback |
|-------|--------|----------|
| **Tap** | Selectionner reponse | Haptic light |
| **Double Tap** | Skip question (si power-up) | Haptic medium |
| **Long Press** | Activer power-up | Haptic success + glow |
| **Swipe Card** | Reponse rapide | Haptic + rotation |
| **Pull Down** | Refresh classement | Spring animation |
| **Pinch** | Zoom sur image joueur | Scale transform |

---

## 5. Performance Considerations

### Skia Best Practices

1. **Worklets**: Utiliser `useComputedValue` pour les calculs sur UI thread
2. **Memoization**: `useMemo` pour les paths statiques
3. **Offscreen rendering**: Pour les effets complexes
4. **Limit particles**: Max 50-100 confetti pour 60fps

### Gesture Handler Best Practices

1. **Workletize callbacks**: RNGH 2.0 le fait automatiquement avec Reanimated
2. **Composed gestures**: Combiner tap + pan quand necessaire
3. **Hit slop**: Augmenter la zone tactile pour meilleure UX

---

## 6. Implementation Plan

### Phase 1: Installation Skia
```bash
npx expo install @shopify/react-native-skia
```

### Phase 2: Effets Prioritaires
1. Confetti sur bonne reponse
2. Score particles
3. Timer gradient

### Phase 3: Gestures Avancees
1. Swipe cards (optionnel, mode alternatif)
2. Pull-to-refresh sur leaderboard
3. Long press power-ups

### Phase 4: Polish
1. Fire effect pour streak
2. Glow sur multiplier
3. Achievement unlock animation

---

## 7. Exemple Complet: Confetti + Score

```tsx
// components/GameFeedback.tsx
import { useState, useCallback } from 'react';
import { View } from 'react-native';
import { Canvas, Circle, Text as SkiaText, useFont } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface GameFeedbackProps {
  isCorrect: boolean;
  points: number;
  onComplete: () => void;
}

export function GameFeedback({ isCorrect, points, onComplete }: GameFeedbackProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isCorrect) {
      // Generate confetti
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 390,
        startY: Math.random() * -50,
        endY: 844,
        color: ['#0ea5e9', '#22c55e', '#f59e0b'][i % 3],
        size: 4 + Math.random() * 6,
      }));
      setParticles(newParticles);
    }

    // Fade out after 1.5s
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
      setTimeout(onComplete, 300);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isCorrect]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const font = useFont(require('../assets/fonts/Inter-Bold.ttf'), 32);

  return (
    <Animated.View style={[{ position: 'absolute', inset: 0 }, containerStyle]}>
      <Canvas style={{ flex: 1 }}>
        {/* Confetti particles */}
        {particles.map((p) => (
          <AnimatedConfetti key={p.id} {...p} />
        ))}

        {/* Score text */}
        {isCorrect && font && (
          <SkiaText
            x={195}
            y={400}
            text={`+${points}`}
            font={font}
            color="#22c55e"
          />
        )}
      </Canvas>
    </Animated.View>
  );
}
```

---

## Sources

- [React Native Gesture Handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Native Skia Shaders](https://shopify.github.io/react-native-skia/docs/shaders/overview/)
- [react-native-fast-confetti](https://github.com/AlirezaHadjar/react-native-fast-confetti)
- [Reanimated Handling Gestures](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/handling-gestures/)
- [LogRocket Gesture Handler Tutorial](https://blog.logrocket.com/react-native-gesture-handler-tutorial-examples/)
