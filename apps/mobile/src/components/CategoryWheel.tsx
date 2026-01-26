import { View, Text, Pressable, Platform, Dimensions } from "react-native";
import { useState, useEffect, useCallback, useMemo } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
  interpolate,
  withRepeat,
} from "react-native-reanimated";
import { Category, CategoryInfo, CATEGORIES, Tier, getQuestionsForLevel } from "../types/adventure";
import { buttonPressFeedback } from "../utils/feedback";
import { soundService } from "../services/sounds";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 60, 320);
const CENTER_SIZE = 80;

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryGlow: "#00e5ff",
  gold: "#FFD700",
  goldDim: "rgba(255, 215, 0, 0.3)",
  text: "#ffffff",
  textMuted: "#9ca3af",
  chrome: ["#e8e8e8", "#b8b8b8", "#888888", "#b8b8b8", "#e8e8e8"],
};

interface CategoryWheelProps {
  completedCategories: Category[];
  onCategorySelected: (category: Category) => void;
  disabled?: boolean;
  tier: Tier;
  level: 1 | 2 | 3;
}

// Fallback wheel for web (no Skia)
function CategoryWheelFallback({
  completedCategories,
  onCategorySelected,
  disabled = false,
  tier,
  level,
}: CategoryWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [showResult, setShowResult] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const resultOpacity = useSharedValue(0);
  const questionsCount = getQuestionsForLevel(level);

  const uncompletedCategories = CATEGORIES.filter(
    (cat) => !completedCategories.includes(cat.code)
  );

  const handleSpin = useCallback(() => {
    if (isSpinning || disabled || uncompletedCategories.length === 0) return;

    buttonPressFeedback();
    setIsSpinning(true);
    setShowResult(false);
    setSelectedCategory(null);
    resultOpacity.value = 0;

    const randomIndex = Math.floor(Math.random() * uncompletedCategories.length);
    const selected = uncompletedCategories[randomIndex];

    const categoryIndex = CATEGORIES.indexOf(selected);
    const anglePerCategory = 360 / CATEGORIES.length;
    const targetAngle = categoryIndex * anglePerCategory;
    const totalRotation = rotation.value + 360 * 5 + (360 - targetAngle);

    soundService.play("gameStart");

    rotation.value = withTiming(totalRotation, {
      duration: 4000,
      easing: Easing.bezier(0.1, 0.7, 0.1, 1),
    });

    setTimeout(() => {
      setSelectedCategory(selected);
      setShowResult(true);
      resultOpacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.15, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      soundService.play("correct");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSpinning(false);
    }, 4100);
  }, [isSpinning, disabled, uncompletedCategories, rotation, resultOpacity, scale]);

  const handlePlay = useCallback(() => {
    if (selectedCategory) {
      buttonPressFeedback();
      onCategorySelected(selectedCategory.code);
    }
  }, [selectedCategory, onCategorySelected]);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="items-center">
      {/* Indicator */}
      <View
        style={{
          marginBottom: 8,
          shadowColor: COLORS.gold,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
        }}
      >
        <Text style={{ fontSize: 36, color: COLORS.gold }}>▼</Text>
      </View>

      {/* Wheel */}
      <Animated.View
        style={[
          {
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
            borderRadius: WHEEL_SIZE / 2,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.surface,
            borderWidth: 6,
            borderColor: COLORS.gold,
            shadowColor: COLORS.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
          },
          wheelStyle,
        ]}
      >
        {/* Inner border */}
        <View
          style={{
            position: "absolute",
            width: WHEEL_SIZE - 20,
            height: WHEEL_SIZE - 20,
            borderRadius: (WHEEL_SIZE - 20) / 2,
            borderWidth: 3,
            borderColor: COLORS.primary,
          }}
        />

        {/* Category segments */}
        {CATEGORIES.map((cat, index) => {
          const angle = (360 / CATEGORIES.length) * index - 90;
          const isCompleted = completedCategories.includes(cat.code);
          const segmentRadius = (WHEEL_SIZE - 40) / 2;

          return (
            <View
              key={cat.code}
              style={{
                position: "absolute",
                width: 56,
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                transform: [
                  { rotate: `${angle}deg` },
                  { translateX: segmentRadius - 10 },
                  { rotate: `${-angle}deg` },
                ],
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isCompleted ? "rgba(255,255,255,0.05)" : `${cat.color}30`,
                  borderWidth: 3,
                  borderColor: isCompleted ? "rgba(255,255,255,0.15)" : cat.color,
                  opacity: isCompleted ? 0.4 : 1,
                  shadowColor: isCompleted ? "transparent" : cat.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                }}
              >
                <Text style={{ fontSize: 24 }}>{isCompleted ? "✓" : cat.icon}</Text>
              </View>
            </View>
          );
        })}

        {/* Center hub */}
        <View
          style={{
            width: CENTER_SIZE,
            height: CENTER_SIZE,
            borderRadius: CENTER_SIZE / 2,
            backgroundColor: COLORS.surfaceLight,
            borderWidth: 4,
            borderColor: COLORS.gold,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: COLORS.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 15,
          }}
        >
          <Text style={{ fontSize: 36 }}>🎡</Text>
        </View>
      </Animated.View>

      {/* Spin Button or Result */}
      <View className="mt-8 items-center">
        {showResult && selectedCategory ? (
          <Animated.View className="items-center" style={resultStyle}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 20,
                backgroundColor: `${selectedCategory.color}30`,
                borderWidth: 2,
                borderColor: selectedCategory.color,
                marginBottom: 16,
                shadowColor: selectedCategory.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
              }}
            >
              <Text style={{ fontSize: 32, marginRight: 12 }}>{selectedCategory.icon}</Text>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: COLORS.text }}>
                {selectedCategory.nameFr}
              </Text>
            </View>
            <Text style={{ color: COLORS.textMuted, marginBottom: 16, fontSize: 16 }}>
              {questionsCount} questions
            </Text>
            <Pressable
              onPress={handlePlay}
              style={{
                paddingHorizontal: 48,
                paddingVertical: 18,
                borderRadius: 20,
                backgroundColor: COLORS.primary,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "900", color: COLORS.bg }}>
                JOUER ! 🎮
              </Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Pressable
            onPress={handleSpin}
            disabled={isSpinning || disabled || uncompletedCategories.length === 0}
            style={{
              paddingHorizontal: 48,
              paddingVertical: 18,
              borderRadius: 20,
              backgroundColor: isSpinning || disabled ? COLORS.surfaceLight : COLORS.gold,
              opacity: uncompletedCategories.length === 0 ? 0.5 : 1,
              shadowColor: COLORS.gold,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isSpinning || disabled ? 0 : 0.4,
              shadowRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: isSpinning || disabled ? COLORS.textMuted : COLORS.bg,
              }}
            >
              {isSpinning ? "✨ TIRAGE..." : "🎰 LANCER LA ROUE"}
            </Text>
          </Pressable>
        )}

        {uncompletedCategories.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 16, color: COLORS.primary, fontSize: 16 }}>
            Toutes les catégories complétées ! 🎉
          </Text>
        )}
      </View>
    </View>
  );
}

// Native wheel with Skia
let SkiaCategoryWheel: React.ComponentType<CategoryWheelProps> | null = null;

if (Platform.OS !== "web") {
  const {
    Canvas,
    Path,
    LinearGradient,
    RadialGradient,
    SweepGradient,
    Circle,
    vec,
    Skia,
    Group,
    Blur,
    Rect,
    Line,
    Text: SkiaText,
    useFont,
  } = require("@shopify/react-native-skia");

  SkiaCategoryWheel = function SkiaCategoryWheelComponent({
    completedCategories,
    onCategorySelected,
    disabled = false,
    tier,
    level,
  }: CategoryWheelProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
    const [showResult, setShowResult] = useState(false);
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const resultOpacity = useSharedValue(0);
    const glowPulse = useSharedValue(0);
    const questionsCount = getQuestionsForLevel(level);

    const uncompletedCategories = CATEGORIES.filter(
      (cat) => !completedCategories.includes(cat.code)
    );

    // Pulse animation for glow
    useEffect(() => {
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, []);

    const handleSpin = useCallback(() => {
      if (isSpinning || disabled || uncompletedCategories.length === 0) return;

      buttonPressFeedback();
      setIsSpinning(true);
      setShowResult(false);
      setSelectedCategory(null);
      resultOpacity.value = 0;

      const randomIndex = Math.floor(Math.random() * uncompletedCategories.length);
      const selected = uncompletedCategories[randomIndex];

      const categoryIndex = CATEGORIES.indexOf(selected);
      const anglePerCategory = 360 / CATEGORIES.length;
      const targetAngle = categoryIndex * anglePerCategory;
      const totalRotation = rotation.value + 360 * 6 + (360 - targetAngle);

      soundService.play("gameStart");

      rotation.value = withTiming(totalRotation, {
        duration: 5000,
        easing: Easing.bezier(0.15, 0.85, 0.1, 1),
      });

      setTimeout(() => {
        setSelectedCategory(selected);
        setShowResult(true);
        resultOpacity.value = withTiming(1, { duration: 300 });
        scale.value = withSequence(
          withSpring(1.2, { damping: 8 }),
          withSpring(1, { damping: 12 })
        );
        soundService.play("correct");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsSpinning(false);
      }, 5100);
    }, [isSpinning, disabled, uncompletedCategories, rotation, resultOpacity, scale]);

    const handlePlay = useCallback(() => {
      if (selectedCategory) {
        buttonPressFeedback();
        onCategorySelected(selectedCategory.code);
      }
    }, [selectedCategory, onCategorySelected]);

    const wheelStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const resultStyle = useAnimatedStyle(() => ({
      opacity: resultOpacity.value,
      transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.7]),
      transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.05]) }],
    }));

    // Create segment paths for wheel
    const createSegmentPath = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
      const path = Skia.Path.Make();
      const center = WHEEL_SIZE / 2;
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      path.moveTo(
        center + innerR * Math.cos(startRad),
        center + innerR * Math.sin(startRad)
      );
      path.lineTo(
        center + outerR * Math.cos(startRad),
        center + outerR * Math.sin(startRad)
      );
      path.arcTo(
        { x: center - outerR, y: center - outerR, width: outerR * 2, height: outerR * 2 },
        startAngle,
        endAngle - startAngle,
        false
      );
      path.lineTo(
        center + innerR * Math.cos(endRad),
        center + innerR * Math.sin(endRad)
      );
      path.arcTo(
        { x: center - innerR, y: center - innerR, width: innerR * 2, height: innerR * 2 },
        endAngle,
        -(endAngle - startAngle),
        false
      );
      path.close();

      return path;
    };

    const segmentAngle = 360 / CATEGORIES.length;
    const innerRadius = CENTER_SIZE / 2 + 10;
    const outerRadius = WHEEL_SIZE / 2 - 15;

    return (
      <View className="items-center">
        {/* Indicator with glow */}
        <Animated.View
          style={[
            {
              marginBottom: 8,
              shadowColor: COLORS.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 15,
            },
            glowStyle,
          ]}
        >
          <Text style={{ fontSize: 40, color: COLORS.gold }}>▼</Text>
        </Animated.View>

        {/* Wheel with Skia Canvas */}
        <View style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
          {/* Outer glow */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: WHEEL_SIZE + 20,
                height: WHEEL_SIZE + 20,
                left: -10,
                top: -10,
                borderRadius: (WHEEL_SIZE + 20) / 2,
                backgroundColor: COLORS.gold,
              },
              glowStyle,
            ]}
          />

          <Animated.View style={[{ width: WHEEL_SIZE, height: WHEEL_SIZE }, wheelStyle]}>
            <Canvas style={{ flex: 1 }}>
              {/* Wheel background */}
              <Circle cx={WHEEL_SIZE / 2} cy={WHEEL_SIZE / 2} r={WHEEL_SIZE / 2 - 2}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(WHEEL_SIZE, WHEEL_SIZE)}
                  colors={["#2a2a3a", "#1a1a2a", "#2a2a3a"]}
                />
              </Circle>

              {/* Gold outer ring */}
              <Circle
                cx={WHEEL_SIZE / 2}
                cy={WHEEL_SIZE / 2}
                r={WHEEL_SIZE / 2 - 4}
                style="stroke"
                strokeWidth={8}
              >
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(WHEEL_SIZE, WHEEL_SIZE)}
                  colors={["#FFD700", "#FFA500", "#FFD700", "#FFEC8B", "#FFD700"]}
                />
              </Circle>

              {/* Cyan inner ring */}
              <Circle
                cx={WHEEL_SIZE / 2}
                cy={WHEEL_SIZE / 2}
                r={WHEEL_SIZE / 2 - 14}
                style="stroke"
                strokeWidth={3}
                color={COLORS.primary}
              />

              {/* Segment separators */}
              {CATEGORIES.map((_, index) => {
                const angle = (segmentAngle * index - 90) * (Math.PI / 180);
                const startX = WHEEL_SIZE / 2 + innerRadius * Math.cos(angle);
                const startY = WHEEL_SIZE / 2 + innerRadius * Math.sin(angle);
                const endX = WHEEL_SIZE / 2 + (outerRadius - 5) * Math.cos(angle);
                const endY = WHEEL_SIZE / 2 + (outerRadius - 5) * Math.sin(angle);

                return (
                  <Line
                    key={`sep-${index}`}
                    p1={vec(startX, startY)}
                    p2={vec(endX, endY)}
                    color="rgba(255, 215, 0, 0.4)"
                    strokeWidth={2}
                  />
                );
              })}

              {/* Notches on outer edge */}
              {[...Array(44)].map((_, i) => {
                const angle = (i * (360 / 44) - 90) * (Math.PI / 180);
                const r1 = WHEEL_SIZE / 2 - 12;
                const r2 = WHEEL_SIZE / 2 - 6;

                return (
                  <Line
                    key={`notch-${i}`}
                    p1={vec(WHEEL_SIZE / 2 + r1 * Math.cos(angle), WHEEL_SIZE / 2 + r1 * Math.sin(angle))}
                    p2={vec(WHEEL_SIZE / 2 + r2 * Math.cos(angle), WHEEL_SIZE / 2 + r2 * Math.sin(angle))}
                    color="rgba(255, 215, 0, 0.3)"
                    strokeWidth={1.5}
                  />
                );
              })}

              {/* Center hub glow */}
              <Circle cx={WHEEL_SIZE / 2} cy={WHEEL_SIZE / 2} r={CENTER_SIZE / 2 + 15} color={COLORS.gold}>
                <Blur blur={15} />
              </Circle>

              {/* Center hub */}
              <Circle cx={WHEEL_SIZE / 2} cy={WHEEL_SIZE / 2} r={CENTER_SIZE / 2}>
                <RadialGradient
                  c={vec(WHEEL_SIZE / 2, WHEEL_SIZE / 2)}
                  r={CENTER_SIZE / 2}
                  colors={["#3a3a4a", "#2a2a3a", "#1a1a2a"]}
                />
              </Circle>

              {/* Center hub ring */}
              <Circle
                cx={WHEEL_SIZE / 2}
                cy={WHEEL_SIZE / 2}
                r={CENTER_SIZE / 2 - 2}
                style="stroke"
                strokeWidth={4}
              >
                <LinearGradient
                  start={vec(WHEEL_SIZE / 2 - CENTER_SIZE / 2, WHEEL_SIZE / 2)}
                  end={vec(WHEEL_SIZE / 2 + CENTER_SIZE / 2, WHEEL_SIZE / 2)}
                  colors={["#FFD700", "#FFEC8B", "#FFD700"]}
                />
              </Circle>
            </Canvas>

            {/* Category icons (React Native for emoji support) */}
            {CATEGORIES.map((cat, index) => {
              const angle = segmentAngle * index - 90;
              const isCompleted = completedCategories.includes(cat.code);
              const iconRadius = (innerRadius + outerRadius) / 2;
              const angleRad = (angle * Math.PI) / 180;
              const x = WHEEL_SIZE / 2 + iconRadius * Math.cos(angleRad) - 26;
              const y = WHEEL_SIZE / 2 + iconRadius * Math.sin(angleRad) - 26;

              return (
                <View
                  key={cat.code}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isCompleted ? "rgba(255,255,255,0.05)" : `${cat.color}40`,
                    borderWidth: 2,
                    borderColor: isCompleted ? "rgba(255,255,255,0.2)" : cat.color,
                    opacity: isCompleted ? 0.4 : 1,
                    shadowColor: isCompleted ? "transparent" : cat.color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{isCompleted ? "✓" : cat.icon}</Text>
                </View>
              );
            })}

            {/* Center emoji */}
            <View
              style={{
                position: "absolute",
                left: WHEEL_SIZE / 2 - CENTER_SIZE / 2,
                top: WHEEL_SIZE / 2 - CENTER_SIZE / 2,
                width: CENTER_SIZE,
                height: CENTER_SIZE,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 36 }}>🎰</Text>
            </View>
          </Animated.View>
        </View>

        {/* Spin Button or Result */}
        <View className="mt-8 items-center">
          {showResult && selectedCategory ? (
            <Animated.View className="items-center" style={resultStyle}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 24,
                  paddingVertical: 14,
                  borderRadius: 20,
                  backgroundColor: `${selectedCategory.color}30`,
                  borderWidth: 2,
                  borderColor: selectedCategory.color,
                  marginBottom: 16,
                  shadowColor: selectedCategory.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 20,
                }}
              >
                <Text style={{ fontSize: 36, marginRight: 12 }}>✨</Text>
                <Text style={{ fontSize: 32, marginRight: 12 }}>{selectedCategory.icon}</Text>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: COLORS.text }}>
                  {selectedCategory.nameFr}
                </Text>
              </View>
              <Text style={{ color: COLORS.textMuted, marginBottom: 16, fontSize: 16 }}>
                {questionsCount} questions
              </Text>
              <Pressable
                onPress={handlePlay}
                style={{
                  paddingHorizontal: 52,
                  paddingVertical: 18,
                  borderRadius: 24,
                  backgroundColor: COLORS.primary,
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 15,
                }}
              >
                <Text style={{ fontSize: 22, fontWeight: "900", color: COLORS.bg }}>
                  🎮 JOUER !
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable
              onPress={handleSpin}
              disabled={isSpinning || disabled || uncompletedCategories.length === 0}
              style={{
                paddingHorizontal: 52,
                paddingVertical: 18,
                borderRadius: 24,
                backgroundColor: isSpinning || disabled ? COLORS.surfaceLight : COLORS.gold,
                opacity: uncompletedCategories.length === 0 ? 0.5 : 1,
                shadowColor: COLORS.gold,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isSpinning || disabled ? 0 : 0.5,
                shadowRadius: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: isSpinning || disabled ? COLORS.textMuted : COLORS.bg,
                }}
              >
                {isSpinning ? "✨ TIRAGE EN COURS..." : "🎰 LANCER LA ROUE"}
              </Text>
            </Pressable>
          )}

          {uncompletedCategories.length === 0 && (
            <Text style={{ textAlign: "center", marginTop: 16, color: COLORS.primary, fontSize: 16 }}>
              Toutes les catégories complétées ! 🎉
            </Text>
          )}
        </View>
      </View>
    );
  };
}

// Main export
export function CategoryWheel(props: CategoryWheelProps) {
  if (Platform.OS === "web" || !SkiaCategoryWheel) {
    return <CategoryWheelFallback {...props} />;
  }
  return <SkiaCategoryWheel {...props} />;
}
