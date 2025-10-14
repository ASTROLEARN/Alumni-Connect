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
    const assignedTo = searchParams.get('assignedTo');

    // Mock conversations data
    const conversations = [
      {
        id: '1',
        subject: 'Alumni Verification Issue',
        participants: [
          { id: 'user1', name: 'John Doe', role: 'ALUMNI', avatar: '' },
          { id: 'admin1', name: 'Admin User', role: 'ADMIN', avatar: '' }
        ],
        lastMessage: {
          id: 'msg1',
          content: 'I need help with my verification process',
          senderId: 'user1',
          senderName: 'John Doe',
          timestamp: '2024-01-15T10:30:00Z',
          isRead: false
        },
        status: 'active',
        priority: 'medium',
        assignedTo: 'Admin User',
        assignedToId: 'admin1',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        tags: ['verification', 'help'],
        messageCount: 5
      },
      {
        id: '2',
        subject: 'Event Planning Question',
        participants: [
          { id: 'user2', name: 'Jane Smith', role: 'ALUMNI', avatar: '' },
          { id: 'admin2', name: 'Event Manager', role: 'ADMIN', avatar: '' }
        ],
        lastMessage: {
          id: 'msg2',
          content: 'Can you help me with the venue selection?',
          senderId: 'user2',
          senderName: 'Jane Smith',
          timestamp: '2024-01-15T09:15:00Z',
          isRead: true
        },
        status: 'active',
        priority: 'low',
        assignedTo: 'Event Manager',
        assignedToId: 'admin2',
        createdAt: '2024-01-14T14:30:00Z',
        updatedAt: '2024-01-15T09:15:00Z',
        tags: ['event', 'planning'],
        messageCount: 8
      },
      {
        id: '3',
        subject: 'Donation Receipt Request',
        participants: [
          { id: 'user3', name: 'Mike Johnson', role: 'ALUMNI', avatar: '' },
          { id: 'admin3', name: 'Finance Team', role: 'ADMIN', avatar: '' }
        ],
        lastMessage: {
          id: 'msg3',
          content: 'I need a receipt for my recent donation',
          senderId: 'user3',
          senderName: 'Mike Johnson',
          timestamp: '2024-01-14T16:20:00Z',
          isRead: true
        },
        status: 'resolved',
        priority: 'high',
        assignedTo: 'Finance Team',
        assignedToId: 'admin3',
        createdAt: '2024-01-13T11:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z',
        tags: ['donation', 'receipt'],
        messageCount: 3
      }
    ];

    // Apply filters
    let filteredConversations = conversations;
    
    if (status) {
      filteredConversations = filteredConversations.filter(conv => conv.status === status);
    }
    
    if (assignedTo) {
      filteredConversations = filteredConversations.filter(conv => conv.assignedToId === assignedTo);
    }

    return NextResponse.json(filteredConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
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
    const { subject, participants, priority, assignedTo, tags } = body;

    // Mock creating a new conversation
    const newConversation = {
      id: Math.random().toString(36).substr(2, 9),
      subject,
      participants,
      lastMessage: null,
      status: 'active',
      priority,
      assignedTo: assignedTo.name,
      assignedToId: assignedTo.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags || [],
      messageCount: 0
    };

    return NextResponse.json(newConversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}