import { View, Text, Dimensions, Platform } from "react-native";
import { useEffect, useMemo } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from "react-native-reanimated";
import {
  Tier,
  TIERS,
  getTierInfo,
  getCurrentLevelNumber,
} from "../types/adventure";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_WIDTH = SCREEN_WIDTH - 40;
const CANVAS_HEIGHT = 380;

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  primaryGlow: "#00e5ff",
  gold: "#FFD700",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

interface MountainProgressProps {
  tier: Tier;
  level: 1 | 2 | 3;
  completedCategories: number;
  totalCategories: number;
}

// Simple fallback component for web (no Skia)
function MountainProgressFallback({
  tier,
  level,
  completedCategories,
  totalCategories,
}: MountainProgressProps) {
  const currentLevel = getCurrentLevelNumber(tier, level);
  const totalLevels = 33;
  const tierInfo = getTierInfo(tier);

  const progressPercent = useMemo(() => {
    const levelProgress = (currentLevel - 1) / totalLevels;
    const withinLevelProgress = completedCategories / totalCategories / totalLevels;
    return Math.min((levelProgress + withinLevelProgress) * 100, 100);
  }, [currentLevel, completedCategories, totalCategories]);

  return (
    <View className="items-center">
      {/* Simple Mountain Visualization */}
      <View
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          backgroundColor: '#1a1a2e',
          borderRadius: 20,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Gradient background simulation */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        }} />

        {/* Stars */}
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              width: 2 + Math.random() * 2,
              height: 2 + Math.random() * 2,
              borderRadius: 10,
              backgroundColor: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`,
            }}
          />
        ))}

        {/* Moon */}
        <View style={{
          position: 'absolute',
          right: 30,
          top: 40,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 240, 200, 0.9)',
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 20,
        }} />

        {/* Mountain shape using CSS */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          width: 0,
          height: 0,
          borderLeftWidth: CANVAS_WIDTH * 0.4,
          borderRightWidth: CANVAS_WIDTH * 0.4,
          borderBottomWidth: CANVAS_HEIGHT * 0.85,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#16213e',
        }} />

        {/* Snow cap */}
        <View style={{
          position: 'absolute',
          top: 25,
          left: '50%',
          marginLeft: -30,
          width: 0,
          height: 0,
          borderLeftWidth: 30,
          borderRightWidth: 30,
          borderBottomWidth: 60,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#e8f4f8',
        }} />

        {/* Progress indicator */}
        <View style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          marginLeft: -3,
          width: 6,
          height: CANVAS_HEIGHT * 0.75,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
        }}>
          <View style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: `${progressPercent}%`,
            backgroundColor: COLORS.primary,
            borderRadius: 3,
          }} />
        </View>

        {/* Character */}
        <View style={{
          position: 'absolute',
          bottom: 40 + (CANVAS_HEIGHT * 0.75 * progressPercent / 100) - 25,
          left: '50%',
          marginLeft: -25,
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#1E2529',
          borderWidth: 3,
          borderColor: COLORS.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
        }}>
          <Text style={{ fontSize: 24 }}>🧗</Text>
        </View>

        {/* Summit star */}
        <View style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          marginLeft: -15,
        }}>
          <Text style={{ fontSize: 30 }}>⭐</Text>
        </View>
      </View>

      {/* Tier badges below mountain */}
      <View className="flex-row flex-wrap justify-center mt-4 px-2">
        {TIERS.slice(0, 6).map((t, index) => {
          const isCurrentTier = t.code === tier;
          const isPastTier = TIERS.findIndex(x => x.code === tier) > index;

          return (
            <View
              key={t.code}
              className="px-3 py-1.5 rounded-full m-1"
              style={{
                backgroundColor: isPastTier || isCurrentTier ? `${t.color}25` : "rgba(255,255,255,0.05)",
                borderWidth: isCurrentTier ? 2 : 1,
                borderColor: isPastTier || isCurrentTier ? t.color : "rgba(255,255,255,0.1)",
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: isPastTier || isCurrentTier ? t.color : COLORS.textMuted,
                }}
              >
                {t.nameFr}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Current Position Info */}
      <View className="mt-4 items-center">
        <View
          className="flex-row items-center px-5 py-2 rounded-2xl"
          style={{
            backgroundColor: `${tierInfo.color}20`,
            borderWidth: 1,
            borderColor: `${tierInfo.color}50`,
          }}
        >
          <Text className="text-2xl mr-2">{tierInfo.icon}</Text>
          <Text className="text-white text-lg font-black">
            {tierInfo.nameFr.toUpperCase()}
          </Text>
          <View
            className="ml-3 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: tierInfo.color }}
          >
            <Text className="text-xs font-bold" style={{ color: "#161a1d" }}>
              Niv. {level}
            </Text>
          </View>
        </View>
        <Text style={{ color: COLORS.textMuted }} className="mt-2 text-sm">
          {completedCategories}/{totalCategories} catégories • Niveau {currentLevel}/33
        </Text>
      </View>
    </View>
  );
}

// Native version with Skia (lazy loaded)
let SkiaMountainProgress: React.ComponentType<MountainProgressProps> | null = null;

if (Platform.OS !== 'web') {
  // Only import Skia on native platforms
  const {
    Canvas,
    Path,
    LinearGradient,
    RadialGradient,
    Circle,
    vec,
    Skia,
    Group,
    Blur,
    Rect,
  } = require("@shopify/react-native-skia");

  // Mountain path coordinates
  const createMountainPath = () => {
    const path = Skia.Path.Make();
    const centerX = CANVAS_WIDTH / 2;
    const baseY = CANVAS_HEIGHT - 20;
    const peakY = 30;
    const baseWidth = CANVAS_WIDTH * 0.85;

    path.moveTo(centerX - baseWidth / 2, baseY);
    path.quadTo(centerX - baseWidth / 3, baseY - 100, centerX - baseWidth / 4, baseY - 180);
    path.quadTo(centerX - baseWidth / 6, baseY - 260, centerX, peakY);
    path.quadTo(centerX + baseWidth / 6, baseY - 260, centerX + baseWidth / 4, baseY - 180);
    path.quadTo(centerX + baseWidth / 3, baseY - 100, centerX + baseWidth / 2, baseY);
    path.close();

    return path;
  };

  const createSnowCapPath = () => {
    const path = Skia.Path.Make();
    const centerX = CANVAS_WIDTH / 2;
    const peakY = 30;
    const snowHeight = 80;

    path.moveTo(centerX - 60, peakY + snowHeight);
    path.quadTo(centerX - 40, peakY + snowHeight - 20, centerX - 25, peakY + 30);
    path.quadTo(centerX - 10, peakY + 5, centerX, peakY);
    path.quadTo(centerX + 10, peakY + 5, centerX + 25, peakY + 30);
    path.quadTo(centerX + 40, peakY + snowHeight - 20, centerX + 60, peakY + snowHeight);
    path.close();

    return path;
  };

  const createProgressPath = (progress: number) => {
    const path = Skia.Path.Make();
    const centerX = CANVAS_WIDTH / 2;
    const baseY = CANVAS_HEIGHT - 40;
    const peakY = 50;
    const totalHeight = baseY - peakY;

    path.moveTo(centerX, baseY);
    const currentY = baseY - (totalHeight * progress);
    path.lineTo(centerX, Math.max(currentY, peakY));

    return path;
  };

  const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * (CANVAS_HEIGHT * 0.4),
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  };

  SkiaMountainProgress = function SkiaMountainProgressComponent({
    tier,
    level,
    completedCategories,
    totalCategories,
  }: MountainProgressProps) {
    const currentLevel = getCurrentLevelNumber(tier, level);
    const totalLevels = 33;
    const tierInfo = getTierInfo(tier);

    const progressAnim = useSharedValue(0);
    const glowAnim = useSharedValue(0);

    const targetProgress = useMemo(() => {
      const levelProgress = (currentLevel - 1) / totalLevels;
      const withinLevelProgress = completedCategories / totalCategories / totalLevels;
      return Math.min(levelProgress + withinLevelProgress, 1);
    }, [currentLevel, completedCategories, totalCategories]);

    const mountainPath = useMemo(() => createMountainPath(), []);
    const snowCapPath = useMemo(() => createSnowCapPath(), []);
    const stars = useMemo(() => generateStars(30), []);

    useEffect(() => {
      progressAnim.value = withDelay(
        300,
        withSpring(targetProgress, { damping: 15, stiffness: 80 })
      );

      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, [targetProgress]);

    const characterStyle = useAnimatedStyle(() => {
      const baseY = CANVAS_HEIGHT - 60;
      const peakY = 40;
      const totalHeight = baseY - peakY;
      const currentY = baseY - (totalHeight * progressAnim.value);

      return {
        transform: [{ translateY: currentY }],
      };
    });

    const characterGlowStyle = useAnimatedStyle(() => {
      return {
        opacity: interpolate(glowAnim.value, [0, 1], [0.4, 0.8]),
        transform: [{ scale: interpolate(glowAnim.value, [0, 1], [1, 1.2]) }],
      };
    });

    return (
      <View className="items-center">
        <View style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <Canvas style={{ flex: 1 }}>
            <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, CANVAS_HEIGHT)}
                colors={["#0f0c29", "#302b63", "#24243e"]}
              />
            </Rect>

            {stars.map((star, i) => (
              <Circle
                key={`star-${i}`}
                cx={star.x}
                cy={star.y}
                r={star.size}
                color={`rgba(255, 255, 255, ${star.opacity})`}
              />
            ))}

            <Circle cx={CANVAS_WIDTH - 50} cy={60} r={35}>
              <RadialGradient
                c={vec(CANVAS_WIDTH - 50, 60)}
                r={35}
                colors={["rgba(255, 220, 150, 0.8)", "rgba(255, 220, 150, 0.3)", "transparent"]}
              />
            </Circle>
            <Circle cx={CANVAS_WIDTH - 50} cy={60} r={20} color="rgba(255, 240, 200, 0.9)" />

            <Path path={mountainPath} color="rgba(0, 0, 0, 0.3)">
              <Blur blur={10} />
            </Path>

            <Path path={mountainPath}>
              <LinearGradient
                start={vec(CANVAS_WIDTH / 2, CANVAS_HEIGHT)}
                end={vec(CANVAS_WIDTH / 2, 30)}
                colors={["#1a1a2e", "#16213e", "#1a1a2e", "#0f3460", "#1a1a2e"]}
              />
            </Path>

            <Path path={mountainPath} color="transparent" style="stroke" strokeWidth={2}>
              <LinearGradient
                start={vec(0, CANVAS_HEIGHT)}
                end={vec(CANVAS_WIDTH, 0)}
                colors={["rgba(0, 194, 204, 0.1)", "rgba(0, 194, 204, 0.4)", "rgba(255, 255, 255, 0.3)"]}
              />
            </Path>

            <Path path={snowCapPath}>
              <LinearGradient
                start={vec(CANVAS_WIDTH / 2, 30)}
                end={vec(CANVAS_WIDTH / 2, 110)}
                colors={["#ffffff", "#e8f4f8", "#c9d6df"]}
              />
            </Path>

            <Path path={snowCapPath} color="rgba(255, 255, 255, 0.3)">
              <Blur blur={5} />
            </Path>

            <Path
              path={createProgressPath(targetProgress)}
              color={COLORS.primary}
              style="stroke"
              strokeWidth={12}
              strokeCap="round"
            >
              <Blur blur={8} />
            </Path>

            <Path
              path={createProgressPath(targetProgress)}
              style="stroke"
              strokeWidth={4}
              strokeCap="round"
            >
              <LinearGradient
                start={vec(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40)}
                end={vec(CANVAS_WIDTH / 2, 50)}
                colors={[COLORS.primary, COLORS.primaryGlow, COLORS.gold]}
              />
            </Path>

            {TIERS.slice(0, 6).map((t, index) => {
              const baseY = CANVAS_HEIGHT - 50;
              const peakY = 60;
              const totalHeight = baseY - peakY;
              const position = baseY - (totalHeight * ((index + 1) / 6));
              const isCurrentTier = t.code === tier;
              const isPastTier = TIERS.findIndex(x => x.code === tier) > index;

              return (
                <Group key={t.code}>
                  <Circle
                    cx={CANVAS_WIDTH / 2}
                    cy={position}
                    r={isPastTier || isCurrentTier ? 6 : 4}
                    color={isPastTier || isCurrentTier ? t.color : "rgba(255,255,255,0.3)"}
                  />
                  {isCurrentTier && (
                    <Circle cx={CANVAS_WIDTH / 2} cy={position} r={12} color={t.color}>
                      <Blur blur={6} />
                    </Circle>
                  )}
                </Group>
              );
            })}

            <Circle cx={CANVAS_WIDTH / 2} cy={25} r={20} color="rgba(255, 215, 0, 0.5)">
              <Blur blur={10} />
            </Circle>
          </Canvas>

          <Animated.View
            style={[
              {
                position: "absolute",
                left: CANVAS_WIDTH / 2 - 25,
                top: 0,
              },
              characterStyle,
            ]}
          >
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: COLORS.primary,
                },
                characterGlowStyle,
              ]}
            />
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#1E2529",
                borderWidth: 3,
                borderColor: COLORS.primary,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
              }}
            >
              <Text style={{ fontSize: 24 }}>🧗</Text>
            </View>
          </Animated.View>

          <View
            style={{
              position: "absolute",
              left: CANVAS_WIDTH / 2 - 15,
              top: 10,
            }}
          >
            <Text style={{ fontSize: 30 }}>⭐</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-center mt-4 px-2">
          {TIERS.slice(0, 6).map((t, index) => {
            const isCurrentTier = t.code === tier;
            const isPastTier = TIERS.findIndex(x => x.code === tier) > index;

            return (
              <View
                key={t.code}
                className="px-3 py-1.5 rounded-full m-1"
                style={{
                  backgroundColor: isPastTier || isCurrentTier ? `${t.color}25` : "rgba(255,255,255,0.05)",
                  borderWidth: isCurrentTier ? 2 : 1,
                  borderColor: isPastTier || isCurrentTier ? t.color : "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{
                    color: isPastTier || isCurrentTier ? t.color : COLORS.textMuted,
                  }}
                >
                  {t.nameFr}
                </Text>
              </View>
            );
          })}
        </View>

        <View className="mt-4 items-center">
          <View
            className="flex-row items-center px-5 py-2 rounded-2xl"
            style={{
              backgroundColor: `${tierInfo.color}20`,
              borderWidth: 1,
              borderColor: `${tierInfo.color}50`,
            }}
          >
            <Text className="text-2xl mr-2">{tierInfo.icon}</Text>
            <Text className="text-white text-lg font-black">
              {tierInfo.nameFr.toUpperCase()}
            </Text>
            <View
              className="ml-3 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: tierInfo.color }}
            >
              <Text className="text-xs font-bold" style={{ color: "#161a1d" }}>
                Niv. {level}
              </Text>
            </View>
          </View>
          <Text style={{ color: COLORS.textMuted }} className="mt-2 text-sm">
            {completedCategories}/{totalCategories} catégories • Niveau {currentLevel}/33
          </Text>
        </View>
      </View>
    );
  };
}

// Main export - uses Skia on native, fallback on web
export function MountainProgress(props: MountainProgressProps) {
  if (Platform.OS === 'web' || !SkiaMountainProgress) {
    return <MountainProgressFallback {...props} />;
  }
  return <SkiaMountainProgress {...props} />;
}
