import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const alumni = await db.alumni.findMany({
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

    return NextResponse.json(alumni);
  } catch (error) {
    console.error('Error fetching alumni:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}