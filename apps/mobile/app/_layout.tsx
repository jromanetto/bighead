import "../global.css";
import * as Sentry from "@sentry/react-native";

// Sentry DSN read here at module load (cheap), but Sentry.init() is deferred
// to AFTER first paint via requestAnimationFrame inside RootLayout.
// Trade-off: errors thrown DURING the very first ~16ms before init are not
// captured. We still keep Sentry.wrap(RootLayout) below so the error boundary
// is registered at root. Saves ~150-300ms of cold-start JS work on each launch.
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, LogBox } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../src/contexts/AuthContext";
import { LanguageProvider } from "../src/contexts/LanguageContext";
import { NotificationProvider } from "../src/contexts/NotificationContext";
import { soundService } from "../src/services/sounds";
import { AnimatedSplash } from "../src/components/AnimatedSplash";

// Ignore warnings in development (Expo Go shows a banner for any warning)
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

// Keep the native splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Defer Sentry init to AFTER first paint to keep cold-start JS work minimal.
  // requestAnimationFrame fires after the renderer has committed at least once.
  useEffect(() => {
    if (!SENTRY_DSN) return;
    const raf = requestAnimationFrame(() => {
      Sentry.init({
        dsn: SENTRY_DSN,
        enabled: !__DEV__,
        debug: __DEV__,
        tracesSampleRate: 0.2,
        environment: __DEV__ ? "development" : "production",
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Initialize sound service on app start
  useEffect(() => {
    async function prepare() {
      try {
        soundService.initialize();
        soundService.preload();
      } catch {
        // Sound initialization failed silently - sounds are optional
      } finally {
        // Delay to ensure splash component mounts first
        await new Promise(resolve => setTimeout(resolve, 50));
        setAppIsReady(true);
      }
    }

    prepare();

    return () => {
      soundService.cleanup();
    };
  }, []);

  // Hide native splash when app is ready
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleAnimationEnd = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationProvider>
            <LanguageProvider>
              <BottomSheetModalProvider>
                <StatusBar style="light" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
                {showAnimatedSplash && (
                  <AnimatedSplash onAnimationEnd={handleAnimationEnd} />
                )}
              </BottomSheetModalProvider>
            </LanguageProvider>
          </NotificationProvider>
        </AuthProvider>
      </SafeAreaProvider>
      </Sentry.ErrorBoundary>
    </GestureHandlerRootView>
  );
}

/**
 * Branded fallback for the root Sentry.ErrorBoundary. Previously an uncaught
 * render error left only Sentry.wrap's default (a blank screen in prod). This
 * gives the user a recovery path; Sentry still captures the error automatically.
 */
function ErrorFallback({ resetError }: { error: unknown; resetError: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        backgroundColor: "#111827",
      }}
    >
      <Text style={{ fontSize: 48 }}>🤯</Text>
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#f9fafb", textAlign: "center" }}>
        Oups, un bug nous a pris de court
      </Text>
      <Text style={{ fontSize: 15, color: "#9ca3af", textAlign: "center", maxWidth: 300 }}>
        Une erreur inattendue est survenue. Réessaie pour repartir.
      </Text>
      <Pressable
        onPress={resetError}
        style={{
          marginTop: 8,
          paddingVertical: 12,
          paddingHorizontal: 28,
          backgroundColor: "#0ea5e9",
          borderRadius: 14,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>Réessayer</Text>
      </Pressable>
    </View>
  );
}

export default Sentry.wrap(RootLayout);
