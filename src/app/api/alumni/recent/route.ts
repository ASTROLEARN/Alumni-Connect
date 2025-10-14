import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch recent alumni with their user and alumni data
    const recentAlumni = await db.user.findMany({
      where: {
        role: 'ALUMNI',
        alumni: {
          verified: true
        }
      },
      include: {
        alumni: {
          select: {
            graduationYear: true,
            company: true,
            position: true,
            location: true,
            verified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 8 // Limit to 8 recent alumni
    });

    // Transform the data to match the expected format
    const formattedAlumni = recentAlumni.map(user => ({
      id: user.id,
      name: user.name || 'Anonymous Alumni',
      email: user.email,
      graduationYear: user.alumni?.graduationYear || 'Unknown',
      company: user.alumni?.company || 'Company not specified',
      position: user.alumni?.position || 'Position not specified',
      location: user.alumni?.location || 'Location not specified',
      verified: user.alumni?.verified || false,
      createdAt: user.createdAt
    }));

    return Response.json({
      success: true,
      alumni: formattedAlumni,
      count: formattedAlumni.length
    });
  } catch (error) {
    console.error('Error fetching recent alumni:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch recent alumni',
      alumni: [],
      count: 0
    }, { status: 500 });
  }
}