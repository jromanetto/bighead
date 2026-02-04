// Rating Modal component
// Shows star rating and feedback form

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from "react-native-reanimated";
import { requestStoreReview, submitFeedback, markAsDismissed } from "../services/rating";
import { playHaptic } from "../utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  gold: "#FFD700",
  goldDim: "rgba(255, 215, 0, 0.2)",
  text: "#ffffff",
  textMuted: "#9ca3af",
  textDim: "#6b7280",
};

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
}

type ModalStep = "rating" | "feedback" | "thanks";

export function RatingModal({ visible, onClose }: RatingModalProps) {
  const [step, setStep] = useState<ModalStep>("rating");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation values for stars
  const starScales = [
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
  ];

  const handleStarPress = (starIndex: number) => {
    playHaptic("light");
    const newRating = starIndex + 1;
    setRating(newRating);

    // Animate the pressed star
    starScales[starIndex].value = withSequence(
      withSpring(1.3, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return;

    playHaptic("medium");
    setLoading(true);

    if (rating === 5) {
      // 5 stars - open App Store
      const success = await requestStoreReview();
      setLoading(false);
      if (success) {
        setStep("thanks");
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        // Fallback if store review not available
        setStep("thanks");
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } else {
      // < 5 stars - show feedback form
      setLoading(false);
      setStep("feedback");
    }
  };

  const handleSubmitFeedback = async () => {
    playHaptic("medium");
    setLoading(true);

    await submitFeedback(rating, feedback);

    setLoading(false);
    setStep("thanks");
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleSkipFeedback = async () => {
    playHaptic("light");
    await markAsDismissed();
    handleClose();
  };

  const handleClose = () => {
    // Reset state
    setStep("rating");
    setRating(0);
    setFeedback("");
    setLoading(false);
    onClose();
  };

  // Animated styles for each star (must be at top level, not in loop)
  const starStyle0 = useAnimatedStyle(() => ({ transform: [{ scale: starScales[0].value }] }));
  const starStyle1 = useAnimatedStyle(() => ({ transform: [{ scale: starScales[1].value }] }));
  const starStyle2 = useAnimatedStyle(() => ({ transform: [{ scale: starScales[2].value }] }));
  const starStyle3 = useAnimatedStyle(() => ({ transform: [{ scale: starScales[3].value }] }));
  const starStyle4 = useAnimatedStyle(() => ({ transform: [{ scale: starScales[4].value }] }));
  const starStyles = [starStyle0, starStyle1, starStyle2, starStyle3, starStyle4];

  const renderStars = () => {
    return (
      <View className="flex-row justify-center gap-2 my-6">
        {[0, 1, 2, 3, 4].map((index) => {
          const isFilled = index < rating;

          return (
            <Pressable key={index} onPress={() => handleStarPress(index)}>
              <Animated.View
                style={starStyles[index]}
                className="w-12 h-12 items-center justify-center"
              >
                <Text
                  className="text-4xl"
                  style={{ color: isFilled ? COLORS.gold : COLORS.textDim }}
                >
                  {isFilled ? "★" : "☆"}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderRatingStep = () => (
    <>
      <Text className="text-3xl text-center mb-2">🎮</Text>
      <Text
        className="text-xl font-bold text-center mb-1"
        style={{ color: COLORS.text }}
      >
        Tu aimes BIGHEAD ?
      </Text>
      <Text
        className="text-center mb-4"
        style={{ color: COLORS.textMuted }}
      >
        Dis-nous ce que tu en penses !
      </Text>

      {renderStars()}

      <Pressable
        onPress={handleSubmitRating}
        disabled={rating === 0 || loading}
        className="py-3 px-6 rounded-xl mt-2"
        style={{
          backgroundColor: rating > 0 ? COLORS.primary : COLORS.surfaceLight,
          opacity: rating === 0 ? 0.5 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-center text-base">
            Envoyer
          </Text>
        )}
      </Pressable>

      <Pressable onPress={handleClose} className="py-3 mt-2">
        <Text className="text-center" style={{ color: COLORS.textMuted }}>
          Plus tard
        </Text>
      </Pressable>
    </>
  );

  const renderFeedbackStep = () => (
    <>
      <Text className="text-3xl text-center mb-2">💭</Text>
      <Text
        className="text-xl font-bold text-center mb-1"
        style={{ color: COLORS.text }}
      >
        Que pouvons-nous améliorer ?
      </Text>
      <Text
        className="text-center mb-4"
        style={{ color: COLORS.textMuted }}
      >
        Ton avis nous aide à nous améliorer
      </Text>

      <TextInput
        value={feedback}
        onChangeText={setFeedback}
        placeholder="Écris ton commentaire ici..."
        placeholderTextColor={COLORS.textDim}
        multiline
        numberOfLines={4}
        className="rounded-xl p-4 mb-4"
        style={{
          backgroundColor: COLORS.surfaceLight,
          color: COLORS.text,
          minHeight: 120,
          textAlignVertical: "top",
        }}
      />

      <Pressable
        onPress={handleSubmitFeedback}
        disabled={loading}
        className="py-3 px-6 rounded-xl"
        style={{ backgroundColor: COLORS.primary }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-center text-base">
            Envoyer le feedback
          </Text>
        )}
      </Pressable>

      <Pressable onPress={handleSkipFeedback} className="py-3 mt-2">
        <Text className="text-center" style={{ color: COLORS.textMuted }}>
          Passer pour l'instant
        </Text>
      </Pressable>
    </>
  );

  const renderThanksStep = () => (
    <>
      <Text className="text-5xl text-center mb-4">🎉</Text>
      <Text
        className="text-2xl font-bold text-center mb-2"
        style={{ color: COLORS.text }}
      >
        Merci !
      </Text>
      <Text
        className="text-center"
        style={{ color: COLORS.textMuted }}
      >
        {rating === 5
          ? "Merci pour ton soutien !"
          : "Ton feedback a été envoyé"}
      </Text>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onPress={handleClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-11/12 max-w-sm rounded-3xl p-6"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            {step === "rating" && renderRatingStep()}
            {step === "feedback" && renderFeedbackStep()}
            {step === "thanks" && renderThanksStep()}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
