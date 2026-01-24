import { useEffect, useRef, useState } from "react";
import { Platform, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  permissionStatus: Notifications.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  scheduleDailyReminder: (hour: number, minute: number) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const { user } = useAuth();

  // Register for push notifications
  const registerForPushNotifications = async (): Promise<string | null> => {
    // Only on physical device
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return null;
    }

    // Check/request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    setPermissionStatus(existingStatus);

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      setPermissionStatus(status);
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return null;
    }

    // Get project ID from config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.error("No EAS project ID found in app config");
      return null;
    }

    try {
      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log("Expo Push Token:", tokenData.data);

      // Configure Android channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#00c2cc",
          sound: "default",
        });

        // Channel for daily reminders
        await Notifications.setNotificationChannelAsync("reminders", {
          name: "Rappels quotidiens",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#00c2cc",
          sound: "default",
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  };

  // Save token to database
  const savePushToken = async (userId: string, token: string) => {
    try {
      const { error } = await (supabase
        .from("users") as any)
        .update({
          push_token: token,
          push_token_updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error saving push token:", error);
      } else {
        console.log("Push token saved to database");
      }
    } catch (error) {
      console.error("Error saving push token:", error);
    }
  };

  // Request permission manually
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

  // Send a test notification
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test BIGHEAD",
        body: "Les notifications fonctionnent !",
        sound: true,
        data: { type: "test" },
      },
      trigger: null, // Immediate
    });
  };

  // Schedule daily reminder
  const scheduleDailyReminder = async (hour: number = 19, minute: number = 0) => {
    // Cancel existing reminders first
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === "daily_reminder") {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // Schedule new reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "C'est l'heure du quiz !",
        body: "Ton defi quotidien t'attend. +100 XP bonus si tu le termines !",
        sound: true,
        data: { type: "daily_reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: Platform.OS === "android" ? "reminders" : undefined,
      },
    });

    console.log(`Daily reminder scheduled for ${hour}:${minute}`);
  };

  // Cancel all notifications
  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  };

  // Initialize notifications on mount
  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        setNotification(notification);
      }
    );

    // Listen for user interaction with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification response:", response);
        const data = response.notification.request.content.data;

        // Handle navigation based on notification type
        if (data?.type === "daily_challenge") {
          // Navigate to daily challenge
          // router.push("/game/daily");
        } else if (data?.type === "duel_invite") {
          // Navigate to duel
          // router.push(`/duel/${data.duelId}`);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Save token when user changes
  useEffect(() => {
    if (expoPushToken && user?.id) {
      savePushToken(user.id, expoPushToken);
    }
  }, [expoPushToken, user?.id]);

  // Handle app state changes - refresh token when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active" && !expoPushToken) {
        const token = await registerForPushNotifications();
        if (token) {
          setExpoPushToken(token);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [expoPushToken]);

  return {
    expoPushToken,
    notification,
    permissionStatus,
    requestPermission,
    sendTestNotification,
    scheduleDailyReminder,
    cancelAllNotifications,
  };
}
