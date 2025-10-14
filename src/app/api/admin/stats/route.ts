import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total user counts by role
    const [totalUsers, students, alumni, admins] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'STUDENT' } }),
      db.user.count({ where: { role: 'ALUMNI' } }),
      db.user.count({ where: { role: 'ADMIN' } })
    ]);

    // Get verified alumni count
    const verifiedAlumni = await db.user.count({
      where: {
        role: 'ALUMNI',
        alumni: {
          verified: true
        }
      }
    });

    // Get job counts
    const [totalJobs, recentJobs] = await Promise.all([
      db.job.count(),
      db.job.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    // Get event counts
    const [totalEvents, upcomingEvents, recentEvents] = await Promise.all([
      db.event.count(),
      db.event.count({
        where: {
          date: {
            gte: new Date()
          }
        }
      }),
      db.event.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    // Get mentorship stats
    const [mentorshipRequests, pendingRequests, acceptedRequests] = await Promise.all([
      db.mentorshipRequest.count(),
      db.mentorshipRequest.count({ where: { status: 'PENDING' } }),
      db.mentorshipRequest.count({ where: { status: 'ACCEPTED' } })
    ]);

    // Get job applications stats
    const [totalApplications, recentApplications] = await Promise.all([
      db.jobApplication.count(),
      db.jobApplication.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    // Get event registrations
    const totalRegistrations = await db.eventRegistration.count();

    // Get success stories
    const [totalStories, publishedStories] = await Promise.all([
      db.successStory.count(),
      db.successStory.count({ where: { published: true } })
    ]);

    // Get donations stats
    const [totalDonations, recentDonations, totalAmount] = await Promise.all([
      db.donation.count(),
      db.donation.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      db.donation.aggregate({
        _sum: {
          amount: true
        }
      })
    ]);

    // Calculate monthly growth rates (simplified)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsersThisMonth, newJobsThisMonth] = await Promise.all([
      db.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      db.job.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        students: students,
        alumni: alumni,
        verifiedAlumni: verifiedAlumni,
        admins: admins,
        newThisMonth: newUsersThisMonth
      },
      jobs: {
        total: totalJobs,
        newThisMonth: recentJobs,
        totalApplications: totalApplications,
        recentApplications: recentApplications
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        newThisMonth: recentEvents,
        totalRegistrations: totalRegistrations
      },
      mentorship: {
        totalRequests: mentorshipRequests,
        pending: pendingRequests,
        accepted: acceptedRequests
      },
      content: {
        successStories: {
          total: totalStories,
          published: publishedStories
        },
        donations: {
          total: totalDonations,
          newThisMonth: recentDonations,
          totalAmount: totalAmount._sum.amount || 0
        }
      },
      timestamp: new Date().toISOString()
    };

    return Response.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch statistics'
    }, { status: 500 });
  }
}