import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AuthProvider } from "../src/contexts/AuthContext";
import { soundService } from "../src/services/sounds";

export default function RootLayout() {
  // Initialize sound service on app start
  useEffect(() => {
    soundService.initialize();
    soundService.preload();

    return () => {
      soundService.cleanup();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <BottomSheetModalProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
          </BottomSheetModalProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
