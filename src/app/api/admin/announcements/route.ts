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
    const status = searchParams.get('status');
    const audience = searchParams.get('audience');

    // Mock announcements data
    const announcements = [
      {
        id: '1',
        title: 'Annual Alumni Reunion 2024',
        content: 'Join us for the biggest alumni gathering of the year!',
        audience: 'all',
        status: 'published',
        priority: 'high',
        author: 'Admin User',
        authorId: 'admin1',
        publishAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-02-15T23:59:59Z',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        views: 1250,
        clicks: 342,
        tags: ['event', 'reunion', 'networking'],
        attachments: [
          { id: 'att1', name: 'Reunion_Schedule.pdf', size: 2048576, url: '/files/reunion-schedule.pdf' }
        ]
      }
    ];

    // Apply filters
    let filteredAnnouncements = announcements;
    
    if (status) {
      filteredAnnouncements = filteredAnnouncements.filter(ann => ann.status === status);
    }
    
    if (audience) {
      filteredAnnouncements = filteredAnnouncements.filter(ann => ann.audience === audience);
    }

    return NextResponse.json(filteredAnnouncements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
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
    const { title, content, audience, priority, publishAt, expiresAt, tags, attachments } = body;

    // Mock creating a new announcement
    const newAnnouncement = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      audience,
      status: 'draft',
      priority,
      author: session.user?.name || 'Admin',
      authorId: session.user?.id || 'admin',
      publishAt: publishAt || new Date().toISOString(),
      expiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      clicks: 0,
      tags: tags || [],
      attachments: attachments || []
    };

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}