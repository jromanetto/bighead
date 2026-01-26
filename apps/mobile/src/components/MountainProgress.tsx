import { View, Text, Dimensions, Platform, Image } from "react-native";
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
  getLevelDifficulty,
  Category,
  CategoryInfo,
  CATEGORIES,
} from "../types/adventure";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_WIDTH = SCREEN_WIDTH - 40;
const CANVAS_HEIGHT = 420;

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  primaryGlow: "#00e5ff",
  gold: "#FFD700",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// Mountain step positions (percentage from bottom)
// 11 steps arranged in a zigzag pattern - steps are filled by completed categories
const MOUNTAIN_STEPS = CATEGORIES.map((_, index) => ({
  y: 0.08 + (index / (CATEGORIES.length - 1)) * 0.82, // Spread from 8% to 90%
  side: index % 2 === 0 ? "left" : "right", // Alternate sides
}));

// Helper to get category info by code
const getCategoryByCode = (code: Category): CategoryInfo | undefined => {
  return CATEGORIES.find(cat => cat.code === code);
};

interface MountainProgressProps {
  tier: Tier;
  level: 1 | 2 | 3;
  completedCategories: Category[];
  totalCategories: number;
  avatarUrl?: string | null;
  username?: string | null;
  justCompletedCategory?: Category | null;
}

// Generate a consistent color from username
const getAvatarColor = (username: string): string => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    "#F8B500", "#00CED1", "#FF7F50", "#9370DB", "#20B2AA",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Default avatar component with first letter
function DefaultAvatar({
  username,
  size = 44,
  tierColor,
}: {
  username: string;
  size?: number;
  tierColor: string;
}) {
  const letter = username.charAt(0).toUpperCase();
  const bgColor = getAvatarColor(username);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: size * 0.5,
          fontWeight: "800",
          textShadowColor: "rgba(0,0,0,0.3)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}
      >
        {letter}
      </Text>
    </View>
  );
}

// Simple fallback component for web (no Skia)
function MountainProgressFallback({
  tier,
  level,
  completedCategories,
  totalCategories,
  avatarUrl,
  username,
  justCompletedCategory,
}: MountainProgressProps) {
  const currentLevel = getCurrentLevelNumber(tier, level);
  const totalLevels = 24; // 8 tiers × 3 levels
  const tierInfo = getTierInfo(tier);
  const difficulty = getLevelDifficulty(level);

  // Animation for just completed category
  const celebrationScale = useSharedValue(1);

  useEffect(() => {
    if (justCompletedCategory) {
      // Pulse animation for the completed category
      celebrationScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        4,
        false
      );
    }
  }, [justCompletedCategory]);

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  // Progress based on completed categories in current level
  const progressPercent = useMemo(() => {
    return (completedCategories.length / totalCategories) * 100;
  }, [completedCategories.length, totalCategories]);

  // Find the position of the avatar (at the last completed category)
  const avatarPositionIndex = completedCategories.length;

  return (
    <View className="items-center">
      {/* Mountain Visualization */}
      <View
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Sky gradient with tier color tint */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: tierInfo.bgColor,
            opacity: 0.15,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#0f0c29",
          }}
        />

        {/* Stars */}
        {[...Array(25)].map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 35}%`,
              width: 2 + Math.random() * 2,
              height: 2 + Math.random() * 2,
              borderRadius: 10,
              backgroundColor: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`,
            }}
          />
        ))}

        {/* Moon */}
        <View
          style={{
            position: "absolute",
            right: 25,
            top: 30,
            width: 45,
            height: 45,
            borderRadius: 25,
            backgroundColor: "rgba(255, 240, 200, 0.95)",
            shadowColor: "#FFD700",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 25,
          }}
        />

        {/* Main mountain */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: "15%",
            width: 0,
            height: 0,
            borderLeftWidth: CANVAS_WIDTH * 0.35,
            borderRightWidth: CANVAS_WIDTH * 0.35,
            borderBottomWidth: CANVAS_HEIGHT * 0.9,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "#1a2535",
          }}
        />

        {/* Snow cap */}
        <View
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            marginLeft: -35,
            width: 0,
            height: 0,
            borderLeftWidth: 35,
            borderRightWidth: 35,
            borderBottomWidth: 70,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "#e8f4f8",
          }}
        />

        {/* Summit flag */}
        <View
          style={{
            position: "absolute",
            top: 15,
            left: "50%",
            marginLeft: -15,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 28 }}>🏁</Text>
        </View>

        {/* Category icons on the path - displayed by completion order */}
        {MOUNTAIN_STEPS.map((step, stepIndex) => {
          const yPos = CANVAS_HEIGHT * (1 - step.y) - 20;
          const xOffset = step.side === "left" ? "30%" : "55%";

          // Check if this step has a completed category
          const completedCategoryCode = completedCategories[stepIndex];
          const categoryInfo = completedCategoryCode ? getCategoryByCode(completedCategoryCode) : null;
          const isCompleted = !!categoryInfo;
          const isJustCompleted = justCompletedCategory === completedCategoryCode;
          const isNextStep = stepIndex === completedCategories.length; // Next position for avatar
          const isFuture = stepIndex > completedCategories.length;

          // Determine what to display
          let displayContent: string;
          let stepColor = "rgba(255,255,255,0.2)";

          if (isCompleted && categoryInfo) {
            displayContent = categoryInfo.icon;
            stepColor = categoryInfo.color;
          } else if (isNextStep) {
            displayContent = "📍"; // Current position marker
            stepColor = "#FFD700";
          } else {
            displayContent = "❓"; // Mystery for future steps
          }

          if (isJustCompleted) {
            return (
              <Animated.View
                key={`step-${stepIndex}`}
                style={[
                  {
                    position: "absolute",
                    top: yPos,
                    left: xOffset,
                    alignItems: "center",
                  },
                  celebrationAnimatedStyle,
                ]}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `${stepColor}80`,
                    borderWidth: 3,
                    borderColor: COLORS.gold,
                    shadowColor: COLORS.gold,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 15,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{displayContent}</Text>
                </View>
              </Animated.View>
            );
          }

          return (
            <View
              key={`step-${stepIndex}`}
              style={{
                position: "absolute",
                top: yPos,
                left: xOffset,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isCompleted ? `${stepColor}40` : isNextStep ? "rgba(255,200,0,0.2)" : "rgba(255,255,255,0.1)",
                  borderWidth: 2,
                  borderColor: isCompleted ? stepColor : isNextStep ? "#FFD700" : "rgba(255,255,255,0.2)",
                  shadowColor: isCompleted ? stepColor : isNextStep ? "#FFD700" : "transparent",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                }}
              >
                <Text style={{ fontSize: 18 }}>{displayContent}</Text>
                {/* Checkmark badge for completed categories */}
                {isCompleted && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: "#22c55e",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: COLORS.bg,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: "#fff" }}>✓</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Character - positioned at the last completed category or start */}
        <View
          style={{
            position: "absolute",
            top: avatarPositionIndex === 0
              ? CANVAS_HEIGHT - 60
              : CANVAS_HEIGHT * (1 - MOUNTAIN_STEPS[Math.min(avatarPositionIndex - 1, MOUNTAIN_STEPS.length - 1)].y) - 45,
            left: "50%",
            marginLeft: -25,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#1E2529",
            borderWidth: 3,
            borderColor: tierInfo.color,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: tierInfo.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
            overflow: "hidden",
            zIndex: 10,
          }}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
            />
          ) : username ? (
            <DefaultAvatar username={username} size={44} tierColor={tierInfo.color} />
          ) : (
            <DefaultAvatar username="?" size={44} tierColor={tierInfo.color} />
          )}
        </View>

        {/* Clouds */}
        <Animated.View
          style={{
            position: "absolute",
            top: 80,
            left: 20,
            opacity: 0.4,
          }}
        >
          <Text style={{ fontSize: 30 }}>☁️</Text>
        </Animated.View>
      </View>

      {/* Category Progress Bar */}
      <View className="w-full px-4 mt-4">
        {/* Progress bar background */}
        <View
          style={{
            height: 8,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Progress fill */}
          <View
            style={{
              height: "100%",
              width: `${(completedCategories.length / totalCategories) * 100}%`,
              backgroundColor: COLORS.primary,
              borderRadius: 4,
            }}
          />
        </View>
        {/* Labels */}
        <View className="flex-row justify-between mt-2">
          <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
            Facile
          </Text>
          <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: "600" }}>
            {completedCategories.length}/{totalCategories} catégories
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
            Difficile
          </Text>
        </View>
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
          <Text className="text-white text-lg font-black">{tierInfo.nameFr}</Text>
        </View>
        <Text style={{ color: COLORS.textMuted }} className="mt-2 text-sm">
          {completedCategories.length}/{totalCategories} catégories • Niveau {currentLevel}/24
        </Text>
      </View>
    </View>
  );
}

// Native version with Skia (lazy loaded)
let SkiaMountainProgress: React.ComponentType<MountainProgressProps> | null = null;

if (Platform.OS !== "web") {
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
    Line,
    Paint,
  } = require("@shopify/react-native-skia");

  // Mountain path coordinates
  const createMountainPath = () => {
    const path = Skia.Path.Make();
    const centerX = CANVAS_WIDTH / 2;
    const baseY = CANVAS_HEIGHT - 15;
    const peakY = 35;
    const baseWidth = CANVAS_WIDTH * 0.95; // Wider base

    // Mountain shape - wide base, narrow peak
    path.moveTo(centerX - baseWidth / 2, baseY);
    // Left side - gentle curve outward then inward to peak
    path.cubicTo(
      centerX - baseWidth / 2.2, baseY - 100,  // Control point 1 - keeps width
      centerX - baseWidth / 3, baseY - 250,     // Control point 2 - starts narrowing
      centerX - 25, peakY + 40                   // End near peak
    );
    // Peak - narrow point
    path.quadTo(centerX, peakY, centerX + 25, peakY + 40);
    // Right side - mirror of left
    path.cubicTo(
      centerX + baseWidth / 3, baseY - 250,
      centerX + baseWidth / 2.2, baseY - 100,
      centerX + baseWidth / 2, baseY
    );
    path.close();

    return path;
  };

  const createSnowCapPath = () => {
    const path = Skia.Path.Make();
    const centerX = CANVAS_WIDTH / 2;
    const peakY = 35;
    const snowHeight = 70; // Smaller snow cap

    // Narrower snow cap to match the narrow peak
    path.moveTo(centerX - 55, peakY + snowHeight);
    path.quadTo(centerX - 40, peakY + snowHeight - 20, centerX - 22, peakY + 30);
    path.quadTo(centerX - 10, peakY + 8, centerX, peakY);
    path.quadTo(centerX + 10, peakY + 8, centerX + 22, peakY + 30);
    path.quadTo(centerX + 40, peakY + snowHeight - 20, centerX + 55, peakY + snowHeight);
    path.close();

    return path;
  };

  // Create zigzag trail path
  const createTrailPath = (progress: number) => {
    const path = Skia.Path.Make();
    const centerX = CANVAS_WIDTH / 2;
    const baseY = CANVAS_HEIGHT - 35;
    const peakY = 45;
    const totalHeight = baseY - peakY;
    const zigzagWidth = 30;

    // Create zigzag points
    const points = [];
    const segments = 12;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = baseY - totalHeight * t;
      const xOffset = i % 2 === 0 ? -zigzagWidth : zigzagWidth;
      // Reduce zigzag near top
      const dampening = 1 - Math.pow(t, 2) * 0.7;
      points.push({ x: centerX + xOffset * dampening, y });
    }

    // Draw the trail
    path.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midY = (prev.y + curr.y) / 2;
      path.quadTo(prev.x, midY, curr.x, curr.y);
    }

    return path;
  };

  const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * (CANVAS_HEIGHT * 0.35),
      size: Math.random() * 2.5 + 0.8,
      opacity: Math.random() * 0.6 + 0.2,
    }));
  };

  // Generate cloud positions
  const generateClouds = () => [
    { x: 30, y: 80, scale: 1, opacity: 0.4 },
    { x: CANVAS_WIDTH - 80, y: 120, scale: 0.8, opacity: 0.3 },
    { x: 60, y: 180, scale: 0.6, opacity: 0.25 },
    { x: CANVAS_WIDTH - 50, y: 220, scale: 0.5, opacity: 0.2 },
  ];

  SkiaMountainProgress = function SkiaMountainProgressComponent({
    tier,
    level,
    completedCategories,
    totalCategories,
    avatarUrl,
    username,
    justCompletedCategory,
  }: MountainProgressProps) {
    const currentLevel = getCurrentLevelNumber(tier, level);
    const totalLevels = 24; // 8 tiers × 3 levels
    const tierInfo = getTierInfo(tier);
    const difficulty = getLevelDifficulty(level);

    const progressAnim = useSharedValue(0);
    const glowAnim = useSharedValue(0);
    const cloudAnim = useSharedValue(0);
    const celebrationScale = useSharedValue(1);

    // Animation for just completed category
    useEffect(() => {
      if (justCompletedCategory) {
        celebrationScale.value = withRepeat(
          withSequence(
            withTiming(1.4, { duration: 300 }),
            withTiming(1, { duration: 300 })
          ),
          5,
          false
        );
      }
    }, [justCompletedCategory]);

    const celebrationAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: celebrationScale.value }],
    }));

    // Progress based on completed categories
    const targetProgress = useMemo(() => {
      return completedCategories.length / totalCategories;
    }, [completedCategories.length, totalCategories]);

    // Avatar position index
    const avatarPositionIndex = completedCategories.length;

    const mountainPath = useMemo(() => createMountainPath(), []);
    const snowCapPath = useMemo(() => createSnowCapPath(), []);
    const trailPath = useMemo(() => createTrailPath(1), []);
    const stars = useMemo(() => generateStars(35), []);
    const clouds = useMemo(() => generateClouds(), []);

    useEffect(() => {
      progressAnim.value = withDelay(300, withSpring(targetProgress, { damping: 15, stiffness: 80 }));

      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      cloudAnim.value = withRepeat(
        withTiming(1, { duration: 20000, easing: Easing.linear }),
        -1,
        false
      );
    }, [targetProgress]);

    const characterStyle = useAnimatedStyle(() => {
      const baseY = CANVAS_HEIGHT - 55;
      const peakY = 45;
      const totalHeight = baseY - peakY;
      // Position based on completed categories (in completion order)
      const stepProgress = avatarPositionIndex === 0
        ? 0
        : MOUNTAIN_STEPS[Math.min(avatarPositionIndex - 1, MOUNTAIN_STEPS.length - 1)].y;
      const currentY = baseY - totalHeight * stepProgress;

      return {
        transform: [{ translateY: currentY }],
      };
    });

    const characterGlowStyle = useAnimatedStyle(() => {
      return {
        opacity: interpolate(glowAnim.value, [0, 1], [0.4, 0.9]),
        transform: [{ scale: interpolate(glowAnim.value, [0, 1], [1, 1.25]) }],
      };
    });

    return (
      <View className="items-center">
        <View style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <Canvas style={{ flex: 1 }}>
            {/* Sky gradient */}
            <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, CANVAS_HEIGHT)}
                colors={["#0a0618", "#1a1040", "#2d2060", "#1a1040", "#0f0825"]}
              />
            </Rect>

            {/* Stars */}
            {stars.map((star, i) => (
              <Circle
                key={`star-${i}`}
                cx={star.x}
                cy={star.y}
                r={star.size}
                color={`rgba(255, 255, 255, ${star.opacity})`}
              />
            ))}

            {/* Moon glow */}
            <Circle cx={CANVAS_WIDTH - 45} cy={55} r={40}>
              <RadialGradient
                c={vec(CANVAS_WIDTH - 45, 55)}
                r={40}
                colors={["rgba(255, 220, 150, 0.6)", "rgba(255, 220, 150, 0.2)", "transparent"]}
              />
            </Circle>
            {/* Moon */}
            <Circle cx={CANVAS_WIDTH - 45} cy={55} r={22} color="rgba(255, 245, 220, 0.95)" />

            {/* Background mountain (depth) */}
            <Path
              path={(() => {
                const p = Skia.Path.Make();
                p.moveTo(0, CANVAS_HEIGHT);
                p.lineTo(CANVAS_WIDTH * 0.3, CANVAS_HEIGHT * 0.5);
                p.lineTo(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT);
                p.close();
                return p;
              })()}
              color="rgba(20, 25, 35, 0.6)"
            />

            {/* Main mountain shadow */}
            <Path path={mountainPath} color="rgba(0, 0, 0, 0.4)">
              <Blur blur={15} />
            </Path>

            {/* Main mountain */}
            <Path path={mountainPath}>
              <LinearGradient
                start={vec(CANVAS_WIDTH / 2, CANVAS_HEIGHT)}
                end={vec(CANVAS_WIDTH / 2, 25)}
                colors={["#1a2030", "#253040", "#1e2835", "#2a3545", "#1a2530"]}
              />
            </Path>

            {/* Mountain edge highlight */}
            <Path path={mountainPath} color="transparent" style="stroke" strokeWidth={1.5}>
              <LinearGradient
                start={vec(0, CANVAS_HEIGHT)}
                end={vec(CANVAS_WIDTH, 0)}
                colors={["rgba(0, 194, 204, 0.05)", "rgba(0, 194, 204, 0.2)", "rgba(255, 255, 255, 0.15)"]}
              />
            </Path>

            {/* Snow cap glow */}
            <Path path={snowCapPath} color="rgba(255, 255, 255, 0.4)">
              <Blur blur={8} />
            </Path>

            {/* Snow cap */}
            <Path path={snowCapPath}>
              <LinearGradient
                start={vec(CANVAS_WIDTH / 2, 25)}
                end={vec(CANVAS_WIDTH / 2, 115)}
                colors={["#ffffff", "#f0f8ff", "#d8e8f0", "#c8dce8"]}
              />
            </Path>

            {/* Trail background (upcoming) */}
            <Path
              path={trailPath}
              color="rgba(255, 255, 255, 0.08)"
              style="stroke"
              strokeWidth={6}
              strokeCap="round"
            />

            {/* Trail progress glow */}
            <Path
              path={trailPath}
              color={COLORS.primary}
              style="stroke"
              strokeWidth={14}
              strokeCap="round"
              start={0}
              end={targetProgress}
            >
              <Blur blur={10} />
            </Path>

            {/* Trail progress */}
            <Path
              path={trailPath}
              style="stroke"
              strokeWidth={5}
              strokeCap="round"
              start={0}
              end={targetProgress}
            >
              <LinearGradient
                start={vec(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 35)}
                end={vec(CANVAS_WIDTH / 2, 45)}
                colors={[COLORS.primary, COLORS.primaryGlow, COLORS.gold]}
              />
            </Path>

            {/* Category markers on the path - by completion order */}
            {MOUNTAIN_STEPS.map((step, stepIndex) => {
              const baseY = CANVAS_HEIGHT - 35;
              const peakY = 45;
              const totalHeight = baseY - peakY;
              const yPos = baseY - totalHeight * step.y;
              const xOffset = step.side === "left" ? -50 : 50;

              // Check if this step has a completed category
              const completedCategoryCode = completedCategories[stepIndex];
              const categoryInfo = completedCategoryCode ? getCategoryByCode(completedCategoryCode) : null;
              const isCompleted = !!categoryInfo;
              const isNextStep = stepIndex === completedCategories.length;
              const stepColor = categoryInfo?.color || "#FFD700";

              return (
                <Group key={`step-${stepIndex}`}>
                  {/* Category glow when completed or next step */}
                  {(isCompleted || isNextStep) && (
                    <Circle cx={CANVAS_WIDTH / 2 + xOffset} cy={yPos} r={22} color={isCompleted ? stepColor : "#FFD700"}>
                      <Blur blur={8} />
                    </Circle>
                  )}
                  {/* Category circle background */}
                  <Circle
                    cx={CANVAS_WIDTH / 2 + xOffset}
                    cy={yPos}
                    r={18}
                    color={isCompleted ? `${stepColor}60` : isNextStep ? "rgba(255,200,0,0.3)" : "rgba(255,255,255,0.1)"}
                  />
                  {/* Category border */}
                  <Circle
                    cx={CANVAS_WIDTH / 2 + xOffset}
                    cy={yPos}
                    r={18}
                    style="stroke"
                    strokeWidth={2}
                    color={isCompleted ? stepColor : isNextStep ? "#FFD700" : "rgba(255,255,255,0.3)"}
                  />
                </Group>
              );
            })}

            {/* Summit star glow */}
            <Circle cx={CANVAS_WIDTH / 2} cy={22} r={25} color="rgba(255, 215, 0, 0.5)">
              <Blur blur={12} />
            </Circle>
          </Canvas>

          {/* Character (React Native View for emoji) */}
          <Animated.View
            style={[
              {
                position: "absolute",
                left: CANVAS_WIDTH / 2 - 25,
                top: 0,
                zIndex: 10,
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
                  backgroundColor: tierInfo.color,
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
                borderColor: tierInfo.color,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: tierInfo.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9,
                shadowRadius: 12,
                overflow: "hidden",
              }}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                />
              ) : username ? (
                <DefaultAvatar username={username} size={44} tierColor={tierInfo.color} />
              ) : (
                <DefaultAvatar username="?" size={44} tierColor={tierInfo.color} />
              )}
            </View>
          </Animated.View>

          {/* Summit flag */}
          <View
            style={{
              position: "absolute",
              left: CANVAS_WIDTH / 2 - 18,
              top: 5,
            }}
          >
            <Text style={{ fontSize: 36 }}>🏁</Text>
          </View>

          {/* Category icons (React Native for emoji support) - by completion order */}
          {MOUNTAIN_STEPS.map((step, stepIndex) => {
            const baseY = CANVAS_HEIGHT - 35;
            const peakY = 45;
            const totalHeight = baseY - peakY;
            const yPos = baseY - totalHeight * step.y;
            const isRight = step.side === "right";

            // Check if this step has a completed category
            const completedCategoryCode = completedCategories[stepIndex];
            const categoryInfo = completedCategoryCode ? getCategoryByCode(completedCategoryCode) : null;
            const isCompleted = !!categoryInfo;
            const isJustCompleted = justCompletedCategory === completedCategoryCode;
            const isNextStep = stepIndex === completedCategories.length;

            // Determine what to display
            let displayContent: string;
            if (isCompleted && categoryInfo) {
              displayContent = categoryInfo.icon;
            } else if (isNextStep) {
              displayContent = "📍";
            } else {
              displayContent = "❓";
            }

            if (isJustCompleted) {
              return (
                <Animated.View
                  key={`icon-step-${stepIndex}`}
                  style={[
                    {
                      position: "absolute",
                      top: yPos - 18,
                      [isRight ? "right" : "left"]: isRight ? CANVAS_WIDTH / 2 - 68 : CANVAS_WIDTH / 2 - 68,
                      width: 36,
                      height: 36,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    celebrationAnimatedStyle,
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{displayContent}</Text>
                </Animated.View>
              );
            }

            return (
              <View
                key={`icon-step-${stepIndex}`}
                style={{
                  position: "absolute",
                  top: yPos - 18,
                  [isRight ? "right" : "left"]: isRight ? CANVAS_WIDTH / 2 - 68 : CANVAS_WIDTH / 2 - 68,
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18 }}>{displayContent}</Text>
                {/* Checkmark badge for completed categories */}
                {isCompleted && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: "#22c55e",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: COLORS.bg,
                    }}
                  >
                    <Text style={{ fontSize: 8, color: "#fff" }}>✓</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Difficulty Progress Bar */}
        <View className="w-full px-4 mt-4">
          <View className="flex-row justify-between mb-2">
            {(["easy", "medium", "hard"] as const).map((diff) => {
              const isActive = difficulty === diff;
              const isPast =
                (diff === "easy" && (difficulty === "medium" || difficulty === "hard")) ||
                (diff === "medium" && difficulty === "hard");

              return (
                <View
                  key={diff}
                  className="flex-1 mx-1"
                  style={{
                    opacity: isActive || isPast ? 1 : 0.4,
                  }}
                >
                  <View
                    style={{
                      height: 6,
                      backgroundColor: isPast ? "#22c55e" : isActive ? COLORS.primary : "rgba(255,255,255,0.2)",
                      borderRadius: 3,
                    }}
                  />
                  <Text
                    style={{
                      color: isActive ? COLORS.primary : isPast ? "#22c55e" : COLORS.textMuted,
                      fontSize: 10,
                      textAlign: "center",
                      marginTop: 4,
                    }}
                  >
                    {diff === "easy" ? "Facile" : diff === "medium" ? "Moyen" : "Difficile"}
                  </Text>
                </View>
              );
            })}
          </View>
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
            <Text className="text-white text-lg font-black">{tierInfo.nameFr}</Text>
          </View>
          <Text style={{ color: COLORS.textMuted }} className="mt-2 text-sm">
            {completedCategories.length}/{totalCategories} catégories • Niveau {currentLevel}/24
          </Text>
        </View>
      </View>
    );
  };
}

// Main export - uses Skia on native, fallback on web
export function MountainProgress(props: MountainProgressProps) {
  if (Platform.OS === "web" || !SkiaMountainProgress) {
    return <MountainProgressFallback {...props} />;
  }
  return <SkiaMountainProgress {...props} />;
}
