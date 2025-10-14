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
    const range = searchParams.get('range') || '7d';
    const status = searchParams.get('status');

    // Mock sessions data
    const sessions = [
      {
        id: 'session1',
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userRole: 'ALUMNI',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows 10',
        location: 'New York, USA',
        status: 'active',
        startedAt: '2024-01-15T10:30:00Z',
        lastActivity: '2024-01-15T10:45:00Z',
        expiresAt: '2024-01-15T18:30:00Z',
        metadata: {
          loginMethod: 'email',
          isCurrentSession: false
        }
      },
      {
        id: 'session2',
        userId: 'user2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        userRole: 'STUDENT',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        deviceType: 'desktop',
        browser: 'Safari',
        os: 'macOS Big Sur',
        location: 'San Francisco, USA',
        status: 'active',
        startedAt: '2024-01-15T09:15:00Z',
        lastActivity: '2024-01-15T09:30:00Z',
        expiresAt: '2024-01-15T17:15:00Z',
        metadata: {
          loginMethod: 'google',
          isCurrentSession: false
        }
      },
      {
        id: 'session3',
        userId: 'user3',
        userName: 'Mike Johnson',
        userEmail: 'mike@example.com',
        userRole: 'ALUMNI',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        deviceType: 'mobile',
        browser: 'Safari',
        os: 'iOS 14',
        location: 'Los Angeles, USA',
        status: 'expired',
        startedAt: '2024-01-14T16:20:00Z',
        lastActivity: '2024-01-14T16:35:00Z',
        expiresAt: '2024-01-14T18:20:00Z',
        metadata: {
          loginMethod: 'linkedin',
          isCurrentSession: false
        }
      },
      {
        id: 'session4',
        userId: 'user4',
        userName: 'Sarah Wilson',
        userEmail: 'sarah@example.com',
        userRole: 'STUDENT',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
        deviceType: 'mobile',
        browser: 'Chrome',
        os: 'Android 10',
        location: 'Chicago, USA',
        status: 'active',
        startedAt: '2024-01-14T14:30:00Z',
        lastActivity: '2024-01-14T14:45:00Z',
        expiresAt: '2024-01-14T22:30:00Z',
        metadata: {
          loginMethod: 'email',
          isCurrentSession: false
        }
      },
      {
        id: 'session5',
        userId: 'admin1',
        userName: 'Admin User',
        userEmail: 'admin@alumni.edu',
        userRole: 'ADMIN',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows 10',
        location: 'Boston, USA',
        status: 'active',
        startedAt: '2024-01-13T11:00:00Z',
        lastActivity: '2024-01-15T10:50:00Z',
        expiresAt: '2024-01-15T19:00:00Z',
        metadata: {
          loginMethod: 'email',
          isCurrentSession: true
        }
      }
    ];

    // Apply filters
    let filteredSessions = sessions;
    
    if (status) {
      filteredSessions = filteredSessions.filter(session => session.status === status);
    }

    // Apply date range filter
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    filteredSessions = filteredSessions.filter(session => 
      new Date(session.startedAt) >= startDate
    );

    return NextResponse.json(filteredSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}