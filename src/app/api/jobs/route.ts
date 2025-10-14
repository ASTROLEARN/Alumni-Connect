import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all jobs with alumni information
    const jobs = await db.job.findMany({
      include: {
        postedBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        applications: {
          select: {
            id: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      postedDate: job.createdAt.toISOString(),
      deadline: job.deadline ? job.deadline.toISOString() : undefined,
      description: job.description,
      requirements: job.requirements,
      industry: job.industry,
      experience: job.experience,
      postedBy: {
        name: job.postedBy.user.name || 'Unknown',
        email: job.postedBy.user.email,
        role: 'Alumni',
        isAlumni: true,
      },
      applications: job.applications.length,
    }));

    return NextResponse.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ALUMNI') {
      return NextResponse.json({ error: 'Unauthorized - Only alumni can post jobs' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      industry,
      experience,
      deadline
    } = body;

    // Validate required fields
    if (!title || !company || !location || !type || !salary || !description || !requirements || !industry || !experience) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the alumni record for the current user
    const alumni = await db.alumni.findUnique({
      where: { userId: session.user.id }
    });

    if (!alumni) {
      return NextResponse.json({ error: 'Alumni profile not found' }, { status: 404 });
    }

    // Create the job posting
    const newJob = await db.job.create({
      data: {
        title,
        company,
        location,
        type,
        salary,
        description,
        requirements,
        industry,
        experience,
        deadline: deadline ? new Date(deadline) : null,
        postedById: alumni.id,
      },
      include: {
        postedBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    // Transform the response to match the expected format
    const transformedJob = {
      id: newJob.id,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      salary: newJob.salary,
      postedDate: newJob.createdAt.toISOString(),
      deadline: newJob.deadline ? newJob.deadline.toISOString() : undefined,
      description: newJob.description,
      requirements: newJob.requirements,
      industry: newJob.industry,
      experience: newJob.experience,
      postedBy: {
        name: newJob.postedBy.user.name || 'Unknown',
        email: newJob.postedBy.user.email,
        role: 'Alumni',
        isAlumni: true,
      },
      applications: 0,
    };

    return NextResponse.json(transformedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}