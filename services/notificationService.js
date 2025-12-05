import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  try {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Schedule daily check-in reminder
export const scheduleDailyReminder = async (hour = 20, minute = 0) => {
  try {
    // Cancel existing daily reminder
    await cancelDailyReminder();

    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Daily Check-In Reminder',
        body: 'Time to log your recovery progress for today!',
        sound: true,
      },
      trigger,
    });

    console.log('✅ Daily reminder scheduled:', id);
    return id;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    throw error;
  }
};

// Cancel daily reminder
export const cancelDailyReminder = async () => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.title?.includes('Daily Check-In')) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log('✅ Cancelled daily reminder');
      }
    }
  } catch (error) {
    console.error('Error canceling daily reminder:', error);
  }
};

// Schedule medication reminder
export const scheduleMedicationReminder = async (medicationName, hour, minute) => {
  try {
    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Medication Reminder',
        body: `Time to take ${medicationName}`,
        sound: true,
      },
      trigger,
    });

    console.log('✅ Medication reminder scheduled:', id);
    return id;
  } catch (error) {
    console.error('Error scheduling medication reminder:', error);
    throw error;
  }
};

// Schedule exercise reminder
export const scheduleExerciseReminder = async (hour, minute) => {
  try {
    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏋️ Exercise Reminder',
        body: 'Time for your recovery exercises!',
        sound: true,
      },
      trigger,
    });

    console.log('✅ Exercise reminder scheduled:', id);
    return id;
  } catch (error) {
    console.error('Error scheduling exercise reminder:', error);
    throw error;
  }
};

// Get all scheduled notifications
export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

// Cancel specific notification
export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('✅ Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};