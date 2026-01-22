import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAuth } from "../contexts/AuthContext";

interface UpgradePromptProps {
  onPress: () => void;
  variant?: "banner" | "card";
  message?: string;
}

export function UpgradePrompt({
  onPress,
  variant = "banner",
  message = "Create an account to save your scores",
}: UpgradePromptProps) {
  const { isAnonymous } = useAuth();

  // Don't show if user is already logged in
  if (!isAnonymous) {
    return null;
  }

  if (variant === "card") {
    return (
      <View className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-5 mx-4 my-4">
        <Text className="text-white text-lg font-bold mb-2">
          Sauvegarde ta progression
        </Text>
        <Text className="text-white/80 mb-4">
          {message}
        </Text>
        <Pressable
          onPress={onPress}
          className="bg-white rounded-xl py-3 px-6 self-start active:opacity-80"
        >
          <Text className="text-primary-600 font-bold">
            Create account
          </Text>
        </Pressable>
      </View>
    );
  }

  // Banner variant (default)
  return (
    <Pressable
      onPress={onPress}
      className="bg-primary-500/20 border border-primary-500/40 rounded-xl p-4 mx-4 my-2 flex-row items-center justify-between active:opacity-80"
    >
      <View className="flex-1 mr-3">
        <Text className="text-primary-400 font-semibold">
          {message}
        </Text>
      </View>
      <View className="bg-primary-500 rounded-lg px-3 py-2">
        <Text className="text-white font-bold text-sm">
          Create
        </Text>
      </View>
    </Pressable>
  );
}
