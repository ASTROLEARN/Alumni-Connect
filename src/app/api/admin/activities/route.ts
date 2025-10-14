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
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    // Mock activities data
    const activities = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userRole: 'ALUMNI',
        action: 'PROFILE_UPDATED',
        description: 'Updated profile information',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-15T10:30:00Z',
        metadata: {
          updatedFields: ['company', 'position', 'bio'],
          previousValues: { company: 'Old Corp', position: 'Developer' },
          newValues: { company: 'New Corp', position: 'Senior Developer' }
        }
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        userRole: 'STUDENT',
        action: 'EVENT_REGISTERED',
        description: 'Registered for Annual Alumni Reunion',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: '2024-01-15T09:15:00Z',
        metadata: {
          eventId: 'event1',
          eventName: 'Annual Alumni Reunion',
          registrationId: 'reg1'
        }
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Mike Johnson',
        userEmail: 'mike@example.com',
        userRole: 'ALUMNI',
        action: 'DONATION_MADE',
        description: 'Made a donation to scholarship fund',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        timestamp: '2024-01-14T16:20:00Z',
        metadata: {
          amount: 500,
          donationType: 'scholarship',
          donationId: 'don1'
        }
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'Sarah Wilson',
        userEmail: 'sarah@example.com',
        userRole: 'STUDENT',
        action: 'MENTORSHIP_REQUESTED',
        description: 'Requested mentorship from alumni',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
        timestamp: '2024-01-14T14:30:00Z',
        metadata: {
          mentorId: 'mentor1',
          mentorName: 'Dr. Smith',
          requestMessage: 'Looking for guidance in software engineering career',
          requestId: 'req1'
        }
      },
      {
        id: '5',
        userId: 'user5',
        userName: 'Admin User',
        userEmail: 'admin@alumni.edu',
        userRole: 'ADMIN',
        action: 'USER_VERIFIED',
        description: 'Verified alumni account',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: '2024-01-13T11:00:00Z',
        metadata: {
          verifiedUserId: 'user6',
          verifiedUserName: 'Robert Brown',
          verificationStatus: 'approved'
        }
      }
    ];

    // Apply filters
    let filteredActivities = activities;
    
    if (userId) {
      filteredActivities = filteredActivities.filter(activity => activity.userId === userId);
    }
    
    if (action) {
      filteredActivities = filteredActivities.filter(activity => activity.action === action);
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
    
    filteredActivities = filteredActivities.filter(activity => 
      new Date(activity.timestamp) >= startDate
    );

    return NextResponse.json(filteredActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}