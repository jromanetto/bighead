import { useEffect, useRef } from "react";
import { Tabs, router } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { useAuth } from "../../src/contexts/AuthContext";
import { isOnboardingCompleted, completeOnboarding } from "../../src/services/settings";
import { logEvent } from "../../src/services/analytics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  textMuted: "#9ca3af",
};

const TAB_CONFIG = [
  { name: "index", icon: "⌂", label: "Home" },
  { name: "leaderboard", icon: "★", label: "Ranking" },
  { name: "profile", icon: "○", label: "Profile" },
  { name: "settings", icon: "☰", label: "Settings" },
];

function TabBarIcon({ icon, focused }: { icon: string; focused: boolean }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { damping: 15, stiffness: 150 });
  }, [focused]);

  return (
    <View
      className="w-14 h-12 rounded-full items-center justify-center"
      style={focused ? { backgroundColor: `${COLORS.primary}25` } : undefined}
    >
      <Animated.Text
        style={[
          {
            fontSize: 24,
            color: focused ? COLORS.primary : COLORS.textMuted
          },
          animatedStyle,
        ]}
      >
        {icon}
      </Animated.Text>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-4 right-4"
      style={{ bottom: Math.max(insets.bottom, 16) }}
    >
      <View
        className="h-18 rounded-full flex-row justify-between items-center px-3"
        style={{
          height: 72,
          backgroundColor: "rgba(30, 37, 41, 0.95)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabConfig = TAB_CONFIG.find((t) => t.name === route.name);

          if (!tabConfig) return null;

          const onPress = () => {
            buttonPressFeedback();
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const showDivider = index === 1;

          return (
            <View key={route.key} className="flex-row items-center flex-1">
              <Pressable
                className="flex-1 items-center justify-center"
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={tabConfig.label}
                accessibilityState={{ selected: isFocused }}
              >
                <TabBarIcon icon={tabConfig.icon} focused={isFocused} />
              </Pressable>

              {showDivider && (
                <View
                  className="w-px h-8"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { user, profile, isInitialized } = useAuth();
  const onboardingChecked = useRef(false);

  // Gate onboarding: envoie UNIQUEMENT les users sans ambiguïté nouveaux vers
  // /onboarding. Un user existant (pseudo, ou XP, ou parties jouées) ne doit JAMAIS
  // se faire redemander son nom — on le marque "fait" et on passe direct.
  // `isInitialized` garantit que `profile` est déjà chargé (cf. AuthContext).
  useEffect(() => {
    if (!isInitialized || onboardingChecked.current) return;
    onboardingChecked.current = true;
    (async () => {
      try {
        const done = await isOnboardingCompleted(user?.id);
        if (done) return;

        // Fail-safe : sans profil chargé, on ne force rien (ne jamais harceler).
        if (!profile) return;

        const isBrandNew =
          !profile.username &&
          (profile.total_xp ?? 0) === 0 &&
          (profile.games_played ?? 0) === 0;

        if (!isBrandNew) {
          // User existant : marquer l'onboarding fait pour ne plus jamais demander.
          completeOnboarding(user?.id).catch(() => {});
          return;
        }

        logEvent("onboarding_started", {}, user?.id);
        router.replace("/onboarding");
      } catch {
        // ne jamais bloquer l'accès à l'app si le check échoue
      }
    })();
  }, [isInitialized, user?.id, profile]);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="leaderboard" options={{ title: "Ranking" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
