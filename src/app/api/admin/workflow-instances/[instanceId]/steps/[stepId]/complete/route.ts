import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { instanceId: string; stepId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { instanceId, stepId } = params;
    const body = await request.json();
    const { notes, data } = body;

    // Mock completing a workflow step
    const updatedInstance = {
      id: instanceId,
      status: 'in_progress',
      currentStep: 'Next Step',
      progress: Math.min(100, (parseInt(stepId) * 25) + 25),
      completedStep: {
        stepId,
        completedAt: new Date().toISOString(),
        completedBy: session.user?.name || 'Admin',
        notes,
        data
      },
      nextStep: {
        stepId: (parseInt(stepId) + 1).toString(),
        name: 'Next Step',
        estimatedDuration: '1-2 days'
      }
    };

    return NextResponse.json(updatedInstance);
  } catch (error) {
    console.error('Error completing workflow step:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}