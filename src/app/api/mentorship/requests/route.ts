import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let requests;

    if (userRole === 'STUDENT') {
      // Get student's sent requests
      const student = await db.student.findUnique({
        where: { userId },
      });

      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      requests = await db.mentorshipRequest.findMany({
        where: { studentId: student.id },
        include: {
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (userRole === 'ALUMNI') {
      // Get alumni's received requests
      const alumni = await db.alumni.findUnique({
        where: { userId },
      });

      if (!alumni) {
        return NextResponse.json({ error: 'Alumni profile not found' }, { status: 404 });
      }

      requests = await db.mentorshipRequest.findMany({
        where: { alumniId: alumni.id },
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 401 });
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { alumniId, message } = await request.json();

    if (!alumniId) {
      return NextResponse.json({ error: 'Alumni ID is required' }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Check if request already exists
    const existingRequest = await db.mentorshipRequest.findFirst({
      where: {
        studentId: student.id,
        alumniId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'Mentorship request already pending' }, { status: 400 });
    }

    const mentorshipRequest = await db.mentorshipRequest.create({
      data: {
        studentId: student.id,
        alumniId,
        message: message || 'I would like to request mentorship.',
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

    return NextResponse.json(mentorshipRequest);
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}