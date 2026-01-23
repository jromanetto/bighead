import { View, Text, Pressable } from "react-native";
import { useState, useEffect, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Category, CategoryInfo, CATEGORIES } from "../types/adventure";
import { buttonPressFeedback } from "../utils/feedback";
import { soundService } from "../services/sounds";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

interface CategoryWheelProps {
  completedCategories: Category[];
  onCategorySelected: (category: Category) => void;
  disabled?: boolean;
}

export function CategoryWheel({
  completedCategories,
  onCategorySelected,
  disabled = false,
}: CategoryWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [showResult, setShowResult] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const resultOpacity = useSharedValue(0);

  // Get uncompleted categories
  const uncompletedCategories = CATEGORIES.filter(
    (cat) => !completedCategories.includes(cat.code)
  );

  const handleSpin = useCallback(() => {
    if (isSpinning || disabled || uncompletedCategories.length === 0) return;

    buttonPressFeedback();
    setIsSpinning(true);
    setShowResult(false);
    resultOpacity.value = 0;

    // Pick a random category
    const randomIndex = Math.floor(Math.random() * uncompletedCategories.length);
    const selected = uncompletedCategories[randomIndex];

    // Calculate spin: multiple full rotations + offset to land on selected
    const categoryAngle = (360 / CATEGORIES.length) * CATEGORIES.indexOf(selected);
    const totalRotation = 360 * 5 + categoryAngle; // 5 full spins + target

    // Play spinning sound
    soundService.play("whoosh");

    // Animate the spin
    rotation.value = withSequence(
      withTiming(totalRotation, {
        duration: 3500,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1), // Slow at end
      }),
    );

    // Show result after spin
    setTimeout(() => {
      setSelectedCategory(selected);
      setShowResult(true);
      resultOpacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      soundService.play("correct"); // Ding sound
      setIsSpinning(false);
    }, 3600);
  }, [isSpinning, disabled, uncompletedCategories, onCategorySelected]);

  const handlePlay = useCallback(() => {
    if (selectedCategory) {
      buttonPressFeedback();
      onCategorySelected(selectedCategory.code);
    }
  }, [selectedCategory, onCategorySelected]);

  const wheelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const resultStyle = useAnimatedStyle(() => {
    return {
      opacity: resultOpacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View className="items-center">
      {/* Indicator */}
      <View className="mb-2">
        <Text className="text-3xl">▼</Text>
      </View>

      {/* Wheel */}
      <Animated.View
        className="w-72 h-72 rounded-full items-center justify-center relative"
        style={[
          {
            backgroundColor: COLORS.surface,
            borderWidth: 4,
            borderColor: COLORS.primary,
          },
          wheelStyle,
        ]}
      >
        {CATEGORIES.map((cat, index) => {
          const angle = (360 / CATEGORIES.length) * index;
          const isCompleted = completedCategories.includes(cat.code);

          return (
            <View
              key={cat.code}
              className="absolute items-center"
              style={{
                transform: [
                  { rotate: `${angle}deg` },
                  { translateY: -100 },
                ],
              }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isCompleted ? "rgba(255,255,255,0.1)" : `${cat.color}30`,
                  borderWidth: 2,
                  borderColor: isCompleted ? "rgba(255,255,255,0.2)" : cat.color,
                  opacity: isCompleted ? 0.4 : 1,
                }}
              >
                <Text
                  className="text-2xl"
                  style={{
                    transform: [{ rotate: `${-angle}deg` }],
                  }}
                >
                  {isCompleted ? "✓" : cat.icon}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Center */}
        <View
          className="w-20 h-20 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.surfaceLight }}
        >
          <Text className="text-3xl">🎡</Text>
        </View>
      </Animated.View>

      {/* Spin Button or Result */}
      <View className="mt-8 items-center">
        {showResult && selectedCategory ? (
          <Animated.View className="items-center" style={resultStyle}>
            <View
              className="flex-row items-center px-6 py-3 rounded-2xl mb-4"
              style={{
                backgroundColor: `${selectedCategory.color}30`,
                borderWidth: 2,
                borderColor: selectedCategory.color,
              }}
            >
              <Text className="text-3xl mr-3">{selectedCategory.icon}</Text>
              <Text className="text-xl font-bold text-white">
                {selectedCategory.nameFr}
              </Text>
            </View>
            <Text style={{ color: COLORS.textMuted }} className="mb-4">
              10 questions
            </Text>
            <Pressable
              onPress={handlePlay}
              className="px-12 py-4 rounded-2xl active:opacity-80"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="text-lg font-black" style={{ color: COLORS.bg }}>
                JOUER !
              </Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Pressable
            onPress={handleSpin}
            disabled={isSpinning || disabled || uncompletedCategories.length === 0}
            className="px-12 py-4 rounded-2xl active:opacity-80"
            style={{
              backgroundColor: isSpinning || disabled
                ? COLORS.surfaceLight
                : COLORS.primary,
              opacity: uncompletedCategories.length === 0 ? 0.5 : 1,
            }}
          >
            <Text
              className="text-lg font-black"
              style={{
                color: isSpinning || disabled ? COLORS.textMuted : COLORS.bg,
              }}
            >
              {isSpinning ? "TIRAGE EN COURS..." : "🎡 LANCER LA ROUE"}
            </Text>
          </Pressable>
        )}

        {uncompletedCategories.length === 0 && (
          <Text className="text-center mt-4" style={{ color: COLORS.primary }}>
            Toutes les catégories complétées ! 🎉
          </Text>
        )}
      </View>
    </View>
  );
}
