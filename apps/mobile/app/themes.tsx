import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { buttonPressFeedback, playHaptic } from "../src/utils/feedback";
import { BottomNavigation } from "../src/components/BottomNavigation";
import { getSettings, saveSettings } from "../src/services/settings";

// Design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  gold: "#FFD100",
  goldDim: "rgba(255, 209, 0, 0.2)",
  purple: "#A16EFF",
  coral: "#FF6B6B",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// Available themes
const THEMES = [
  {
    id: "default",
    name: "Midnight",
    description: "The classic dark theme",
    colors: ["#161a1d", "#00c2cc", "#1E2529"],
    icon: "🌙",
    unlocked: true,
    requirement: null,
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Deep sea vibes",
    colors: ["#0c1929", "#3b82f6", "#1e3a5f"],
    icon: "🌊",
    unlocked: true,
    requirement: null,
  },
  {
    id: "forest",
    name: "Forest",
    description: "Nature-inspired greens",
    colors: ["#0f1f0f", "#22c55e", "#1a3a1a"],
    icon: "🌲",
    unlocked: false,
    requirement: "Play 10 games",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange tones",
    colors: ["#1f0f0a", "#f97316", "#3d1f10"],
    icon: "🌅",
    unlocked: false,
    requirement: "Win 5 duels",
  },
  {
    id: "royal",
    name: "Royal Purple",
    description: "Majestic and elegant",
    colors: ["#150f1f", "#a855f7", "#2d1f3d"],
    icon: "👑",
    unlocked: false,
    requirement: "Reach level 10",
  },
  {
    id: "cherry",
    name: "Cherry Blossom",
    description: "Soft pink aesthetics",
    colors: ["#1f0f15", "#ec4899", "#3d1f2d"],
    icon: "🌸",
    unlocked: false,
    requirement: "Unlock 10 achievements",
  },
  {
    id: "gold",
    name: "Golden",
    description: "Premium luxury theme",
    colors: ["#1f1a0a", "#fbbf24", "#3d3410"],
    icon: "✨",
    unlocked: false,
    requirement: "Premium only",
    premium: true,
  },
  {
    id: "neon",
    name: "Neon Nights",
    description: "Cyberpunk vibes",
    colors: ["#0a0a1f", "#00ff88", "#1a1a3d"],
    icon: "💜",
    unlocked: false,
    requirement: "Premium only",
    premium: true,
  },
];

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: string[];
  icon: string;
  unlocked: boolean;
  requirement: string | null;
  premium?: boolean;
}

// Theme Card component
function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: Theme;
  isActive: boolean;
  onSelect: () => void;
}) {
  const isLocked = !theme.unlocked;

  return (
    <Pressable
      onPress={() => {
        if (!isLocked) {
          buttonPressFeedback();
          onSelect();
        }
      }}
      className="rounded-2xl p-4 mb-3"
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: isActive ? 2 : 1,
        borderColor: isActive ? COLORS.primary : 'rgba(255,255,255,0.05)',
        opacity: isLocked ? 0.7 : 1,
      }}
    >
      <View className="flex-row items-center">
        {/* Theme Preview */}
        <View
          className="w-16 h-16 rounded-xl mr-4 overflow-hidden"
          style={{
            flexDirection: 'row',
          }}
        >
          {theme.colors.map((color, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                backgroundColor: color,
              }}
            />
          ))}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-xl mr-2">{theme.icon}</Text>
            <Text
              className="font-bold text-base"
              style={{ color: isLocked ? COLORS.textMuted : COLORS.text }}
            >
              {theme.name}
            </Text>
            {theme.premium && (
              <View
                className="ml-2 px-2 py-0.5 rounded"
                style={{ backgroundColor: COLORS.goldDim }}
              >
                <Text style={{ color: COLORS.gold }} className="text-xs font-bold">
                  PRO
                </Text>
              </View>
            )}
          </View>
          <Text
            className="text-sm"
            style={{ color: isLocked ? '#6b7280' : COLORS.textMuted }}
          >
            {theme.description}
          </Text>
          {isLocked && theme.requirement && (
            <View className="flex-row items-center mt-2">
              <Text className="text-xs mr-1">🔒</Text>
              <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                {theme.requirement}
              </Text>
            </View>
          )}
        </View>

        {/* Status */}
        {isActive && (
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.success }}
          >
            <Text className="text-white text-sm">✓</Text>
          </View>
        )}
        {isLocked && (
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.surfaceLight }}
          >
            <Text className="text-gray-500 text-sm">🔒</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function ThemesScreen() {
  const { user, isPremium, profile } = useAuth();
  const [activeTheme, setActiveTheme] = useState("default");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, [user]);

  const loadTheme = async () => {
    try {
      const settings = await getSettings(user?.id);
      if (settings.theme) {
        setActiveTheme(settings.theme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if theme is unlocked based on user progress
  const isThemeUnlocked = (theme: Theme): boolean => {
    if (theme.unlocked) return true;
    if (theme.premium) return isPremium;

    // Check requirements based on user profile
    if (!profile) return false;

    switch (theme.id) {
      case "forest":
        return profile.games_played >= 10;
      case "sunset":
        // Win 5 duels - would need duel wins tracking
        return false;
      case "royal":
        return profile.level >= 10;
      case "cherry":
        // Would need achievement count
        return false;
      default:
        return false;
    }
  };

  // Apply premium and progress-based unlock to themes
  const themesWithUnlockStatus = THEMES.map(theme => ({
    ...theme,
    unlocked: isThemeUnlocked(theme),
  }));

  const handleSelectTheme = async (themeId: string) => {
    playHaptic("light");
    setActiveTheme(themeId);

    // Save theme to settings
    setSaving(true);
    try {
      await saveSettings({ theme: themeId }, user?.id);
    } catch (error) {
      console.error("Error saving theme:", error);
    } finally {
      setSaving(false);
    }
  };

  const unlockedCount = themesWithUnlockStatus.filter(t => t.unlocked).length;
  const totalCount = themesWithUnlockStatus.length;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 mb-4">
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.back();
            }}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-white text-lg">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-black flex-1">THEMES</Text>
          {saving && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
        </View>

        {/* Stats Card */}
        <View
          className="mx-5 mb-5 rounded-2xl p-5"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: COLORS.textMuted }}
              >
                Themes Unlocked
              </Text>
              <Text className="text-3xl font-black text-white">
                {unlockedCount} / {totalCount}
              </Text>
            </View>
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center"
              style={{ backgroundColor: COLORS.primaryDim }}
            >
              <Text className="text-3xl">🎨</Text>
            </View>
          </View>
          <View
            className="h-2 rounded-full overflow-hidden mt-4"
            style={{ backgroundColor: COLORS.surfaceLight }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${(unlockedCount / totalCount) * 100}%`,
                backgroundColor: COLORS.primary,
              }}
            />
          </View>
        </View>

        {/* Theme List */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Text
            className="text-xs uppercase tracking-wider mb-3"
            style={{ color: COLORS.textMuted }}
          >
            Available Themes
          </Text>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            themesWithUnlockStatus.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={activeTheme === theme.id}
                onSelect={() => handleSelectTheme(theme.id)}
              />
            ))
          )}

          {/* Premium CTA - hide if already premium */}
          {!isPremium && (
            <Pressable
              onPress={() => {
                buttonPressFeedback();
                router.push("/premium");
              }}
              className="rounded-2xl p-5 mt-2"
              style={{
                backgroundColor: COLORS.goldDim,
                borderWidth: 1,
                borderColor: `${COLORS.gold}30`,
              }}
            >
              <View className="flex-row items-center">
                <Text className="text-3xl mr-4">👑</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    Unlock all themes
                  </Text>
                  <Text style={{ color: COLORS.textMuted }} className="text-sm">
                    Get Premium for exclusive themes and more
                  </Text>
                </View>
                <Text style={{ color: COLORS.gold }} className="text-xl">→</Text>
              </View>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
}
