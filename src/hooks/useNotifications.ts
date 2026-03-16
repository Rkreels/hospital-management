import { useState, useEffect, useCallback } from 'react';
import { Notification, UserRole } from '../types';
import { db } from '../lib/store';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (notification: Partial<Notification>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(
  _role?: UserRole,
  _userId?: string
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = db.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
    
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      db.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      
      unreadIds.forEach((id) => {
        db.markNotificationRead(id);
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [notifications]);

  const sendNotification = useCallback(async (notification: Partial<Notification>) => {
    try {
      db.addNotification({
        type: notification.type || 'Info',
        title: notification.title || '',
        message: notification.message || '',
        category: notification.category || 'System',
        priority: notification.priority || 'Low',
        isRead: false,
        targetUserId: notification.targetUserId,
        targetRole: notification.targetRole,
      });
      refreshNotifications();
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    sendNotification,
    refreshNotifications
  };
}

export type { UseNotificationsReturn };
