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

    // Mock engagement metrics data
    const metrics = {
      overview: {
        totalUsers: 5234,
        activeUsers: 1234,
        newUsers: 156,
        sessionDuration: '12m 34s',
        pageViews: 45678,
        bounceRate: 23.5
      },
      dailyEngagement: [
        { date: '2024-01-09', activeUsers: 892, pageViews: 5678, sessions: 1234, avgDuration: '11m 45s' },
        { date: '2024-01-10', activeUsers: 945, pageViews: 6123, sessions: 1345, avgDuration: '12m 12s' },
        { date: '2024-01-11', activeUsers: 1023, pageViews: 6789, sessions: 1456, avgDuration: '13m 01s' },
        { date: '2024-01-12', activeUsers: 1156, pageViews: 7234, sessions: 1567, avgDuration: '12m 56s' },
        { date: '2024-01-13', activeUsers: 1089, pageViews: 6890, sessions: 1498, avgDuration: '12m 23s' },
        { date: '2024-01-14', activeUsers: 1198, pageViews: 7456, sessions: 1623, avgDuration: '13m 15s' },
        { date: '2024-01-15', activeUsers: 1234, pageViews: 7890, sessions: 1678, avgDuration: '12m 34s' }
      ],
      topPages: [
        { path: '/directory', views: 8934, uniqueVisitors: 2345, avgDuration: '8m 45s', bounceRate: 15.2 },
        { path: '/jobs', views: 7654, uniqueVisitors: 2109, avgDuration: '12m 30s', bounceRate: 18.7 },
        { path: '/events', views: 6543, uniqueVisitors: 1987, avgDuration: '6m 15s', bounceRate: 22.1 },
        { path: '/mentorship', views: 5432, uniqueVisitors: 1765, avgDuration: '15m 20s', bounceRate: 12.3 },
        { path: '/stories', views: 4321, uniqueVisitors: 1543, avgDuration: '9m 45s', bounceRate: 19.8 }
      ],
      userSegments: [
        { segment: 'Students', users: 2345, percentage: 44.8, avgSessions: 8.5, avgDuration: '14m 20s' },
        { segment: 'Alumni', users: 2678, percentage: 51.2, avgSessions: 6.2, avgDuration: '11m 45s' },
        { segment: 'Admins', users: 211, percentage: 4.0, avgSessions: 15.3, avgDuration: '25m 10s' }
      ],
      deviceStats: [
        { device: 'Desktop', users: 3456, percentage: 66.0, sessions: 8934, avgDuration: '15m 20s' },
        { device: 'Mobile', users: 1567, percentage: 29.9, sessions: 4321, avgDuration: '8m 45s' },
        { device: 'Tablet', users: 211, percentage: 4.1, sessions: 543, avgDuration: '12m 10s' }
      ],
      conversionMetrics: {
        registrationRate: 12.5,
        verificationRate: 78.3,
        mentorshipRequestRate: 23.4,
        eventRegistrationRate: 15.6,
        donationRate: 3.2
      }
    };

    // Apply date range filtering (simplified for demo)
    let filteredMetrics = { ...metrics };
    
    if (range === '1d') {
      filteredMetrics.dailyEngagement = metrics.dailyEngagement.slice(-1);
    } else if (range === '30d') {
      // For demo, just return the same data but indicate it's for 30 days
      filteredMetrics.overview.totalUsers = 6789;
      filteredMetrics.overview.activeUsers = 2345;
    }

    return NextResponse.json(filteredMetrics);
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}