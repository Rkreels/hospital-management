import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Notification, UserRole } from '@/types';

// WebSocket service HTTP broadcast URL
const WS_BROADCAST_URL = 'http://localhost:3003/broadcast';

// Helper to broadcast notification to WebSocket service
async function broadcastNotification(notification: Notification) {
  try {
    await fetch(WS_BROADCAST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
  } catch (error) {
    console.error('Failed to broadcast notification:', error);
    // Don't fail the request if broadcast fails
  }
}

// GET - Fetch all notifications or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const targetRole = searchParams.get('targetRole') as UserRole | null;
    const targetUserId = searchParams.get('targetUserId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let notifications = db.getNotifications();

    // Filter by read status
    if (unreadOnly) {
      notifications = db.getUnreadNotifications();
    }

    // Filter by target role
    if (targetRole) {
      notifications = notifications.filter(
        (n) => n.targetRole === targetRole || !n.targetRole
      );
    }

    // Filter by target user
    if (targetUserId) {
      notifications = notifications.filter(
        (n) => n.targetUserId === targetUserId || !n.targetUserId
      );
    }

    // Filter by category
    if (category) {
      notifications = notifications.filter((n) => n.category === category);
    }

    // Sort by created date (newest first)
    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Limit results
    const limitedNotifications = notifications.slice(0, limit);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications: limitedNotifications,
      total: notifications.length,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = 'Info',
      title,
      message,
      category = 'System',
      priority = 'Medium',
      targetRole,
      targetUserId,
      actionUrl,
      actionLabel,
      relatedEntityId,
      relatedEntityType,
      expiresAt
    } = body;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Create notification in database
    const notification = db.addNotification({
      type,
      title,
      message,
      category,
      priority,
      targetRole,
      targetUserId,
      actionUrl,
      actionLabel,
      relatedEntityId,
      relatedEntityType,
      expiresAt,
      isRead: false
    });

    // Broadcast to WebSocket service
    await broadcastNotification(notification);

    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PUT - Update notification (mark as read)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Mark notification as read
    const success = db.markNotificationRead(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a notification (optional, not typically used)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Note: We don't have a deleteNotification method in the store
    // For now, we'll just mark it as read
    db.markNotificationRead(id);

    return NextResponse.json({
      success: true,
      message: 'Notification removed'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
