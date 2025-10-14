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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Mock audit logs data
    const auditLogs = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Admin',
        action: 'USER_VERIFICATION_APPROVED',
        targetId: 'alumni1',
        targetName: 'Jane Smith',
        details: 'Approved alumni verification for Jane Smith',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-15T10:30:00Z',
        severity: 'info'
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Sarah Manager',
        action: 'EVENT_CREATED',
        targetId: 'event1',
        targetName: 'Alumni Reunion 2024',
        details: 'Created new event: Alumni Reunion 2024',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: '2024-01-15T09:15:00Z',
        severity: 'info'
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Mike User',
        action: 'LOGIN_FAILED',
        targetId: null,
        targetName: null,
        details: 'Failed login attempt for user: mike@example.com',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        timestamp: '2024-01-15T08:45:00Z',
        severity: 'warning'
      },
      {
        id: '4',
        userId: 'user1',
        userName: 'John Admin',
        action: 'USER_DELETED',
        targetId: 'user4',
        targetName: 'Spam User',
        details: 'Deleted user account for spam activity',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-14T16:20:00Z',
        severity: 'critical'
      },
      {
        id: '5',
        userId: 'user2',
        userName: 'Sarah Manager',
        action: 'EVENT_UPDATED',
        targetId: 'event2',
        targetName: 'Tech Career Fair',
        details: 'Updated event details for Tech Career Fair',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: '2024-01-14T14:10:00Z',
        severity: 'info'
      }
    ];

    // Apply filters
    let filteredLogs = auditLogs;
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }
    
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }
    
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredLogs.length / limit),
        totalItems: filteredLogs.length,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}