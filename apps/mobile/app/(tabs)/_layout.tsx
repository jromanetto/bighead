import { useEffect } from "react";
import { Tabs } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buttonPressFeedback } from "../../src/utils/feedback";
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
