"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification, UserRole } from '@/types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (notification: Partial<Notification>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// WebSocket URL - uses XTransformPort for port transformation in dev environment
const WS_URL = '/?XTransformPort=3002';
const HTTP_BROADCAST_URL = 'http://localhost:3003/broadcast';

export function useNotifications(
  role?: UserRole,
  userId?: string
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const initialLoadDone = useRef(false);

  // Fetch initial notifications from API
  const refreshNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Fetch initial notifications
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      refreshNotifications();
    }

    // Create socket connection
    const socket = io(WS_URL, {
      query: {
        role: role || 'all',
        userId: userId
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('🔔 Connected to notification service');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔔 Disconnected from notification service');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🔔 Connection error:', error.message);
      setIsConnected(false);
    });

    // Handle incoming notifications
    socket.on('notification', (notification: Notification) => {
      console.log('🔔 Received notification:', notification);
      
      setNotifications((prev) => {
        // Avoid duplicates
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) return prev;
        
        // Add new notification at the beginning
        return [notification, ...prev];
      });

      // Show browser notification if supported and permitted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (window.Notification.permission === 'granted') {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      }
    });

    // Handle notification read confirmation
    socket.on('notification-read', (data: { notificationId: string; readAt: string }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.notificationId
            ? { ...n, isRead: true, readAt: data.readAt }
            : n
        )
      );
    });

    // Handle welcome message
    socket.on('connected', (data: { message: string; socketId: string }) => {
      console.log('🔔 Welcome message:', data.message);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [role, userId, refreshNotifications]);

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Update via API
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true })
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          )
        );

        // Notify socket
        if (socketRef.current) {
          socketRef.current.emit('mark-read', { notificationId: id });
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      
      // Update via API for each
      await Promise.all(
        unreadIds.map((id) =>
          fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isRead: true })
          })
        )
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [notifications]);

  // Send a notification (via HTTP to WebSocket service)
  const sendNotification = useCallback(async (notification: Partial<Notification>) => {
    try {
      // Create notification via API
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Notification created:', data.notification);
        
        // The API will broadcast via HTTP to the WebSocket service
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, []);

  // Calculate unread count
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

// Export types
export type { UseNotificationsReturn };
