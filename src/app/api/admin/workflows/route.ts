import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock workflows data
    const workflows = [
      {
        id: '1',
        name: 'Alumni Verification',
        description: 'Process for verifying new alumni accounts and documents',
        status: 'active',
        steps: [
          { id: '1', name: 'Initial Application', order: 1, estimatedDuration: '1 day' },
          { id: '2', name: 'Document Review', order: 2, estimatedDuration: '2-3 days' },
          { id: '3', name: 'Background Check', order: 3, estimatedDuration: '1-2 days' },
          { id: '4', name: 'Final Approval', order: 4, estimatedDuration: '1 day' }
        ],
        totalInstances: 156,
        activeInstances: 23,
        averageCompletionTime: '5.2 days'
      },
      {
        id: '2',
        name: 'Event Approval',
        description: 'Workflow for approving and managing alumni events',
        status: 'active',
        steps: [
          { id: '1', name: 'Event Submission', order: 1, estimatedDuration: '1 day' },
          { id: '2', name: 'Initial Review', order: 2, estimatedDuration: '2 days' },
          { id: '3', name: 'Logistics Planning', order: 3, estimatedDuration: '3-5 days' },
          { id: '4', name: 'Final Approval', order: 4, estimatedDuration: '1 day' }
        ],
        totalInstances: 89,
        activeInstances: 12,
        averageCompletionTime: '4.8 days'
      },
      {
        id: '3',
        name: 'Donation Processing',
        description: 'Process for handling and acknowledging alumni donations',
        status: 'active',
        steps: [
          { id: '1', name: 'Donation Received', order: 1, estimatedDuration: '1 day' },
          { id: '2', name: 'Verification', order: 2, estimatedDuration: '1 day' },
          { id: '3', name: 'Receipt Generation', order: 3, estimatedDuration: '1 day' },
          { id: '4', name: 'Thank You Process', order: 4, estimatedDuration: '2-3 days' }
        ],
        totalInstances: 234,
        activeInstances: 8,
        averageCompletionTime: '3.5 days'
      }
    ];

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
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
    const { name, description, steps } = body;

    // Mock creating a new workflow
    const newWorkflow = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      status: 'active',
      steps: steps.map((step: any, index: number) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: step.name,
        order: index + 1,
        estimatedDuration: step.estimatedDuration
      })),
      totalInstances: 0,
      activeInstances: 0,
      averageCompletionTime: '0 days'
    };

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}