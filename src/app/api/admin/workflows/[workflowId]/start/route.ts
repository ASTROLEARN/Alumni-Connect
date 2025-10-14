import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflowId } = params;
    const body = await request.json();
    const { data } = body;

    // Mock starting a workflow instance
    const newInstance = {
      id: Math.random().toString(36).substr(2, 9),
      workflowId,
      status: 'in_progress',
      currentStep: 'Initialization',
      assignedTo: 'System',
      startedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 10,
      data
    };

    return NextResponse.json(newInstance);
  } catch (error) {
    console.error('Error starting workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}