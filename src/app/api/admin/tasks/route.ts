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

    // Mock tasks data
    const tasks = [
      {
        id: '1',
        title: 'Review alumni verification documents',
        description: 'Review submitted documents for John Doe alumni verification',
        status: 'pending',
        priority: 'high',
        assignedTo: 'Admin User',
        assignedToId: 'user1',
        dueDate: '2024-01-18T17:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        workflowInstanceId: '1',
        workflowName: 'Alumni Verification'
      },
      {
        id: '2',
        title: 'Approve event budget',
        description: 'Review and approve budget for Alumni Reunion 2024',
        status: 'in_progress',
        priority: 'medium',
        assignedTo: 'Finance Manager',
        assignedToId: 'user2',
        dueDate: '2024-01-20T12:00:00Z',
        createdAt: '2024-01-14T14:30:00Z',
        workflowInstanceId: '2',
        workflowName: 'Event Approval'
      },
      {
        id: '3',
        title: 'Send donation receipt',
        description: 'Generate and send receipt for recent donation from Jane Smith',
        status: 'completed',
        priority: 'low',
        assignedTo: 'Admin Assistant',
        assignedToId: 'user3',
        dueDate: '2024-01-16T15:00:00Z',
        createdAt: '2024-01-13T09:00:00Z',
        workflowInstanceId: '3',
        workflowName: 'Donation Processing'
      },
      {
        id: '4',
        title: 'Background check verification',
        description: 'Conduct background check for new alumni applicant',
        status: 'pending',
        priority: 'high',
        assignedTo: 'Security Team',
        assignedToId: 'user4',
        dueDate: '2024-01-19T17:00:00Z',
        createdAt: '2024-01-15T11:00:00Z',
        workflowInstanceId: '1',
        workflowName: 'Alumni Verification'
      }
    ];

    // Apply filters
    let filteredTasks = tasks;
    
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (assignedTo) {
      filteredTasks = filteredTasks.filter(task => task.assignedToId === assignedTo);
    }

    return NextResponse.json(filteredTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
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
    const { title, description, priority, assignedTo, dueDate, workflowInstanceId } = body;

    // Mock creating a new task
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      status: 'pending',
      priority,
      assignedTo: assignedTo.name,
      assignedToId: assignedTo.id,
      dueDate,
      createdAt: new Date().toISOString(),
      workflowInstanceId,
      workflowName: body.workflowName || 'Unknown Workflow'
    };

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}