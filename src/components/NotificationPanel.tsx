"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  User,
  Calendar,
  FlaskConical,
  Pill,
  CreditCard,
  Activity,
  FileText,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Notification } from '@/types';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose?: () => void;
  onNavigate?: (url: string) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  Patient: User,
  Appointment: Calendar,
  Lab: FlaskConical,
  Pharmacy: Pill,
  Billing: CreditCard,
  Emergency: Activity,
  System: Bell,
  Task: FileText
};

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-amber-100 text-amber-700',
  Critical: 'bg-red-100 text-red-700'
};

const typeIcons: Record<string, React.ElementType> = {
  Alert: AlertTriangle,
  Reminder: Clock,
  Info: Info,
  Warning: AlertCircle,
  Emergency: Activity
};

const typeColors: Record<string, string> = {
  Alert: 'text-amber-500',
  Reminder: 'text-blue-500',
  Info: 'text-gray-500',
  Warning: 'text-orange-500',
  Emergency: 'text-red-500'
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  onNavigate
}: NotificationPanelProps) {
  // Group notifications by category
  const categorizedNotifications = useMemo(() => {
    const categories: Record<string, Notification[]> = {};
    
    notifications.forEach((notification) => {
      const category = notification.category || 'System';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(notification);
    });

    return categories;
  }, [notifications]);

  // Get unread notifications
  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !n.isRead);
  }, [notifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
      if (onClose) onClose();
    }
  };

  const renderNotificationItem = (notification: Notification) => {
    const TypeIcon = typeIcons[notification.type] || Info;
    const typeColor = typeColors[notification.type] || 'text-gray-500';

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className={`
          relative p-3 rounded-lg border cursor-pointer transition-all
          ${notification.isRead 
            ? 'bg-background border-border hover:bg-muted/50' 
            : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
          }
        `}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${typeColor}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-medium text-sm truncate ${notification.isRead ? 'text-foreground' : 'text-foreground'}`}>
                {notification.title}
              </p>
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(notification.createdAt)}
              </span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[notification.priority]}`}>
                {notification.priority}
              </Badge>
            </div>
          </div>
          {notification.actionUrl && (
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-foreground" />
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 h-10">
          <TabsTrigger
            value="all"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
          >
            All
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px]">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
          >
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
          >
            Categories
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[350px]">
          {/* All Notifications Tab */}
          <TabsContent value="all" className="mt-0 p-2">
            <AnimatePresence mode="popLayout">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map(renderNotificationItem)}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Unread Notifications Tab */}
          <TabsContent value="unread" className="mt-0 p-2">
            <AnimatePresence mode="popLayout">
              {unreadNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Check className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {unreadNotifications.map(renderNotificationItem)}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-0 p-2">
            <AnimatePresence mode="popLayout">
              {Object.keys(categorizedNotifications).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(categorizedNotifications).map(([category, items]) => {
                    const CategoryIcon = categoryIcons[category] || Bell;
                    const unreadInCategory = items.filter((n) => !n.isRead).length;

                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{category}</span>
                          {unreadInCategory > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              {unreadInCategory}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          {items.slice(0, 3).map(renderNotificationItem)}
                          {items.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center py-1">
                              +{items.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Real-time notifications enabled
        </p>
      </div>
    </div>
  );
}

export default NotificationPanel;
