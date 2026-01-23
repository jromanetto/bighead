import "../global.css";
import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../src/contexts/AuthContext";
import { LanguageProvider } from "../src/contexts/LanguageContext";
import { soundService } from "../src/services/sounds";
import { AnimatedSplash } from "../src/components/AnimatedSplash";

// Keep the native splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Initialize sound service on app start
  useEffect(() => {
    async function prepare() {
      try {
        soundService.initialize();
        soundService.preload();
      } catch (e) {
        console.warn(e);
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
      <SafeAreaProvider>
        <AuthProvider>
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
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
