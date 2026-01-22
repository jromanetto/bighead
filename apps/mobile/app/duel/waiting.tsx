import { View, Text, Pressable, ActivityIndicator, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../../src/contexts/AuthContext";
import { getDuel, subscribeToDuel, cancelDuel, type Duel } from "../../src/services/duel";

export default function DuelWaitingScreen() {
  const { id, code } = useLocalSearchParams<{ id: string; code: string }>();
  const { user } = useAuth();
  const [duel, setDuel] = useState<Duel | null>(null);
  const [loading, setLoading] = useState(true);

  // Pulse animation
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (!id) return;

    // Load initial duel data
    const loadDuel = async () => {
      try {
        const data = await getDuel(id);
        setDuel(data);
      } catch (error) {
        console.error("Error loading duel:", error);
      }
      setLoading(false);
    };
    loadDuel();

    // Subscribe to updates
    const channel = subscribeToDuel(id, (updatedDuel) => {
      setDuel(updatedDuel);
      if (updatedDuel.status === "playing") {
        // Guest joined, start the game!
        router.replace(`/duel/play?id=${id}`);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my BIGHEAD duel! Code: ${code}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelDuel(id);
      router.back();
    } catch (error) {
      console.error("Error cancelling:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 mb-8">
          <Pressable onPress={handleCancel} className="p-2">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-xl font-bold">Waiting...</Text>
          <View className="w-10" />
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center">
          <Animated.View style={animatedStyle} className="mb-8">
            <Text className="text-8xl">⏳</Text>
          </Animated.View>

          <Text className="text-white text-2xl font-bold mb-2">
            Waiting for opponent
          </Text>
          <Text className="text-gray-400 text-center mb-8">
            Share this code with your friend
          </Text>

          {/* Code Display */}
          <View className="bg-gray-800 rounded-2xl p-6 mb-8 w-full">
            <Text className="text-gray-400 text-center text-sm mb-2">
              DUEL CODE
            </Text>
            <Text className="text-primary-400 text-center text-4xl font-bold tracking-widest">
              {code}
            </Text>
          </View>

          {/* Share Button */}
          <Pressable
            onPress={handleShare}
            className="bg-primary-500 rounded-xl py-4 px-8 mb-4 w-full"
          >
            <Text className="text-white text-center font-bold text-lg">
              📤 Share code
            </Text>
          </Pressable>

          {/* Waiting indicator */}
          <View className="flex-row items-center mt-8">
            <ActivityIndicator size="small" color="#6B7280" />
            <Text className="text-gray-500 ml-2">
              Searching for opponent...
            </Text>
          </View>
        </View>

        {/* Cancel Button */}
        <Pressable
          onPress={handleCancel}
          className="bg-red-500/20 rounded-xl py-4 mb-6"
        >
          <Text className="text-red-400 text-center font-bold">
            Cancel duel
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
