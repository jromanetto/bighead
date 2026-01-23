import { View, Text, Pressable } from "react-native";
import { Link, usePathname } from "expo-router";
import { buttonPressFeedback } from "../utils/feedback";

// Shared design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  textMuted: "#9ca3af",
};

// Navigation items configuration
const NAV_ITEMS = [
  { href: "/", icon: "⌂", label: "Home" },
  { href: "/leaderboard", icon: "♛", label: "Ranking" },
  { href: "/profile", icon: "◉", label: "Profile" },
  { href: "/settings", icon: "⚙", label: "Settings" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <View className="absolute bottom-6 left-4 right-4">
      <View
        className="h-16 rounded-full flex-row justify-between items-center px-2"
        style={{
          backgroundColor: "rgba(30, 37, 41, 0.9)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
        }}
      >
        {NAV_ITEMS.map((item, index) => {
          const active = isActive(item.href);

          // Add divider after second item
          const showDivider = index === 1;

          return (
            <View key={item.href} className="flex-row items-center flex-1">
              <Link href={item.href as any} asChild>
                <Pressable
                  className="flex-1 items-center justify-center"
                  onPressIn={buttonPressFeedback}
                >
                  <View
                    className="w-12 h-10 rounded-full items-center justify-center"
                    style={active ? { backgroundColor: `${COLORS.primary}25` } : undefined}
                  >
                    <Text
                      className="text-lg font-bold"
                      style={{ color: active ? COLORS.primary : COLORS.textMuted }}
                    >
                      {item.icon}
                    </Text>
                  </View>
                </Pressable>
              </Link>

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
