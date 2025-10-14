import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = params;
    const body = await request.json();
    const { assignedTo, assignedToId } = body;

    // Mock assigning a task
    const updatedTask = {
      id: taskId,
      assignedTo,
      assignedToId,
      status: 'assigned',
      assignedAt: new Date().toISOString(),
      assignedBy: session.user?.name || 'Admin'
    };

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error assigning task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}