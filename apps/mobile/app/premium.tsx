import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../src/contexts/AuthContext";
import {
  monetizationService,
  getOfferings,
  purchasePackage,
  restorePurchases,
  isPremium,
} from "../src/services/monetization";
import { buttonPressFeedback, playHaptic } from "../src/utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  coral: "#FF6B6B",
  purple: "#A16EFF",
  yellow: "#FFD100",
  green: "#22c55e",
  gold: "#fbbf24",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const PREMIUM_FEATURES = [
  {
    icon: "🚫",
    title: "No Ads",
    description: "Enjoy an uninterrupted quiz experience",
  },
  {
    icon: "♾️",
    title: "Unlimited Hearts",
    description: "Play as much as you want, no waiting",
  },
  {
    icon: "🎯",
    title: "Exclusive Challenges",
    description: "Access premium-only quiz categories",
  },
  {
    icon: "📊",
    title: "Detailed Stats",
    description: "Track your progress with advanced analytics",
  },
  {
    icon: "🎨",
    title: "Custom Themes",
    description: "Personalize your app with exclusive themes",
  },
  {
    icon: "⚡",
    title: "Early Access",
    description: "Get new features before anyone else",
  },
];

interface Package {
  identifier: string;
  product: {
    title: string;
    description: string;
    priceString: string;
  };
  packageType: string;
}

export default function PremiumScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      // Initialize monetization if needed
      if (user?.id) {
        await monetizationService.initialize(user.id);
      }

      // Check premium status
      const premium = await isPremium();
      setUserIsPremium(premium);

      if (!premium) {
        // Load offerings
        const offering = await getOfferings();
        if (offering?.availablePackages) {
          setPackages(offering.availablePackages as Package[]);
          // Select monthly by default
          const monthly = offering.availablePackages.find(
            (p: any) => p.packageType === "MONTHLY"
          );
          if (monthly) {
            setSelectedPackage(monthly.identifier);
          }
        }
      }
    } catch (err) {
      console.error("Error loading offerings:", err);
      // Set mock packages for demo
      setPackages([
        {
          identifier: "monthly",
          product: {
            title: "Monthly Premium",
            description: "Billed monthly",
            priceString: "$4.99/month",
          },
          packageType: "MONTHLY",
        },
        {
          identifier: "annual",
          product: {
            title: "Annual Premium",
            description: "Best value - Save 50%",
            priceString: "$29.99/year",
          },
          packageType: "ANNUAL",
        },
      ]);
      setSelectedPackage("monthly");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setPurchasing(true);
    setError(null);

    try {
      const pkg = packages.find((p) => p.identifier === selectedPackage);
      if (!pkg) return;

      const success = await purchasePackage(pkg);
      if (success) {
        playHaptic("success");
        setUserIsPremium(true);
      } else {
        setError("Purchase failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      if (!err.userCancelled) {
        setError("Purchase failed. Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setError(null);

    try {
      const success = await restorePurchases();
      if (success) {
        playHaptic("success");
        setUserIsPremium(true);
      } else {
        setError("No purchases found to restore.");
      }
    } catch (err) {
      console.error("Restore error:", err);
      setError("Failed to restore purchases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Already premium
  if (userIsPremium) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-6 items-center justify-center">
          {/* Success Icon */}
          <View
            className="w-32 h-32 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: `${COLORS.gold}20` }}
          >
            <Text className="text-6xl">👑</Text>
          </View>

          <Text className="text-white text-3xl font-black mb-2">
            You're Premium!
          </Text>
          <Text
            style={{ color: COLORS.textMuted }}
            className="text-center mb-8 px-4"
          >
            Thank you for your support. Enjoy all premium features!
          </Text>

          {/* Features Grid */}
          <View className="w-full mb-8">
            {PREMIUM_FEATURES.slice(0, 4).map((feature, index) => (
              <View
                key={index}
                className="flex-row items-center gap-3 mb-3"
              >
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center"
                  style={{ backgroundColor: `${COLORS.gold}20` }}
                >
                  <Text className="text-lg">{feature.icon}</Text>
                </View>
                <Text className="text-white font-medium">{feature.title}</Text>
                <Text style={{ color: COLORS.green }}>✓</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.back();
            }}
            className="w-full rounded-xl py-4"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text
              className="text-center font-bold text-lg"
              style={{ color: COLORS.bg }}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.bg }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 mb-4">
          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.back();
            }}
            className="mr-4"
          >
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-black">Go Premium</Text>
        </View>

        {/* Hero */}
        <LinearGradient
          colors={["#fbbf24", "#f59e0b", "#d97706"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-6 rounded-2xl p-6 items-center mb-6"
        >
          <Text className="text-6xl mb-3">👑</Text>
          <Text
            className="text-3xl font-black mb-2"
            style={{ color: COLORS.bg }}
          >
            BigHead Premium
          </Text>
          <Text className="text-center" style={{ color: "rgba(0,0,0,0.6)" }}>
            Unlock the full potential of your quiz experience
          </Text>
        </LinearGradient>

        {/* Features */}
        <View className="px-6 mb-6">
          <Text className="text-white font-bold text-lg mb-4">
            What you get
          </Text>
          <View className="gap-3">
            {PREMIUM_FEATURES.map((feature, index) => (
              <View
                key={index}
                className="flex-row items-center p-4 rounded-xl"
                style={{ backgroundColor: COLORS.surface }}
              >
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${COLORS.gold}15` }}
                >
                  <Text className="text-2xl">{feature.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold mb-0.5">
                    {feature.title}
                  </Text>
                  <Text style={{ color: COLORS.textMuted }} className="text-sm">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Plans */}
        <View className="px-6 mb-6">
          <Text className="text-white font-bold text-lg mb-4">
            Choose your plan
          </Text>
          <View className="gap-3">
            {packages.map((pkg) => {
              const isSelected = selectedPackage === pkg.identifier;
              const isAnnual = pkg.packageType === "ANNUAL";

              return (
                <Pressable
                  key={pkg.identifier}
                  onPress={() => {
                    buttonPressFeedback();
                    setSelectedPackage(pkg.identifier);
                  }}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: isSelected ? COLORS.surface : COLORS.bg,
                    borderWidth: 2,
                    borderColor: isSelected ? COLORS.gold : COLORS.surface,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      {/* Radio */}
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{
                          borderWidth: 2,
                          borderColor: isSelected ? COLORS.gold : COLORS.textMuted,
                          backgroundColor: isSelected ? COLORS.gold : "transparent",
                        }}
                      >
                        {isSelected && (
                          <View
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS.bg }}
                          />
                        )}
                      </View>

                      <View>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-white font-bold">
                            {pkg.product.title}
                          </Text>
                          {isAnnual && (
                            <View
                              className="px-2 py-0.5 rounded"
                              style={{ backgroundColor: COLORS.green }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{ color: COLORS.bg }}
                              >
                                SAVE 50%
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={{ color: COLORS.textMuted }}
                          className="text-sm"
                        >
                          {pkg.product.description}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className="font-bold"
                      style={{ color: isSelected ? COLORS.gold : COLORS.text }}
                    >
                      {pkg.product.priceString}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Error */}
        {error && (
          <View
            className="mx-6 rounded-xl p-4 mb-4"
            style={{ backgroundColor: `${COLORS.coral}20` }}
          >
            <Text style={{ color: COLORS.coral }} className="text-center">
              {error}
            </Text>
          </View>
        )}

        {/* CTA */}
        <View className="px-6">
          <Pressable
            onPress={handlePurchase}
            disabled={purchasing || !selectedPackage}
            className="rounded-xl py-4 mb-3"
            style={{
              backgroundColor:
                purchasing || !selectedPackage ? COLORS.surfaceLight : COLORS.gold,
            }}
          >
            {purchasing ? (
              <ActivityIndicator color={COLORS.bg} />
            ) : (
              <Text
                className="text-center font-bold text-lg"
                style={{ color: COLORS.bg }}
              >
                Subscribe Now
              </Text>
            )}
          </Pressable>

          <Pressable onPress={handleRestore} className="py-3">
            <Text className="text-center" style={{ color: COLORS.textMuted }}>
              Restore Purchases
            </Text>
          </Pressable>

          {/* Terms */}
          <Text
            className="text-center text-xs mt-4 px-4"
            style={{ color: COLORS.textMuted }}
          >
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Subscriptions auto-renew unless canceled at least 24 hours before the
            end of the current period.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
