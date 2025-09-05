import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  type: 'new_match' | 'new_message' | 'daily_matches' | 'verification_update';
  title: string;
  body: string;
  data?: any;
}

export const registerForPushNotifications = async (): Promise<string | null> => {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return null;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
};

export const savePushToken = async (userId: string, token: string) => {
  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert({ user_id: userId, push_token: token }, { onConflict: 'user_id' });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const sendPushNotification = async (
  expoPushToken: string,
  notificationData: NotificationData
) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: notificationData.title,
    body: notificationData.body,
    data: notificationData.data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    return { success: false, error };
  }
};

export const scheduleLocalNotification = async (notificationData: NotificationData, trigger?: Notifications.NotificationTriggerInput) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data,
      },
      trigger: trigger || null,
    });
    
    return { success: true, id };
  } catch (error) {
    return { success: false, error };
  }
};

// Notification templates
export const NotificationTemplates = {
  newMatch: (matchName: string): NotificationData => ({
    type: 'new_match',
    title: '💕 New Match!',
    body: `You have a new match with ${matchName}!`,
    data: { type: 'new_match' },
  }),

  newMessage: (senderName: string, message: string): NotificationData => ({
    type: 'new_message',
    title: `💬 ${senderName}`,
    body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
    data: { type: 'new_message' },
  }),

  dailyMatches: (count: number): NotificationData => ({
    type: 'daily_matches',
    title: '🔥 New Matches Available!',
    body: `${count} new potential matches are waiting for you!`,
    data: { type: 'daily_matches' },
  }),

  verificationApproved: (): NotificationData => ({
    type: 'verification_update',
    title: '✅ Verification Approved!',
    body: 'Your profile is now verified. Start getting more matches!',
    data: { type: 'verification_approved' },
  }),

  verificationRejected: (): NotificationData => ({
    type: 'verification_update',
    title: '❌ Verification Rejected',
    body: 'Please submit a new verification photo.',
    data: { type: 'verification_rejected' },
  }),
};