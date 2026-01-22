import React, { useCallback, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useAuth } from "../contexts/AuthContext";

export interface AuthModalRef {
  open: (mode?: "login" | "signup") => void;
  close: () => void;
}

interface AuthModalProps {
  onSuccess?: () => void;
}

export const AuthModal = forwardRef<AuthModalRef, AuthModalProps>(
  ({ onSuccess }, ref) => {
    const { signInWithEmail, signUpWithEmail, upgradeAnonymousAccount, isAnonymous, isLoading } = useAuth();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["70%"], []);

    useImperativeHandle(ref, () => ({
      open: (initialMode = "login") => {
        setMode(initialMode);
        setError(null);
        setEmail("");
        setPassword("");
        setUsername("");
        bottomSheetRef.current?.expand();
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
    }));

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const validateForm = (): boolean => {
      if (!email.trim()) {
        setError("Email requis");
        return false;
      }
      if (!email.includes("@")) {
        setError("Email invalide");
        return false;
      }
      if (password.length < 6) {
        setError("6 caractères minimum pour le mot de passe");
        return false;
      }
      if (mode === "signup" && username.trim().length < 3) {
        setError("3 caractères minimum pour le pseudo");
        return false;
      }
      return true;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      setIsSubmitting(true);
      setError(null);

      try {
        if (mode === "login") {
          await signInWithEmail(email, password);
        } else {
          // If anonymous, upgrade the account; otherwise create new
          if (isAnonymous) {
            await upgradeAnonymousAccount(email, password, username);
          } else {
            await signUpWithEmail(email, password, username);
          }
        }

        bottomSheetRef.current?.close();
        onSuccess?.();
      } catch (err: any) {
        console.error("Auth error:", err);

        // Map Supabase errors to user-friendly messages
        if (err.message?.includes("Invalid login credentials")) {
          setError("Email ou mot de passe incorrect");
        } else if (err.message?.includes("User already registered")) {
          setError("Cet email est déjà utilisé");
        } else if (err.message?.includes("Email rate limit")) {
          setError("Trop de tentatives, réessaie plus tard");
        } else {
          setError(err.message || "Une erreur est survenue");
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const isFormDisabled = isSubmitting || isLoading;

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: "#1f2937" }}
        handleIndicatorStyle={{ backgroundColor: "#6b7280" }}
      >
        <BottomSheetView className="flex-1 px-6 pt-2">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            {/* Tabs */}
            <View className="flex-row mb-6">
              <Pressable
                onPress={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`flex-1 py-3 rounded-l-xl ${
                  mode === "login" ? "bg-primary-500" : "bg-gray-700"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    mode === "login" ? "text-white" : "text-gray-400"
                  }`}
                >
                  Connexion
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`flex-1 py-3 rounded-r-xl ${
                  mode === "signup" ? "bg-primary-500" : "bg-gray-700"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    mode === "signup" ? "text-white" : "text-gray-400"
                  }`}
                >
                  Inscription
                </Text>
              </Pressable>
            </View>

            {/* Error message */}
            {error && (
              <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
                <Text className="text-red-400 text-center">{error}</Text>
              </View>
            )}

            {/* Form */}
            <View className="gap-4">
              {mode === "signup" && (
                <View>
                  <Text className="text-gray-400 mb-2">Pseudo</Text>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Ton pseudo"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                    editable={!isFormDisabled}
                    className="bg-gray-700 text-white px-4 py-3 rounded-xl text-base"
                  />
                </View>
              )}

              <View>
                <Text className="text-gray-400 mb-2">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ton@email.com"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isFormDisabled}
                  className="bg-gray-700 text-white px-4 py-3 rounded-xl text-base"
                />
              </View>

              <View>
                <Text className="text-gray-400 mb-2">Mot de passe</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#6b7280"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isFormDisabled}
                  className="bg-gray-700 text-white px-4 py-3 rounded-xl text-base"
                />
              </View>

              {/* Submit button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isFormDisabled}
                className={`py-4 rounded-xl mt-2 ${
                  isFormDisabled ? "bg-primary-500/50" : "bg-primary-500 active:opacity-80"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    {mode === "login" ? "Se connecter" : "Créer mon compte"}
                  </Text>
                )}
              </Pressable>

              {/* Forgot password (login only) */}
              {mode === "login" && (
                <Pressable className="mt-2">
                  <Text className="text-gray-400 text-center">
                    Mot de passe oublié ?
                  </Text>
                </Pressable>
              )}
            </View>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AuthModal.displayName = "AuthModal";
