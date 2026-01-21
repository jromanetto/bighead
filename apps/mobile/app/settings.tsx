import { View, Text, Pressable, Switch } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function SettingsScreen() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Options</Text>
        </View>

        {/* Settings Groups */}
        <View className="gap-6">
          {/* Audio & Feedback */}
          <View>
            <Text className="text-gray-400 text-sm uppercase mb-3">
              Audio & Feedback
            </Text>
            <View className="bg-gray-800 rounded-xl">
              <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
                <Text className="text-white">Sons</Text>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: "#374151", true: "#0ea5e9" }}
                  thumbColor="#ffffff"
                />
              </View>
              <View className="flex-row items-center justify-between p-4">
                <Text className="text-white">Vibrations</Text>
                <Switch
                  value={hapticEnabled}
                  onValueChange={setHapticEnabled}
                  trackColor={{ false: "#374151", true: "#0ea5e9" }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View>
            <Text className="text-gray-400 text-sm uppercase mb-3">
              Notifications
            </Text>
            <View className="bg-gray-800 rounded-xl">
              <View className="flex-row items-center justify-between p-4">
                <Text className="text-white">Rappels quotidiens</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#374151", true: "#0ea5e9" }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* About */}
          <View>
            <Text className="text-gray-400 text-sm uppercase mb-3">
              À propos
            </Text>
            <View className="bg-gray-800 rounded-xl">
              <Pressable className="p-4 border-b border-gray-700">
                <Text className="text-white">Politique de confidentialité</Text>
              </Pressable>
              <Pressable className="p-4 border-b border-gray-700">
                <Text className="text-white">Conditions d'utilisation</Text>
              </Pressable>
              <View className="p-4">
                <Text className="text-white">Version</Text>
                <Text className="text-gray-400">1.0.0 (MVP)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-1 justify-end pb-6">
          <Text className="text-gray-500 text-center">
            BIGHEAD MVP - Made with Claude
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
