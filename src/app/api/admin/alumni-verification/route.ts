import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const pendingAlumni = await db.alumni.findMany({
      where: { verified: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        user: {
          createdAt: 'desc',
        },
      },
    });

    return NextResponse.json(pendingAlumni);
  } catch (error) {
    console.error('Error fetching pending alumni:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { alumniId, approved } = await request.json();

    if (!alumniId || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const alumni = await db.alumni.update({
      where: { id: alumniId },
      data: { verified: approved },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(alumni);
  } catch (error) {
    console.error('Error updating alumni verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}