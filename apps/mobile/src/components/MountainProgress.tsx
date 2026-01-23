import { View, Text } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import {
  Tier,
  TIERS,
  getTierInfo,
  getCurrentLevelNumber,
} from "../types/adventure";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

interface MountainProgressProps {
  tier: Tier;
  level: 1 | 2 | 3;
  completedCategories: number;
  totalCategories: number;
}

export function MountainProgress({
  tier,
  level,
  completedCategories,
  totalCategories,
}: MountainProgressProps) {
  const currentLevel = getCurrentLevelNumber(tier, level);
  const totalLevels = 12;
  const characterProgress = useSharedValue(0);

  useEffect(() => {
    // Calculate progress: current level + partial progress within level
    const levelProgress = (currentLevel - 1) / totalLevels;
    const withinLevelProgress = completedCategories / totalCategories / totalLevels;
    const targetProgress = levelProgress + withinLevelProgress;

    characterProgress.value = withDelay(300, withSpring(targetProgress, {
      damping: 15,
      stiffness: 100,
    }));
  }, [currentLevel, completedCategories, totalCategories]);

  const characterStyle = useAnimatedStyle(() => {
    // Character moves from bottom (0%) to top (100%)
    const bottom = interpolate(characterProgress.value, [0, 1], [5, 85]);
    return {
      bottom: `${bottom}%`,
    };
  });

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Mountain Container */}
      <View className="w-full h-96 relative">
        {/* Mountain Background */}
        <View className="absolute inset-0 items-center">
          {/* Mountain Shape */}
          <View
            className="w-full h-full"
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 200,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            {/* Tier Markers */}
            {TIERS.map((t, index) => {
              const position = ((index + 1) / TIERS.length) * 85;
              const isCurrentTier = t.code === tier;
              const isPastTier = TIERS.findIndex(x => x.code === tier) > index;

              return (
                <View
                  key={t.code}
                  className="absolute left-0 right-0 flex-row items-center px-4"
                  style={{ bottom: `${position}%` }}
                >
                  {/* Tier line */}
                  <View
                    className="flex-1 h-0.5"
                    style={{
                      backgroundColor: isPastTier || isCurrentTier
                        ? t.color
                        : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {/* Tier label */}
                  <View
                    className="px-3 py-1 rounded-full ml-2"
                    style={{
                      backgroundColor: isPastTier || isCurrentTier
                        ? `${t.color}30`
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: isPastTier || isCurrentTier ? t.color : COLORS.textMuted,
                      }}
                    >
                      {t.nameFr.toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Summit Star */}
            <View className="absolute top-2 left-1/2 -translate-x-1/2">
              <Text className="text-3xl">⭐</Text>
            </View>

            {/* Level markers within current tier */}
            <View
              className="absolute left-1/2 -translate-x-1/2"
              style={{ bottom: "5%", height: "80%" }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((lvl) => {
                const position = ((lvl - 1) / 11) * 100;
                const isCompleted = lvl < currentLevel;
                const isCurrent = lvl === currentLevel;

                return (
                  <View
                    key={lvl}
                    className="absolute w-3 h-3 rounded-full -translate-x-1/2"
                    style={{
                      bottom: `${position}%`,
                      backgroundColor: isCompleted
                        ? COLORS.primary
                        : isCurrent
                        ? "#FFD700"
                        : "rgba(255,255,255,0.2)",
                      borderWidth: isCurrent ? 2 : 0,
                      borderColor: "#FFD700",
                    }}
                  />
                );
              })}
            </View>

            {/* Character */}
            <Animated.View
              className="absolute left-1/2 -translate-x-1/2"
              style={[
                {
                  width: 50,
                  height: 50,
                  zIndex: 10,
                },
                characterStyle,
              ]}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: COLORS.primary,
                  borderWidth: 3,
                  borderColor: "#fff",
                }}
              >
                <Text className="text-2xl">🧗</Text>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Ground */}
        <View
          className="absolute bottom-0 left-0 right-0 h-4 rounded-b-lg"
          style={{ backgroundColor: "#2d3748" }}
        />
      </View>

      {/* Current Position Info */}
      <View className="mt-6 items-center">
        <Text className="text-white text-xl font-black">
          {getTierInfo(tier).nameFr.toUpperCase()} - NIVEAU {level}
        </Text>
        <Text style={{ color: COLORS.textMuted }} className="mt-1">
          {completedCategories}/{totalCategories} catégories complétées
        </Text>
      </View>
    </View>
  );
}
