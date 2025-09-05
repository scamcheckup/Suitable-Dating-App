import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import { 
  registerForPushNotifications, 
  savePushToken,
  scheduleLocalNotification,
  NotificationTemplates 
} from '@/lib/notifications';

interface NotificationContextType {
  pushToken: string | null;
  sendLocalNotification: (type: string, data?: any) => void;
  scheduleDailyMatchReminder: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  pushToken: null,
  sendLocalNotification: () => {},
  scheduleDailyMatchReminder: () => {},
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setupNotifications();
    }
  }, [user]);

  const setupNotifications = async () => {
    try {
      const token = await registerForPushNotifications();
      if (token && user) {
        setPushToken(token);
        await savePushToken(user.id, token);
      }
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  const sendLocalNotification = async (type: string, data?: any) => {
    let notificationData;

    switch (type) {
      case 'new_match':
        notificationData = NotificationTemplates.newMatch(data?.matchName || 'Someone');
        break;
      case 'new_message':
        notificationData = NotificationTemplates.newMessage(data?.senderName || 'Someone', data?.message || 'New message');
        break;
      case 'daily_matches':
        notificationData = NotificationTemplates.dailyMatches(data?.count || 1);
        break;
      case 'verification_approved':
        notificationData = NotificationTemplates.verificationApproved();
        break;
      case 'verification_rejected':
        notificationData = NotificationTemplates.verificationRejected();
        break;
      default:
        return;
    }

    await scheduleLocalNotification(notificationData);
  };

  const scheduleDailyMatchReminder = async () => {
    try {
      const trigger = {
        hour: 10,
        minute: 0,
        repeats: true,
      };

      await scheduleLocalNotification(
        NotificationTemplates.dailyMatches(3),
        trigger
      );
    } catch (error) {
      console.error('Failed to schedule daily reminder:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      pushToken,
      sendLocalNotification,
      scheduleDailyMatchReminder,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};