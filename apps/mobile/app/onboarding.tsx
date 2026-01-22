import { View, Text, Pressable, Dimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useAuth } from "../src/contexts/AuthContext";
import { completeOnboarding } from "../src/services/settings";
import { playHaptic } from "../src/utils/feedback";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: "🧠",
    title: "Bienvenue sur BIGHEAD",
    description: "Le quiz qui fait travailler tes méninges ! Devine le footballeur mystère et deviens le meilleur.",
    color: "#6366f1",
  },
  {
    icon: "🔥",
    title: "Mode Chaîne",
    description: "Enchaîne les bonnes réponses pour multiplier tes points. Plus ta chaîne est longue, plus tu gagnes !",
    color: "#f59e0b",
  },
  {
    icon: "🎉",
    title: "Mode Party",
    description: "Joue avec tes amis en local ! Passez-vous le téléphone et découvrez qui est le vrai champion.",
    color: "#ec4899",
  },
  {
    icon: "🏆",
    title: "Grimpe le classement",
    description: "Gagne de l'XP, débloque des succès et hisse-toi en haut du classement mondial !",
    color: "#22c55e",
  },
];

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);

  const goToSlide = (index: number) => {
    playHaptic("light");
    translateX.value = withSpring(-index * width, { damping: 20 });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    playHaptic("success");
    await completeOnboarding(user?.id);
    router.replace("/");
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Skip button */}
        <View className="flex-row justify-end px-6 pt-4">
          <Pressable onPress={handleSkip} className="p-2">
            <Text className="text-gray-400">Passer</Text>
          </Pressable>
        </View>

        {/* Slides */}
        <View className="flex-1 overflow-hidden">
          <Animated.View
            style={[{ flexDirection: "row", width: width * slides.length }, animatedStyle]}
          >
            {slides.map((slide, index) => (
              <View
                key={index}
                style={{ width }}
                className="flex-1 items-center justify-center px-8"
              >
                <View
                  className="w-32 h-32 rounded-full items-center justify-center mb-8"
                  style={{ backgroundColor: `${slide.color}20` }}
                >
                  <Text className="text-6xl">{slide.icon}</Text>
                </View>
                <Text className="text-white text-2xl font-bold text-center mb-4">
                  {slide.title}
                </Text>
                <Text className="text-gray-400 text-center text-lg leading-7">
                  {slide.description}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Pagination */}
        <View className="flex-row justify-center mb-8">
          {slides.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => goToSlide(index)}
              className="p-2"
            >
              <View
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? "bg-primary-500 w-6" : "bg-gray-600"
                }`}
              />
            </Pressable>
          ))}
        </View>

        {/* Button */}
        <View className="px-6 pb-6">
          <Pressable
            onPress={handleNext}
            className="bg-primary-500 rounded-xl py-4"
          >
            <Text className="text-white text-center font-bold text-lg">
              {currentIndex === slides.length - 1 ? "C'est parti !" : "Suivant"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
