import { View, Text, Pressable, Switch, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { useLanguage } from "../../src/contexts/LanguageContext";
import { useNotificationContext } from "../../src/contexts/NotificationContext";
import { getSettings, saveSettings, type UserSettings } from "../../src/services/settings";
import { playHaptic, buttonPressFeedback } from "../../src/utils/feedback";
import { IconButton, Icon } from "../../src/components/ui";
import { RatingModal } from "../../src/components/RatingModal";
import { ContactModal } from "../../src/components/ContactModal";
import { useRatingPrompt } from "../../src/hooks/useRatingPrompt";

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
  const { language, setLanguage, t } = useLanguage();
  const {
    requestPermission,
    scheduleDailyReminder,
    cancelAllNotifications,
  } = useNotificationContext();
  const { showRatingModal, openRatingModal, closeRatingModal } = useRatingPrompt();
  const [showContactModal, setShowContactModal] = useState(false);
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
          const granted = await requestPermission();
          if (granted) {
            await scheduleDailyReminder(19, 0);
            Alert.alert("Notifications activees", "Tu recevras un rappel tous les jours a 19h !");
          } else {
            Alert.alert("Permission refusee", "Active les notifications dans les reglages de ton telephone.");
            setSettings((prev) => ({ ...prev, notifications_enabled: false }));
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

  const handleLanguageChange = async (lang: "en" | "fr") => {
    playHaptic("light");
    await setLanguage(lang);
    setSettings((prev) => ({ ...prev, language: lang }));
  };

  const handleSignOut = () => {
    Alert.alert(
      t("signOut"),
      t("signOutConfirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("signOut"),
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
        <Text className="text-xl" style={{ color: COLORS.text }}>{icon}</Text>
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
        <Text className="text-xl" style={{ color: danger ? COLORS.error : COLORS.text }}>{icon}</Text>
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
      <Icon name="ChevronRight" size={16} color={COLORS.textMuted} />
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 mb-4">
        <IconButton
          name="ArrowLeft"
          onPress={() => router.back()}
          variant="glass"
          size={40}
          style={{ marginRight: 12 }}
        />
        <Text className="text-white text-2xl font-black">{t("settings")}</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
          {/* Sound & Haptics */}
          <Text
            className="text-xs font-bold mb-2 mt-4 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            {t("soundAndVibrations")}
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
              icon="♪"
              title={t("sounds")}
              subtitle={t("gameSoundEffects")}
              value={settings.sound_enabled}
              onToggle={(v) => updateSetting("sound_enabled", v)}
            />
            <SettingRow
              icon="∿"
              title={t("vibrations")}
              subtitle={t("hapticFeedback")}
              value={settings.haptic_enabled}
              onToggle={(v) => updateSetting("haptic_enabled", v)}
            />
          </View>

          {/* Notifications */}
          <Text
            className="text-xs font-bold mb-2 mt-6 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            {t("notifications")}
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
              icon="◎"
              title={t("notifications")}
              subtitle={t("dailyReminders")}
              value={settings.notifications_enabled}
              onToggle={(v) => updateSetting("notifications_enabled", v)}
            />
          </View>

          {/* Language */}
          <Text
            className="text-xs font-bold mb-2 mt-6 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            {t("language")}
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
              icon="EN"
              title="English"
              subtitle={language === "en" ? t("selected") : undefined}
              onPress={() => handleLanguageChange("en")}
            />
            <MenuRow
              icon="FR"
              title="Français"
              subtitle={language === "fr" ? t("selected") : undefined}
              onPress={() => handleLanguageChange("fr")}
            />
          </View>

          {/* Premium & Stats */}
          <Text
            className="text-xs font-bold mb-2 mt-6 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            {t("premium")}
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
              icon="★"
              title={t("goPremium")}
              subtitle={t("unlockAllFeatures")}
              onPress={() => router.push("/premium")}
            />
          </View>

          {/* Account */}
          <Text
            className="text-xs font-bold mb-2 mt-6 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            {t("account")}
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
              icon="◉"
              title={t("myProfile")}
              subtitle={t("managePersonalInfo")}
              onPress={() => router.push("/profile")}
            />
            {!isAnonymous && (
              <MenuRow
                icon="→"
                title={t("signOut")}
                subtitle={t("leaveSession")}
                onPress={handleSignOut}
                danger
              />
            )}
          </View>

          {/* About */}
          <Text
            className="text-xs font-bold mb-2 mt-6 uppercase tracking-wider"
            style={{ color: COLORS.textMuted }}
          >
            {t("about")}
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
              icon="≡"
              title={t("tutorial")}
              subtitle={t("reviewIntroduction")}
              onPress={() => router.push("/onboarding")}
            />
            <MenuRow
              icon="☆"
              title={t("rateApp")}
              subtitle={t("leaveReview")}
              onPress={openRatingModal}
            />
            <MenuRow
              icon="@"
              title={t("contact")}
              subtitle={t("reportProblem")}
              onPress={() => setShowContactModal(true)}
            />
          </View>

          {/* Version */}
          <View className="items-center py-8">
            <Text style={{ color: COLORS.textMuted }} className="text-sm font-bold">
              BIGHEAD V1.1.0
            </Text>
            <Text className="text-gray-600 text-xs mt-1">
              {t("madeByTeam")}
            </Text>
          </View>
        </ScrollView>

      {/* Rating Modal */}
      <RatingModal visible={showRatingModal} onClose={closeRatingModal} />

      {/* Contact Modal */}
      <ContactModal visible={showContactModal} onClose={() => setShowContactModal(false)} />
    </SafeAreaView>
  );
}
