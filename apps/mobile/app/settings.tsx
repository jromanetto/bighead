import { View, Text, Pressable, Switch, ScrollView, Alert } from "react-native";
import { router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { getSettings, saveSettings, type UserSettings } from "../src/services/settings";
import { playHaptic, buttonPressFeedback } from "../src/utils/feedback";
import {
  registerForPushNotifications,
  savePushToken,
  scheduleDailyReminder,
  cancelAllNotifications,
} from "../src/services/notifications";

// New QuizNext design colors
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  error: "#ef4444",
  errorDim: "rgba(239, 68, 68, 0.15)",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

export default function SettingsScreen() {
  const { user, isAnonymous, signOut } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    sound_enabled: true,
    haptic_enabled: true,
    notifications_enabled: true,
    language: "fr",
    theme: "dark",
    onboarding_completed: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const data = await getSettings(user?.id);
      setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    playHaptic("light");
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    setSaving(true);
    try {
      await saveSettings({ [key]: value }, user?.id);

      if (key === "notifications_enabled") {
        if (value) {
          const token = await registerForPushNotifications();
          if (token && user) {
            await savePushToken(user.id, token);
            await scheduleDailyReminder();
          }
        } else {
          await cancelAllNotifications();
        }
      }
    } catch (error) {
      console.error("Error saving setting:", error);
    }
    setSaving(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/");
            } catch (error) {
              console.error("Error signing out:", error);
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    value,
    onToggle,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View
      className="flex-row items-center py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: COLORS.surfaceLight }}
      >
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-medium">{title}</Text>
        {subtitle && <Text style={{ color: COLORS.textMuted }} className="text-sm">{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );

  const MenuRow = ({
    icon,
    title,
    subtitle,
    onPress,
    danger,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={() => {
        buttonPressFeedback();
        onPress();
      }}
      className="flex-row items-center py-4 active:opacity-70"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: danger ? COLORS.errorDim : COLORS.surfaceLight }}
      >
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text
          className="font-medium"
          style={{ color: danger ? COLORS.error : COLORS.text }}
        >
          {title}
        </Text>
        {subtitle && <Text style={{ color: COLORS.textMuted }} className="text-sm">{subtitle}</Text>}
      </View>
      <Text style={{ color: COLORS.textMuted }}>→</Text>
    </Pressable>
  );

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
          <Text className="text-white text-2xl font-black">Settings</Text>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Sound & Haptics */}
          <Text
            className="text-xs font-bold mb-2 mt-4 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            Sound & Vibrations
          </Text>
          <View
            className="rounded-2xl px-4"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <SettingRow
              icon="🔊"
              title="Sounds"
              subtitle="Game sound effects"
              value={settings.sound_enabled}
              onToggle={(v) => updateSetting("sound_enabled", v)}
            />
            <SettingRow
              icon="📳"
              title="Vibrations"
              subtitle="Haptic feedback"
              value={settings.haptic_enabled}
              onToggle={(v) => updateSetting("haptic_enabled", v)}
            />
          </View>

          {/* Notifications */}
          <Text
            className="text-xs font-bold mb-2 mt-6 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            Notifications
          </Text>
          <View
            className="rounded-2xl px-4"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <SettingRow
              icon="🔔"
              title="Notifications"
              subtitle="Daily reminders and updates"
              value={settings.notifications_enabled}
              onToggle={(v) => updateSetting("notifications_enabled", v)}
            />
          </View>

          {/* Account */}
          <Text
            className="text-xs font-bold mb-2 mt-6 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            Account
          </Text>
          <View
            className="rounded-2xl px-4"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            {isAnonymous ? (
              <MenuRow
                icon="👤"
                title="Create account"
                subtitle="Save your progress"
                onPress={() => router.push("/profile")}
              />
            ) : (
              <>
                <MenuRow
                  icon="👤"
                  title="My profile"
                  subtitle="Manage your personal info"
                  onPress={() => router.push("/profile")}
                />
                <MenuRow
                  icon="🚪"
                  title="Sign out"
                  subtitle="Leave your current session"
                  onPress={handleSignOut}
                  danger
                />
              </>
            )}
          </View>

          {/* About */}
          <Text
            className="text-xs font-bold mb-2 mt-6 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            About
          </Text>
          <View
            className="rounded-2xl px-4"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <MenuRow
              icon="📖"
              title="Tutorial"
              subtitle="Review the introduction"
              onPress={() => router.push("/onboarding")}
            />
            <MenuRow
              icon="⭐"
              title="Rate the app"
              subtitle="Leave us a review"
              onPress={() => {
                Alert.alert("Thanks!", "This feature is coming soon.");
              }}
            />
            <MenuRow
              icon="📧"
              title="Contact"
              subtitle="Report a problem"
              onPress={() => {
                Alert.alert("Contact", "support@bighead.app");
              }}
            />
          </View>

          {/* Version */}
          <View className="items-center py-8">
            <Text style={{ color: COLORS.textMuted }} className="text-sm font-bold">
              BIGHEAD V1.0.0
            </Text>
            <Text className="text-gray-600 text-xs mt-1">
              Made with ❤️ by the team
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View
          className="flex-row justify-around py-3 px-2"
          style={{
            backgroundColor: COLORS.bg,
            borderTopWidth: 1,
            borderTopColor: COLORS.surfaceLight,
          }}
        >
          <Link href="/" asChild>
            <Pressable className="items-center flex-1">
              <Text className="text-xl mb-1">🏠</Text>
              <Text className="text-gray-500 text-xs">Home</Text>
            </Pressable>
          </Link>
          <Link href="/achievements" asChild>
            <Pressable className="items-center flex-1">
              <Text className="text-xl mb-1">🏆</Text>
              <Text className="text-gray-500 text-xs">Achievements</Text>
            </Pressable>
          </Link>
          <Link href="/leaderboard" asChild>
            <Pressable className="items-center flex-1">
              <Text className="text-xl mb-1">📊</Text>
              <Text className="text-gray-500 text-xs">Leaderboard</Text>
            </Pressable>
          </Link>
          <Link href="/profile" asChild>
            <Pressable className="items-center flex-1">
              <Text className="text-xl mb-1">👤</Text>
              <Text className="text-gray-500 text-xs">Profile</Text>
            </Pressable>
          </Link>
          <Pressable className="items-center flex-1">
            <Text className="text-xl mb-1">⚙️</Text>
            <Text style={{ color: COLORS.primary }} className="text-xs font-medium">Options</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
