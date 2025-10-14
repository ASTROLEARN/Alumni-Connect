import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ALUMNI') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, accepted, message } = await request.json();

    if (!requestId || typeof accepted !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const alumni = await db.alumni.findUnique({
      where: { userId: session.user.id },
    });

    if (!alumni) {
      return NextResponse.json({ error: 'Alumni profile not found' }, { status: 404 });
    }

    // Verify the request belongs to this alumni
    const mentorshipRequest = await db.mentorshipRequest.findFirst({
      where: {
        id: requestId,
        alumniId: alumni.id,
        status: 'PENDING',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!mentorshipRequest) {
      return NextResponse.json({ error: 'Mentorship request not found or already processed' }, { status: 404 });
    }

    const updatedRequest = await db.mentorshipRequest.update({
      where: { id: requestId },
      data: {
        status: accepted ? 'ACCEPTED' : 'REJECTED',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        alumni: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error processing mentorship decision:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}