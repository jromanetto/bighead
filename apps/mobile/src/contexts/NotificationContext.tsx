import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Platform, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useAuth } from "./AuthContext";
import { supabase } from "../services/supabase";

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  lastNotification: Notifications.Notification | null;
  isInitialized: boolean;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  scheduleDailyReminder: (hour?: number, minute?: number) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const { user, isInitialized: authInitialized } = useAuth();

  // Register for push notifications
  const registerForPushNotifications = async (): Promise<string | null> => {
    // Skip on web or non-device
    if (Platform.OS === "web") {
      console.log("Push notifications not supported on web");
      return null;
    }

    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      setPermissionStatus(existingStatus);

      // Request if not granted
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        setPermissionStatus(status);
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return null;
      }

      // Get project ID
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error("Missing EAS project ID");
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log("Push token obtained:", tokenData.data);

      // Setup Android channels
      if (Platform.OS === "android") {
        await setupAndroidChannels();
      }

      return tokenData.data;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  };

  // Setup Android notification channels
  const setupAndroidChannels = async () => {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00c2cc",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Rappels",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00c2cc",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("social", {
      name: "Duels & Amis",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00c2cc",
      sound: "default",
    });
  };

  // Save token to database
  const savePushToken = async (userId: string, token: string) => {
    try {
      const { error } = await (supabase.from("users") as any)
        .update({
          push_token: token,
          push_token_updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error saving push token:", error);
      }
    } catch (error) {
      console.error("Error saving push token:", error);
    }
  };

  // Public: Request permission
  const requestPermission = async (): Promise<boolean> => {
    const token = await registerForPushNotifications();
    if (token) {
      setExpoPushToken(token);
      if (user?.id) {
        await savePushToken(user.id, token);
      }
      return true;
    }
    return false;
  };

  // Public: Send test notification
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test BIGHEAD",
        body: "Les notifications fonctionnent parfaitement !",
        sound: true,
        data: { type: "test" },
      },
      trigger: null,
    });
  };

  // Public: Schedule daily reminder
  const scheduleDailyReminder = async (hour: number = 19, minute: number = 0) => {
    // Cancel existing daily reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === "daily_reminder") {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // Schedule new one
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "C'est l'heure du quiz !",
        body: "Ton defi quotidien t'attend +100 XP bonus !",
        sound: true,
        data: { type: "daily_reminder", screen: "/game/daily" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: Platform.OS === "android" ? "reminders" : undefined,
      },
    });
  };

  // Public: Cancel all notifications
  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  };

  // Initialize on mount
  useEffect(() => {
    if (Platform.OS === "web") {
      setIsInitialized(true);
      return;
    }

    const init = async () => {
      const token = await registerForPushNotifications();
      if (token) {
        setExpoPushToken(token);
      }
      setIsInitialized(true);
    };

    init();

    // Notification received listener
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification.request.content);
        setLastNotification(notification);
      }
    );

    // User tapped notification listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log("User tapped notification:", data);

        // Handle deep linking based on notification type
        if (data?.type === "daily_question") {
          // Navigate to daily brain with the question from notification
          setTimeout(() => {
            router.push({
              pathname: "/daily",
              params: { fromNotification: "true" },
            } as any);
          }, 100);
        } else if (data?.type === "daily_reminder") {
          // Navigate to daily brain without specific question
          setTimeout(() => {
            router.push("/daily" as any);
          }, 100);
        } else if (data?.screen) {
          setTimeout(() => {
            router.push(data.screen as any);
          }, 100);
        }
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Save token when user is authenticated
  useEffect(() => {
    if (expoPushToken && user?.id && authInitialized) {
      savePushToken(user.id, expoPushToken);
    }
  }, [expoPushToken, user?.id, authInitialized]);

  const value: NotificationContextType = {
    expoPushToken,
    permissionStatus,
    lastNotification,
    isInitialized,
    requestPermission,
    sendTestNotification,
    scheduleDailyReminder,
    cancelAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
