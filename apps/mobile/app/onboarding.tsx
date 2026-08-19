import { View, Text, Pressable, Dimensions, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useAuth } from "../src/contexts/AuthContext";
import { useTranslation } from "../src/contexts/LanguageContext";
import { completeOnboarding } from "../src/services/settings";
import { redeemReferralCode } from "../src/services/referral";
import { claimMilestone } from "../src/services/universalXp";
import { logEvent } from "../src/services/analytics";
import { playHaptic } from "../src/utils/feedback";
import { COLORS } from "../src/theme/colors";
import { THEME_OPTIONS, saveFavThemes } from "../src/utils/favThemes";
import { ModeIcon, type ModeIconName } from "../src/components/icons/ModeIcon";
import { ResultIcon } from "../src/components/icons/ResultIcon";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { user, updateUsername } = useAuth();
  const { t, language } = useTranslation();
  const lang = language === "fr" ? "fr" : "en";
  const L = (fr: string, en: string) => (lang === "fr" ? fr : en);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [step, setStep] = useState<"slides" | "themes" | "username" | "referral">("slides");
  const [referralCode, setReferralCode] = useState("");
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralSuccess, setReferralSuccess] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const translateX = useSharedValue(0);

  // Slides value-first : la valeur, l'habitude quotidienne (série), le social.
  const slides: { iconSet: "result" | "mode"; iconName: string; color: string; title: string; description: string }[] = [
    { iconSet: "result", iconName: "brain", color: "#00c2cc", title: L("Bienvenue sur BigHead", "Welcome to BigHead"), description: L("Une question de culture générale par jour. Deviens incollable, un jour à la fois.", "One general-knowledge question a day. Get sharper, one day at a time.") },
    { iconSet: "mode", iconName: "streak", color: "#f97316", title: L("Une question par jour", "One question a day"), description: L("Réponds chaque jour, garde ta série et grimpe dans ta ligue.", "Answer daily, keep your streak and climb your league.") },
    { iconSet: "mode", iconName: "duel", color: "#a880ff", title: L("Défie tes amis", "Challenge your friends"), description: L("Duels, clubs, party entre potes — la culture G devient un jeu.", "Duels, clubs, party with friends — trivia becomes a game.") },
  ];

  const goToSlide = (index: number) => {
    playHaptic("light");
    translateX.value = withSpring(-index * width, { damping: 20 });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) goToSlide(currentIndex + 1);
    else setStep("themes");
  };

  const toggleTheme = (id: string) => {
    playHaptic("light");
    setSelectedThemes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleThemesNext = async () => {
    playHaptic("light");
    await saveFavThemes(selectedThemes);
    logEvent("onboarding_themes_picked", { count: selectedThemes.length }, user?.id);
    setStep("username");
  };

  const handleUsernameNext = async () => {
    playHaptic("light");
    if (username.trim().length >= 2) {
      try {
        await updateUsername(username.trim());
      } catch (error) {
        console.error("Error saving username:", error);
      }
    }
    setStep("referral");
  };

  const mapRedeemError = (err: string): string => {
    switch (err) {
      case "code_not_found":
      case "invalid_code":
        return t("referralErrorInvalid");
      case "self_referral":
        return t("referralErrorSelf");
      case "already_redeemed":
        return t("referralErrorAlready");
      default:
        return t("referralErrorUnknown");
    }
  };

  const handleRedeem = async () => {
    const code = referralCode.trim();
    if (code.length < 4) {
      setReferralError(t("referralErrorInvalid"));
      return;
    }
    setRedeeming(true);
    setReferralError(null);
    try {
      const result = await redeemReferralCode(code);
      if (result.success) {
        playHaptic("success");
        setReferralSuccess(true);
      } else {
        playHaptic("error");
        setReferralError(mapRedeemError(result.error));
      }
    } finally {
      setRedeeming(false);
    }
  };

  const finishOnboarding = async () => {
    playHaptic("success");
    try {
      await completeOnboarding(user?.id);
      logEvent("onboarding_completed", { username_set: username.trim().length >= 2, referral_redeemed: referralSuccess, themes: selectedThemes.length }, user?.id);
      claimMilestone("onboarding_complete").catch(() => {});
    } catch (error) {
      console.error("Error finishing onboarding:", error);
    } finally {
      // Activation : on lâche le nouveau joueur DANS une partie (Daily Brain).
      router.replace("/daily");
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  // ---------- Étape THÈMES ----------
  if (step === "themes") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-6">
          <View className="items-center mt-8 mb-6">
            <View className="mb-4"><ResultIcon name="sparkle" color={COLORS.primary} size={48} /></View>
            <Text className="text-white text-2xl font-black text-center mb-2">
              {L("Qu'est-ce qui te branche ?", "What are you into?")}
            </Text>
            <Text className="text-gray-400 text-center px-4">
              {L("Choisis tes thèmes préférés — on te les servira en priorité.", "Pick your favorite topics — we'll serve them first.")}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-4">
            <View className="flex-row flex-wrap justify-center" style={{ gap: 10 }}>
              {THEME_OPTIONS.map((o) => {
                const on = selectedThemes.includes(o.id);
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => toggleTheme(o.id)}
                    className="rounded-2xl px-4 py-3 flex-row items-center active:opacity-80"
                    style={{ gap: 8, backgroundColor: on ? COLORS.primaryDim : COLORS.surface, borderWidth: 1.5, borderColor: on ? COLORS.primary : "rgba(255,255,255,0.06)" }}
                    accessibilityRole="button"
                    accessibilityLabel={o[lang]}
                  >
                    <Text style={{ fontSize: 18 }}>{o.emoji}</Text>
                    <Text className="font-bold" style={{ color: on ? COLORS.primary : COLORS.text }}>{o[lang]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View className="pb-6 pt-2">
            <Pressable onPress={handleThemesNext} className="rounded-2xl py-4" style={{ backgroundColor: COLORS.primary }}>
              <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
                {selectedThemes.length > 0 ? L("Continuer", "Continue") : L("Passer", "Skip")}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Étape PSEUDO ----------
  if (step === "username") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-8 justify-center">
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: COLORS.primaryDim }}>
              <ResultIcon name="person" color={COLORS.primary} size={44} />
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-2">
              {L("Comment on t'appelle ?", "What's your name?")}
            </Text>
            <Text className="text-gray-400 text-center">
              {L("Un pseudo pour le classement", "A username for the leaderboard")}
            </Text>
          </View>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder={L("Entre ton pseudo", "Enter your username")}
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            maxLength={20}
            className="text-white text-xl text-center rounded-2xl px-6 py-4 mb-8"
            style={{ backgroundColor: COLORS.surface }}
          />

          <Pressable onPress={handleUsernameNext} className="rounded-2xl py-4 mb-4" style={{ backgroundColor: COLORS.primary }}>
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              {username.trim().length >= 2 ? L("C'est parti !", "Let's go!") : L("Plus tard", "Skip for now")}
            </Text>
          </Pressable>

          {username.trim().length < 2 && (
            <Text className="text-gray-500 text-center text-sm">
              {L("Tu pourras le définir plus tard dans ton profil", "You can set your username later in your profile")}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Étape PARRAINAGE ----------
  if (step === "referral") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-1 px-8 justify-center">
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: COLORS.primaryDim }}>
              <ResultIcon name="gift" color={COLORS.primary} size={44} />
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-2">{t("referralEnterCode")}</Text>
            <Text className="text-gray-400 text-center px-4">{t("referralReward")}</Text>
          </View>

          {referralSuccess ? (
            <>
              <View className="rounded-2xl px-6 py-4 mb-6" style={{ backgroundColor: COLORS.primaryDim }}>
                <Text className="text-center font-semibold" style={{ color: COLORS.primary }}>{t("referralApplied")}</Text>
              </View>
              <Pressable onPress={finishOnboarding} className="rounded-2xl py-4" style={{ backgroundColor: COLORS.primary }}>
                <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>{L("C'est parti !", "Let's go!")}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <TextInput
                value={referralCode}
                onChangeText={(v) => { setReferralCode(v.toUpperCase()); if (referralError) setReferralError(null); }}
                placeholder={t("referralEnterPlaceholder")}
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                className="text-white text-xl text-center rounded-2xl px-6 py-4 mb-3"
                style={{ backgroundColor: COLORS.surface, letterSpacing: 2 }}
              />
              {referralError && <Text className="text-red-400 text-center text-sm mb-3">{referralError}</Text>}
              <Pressable
                onPress={handleRedeem}
                disabled={redeeming || referralCode.trim().length < 4}
                className="rounded-2xl py-4 mb-3"
                style={{ backgroundColor: COLORS.primary, opacity: redeeming || referralCode.trim().length < 4 ? 0.5 : 1 }}
              >
                <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>{redeeming ? "..." : t("referralRedeem")}</Text>
              </Pressable>
              <Pressable onPress={finishOnboarding} className="py-3">
                <Text className="text-center text-gray-400">{t("referralSkip")}</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ---------- SLIDES ----------
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-1">
        <View className="flex-row justify-end px-6 pt-4">
          <Pressable onPress={() => setStep("themes")} className="p-2">
            <Text className="text-gray-400">{L("Passer", "Skip")}</Text>
          </Pressable>
        </View>

        <View className="flex-1 overflow-hidden">
          <Animated.View style={[{ flexDirection: "row", width: width * slides.length }, animatedStyle]}>
            {slides.map((slide, index) => (
              <View key={index} style={{ width }} className="flex-1 items-center justify-center px-8">
                <View className="w-32 h-32 rounded-full items-center justify-center mb-8" style={{ backgroundColor: `${slide.color}20` }}>
                  {slide.iconSet === "result"
                    ? <ResultIcon name={slide.iconName as any} color={slide.color} size={60} />
                    : <ModeIcon name={slide.iconName as ModeIconName} color={slide.color} size={56} />}
                </View>
                <Text className="text-white text-2xl font-black text-center mb-4">{slide.title}</Text>
                <Text className="text-gray-400 text-center text-lg leading-7">{slide.description}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        <View className="flex-row justify-center mb-8">
          {slides.map((_, index) => (
            <Pressable key={index} onPress={() => goToSlide(index)} className="p-2">
              <View className="h-2 rounded-full" style={{ width: index === currentIndex ? 24 : 8, backgroundColor: index === currentIndex ? COLORS.primary : "#4b5563" }} />
            </Pressable>
          ))}
        </View>

        <View className="px-6 pb-6">
          <Pressable onPress={handleNext} className="rounded-xl py-4" style={{ backgroundColor: COLORS.primary }}>
            <Text className="text-center font-bold text-lg" style={{ color: COLORS.bg }}>
              {currentIndex === slides.length - 1 ? L("Continuer", "Continue") : L("Suivant", "Next")}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
