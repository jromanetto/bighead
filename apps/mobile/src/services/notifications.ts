import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  // Get Expo push token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PROJECT_ID,
  });

  // Configure Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0ea5e9",
    });
  }

  return token.data;
};

/**
 * Save push token to database
 */
export const savePushToken = async (
  userId: string,
  token: string
): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .update({ push_token: token })
    .eq("id", userId);

  if (error) {
    console.error("Error saving push token:", error);
  }
};

/**
 * Schedule daily challenge reminder
 */
export const scheduleDailyReminder = async (): Promise<void> => {
  // Cancel existing reminders
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule for 7 PM every day
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎯 Défi du jour",
      body: "N'oublie pas ton défi quotidien ! +100 XP bonus t'attendent.",
      sound: true,
    },
    trigger: {
      hour: 19,
      minute: 0,
      repeats: true,
    },
  });
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Send local notification (for testing)
 */
export const sendLocalNotification = async (
  title: string,
  body: string
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // Send immediately
  });
};

/**
 * Add notification listeners
 */
export const addNotificationListeners = (
  onReceived: (notification: Notifications.Notification) => void,
  onResponseReceived: (response: Notifications.NotificationResponse) => void
) => {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    onReceived
  );

  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener(onResponseReceived);

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Get badge count
 */
export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync();
};

/**
 * Set badge count
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};
