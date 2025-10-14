import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock workflow instances data
    const workflowInstances = [
      {
        id: '1',
        workflowName: 'Alumni Verification',
        status: 'in_progress',
        currentStep: 'Document Review',
        assignedTo: 'Admin User',
        startedAt: '2024-01-15T10:00:00Z',
        estimatedCompletion: '2024-01-20T17:00:00Z',
        progress: 65
      },
      {
        id: '2',
        workflowName: 'Event Approval',
        status: 'pending',
        currentStep: 'Initial Review',
        assignedTo: 'Event Manager',
        startedAt: '2024-01-14T14:30:00Z',
        estimatedCompletion: '2024-01-18T12:00:00Z',
        progress: 30
      },
      {
        id: '3',
        workflowName: 'Donation Processing',
        status: 'completed',
        currentStep: 'Completed',
        assignedTo: 'Finance Team',
        startedAt: '2024-01-10T09:00:00Z',
        estimatedCompletion: '2024-01-12T17:00:00Z',
        progress: 100
      }
    ];

    return NextResponse.json(workflowInstances);
  } catch (error) {
    console.error('Error fetching workflow instances:', error);
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
    const { workflowId, data } = body;

    // Mock creating a new workflow instance
    const newInstance = {
      id: Math.random().toString(36).substr(2, 9),
      workflowId,
      status: 'pending',
      currentStep: 'Initialization',
      assignedTo: 'System',
      startedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 0,
      data
    };

    return NextResponse.json(newInstance, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}