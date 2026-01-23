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
  grantPremiumToUser,
} from "../src/services/monetization";
import { buttonPressFeedback, playHaptic } from "../src/utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryGlow: "#00e5f0",
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
    icon: "⚔️",
    title: "Duel 1v1",
    description: "Challenge friends in real-time battles",
    color: COLORS.coral,
  },
  {
    icon: "⊘",
    title: "No Ads",
    description: "Pure quiz experience without interruptions",
    color: COLORS.primary,
  },
  {
    icon: "∞",
    title: "Unlimited Lives",
    description: "Play as much as you want, no limits",
    color: COLORS.purple,
  },
  {
    icon: "🎨",
    title: "Exclusive Themes",
    description: "Unlock all visual themes",
    color: COLORS.yellow,
  },
  {
    icon: "📊",
    title: "Advanced Stats",
    description: "Track your progress with detailed analytics",
    color: COLORS.green,
  },
  {
    icon: "⚡",
    title: "Early Access",
    description: "Get new features before anyone else",
    color: COLORS.gold,
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

// Brain Logo Component
function BrainLogo({ size = 80 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size * 0.9, position: 'relative' }}>
      {/* Left hemisphere */}
      <View style={{ position: 'absolute', left: size * 0.05, top: size * 0.05, width: size * 0.4, height: size * 0.75 }}>
        <View style={{ position: 'absolute', width: size * 0.35, height: size * 0.3, borderRadius: size * 0.15, backgroundColor: COLORS.gold, opacity: 0.4, top: 0, left: size * 0.04 }} />
        <View style={{ position: 'absolute', width: size * 0.3, height: size * 0.25, borderRadius: size * 0.12, backgroundColor: COLORS.gold, opacity: 0.4, top: size * 0.42, left: size * 0.08 }} />
        <View style={{ position: 'absolute', width: size * 0.25, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: COLORS.gold, opacity: 0.4, top: size * 0.22, left: 0 }} />
      </View>
      {/* Right hemisphere */}
      <View style={{ position: 'absolute', right: size * 0.05, top: size * 0.05, width: size * 0.4, height: size * 0.75 }}>
        <View style={{ position: 'absolute', width: size * 0.35, height: size * 0.3, borderRadius: size * 0.15, backgroundColor: COLORS.gold, opacity: 0.4, top: 0, right: size * 0.04 }} />
        <View style={{ position: 'absolute', width: size * 0.3, height: size * 0.25, borderRadius: size * 0.12, backgroundColor: COLORS.gold, opacity: 0.4, top: size * 0.42, right: size * 0.08 }} />
        <View style={{ position: 'absolute', width: size * 0.25, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: COLORS.gold, opacity: 0.4, top: size * 0.22, right: 0 }} />
      </View>
      {/* Center stem */}
      <View style={{ position: 'absolute', width: size * 0.12, height: size * 0.18, backgroundColor: COLORS.gold, opacity: 0.3, borderRadius: size * 0.06, bottom: 0, left: size * 0.44 }} />
      {/* Neural dots */}
      <View style={{ position: 'absolute', width: size * 0.05, height: size * 0.05, borderRadius: size * 0.025, backgroundColor: COLORS.gold, top: size * 0.15, left: size * 0.25 }} />
      <View style={{ position: 'absolute', width: size * 0.05, height: size * 0.05, borderRadius: size * 0.025, backgroundColor: COLORS.gold, top: size * 0.35, left: size * 0.15 }} />
      <View style={{ position: 'absolute', width: size * 0.05, height: size * 0.05, borderRadius: size * 0.025, backgroundColor: COLORS.gold, top: size * 0.55, left: size * 0.28 }} />
      <View style={{ position: 'absolute', width: size * 0.05, height: size * 0.05, borderRadius: size * 0.025, backgroundColor: COLORS.gold, top: size * 0.15, right: size * 0.25 }} />
      <View style={{ position: 'absolute', width: size * 0.05, height: size * 0.05, borderRadius: size * 0.025, backgroundColor: COLORS.gold, top: size * 0.35, right: size * 0.15 }} />
      <View style={{ position: 'absolute', width: size * 0.05, height: size * 0.05, borderRadius: size * 0.025, backgroundColor: COLORS.gold, top: size * 0.55, right: size * 0.28 }} />
    </View>
  );
}

export default function PremiumScreen() {
  const { user, refreshProfile, isPremium: isProfilePremium } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOfferings();
  }, [isProfilePremium]);

  const setDemoPackages = () => {
    setPackages([
      {
        identifier: "monthly",
        product: {
          title: "Monthly",
          description: "Billed monthly",
          priceString: "€4.99/mo",
        },
        packageType: "MONTHLY",
      },
      {
        identifier: "annual",
        product: {
          title: "Annual",
          description: "Best value - Save 50%",
          priceString: "€29.99/yr",
        },
        packageType: "ANNUAL",
      },
    ]);
    setSelectedPackage("annual");
  };

  const loadOfferings = async () => {
    try {
      if (user?.id) {
        await monetizationService.initialize(user.id);
      }

      // Check both RevenueCat and Supabase profile for premium status
      const revenueCatPremium = await isPremium();
      const premium = revenueCatPremium || isProfilePremium;
      setUserIsPremium(premium);

      if (!premium) {
        const offering = await getOfferings();
        if (offering?.availablePackages && offering.availablePackages.length > 0) {
          setPackages(offering.availablePackages as Package[]);
          const monthly = offering.availablePackages.find(
            (p: any) => p.packageType === "MONTHLY"
          );
          if (monthly) {
            setSelectedPackage(monthly.identifier);
          }
        } else {
          // Fallback to demo packages if no offerings
          setDemoPackages();
        }
      }
    } catch (err) {
      console.error("Error loading offerings:", err);
      setDemoPackages();
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

        // Sync with Supabase - determine duration based on package type
        if (user?.id) {
          const isAnnual = pkg.packageType === "ANNUAL";
          const durationDays = isAnnual ? 365 : 30;
          await grantPremiumToUser(user.id, durationDays);

          // Refresh profile to update global state
          await refreshProfile();
        }

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

        // Sync with Supabase - restore as lifetime (null = no expiration)
        // RevenueCat will manage the actual expiration
        if (user?.id) {
          await grantPremiumToUser(user.id, null);
          await refreshProfile();
        }

        setUserIsPremium(true);
      } else {
        setError("No purchases found to restore.");
      }
    } catch (err) {
      console.error("Restore error:", err);
      setError("Failed to restore purchases.");
    } finally {
      setLoading(false);
    }
  };

  // Already premium - success screen
  if (userIsPremium) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-6 items-center justify-center">
          {/* Success glow */}
          <View
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: `${COLORS.gold}15`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: `${COLORS.gold}25`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BrainLogo size={80} />
            </View>
          </View>

          <Text className="text-3xl font-black mb-2" style={{ color: COLORS.gold }}>
            You're Premium!
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-center mb-8 px-4">
            Thank you for your support. Enjoy all premium features!
          </Text>

          {/* Features unlocked */}
          <View className="w-full mb-8">
            {PREMIUM_FEATURES.slice(0, 4).map((feature, index) => (
              <View key={index} className="flex-row items-center gap-3 mb-3">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: `${feature.color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: feature.color, fontSize: 18, fontWeight: 'bold' }}>
                    {feature.icon}
                  </Text>
                </View>
                <Text className="text-white font-medium flex-1">{feature.title}</Text>
                <Text style={{ color: COLORS.green, fontSize: 18 }}>✓</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => {
              buttonPressFeedback();
              router.back();
            }}
            style={{
              width: '100%',
              backgroundColor: COLORS.gold,
              borderRadius: 16,
              paddingVertical: 16,
            }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              Continue Playing
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 mb-6">
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
          <Text className="text-white text-2xl font-black">PREMIUM</Text>
        </View>

        {/* Hero Section */}
        <View className="mx-5 mb-8">
          <LinearGradient
            colors={['#fbbf24', '#f59e0b', '#d97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
            }}
          >
            {/* Brain with glow */}
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <BrainLogo size={90} />
            </View>

            <Text className="text-4xl font-black mb-2" style={{ color: COLORS.bg }}>
              BIGHEAD
            </Text>
            <Text className="text-xl font-bold mb-3" style={{ color: 'rgba(0,0,0,0.7)' }}>
              PREMIUM
            </Text>
            <Text className="text-center" style={{ color: 'rgba(0,0,0,0.6)' }}>
              Unlock the full potential of your brain
            </Text>
          </LinearGradient>
        </View>

        {/* Features */}
        <View className="px-5 mb-8">
          <Text className="text-white font-bold text-lg mb-4 uppercase tracking-wide">
            What you get
          </Text>
          <View style={{ gap: 12 }}>
            {PREMIUM_FEATURES.map((feature, index) => (
              <View
                key={index}
                className="flex-row items-center p-4 rounded-2xl"
                style={{
                  backgroundColor: COLORS.surface,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: `${feature.color}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Text style={{ color: feature.color, fontSize: 22, fontWeight: 'bold' }}>
                    {feature.icon}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold mb-1">{feature.title}</Text>
                  <Text style={{ color: COLORS.textMuted }} className="text-sm">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Plans */}
        <View className="px-5 mb-6">
          <Text className="text-white font-bold text-lg mb-4 uppercase tracking-wide">
            Choose your plan
          </Text>
          <View style={{ gap: 12 }}>
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
                  style={{
                    padding: 20,
                    borderRadius: 16,
                    backgroundColor: isSelected ? COLORS.surface : COLORS.bg,
                    borderWidth: 2,
                    borderColor: isSelected ? COLORS.gold : COLORS.surface,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center" style={{ gap: 14 }}>
                      {/* Radio */}
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: isSelected ? COLORS.gold : COLORS.textMuted,
                          backgroundColor: isSelected ? COLORS.gold : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && (
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: COLORS.bg,
                            }}
                          />
                        )}
                      </View>

                      <View>
                        <View className="flex-row items-center" style={{ gap: 8 }}>
                          <Text className="text-white font-bold text-lg">
                            {pkg.product.title}
                          </Text>
                          {isAnnual && (
                            <View
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 6,
                                backgroundColor: COLORS.green,
                              }}
                            >
                              <Text className="text-xs font-black" style={{ color: COLORS.bg }}>
                                -50%
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ color: COLORS.textMuted }} className="text-sm">
                          {pkg.product.description}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className="font-black text-lg"
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
            className="mx-5 rounded-xl p-4 mb-4"
            style={{ backgroundColor: `${COLORS.coral}20` }}
          >
            <Text style={{ color: COLORS.coral }} className="text-center">
              {error}
            </Text>
          </View>
        )}

        {/* CTA */}
        <View className="px-5">
          <Pressable
            onPress={handlePurchase}
            disabled={purchasing || !selectedPackage}
            style={{
              borderRadius: 16,
              paddingVertical: 18,
              marginBottom: 12,
              backgroundColor: purchasing || !selectedPackage ? COLORS.surfaceLight : COLORS.gold,
              opacity: purchasing || !selectedPackage ? 0.6 : 1,
            }}
          >
            {purchasing ? (
              <ActivityIndicator color={COLORS.bg} />
            ) : (
              <Text className="text-center font-black text-lg" style={{ color: COLORS.bg }}>
                Subscribe Now
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleRestore}
            style={{ paddingVertical: 12 }}
          >
            <Text className="text-center font-medium" style={{ color: COLORS.textMuted }}>
              Restore Purchases
            </Text>
          </Pressable>

          {/* Terms */}
          <Text
            className="text-center text-xs mt-4 px-4"
            style={{ color: COLORS.textMuted, opacity: 0.7 }}
          >
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Subscriptions auto-renew unless canceled 24h before the end of the period.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
