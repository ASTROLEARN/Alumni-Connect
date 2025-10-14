import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}