import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');

    // Mock notifications data
    const notifications = [
      {
        id: '1',
        type: 'system',
        title: 'New Alumni Registration',
        message: 'John Doe has registered as a new alumni member.',
        isRead: false,
        priority: 'high',
        actionUrl: '/admin/pending',
        createdAt: '2024-01-15T10:30:00Z',
        expiresAt: '2024-01-22T10:30:00Z',
        metadata: {
          userId: 'user1',
          userName: 'John Doe',
          registrationId: 'reg1'
        }
      }
    ];

    // Apply filters
    let filteredNotifications = notifications;
    
    if (type) {
      filteredNotifications = filteredNotifications.filter(notif => notif.type === type);
    }
    
    if (isRead !== null) {
      filteredNotifications = filteredNotifications.filter(notif => notif.isRead === (isRead === 'true'));
    }

    return NextResponse.json(filteredNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, priority, actionUrl, metadata } = body;

    // Mock creating a new notification
    const newNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      isRead: false,
      priority,
      actionUrl,
      createdAt: new Date().toISOString(),
      expiresAt: body.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: metadata || {}
    };

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}