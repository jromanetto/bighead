import { View, Text, Pressable, Switch, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { getSettings, saveSettings, type UserSettings } from "../src/services/settings";
import { playHaptic } from "../src/utils/feedback";

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
    } catch (error) {
      console.error("Error saving setting:", error);
    }
    setSaving(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      "Déconnexion",
      "Tu es sûr de vouloir te déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
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
    <View className="flex-row items-center py-4 border-b border-gray-700 last:border-b-0">
      <Text className="text-2xl mr-4">{icon}</Text>
      <View className="flex-1">
        <Text className="text-white font-medium">{title}</Text>
        {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#374151", true: "#0ea5e9" }}
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
      onPress={onPress}
      className="flex-row items-center py-4 border-b border-gray-700 last:border-b-0"
    >
      <Text className="text-2xl mr-4">{icon}</Text>
      <View className="flex-1">
        <Text className={`font-medium ${danger ? "text-red-400" : "text-white"}`}>
          {title}
        </Text>
        {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
      </View>
      <Text className="text-gray-500">→</Text>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 mb-4">
          <Pressable onPress={() => router.back()} className="mr-4 p-2">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Paramètres</Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Sound & Haptics */}
          <Text className="text-gray-400 text-sm font-bold mb-2 mt-4">
            SON & VIBRATIONS
          </Text>
          <View className="bg-gray-800 rounded-xl px-4">
            <SettingRow
              icon="🔊"
              title="Sons"
              subtitle="Effets sonores du jeu"
              value={settings.sound_enabled}
              onToggle={(v) => updateSetting("sound_enabled", v)}
            />
            <SettingRow
              icon="📳"
              title="Vibrations"
              subtitle="Retour haptique"
              value={settings.haptic_enabled}
              onToggle={(v) => updateSetting("haptic_enabled", v)}
            />
          </View>

          {/* Notifications */}
          <Text className="text-gray-400 text-sm font-bold mb-2 mt-6">
            NOTIFICATIONS
          </Text>
          <View className="bg-gray-800 rounded-xl px-4">
            <SettingRow
              icon="🔔"
              title="Notifications"
              subtitle="Rappels quotidiens et mises à jour"
              value={settings.notifications_enabled}
              onToggle={(v) => updateSetting("notifications_enabled", v)}
            />
          </View>

          {/* Account */}
          <Text className="text-gray-400 text-sm font-bold mb-2 mt-6">COMPTE</Text>
          <View className="bg-gray-800 rounded-xl px-4">
            {isAnonymous ? (
              <MenuRow
                icon="👤"
                title="Créer un compte"
                subtitle="Sauvegarde ta progression"
                onPress={() => router.push("/profile")}
              />
            ) : (
              <>
                <MenuRow
                  icon="👤"
                  title="Mon profil"
                  subtitle="Voir et modifier ton profil"
                  onPress={() => router.push("/profile")}
                />
                <MenuRow
                  icon="🚪"
                  title="Déconnexion"
                  onPress={handleSignOut}
                  danger
                />
              </>
            )}
          </View>

          {/* About */}
          <Text className="text-gray-400 text-sm font-bold mb-2 mt-6">À PROPOS</Text>
          <View className="bg-gray-800 rounded-xl px-4">
            <MenuRow
              icon="📖"
              title="Tutoriel"
              subtitle="Revoir l'introduction"
              onPress={() => router.push("/onboarding")}
            />
            <MenuRow
              icon="⭐"
              title="Noter l'app"
              subtitle="Laisse-nous un avis"
              onPress={() => {
                Alert.alert("Merci !", "Cette fonctionnalité arrive bientôt.");
              }}
            />
            <MenuRow
              icon="📧"
              title="Contact"
              subtitle="Signaler un problème"
              onPress={() => {
                Alert.alert("Contact", "support@bighead.app");
              }}
            />
          </View>

          {/* Version */}
          <View className="items-center py-8">
            <Text className="text-gray-600 text-sm">BIGHEAD v1.0.0</Text>
            <Text className="text-gray-700 text-xs mt-1">Made with ❤️</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
