'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Award, 
  MessageSquare, 
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import ProfileHeader from '@/components/ui/ProfileHeader';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

interface DashboardStats {
  totalMentorshipRequests: number;
  pendingMentorshipRequests: number;
  activeJobsPosted: number;
  totalDonations: number;
  upcomingEvents: number;
  totalConnections: number;
}

interface RecentActivity {
  id: string;
  type: 'mentorship' | 'job' | 'donation' | 'event';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'active';
}

interface MentorshipRequest {
  id: string;
  studentName: string;
  studentAvatar?: string;
  message: string;
  requestedAt: string;
  skills: string[];
}

export default function AlumniDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMentorshipRequests: 0,
    pendingMentorshipRequests: 0,
    activeJobsPosted: 0,
    totalDonations: 0,
    upcomingEvents: 0,
    totalConnections: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Simulate API calls for dashboard data
    const fetchDashboardData = async () => {
      // Mock data for demonstration
      setStats({
        totalMentorshipRequests: 12,
        pendingMentorshipRequests: 3,
        activeJobsPosted: 5,
        totalDonations: 2500,
        upcomingEvents: 2,
        totalConnections: 48
      });

      setRecentActivities([
        {
          id: '1',
          type: 'mentorship',
          title: 'New Mentorship Request',
          description: 'John Smith requested mentorship in Software Engineering',
          timestamp: '2 hours ago',
          status: 'pending'
        },
        {
          id: '2',
          type: 'job',
          title: 'Job Application Received',
          description: 'Sarah Johnson applied to your Software Engineer internship',
          timestamp: '5 hours ago',
          status: 'pending'
        },
        {
          id: '3',
          type: 'donation',
          title: 'Donation Processed',
          description: 'Your $500 donation to the scholarship fund was processed',
          timestamp: '1 day ago',
          status: 'completed'
        },
        {
          id: '4',
          type: 'event',
          title: 'Event Registration',
          description: 'You registered for the Annual Alumni Reunion',
          timestamp: '2 days ago',
          status: 'completed'
        }
      ]);

      setMentorshipRequests([
        {
          id: '1',
          studentName: 'John Smith',
          studentAvatar: '',
          message: 'I would love to learn from your experience in software engineering. Could you guide me on career development?',
          requestedAt: '2024-01-15T10:30:00Z',
          skills: ['Software Engineering', 'Career Development', 'Programming']
        },
        {
          id: '2',
          studentName: 'Emily Chen',
          studentAvatar: '',
          message: 'Interested in learning about product management and your journey at Google.',
          requestedAt: '2024-01-14T15:45:00Z',
          skills: ['Product Management', 'Leadership', 'Strategy']
        },
        {
          id: '3',
          studentName: 'Michael Rodriguez',
          studentAvatar: '',
          message: 'Would you be available to mentor me in data science and machine learning?',
          requestedAt: '2024-01-13T09:20:00Z',
          skills: ['Data Science', 'Machine Learning', 'Python']
        }
      ]);
    };

    fetchDashboardData();

    // Initialize socket connection for real-time updates
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socketio'
    });
    setSocket(socketInstance);

    // Listen for real-time updates
    socketInstance.on('new_mentorship_request', (data) => {
      setMentorshipRequests(prev => [data, ...prev]);
      setStats(prev => ({ ...prev, totalMentorshipRequests: prev.totalMentorshipRequests + 1, pendingMentorshipRequests: prev.pendingMentorshipRequests + 1 }));
    });

    socketInstance.on('new_job_application', (data) => {
      setRecentActivities(prev => [{
        id: Date.now().toString(),
        type: 'job',
        title: 'New Job Application',
        description: `${data.applicantName} applied to ${data.jobTitle}`,
        timestamp: 'Just now',
        status: 'pending'
      }, ...prev]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mentorship': return <MessageSquare className="h-4 w-4" />;
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'donation': return <Heart className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <ProfileHeader 
        user={{
          ...user!,
          graduationYear: 2020, // This would come from alumni data
          degree: "Bachelor of Science", // This would come from alumni data
          company: "Tech Corp", // This would come from alumni data
          position: "Senior Engineer", // This would come from alumni data
          industry: "Technology", // This would come from alumni data
        }}
        onUpdate={(updatedData) => {
          console.log('Profile updated:', updatedData);
          // Here you would typically update the user data via API
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorship Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMentorshipRequests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingMentorshipRequests} pending response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs Posted</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobsPosted}</div>
            <p className="text-xs text-muted-foreground">
              Opportunities available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalDonations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events to attend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConnections}</div>
            <p className="text-xs text-muted-foreground">
              Professional connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              Community contribution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-sm text-slate-600">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-slate-500">{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Mentorship Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Mentorship Requests</CardTitle>
            <CardDescription>Students seeking your guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mentorshipRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{request.studentName}</h4>
                        <p className="text-sm text-slate-600 mt-1">{request.message}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {request.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Requested {formatDate(request.requestedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
              {mentorshipRequests.length > 3 && (
                <Button variant="outline" className="w-full">
                  View All Requests ({mentorshipRequests.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Briefcase className="h-6 w-6 mb-2" />
              <span className="text-sm">Post a Job</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <MessageSquare className="h-6 w-6 mb-2" />
              <span className="text-sm">View Mentorship</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Heart className="h-6 w-6 mb-2" />
              <span className="text-sm">Make Donation</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">View Events</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}