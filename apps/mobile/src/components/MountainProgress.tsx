import { View, Text, Dimensions, Platform, Image } from "react-native";
import { useEffect, useMemo } from "react";
import { useTranslation } from "../contexts/LanguageContext";
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
import { Icon } from "./ui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_WIDTH = SCREEN_WIDTH - 40;
const CANVAS_HEIGHT = 420;

// Glassmorphism color palette
const COLORS = {
  // Background
  bgDark: "#050510",
  bgMid: "#0a0a20",
  bgLight: "#101030",

  // Glass surfaces
  glass: "rgba(255, 255, 255, 0.05)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  glassHighlight: "rgba(255, 255, 255, 0.15)",

  // Accent colors
  primary: "#00c2cc",
  primaryGlow: "#00e5ff",
  gold: "#FFD700",
  goldGlow: "#FFF0A0",

  // Text
  text: "#ffffff",
  textMuted: "#9ca3af",
  textDim: "rgba(255, 255, 255, 0.5)",
};

// Mountain step positions (percentage from bottom)
const MOUNTAIN_STEPS = CATEGORIES.map((_, index) => ({
  y: 0.08 + (index / (CATEGORIES.length - 1)) * 0.82,
  side: index % 2 === 0 ? "left" : "right",
}));

// Helper to get category info by code
const getCategoryByCode = (code: Category): CategoryInfo | undefined => {
  return CATEGORIES.find(cat => cat.code === code);
};

// Map category codes to Lucide icon names
const CATEGORY_ICONS: Record<string, string> = {
  geography: "Globe",
  history: "Landmark",
  science: "FlaskConical",
  sports: "Trophy",
  entertainment: "Clapperboard",
  art: "Palette",
  literature: "BookOpen",
  music: "Music",
  nature: "Leaf",
  technology: "Cpu",
  food: "UtensilsCrossed",
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

// Glass Step Marker Component
function GlassStepMarker({
  isCompleted,
  isNext,
  isCelebrating,
  categoryInfo,
  celebrationStyle,
}: {
  isCompleted: boolean;
  isNext: boolean;
  isCelebrating: boolean;
  categoryInfo?: CategoryInfo;
  celebrationStyle: any;
}) {
  const iconName = categoryInfo ? CATEGORY_ICONS[categoryInfo.code] || "HelpCircle" : isNext ? "MapPin" : "Lock";
  const color = isCompleted && categoryInfo ? categoryInfo.color : isNext ? COLORS.gold : COLORS.textDim;

  const Container = isCelebrating ? Animated.View : View;
  const containerProps = isCelebrating ? { style: celebrationStyle } : {};

  return (
    <Container {...containerProps}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: isCompleted ? `${color}20` : isNext ? "rgba(255, 215, 0, 0.15)" : COLORS.glass,
          borderWidth: 1.5,
          borderColor: isCompleted ? color : isNext ? COLORS.gold : COLORS.glassBorder,
          alignItems: "center",
          justifyContent: "center",
          // Glass shadow
          shadowColor: isCompleted ? color : isNext ? COLORS.gold : "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isCompleted || isNext ? 0.6 : 0,
          shadowRadius: 12,
        }}
      >
        <Icon
          name={iconName as any}
          size={20}
          color={isCompleted ? color : isNext ? COLORS.gold : COLORS.textDim}
        />
        {/* Completion checkmark badge */}
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
              borderColor: COLORS.bgDark,
            }}
          >
            <Icon name="Check" size={10} color="#fff" strokeWidth={3} />
          </View>
        )}
      </View>
    </Container>
  );
}

// Glassmorphism fallback for web (no Skia)
function MountainProgressFallback({
  tier,
  level,
  completedCategories,
  totalCategories,
  avatarUrl,
  username,
  justCompletedCategory,
}: MountainProgressProps) {
  const { t, language } = useTranslation();
  const currentLevel = getCurrentLevelNumber(tier, level);
  const tierInfo = getTierInfo(tier);
  const difficulty = getLevelDifficulty(level);

  const celebrationScale = useSharedValue(1);

  useEffect(() => {
    if (justCompletedCategory) {
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

  const avatarPositionIndex = completedCategories.length;

  return (
    <View className="items-center">
      {/* Mountain Container with Glass Effect */}
      <View
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
          backgroundColor: COLORS.bgDark,
          borderWidth: 1,
          borderColor: COLORS.glassBorder,
        }}
      >
        {/* Gradient overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.bgMid,
          }}
        />

        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              width: 2 + Math.random() * 2,
              height: 2 + Math.random() * 2,
              borderRadius: 10,
              backgroundColor: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`,
            }}
          />
        ))}

        {/* Moon with glow */}
        <View
          style={{
            position: "absolute",
            right: 25,
            top: 30,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "rgba(255, 245, 220, 0.9)",
            shadowColor: COLORS.goldGlow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 30,
          }}
        />

        {/* Glass Mountain */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: "10%",
            width: 0,
            height: 0,
            borderLeftWidth: CANVAS_WIDTH * 0.4,
            borderRightWidth: CANVAS_WIDTH * 0.4,
            borderBottomWidth: CANVAS_HEIGHT * 0.9,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "rgba(30, 40, 60, 0.7)",
          }}
        />

        {/* Mountain glass highlight */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: "12%",
            width: 0,
            height: 0,
            borderLeftWidth: CANVAS_WIDTH * 0.38,
            borderRightWidth: CANVAS_WIDTH * 0.38,
            borderBottomWidth: CANVAS_HEIGHT * 0.85,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "rgba(255, 255, 255, 0.03)",
          }}
        />

        {/* Snow cap with glow */}
        <View
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            marginLeft: -40,
            width: 0,
            height: 0,
            borderLeftWidth: 40,
            borderRightWidth: 40,
            borderBottomWidth: 80,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "rgba(255, 255, 255, 0.9)",
            shadowColor: "#ffffff",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
          }}
        />

        {/* Summit flag */}
        <View
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            marginLeft: -15,
            alignItems: "center",
          }}
        >
          <Icon name="Flag" size={32} color={COLORS.gold} />
        </View>

        {/* Step markers */}
        {MOUNTAIN_STEPS.map((step, stepIndex) => {
          const yPos = CANVAS_HEIGHT * (1 - step.y) - 22;
          const xOffset = step.side === "left" ? "25%" : "60%";

          const completedCategoryCode = completedCategories[stepIndex];
          const categoryInfo = completedCategoryCode ? getCategoryByCode(completedCategoryCode) : undefined;
          const isCompleted = !!categoryInfo;
          const isJustCompleted = justCompletedCategory === completedCategoryCode;
          const isNextStep = stepIndex === completedCategories.length;

          return (
            <View
              key={`step-${stepIndex}`}
              style={{
                position: "absolute",
                top: yPos,
                left: xOffset,
              }}
            >
              <GlassStepMarker
                isCompleted={isCompleted}
                isNext={isNextStep}
                isCelebrating={isJustCompleted}
                categoryInfo={categoryInfo}
                celebrationStyle={celebrationAnimatedStyle}
              />
            </View>
          );
        })}

        {/* Player Avatar */}
        <View
          style={{
            position: "absolute",
            top: avatarPositionIndex === 0
              ? CANVAS_HEIGHT - 70
              : CANVAS_HEIGHT * (1 - MOUNTAIN_STEPS[Math.min(avatarPositionIndex - 1, MOUNTAIN_STEPS.length - 1)].y) - 50,
            left: "50%",
            marginLeft: -28,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: COLORS.glass,
            borderWidth: 2,
            borderColor: tierInfo.color,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: tierInfo.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 16,
            overflow: "hidden",
            zIndex: 10,
          }}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 52, height: 52, borderRadius: 26 }}
            />
          ) : username ? (
            <DefaultAvatar username={username} size={52} tierColor={tierInfo.color} />
          ) : (
            <DefaultAvatar username="?" size={52} tierColor={tierInfo.color} />
          )}
        </View>
      </View>

      {/* Progress Bar - Glass Style */}
      <View
        style={{
          width: "100%",
          paddingHorizontal: 16,
          marginTop: 16,
        }}
      >
        <View
          style={{
            height: 8,
            backgroundColor: COLORS.glass,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: COLORS.glassBorder,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${(completedCategories.length / totalCategories) * 100}%`,
              backgroundColor: COLORS.primary,
              borderRadius: 4,
              shadowColor: COLORS.primaryGlow,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
            }}
          />
        </View>
        <View className="flex-row justify-between mt-2">
          <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
            {t("difficultyEasy" as any)}
          </Text>
          <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: "600" }}>
            {completedCategories.length}/{totalCategories} {t("categories" as any)}
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
            {t("difficultyHard" as any)}
          </Text>
        </View>
      </View>

      {/* Tier Info - Glass Card */}
      <View
        style={{
          marginTop: 16,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: `${tierInfo.color}15`,
            borderWidth: 1,
            borderColor: `${tierInfo.color}40`,
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 8 }}>{tierInfo.icon}</Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "800" }}>
            {language === "fr" ? tierInfo.nameFr : tierInfo.name}
          </Text>
        </View>
        <Text style={{ color: COLORS.textMuted, marginTop: 8, fontSize: 12 }}>
          {completedCategories.length}/{totalCategories} {t("categories" as any)} • {t("levelLabel" as any)} {currentLevel}/24
        </Text>
      </View>
    </View>
  );
}

// Native version with Skia
let SkiaMountainProgress: React.ComponentType<MountainProgressProps> | null = null;

if (Platform.OS !== "web") {
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
    RoundedRect,
  } = require("@shopify/react-native-skia");

  // Smoother mountain path with glass effect
  const createMountainPath = () => {
    const path = Skia.Path.Make();
    const centerX = CANVAS_WIDTH / 2;
    const baseY = CANVAS_HEIGHT - 15;
    const peakY = 35;
    const baseWidth = CANVAS_WIDTH * 0.95;

    path.moveTo(centerX - baseWidth / 2, baseY);
    path.cubicTo(
      centerX - baseWidth / 2.2, baseY - 120,
      centerX - baseWidth / 3, baseY - 280,
      centerX - 20, peakY + 50
    );
    path.quadTo(centerX, peakY, centerX + 20, peakY + 50);
    path.cubicTo(
      centerX + baseWidth / 3, baseY - 280,
      centerX + baseWidth / 2.2, baseY - 120,
      centerX + baseWidth / 2, baseY
    );
    path.close();
    return path;
  };

  const createSnowCapPath = () => {
    const path = Skia.Path.Make();
    const centerX = CANVAS_WIDTH / 2;
    const peakY = 35;

    path.moveTo(centerX - 60, peakY + 80);
    path.quadTo(centerX - 45, peakY + 55, centerX - 25, peakY + 35);
    path.quadTo(centerX - 12, peakY + 10, centerX, peakY);
    path.quadTo(centerX + 12, peakY + 10, centerX + 25, peakY + 35);
    path.quadTo(centerX + 45, peakY + 55, centerX + 60, peakY + 80);
    path.close();
    return path;
  };

  const createTrailPath = () => {
    const path = Skia.Path.Make();
    const centerX = CANVAS_WIDTH / 2;
    const baseY = CANVAS_HEIGHT - 35;
    const peakY = 50;
    const totalHeight = baseY - peakY;
    const zigzagWidth = 35;

    const points = [];
    const segments = 12;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = baseY - totalHeight * t;
      const xOffset = i % 2 === 0 ? -zigzagWidth : zigzagWidth;
      const dampening = 1 - Math.pow(t, 2) * 0.7;
      points.push({ x: centerX + xOffset * dampening, y });
    }

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
    return Array.from({ length: count }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * (CANVAS_HEIGHT * 0.4),
      size: Math.random() * 2.5 + 0.8,
      opacity: Math.random() * 0.6 + 0.3,
    }));
  };

  SkiaMountainProgress = function SkiaMountainProgressComponent({
    tier,
    level,
    completedCategories,
    totalCategories,
    avatarUrl,
    username,
    justCompletedCategory,
  }: MountainProgressProps) {
    const { t, language } = useTranslation();
    const currentLevel = getCurrentLevelNumber(tier, level);
    const tierInfo = getTierInfo(tier);
    const difficulty = getLevelDifficulty(level);

    const progressAnim = useSharedValue(0);
    const glowAnim = useSharedValue(0);
    const celebrationScale = useSharedValue(1);

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

    const targetProgress = useMemo(() => {
      return completedCategories.length / totalCategories;
    }, [completedCategories.length, totalCategories]);

    const avatarPositionIndex = completedCategories.length;

    const mountainPath = useMemo(() => createMountainPath(), []);
    const snowCapPath = useMemo(() => createSnowCapPath(), []);
    const trailPath = useMemo(() => createTrailPath(), []);
    const stars = useMemo(() => generateStars(40), []);

    useEffect(() => {
      progressAnim.value = withDelay(300, withSpring(targetProgress, { damping: 15, stiffness: 80 }));

      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, [targetProgress]);

    const characterStyle = useAnimatedStyle(() => {
      const baseY = CANVAS_HEIGHT - 60;
      const peakY = 50;
      const totalHeight = baseY - peakY;
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
        transform: [{ scale: interpolate(glowAnim.value, [0, 1], [1, 1.2]) }],
      };
    });

    return (
      <View className="items-center">
        <View
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            borderRadius: 24,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: COLORS.glassBorder,
          }}
        >
          <Canvas style={{ flex: 1 }}>
            {/* Deep space gradient background */}
            <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, CANVAS_HEIGHT)}
                colors={["#050510", "#0a0a25", "#151540", "#0a0a25", "#050515"]}
              />
            </Rect>

            {/* Ambient glow */}
            <Circle cx={CANVAS_WIDTH * 0.3} cy={CANVAS_HEIGHT * 0.3} r={120}>
              <RadialGradient
                c={vec(CANVAS_WIDTH * 0.3, CANVAS_HEIGHT * 0.3)}
                r={120}
                colors={["rgba(0, 194, 204, 0.08)", "transparent"]}
              />
            </Circle>

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
            <Circle cx={CANVAS_WIDTH - 50} cy={50} r={50}>
              <RadialGradient
                c={vec(CANVAS_WIDTH - 50, 50)}
                r={50}
                colors={["rgba(255, 240, 200, 0.5)", "rgba(255, 220, 150, 0.2)", "transparent"]}
              />
            </Circle>
            {/* Moon */}
            <Circle cx={CANVAS_WIDTH - 50} cy={50} r={24} color="rgba(255, 250, 240, 0.95)" />

            {/* Mountain shadow for depth */}
            <Path path={mountainPath} color="rgba(0, 0, 0, 0.5)">
              <Blur blur={20} />
            </Path>

            {/* Main mountain with glass gradient */}
            <Path path={mountainPath}>
              <LinearGradient
                start={vec(CANVAS_WIDTH / 2, CANVAS_HEIGHT)}
                end={vec(CANVAS_WIDTH / 2, 30)}
                colors={[
                  "rgba(25, 35, 55, 0.9)",
                  "rgba(35, 50, 75, 0.85)",
                  "rgba(30, 45, 70, 0.8)",
                  "rgba(40, 55, 85, 0.75)",
                  "rgba(35, 50, 80, 0.7)",
                ]}
              />
            </Path>

            {/* Mountain edge highlight (glass effect) */}
            <Path path={mountainPath} color="transparent" style="stroke" strokeWidth={1}>
              <LinearGradient
                start={vec(0, CANVAS_HEIGHT)}
                end={vec(CANVAS_WIDTH, 0)}
                colors={[
                  "rgba(255, 255, 255, 0.05)",
                  "rgba(255, 255, 255, 0.15)",
                  "rgba(255, 255, 255, 0.1)",
                ]}
              />
            </Path>

            {/* Snow cap glow */}
            <Path path={snowCapPath} color="rgba(255, 255, 255, 0.5)">
              <Blur blur={15} />
            </Path>

            {/* Snow cap */}
            <Path path={snowCapPath}>
              <LinearGradient
                start={vec(CANVAS_WIDTH / 2, 30)}
                end={vec(CANVAS_WIDTH / 2, 120)}
                colors={["#ffffff", "#f0f8ff", "#e0f0ff", "#d0e8f8"]}
              />
            </Path>

            {/* Trail background (glass) */}
            <Path
              path={trailPath}
              color="rgba(255, 255, 255, 0.08)"
              style="stroke"
              strokeWidth={8}
              strokeCap="round"
            />

            {/* Trail progress glow */}
            <Path
              path={trailPath}
              color={COLORS.primaryGlow}
              style="stroke"
              strokeWidth={16}
              strokeCap="round"
              start={0}
              end={targetProgress}
            >
              <Blur blur={12} />
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
                end={vec(CANVAS_WIDTH / 2, 50)}
                colors={[COLORS.primary, COLORS.primaryGlow, COLORS.gold]}
              />
            </Path>

            {/* Step marker backgrounds (glass circles) */}
            {MOUNTAIN_STEPS.map((step, stepIndex) => {
              const baseY = CANVAS_HEIGHT - 35;
              const peakY = 50;
              const totalHeight = baseY - peakY;
              const yPos = baseY - totalHeight * step.y;
              const xOffset = step.side === "left" ? -55 : 55;

              const completedCategoryCode = completedCategories[stepIndex];
              const categoryInfo = completedCategoryCode ? getCategoryByCode(completedCategoryCode) : undefined;
              const isCompleted = !!categoryInfo;
              const isNextStep = stepIndex === completedCategories.length;
              const stepColor = categoryInfo?.color || (isNextStep ? COLORS.gold : "rgba(255,255,255,0.2)");

              return (
                <Group key={`step-${stepIndex}`}>
                  {/* Glow for completed/next steps */}
                  {(isCompleted || isNextStep) && (
                    <Circle cx={CANVAS_WIDTH / 2 + xOffset} cy={yPos} r={26} color={stepColor}>
                      <Blur blur={10} />
                    </Circle>
                  )}
                  {/* Glass circle background */}
                  <Circle
                    cx={CANVAS_WIDTH / 2 + xOffset}
                    cy={yPos}
                    r={20}
                    color={isCompleted ? `${stepColor}30` : isNextStep ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.08)"}
                  />
                  {/* Glass circle border */}
                  <Circle
                    cx={CANVAS_WIDTH / 2 + xOffset}
                    cy={yPos}
                    r={20}
                    style="stroke"
                    strokeWidth={1.5}
                    color={isCompleted ? stepColor : isNextStep ? COLORS.gold : "rgba(255,255,255,0.15)"}
                  />
                </Group>
              );
            })}

            {/* Summit glow */}
            <Circle cx={CANVAS_WIDTH / 2} cy={25} r={30} color="rgba(255, 215, 0, 0.4)">
              <Blur blur={15} />
            </Circle>
          </Canvas>

          {/* Summit flag (React Native for icon) */}
          <View
            style={{
              position: "absolute",
              left: CANVAS_WIDTH / 2 - 18,
              top: 5,
            }}
          >
            <Icon name="Flag" size={36} color={COLORS.gold} />
          </View>

          {/* Step icons (React Native for Lucide icons) */}
          {MOUNTAIN_STEPS.map((step, stepIndex) => {
            const baseY = CANVAS_HEIGHT - 35;
            const peakY = 50;
            const totalHeight = baseY - peakY;
            const yPos = baseY - totalHeight * step.y;
            const isRight = step.side === "right";

            const completedCategoryCode = completedCategories[stepIndex];
            const categoryInfo = completedCategoryCode ? getCategoryByCode(completedCategoryCode) : undefined;
            const isCompleted = !!categoryInfo;
            const isJustCompleted = justCompletedCategory === completedCategoryCode;
            const isNextStep = stepIndex === completedCategories.length;

            const iconName = categoryInfo
              ? (CATEGORY_ICONS[categoryInfo.code] || "HelpCircle")
              : isNextStep ? "MapPin" : "Lock";
            const iconColor = isCompleted && categoryInfo
              ? categoryInfo.color
              : isNextStep ? COLORS.gold : COLORS.textDim;

            const Container = isJustCompleted ? Animated.View : View;
            const containerProps = isJustCompleted ? { style: celebrationAnimatedStyle } : {};

            return (
              <Container
                key={`icon-step-${stepIndex}`}
                {...containerProps}
                style={[
                  {
                    position: "absolute",
                    top: yPos - 20,
                    [isRight ? "right" : "left"]: isRight
                      ? CANVAS_WIDTH / 2 - 75
                      : CANVAS_WIDTH / 2 - 75,
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  isJustCompleted && celebrationAnimatedStyle,
                ]}
              >
                <Icon name={iconName as any} size={18} color={iconColor} />
                {/* Completion badge */}
                {isCompleted && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: "#22c55e",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: COLORS.bgDark,
                    }}
                  >
                    <Icon name="Check" size={8} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </Container>
            );
          })}

          {/* Player Avatar */}
          <Animated.View
            style={[
              {
                position: "absolute",
                left: CANVAS_WIDTH / 2 - 28,
                top: 0,
                zIndex: 10,
              },
              characterStyle,
            ]}
          >
            {/* Avatar glow */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: tierInfo.color,
                },
                characterGlowStyle,
              ]}
            />
            {/* Avatar container */}
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: COLORS.glass,
                borderWidth: 2,
                borderColor: tierInfo.color,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: tierInfo.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9,
                shadowRadius: 16,
                overflow: "hidden",
              }}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: 52, height: 52, borderRadius: 26 }}
                />
              ) : username ? (
                <DefaultAvatar username={username} size={52} tierColor={tierInfo.color} />
              ) : (
                <DefaultAvatar username="?" size={52} tierColor={tierInfo.color} />
              )}
            </View>
          </Animated.View>
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
                  style={{ opacity: isActive || isPast ? 1 : 0.4 }}
                >
                  <View
                    style={{
                      height: 6,
                      backgroundColor: isPast
                        ? "#22c55e"
                        : isActive
                          ? COLORS.primary
                          : COLORS.glass,
                      borderRadius: 3,
                      borderWidth: 1,
                      borderColor: isPast
                        ? "rgba(34, 197, 94, 0.3)"
                        : isActive
                          ? "rgba(0, 194, 204, 0.3)"
                          : COLORS.glassBorder,
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
                    {diff === "easy" ? t("difficultyEasy" as any) : diff === "medium" ? t("difficultyMedium" as any) : t("difficultyHard" as any)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tier Info - Glass Card */}
        <View className="mt-4 items-center">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: `${tierInfo.color}15`,
              borderWidth: 1,
              borderColor: `${tierInfo.color}40`,
            }}
          >
            <Text className="text-2xl mr-2">{tierInfo.icon}</Text>
            <Text className="text-white text-lg font-black">{language === "fr" ? tierInfo.nameFr : tierInfo.name}</Text>
          </View>
          <Text style={{ color: COLORS.textMuted }} className="mt-2 text-sm">
            {completedCategories.length}/{totalCategories} {t("categories" as any)} • {t("levelLabel" as any)} {currentLevel}/24
          </Text>
        </View>
      </View>
    );
  };
}

// Main export
export function MountainProgress(props: MountainProgressProps) {
  if (Platform.OS === "web" || !SkiaMountainProgress) {
    return <MountainProgressFallback {...props} />;
  }
  return <SkiaMountainProgress {...props} />;
}
