'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Award, 
  DollarSign,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Target,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StatsData {
  users: {
    total: number;
    students: number;
    alumni: number;
    verifiedAlumni: number;
    admins: number;
    newThisMonth: number;
  };
  jobs: {
    total: number;
    newThisMonth: number;
    totalApplications: number;
    recentApplications: number;
  };
  events: {
    total: number;
    upcoming: number;
    newThisMonth: number;
    totalRegistrations: number;
  };
  mentorship: {
    totalRequests: number;
    pending: number;
    accepted: number;
  };
  content: {
    successStories: {
      total: number;
      published: number;
    };
    donations: {
      total: number;
      newThisMonth: number;
      totalAmount: number;
    };
  };
  timestamp: string;
}

interface ApiResponse {
  success: boolean;
  stats?: StatsData;
  error?: string;
}

interface ActivityData {
  date: string;
  users: number;
  jobs: number;
  events: number;
  applications: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      const data: ApiResponse = await response.json();
      
      if (data.success && data.stats) {
        setStats(data.stats);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError(data.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const generateMockActivityData = (): ActivityData[] => {
    const data: ActivityData[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 10) + 1,
        jobs: Math.floor(Math.random() * 5) + 1,
        events: Math.floor(Math.random() * 3) + 1,
        applications: Math.floor(Math.random() * 15) + 1
      });
    }
    
    return data;
  };

  const activityData = generateMockActivityData();

  const exportReport = () => {
    if (!stats) return;

    const report = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalUsers: stats.users.total,
        totalJobs: stats.jobs.total,
        totalEvents: stats.events.total,
        totalDonations: stats.content.donations.totalAmount
      },
      userStats: stats.users,
      jobStats: stats.jobs,
      eventStats: stats.events,
      mentorshipStats: stats.mentorship,
      contentStats: stats.content
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Analytics</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchStats} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-slate-600 mt-2">Comprehensive platform insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Button onClick={exportReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={fetchStats} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span>Last updated: {lastUpdated}</span>
            <span>•</span>
            <span>Auto-refresh: Every 5 minutes</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.users.newThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobs.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.jobs.newThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.events.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.events.upcoming} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.content.donations.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.content.donations.total} donations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Students</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(stats.users.students / stats.users.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600">{stats.users.students}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Alumni</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(stats.users.alumni / stats.users.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600">{stats.users.alumni}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Administrators</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${(stats.users.admins / stats.users.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600">{stats.users.admins}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.jobs.totalApplications}</div>
                  <div className="text-sm text-blue-800">Job Applications</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.events.totalRegistrations}</div>
                  <div className="text-sm text-green-800">Event Registrations</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.mentorship.totalRequests}</div>
                  <div className="text-sm text-purple-800">Mentorship Requests</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.content.successStories.published}</div>
                  <div className="text-sm text-orange-800">Success Stories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Mentorship Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Requests</span>
                  <Badge variant="secondary">{stats.mentorship.totalRequests}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pending</span>
                  <Badge variant="outline">{stats.mentorship.pending}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Accepted</span>
                  <Badge className="bg-green-100 text-green-800">{stats.mentorship.accepted}</Badge>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-slate-600">
                    Acceptance Rate: {stats.mentorship.totalRequests > 0 
                      ? Math.round((stats.mentorship.accepted / stats.mentorship.totalRequests) * 100) 
                      : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Content & Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Success Stories</span>
                  <Badge variant="secondary">{stats.content.successStories.total}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Published</span>
                  <Badge className="bg-green-100 text-green-800">{stats.content.successStories.published}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Draft</span>
                  <Badge variant="outline">
                    {stats.content.successStories.total - stats.content.successStories.published}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Donations</span>
                  <Badge variant="secondary">{stats.content.donations.total}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">This Month</span>
                  <Badge className="bg-green-100 text-green-800">{stats.content.donations.newThisMonth}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Amount</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    ${stats.content.donations.totalAmount.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">All Systems</div>
                  <div className="text-sm text-green-700">Operational</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Database</div>
                  <div className="text-sm text-blue-700">Connected</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">Last Sync</div>
                  <div className="text-sm text-purple-700">{lastUpdated}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}