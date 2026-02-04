// Contact Modal component
// Simple contact form that sends email

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
  Linking,
  Alert,
} from "react-native";
import { playHaptic } from "../utils/feedback";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  text: "#ffffff",
  textMuted: "#9ca3af",
  textDim: "#6b7280",
};

const SUPPORT_EMAIL = "contact@jrmanagement.org";

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ContactModal({ visible, onClose }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Message requis", "Écris ton message avant d'envoyer.");
      return;
    }

    playHaptic("medium");
    setLoading(true);

    // Build email body
    const subject = encodeURIComponent("Contact BIGHEAD");
    const body = encodeURIComponent(
      `Nom: ${name || "Non renseigné"}\nEmail: ${email || "Non renseigné"}\n\nMessage:\n${message}`
    );

    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        setSent(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        Alert.alert(
          "Erreur",
          `Impossible d'ouvrir l'app mail. Contacte-nous à ${SUPPORT_EMAIL}`
        );
      }
    } catch (error) {
      console.error("Error opening mail:", error);
      Alert.alert(
        "Erreur",
        `Impossible d'ouvrir l'app mail. Contacte-nous à ${SUPPORT_EMAIL}`
      );
    }

    setLoading(false);
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setMessage("");
    setSent(false);
    setLoading(false);
    onClose();
  };

  const renderForm = () => (
    <>
      <Text className="text-3xl text-center mb-2">✉️</Text>
      <Text
        className="text-xl font-bold text-center mb-1"
        style={{ color: COLORS.text }}
      >
        Nous contacter
      </Text>
      <Text
        className="text-center mb-4"
        style={{ color: COLORS.textMuted }}
      >
        Une question ? Un problème ? Écris-nous !
      </Text>

      {/* Name field */}
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ton nom (optionnel)"
        placeholderTextColor={COLORS.textDim}
        className="rounded-xl p-4 mb-3"
        style={{
          backgroundColor: COLORS.surfaceLight,
          color: COLORS.text,
        }}
      />

      {/* Email field */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Ton email (optionnel)"
        placeholderTextColor={COLORS.textDim}
        keyboardType="email-address"
        autoCapitalize="none"
        className="rounded-xl p-4 mb-3"
        style={{
          backgroundColor: COLORS.surfaceLight,
          color: COLORS.text,
        }}
      />

      {/* Message field */}
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Ton message..."
        placeholderTextColor={COLORS.textDim}
        multiline
        numberOfLines={4}
        className="rounded-xl p-4 mb-4"
        style={{
          backgroundColor: COLORS.surfaceLight,
          color: COLORS.text,
          minHeight: 100,
          textAlignVertical: "top",
        }}
      />

      <Pressable
        onPress={handleSubmit}
        disabled={loading || !message.trim()}
        className="py-3 px-6 rounded-xl"
        style={{
          backgroundColor: message.trim() ? COLORS.primary : COLORS.surfaceLight,
          opacity: message.trim() ? 1 : 0.5,
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
          Annuler
        </Text>
      </Pressable>
    </>
  );

  const renderSent = () => (
    <>
      <Text className="text-5xl text-center mb-4">📬</Text>
      <Text
        className="text-2xl font-bold text-center mb-2"
        style={{ color: COLORS.text }}
      >
        Message prêt !
      </Text>
      <Text
        className="text-center"
        style={{ color: COLORS.textMuted }}
      >
        Ton app mail s'est ouverte avec le message. Envoie-le !
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
            {sent ? renderSent() : renderForm()}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
