'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Calendar,
  MapPin,
  Briefcase,
  MessageSquare,
  Award,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  action: string;
  category: 'profile' | 'jobs' | 'events' | 'mentorship' | 'stories' | 'directory' | 'system';
  page: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

interface EngagementMetrics {
  totalUsers: number;
  activeUsers: number;
  pageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueUsers: number;
  }>;
  userJourneys: Array<{
    userId: string;
    userName: string;
    path: string[];
    duration: number;
    conversions: number;
  }>;
  contentPopularity: Array<{
    type: 'job' | 'event' | 'story' | 'alumni';
    id: string;
    title: string;
    views: number;
    interactions: number;
    conversionRate: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    pageViews: number;
    uniqueUsers: number;
    sessions: number;
  }>;
}

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  startTime: string;
  endTime?: string;
  duration: number;
  pages: string[];
  actions: number;
  device?: string;
  browser?: string;
  location?: string;
}

export default function UserActivityMonitor() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityData();
  }, [timeRange]);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const [activitiesRes, sessionsRes, metricsRes] = await Promise.all([
        fetch(`/api/admin/activities?range=${timeRange}`),
        fetch(`/api/admin/sessions?range=${timeRange}`),
        fetch(`/api/admin/engagement-metrics?range=${timeRange}`)
      ]);

      if (activitiesRes.ok) setActivities(await activitiesRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredActivities = () => {
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.page.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(activity => activity.category === filterCategory);
    }

    if (filterAction) {
      filtered = filtered.filter(activity => activity.action.includes(filterAction));
    }

    if (selectedUser) {
      filtered = filtered.filter(activity => activity.userId === selectedUser);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile': return <Users className="h-4 w-4" />;
      case 'jobs': return <Briefcase className="h-4 w-4" />;
      case 'events': return <Calendar className="h-4 w-4" />;
      case 'mentorship': return <MessageSquare className="h-4 w-4" />;
      case 'stories': return <Award className="h-4 w-4" />;
      case 'directory': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('view') || action.includes('read')) return 'text-blue-600';
    if (action.includes('click') || action.includes('navigate')) return 'text-green-600';
    if (action.includes('create') || action.includes('post')) return 'text-purple-600';
    if (action.includes('update') || action.includes('edit')) return 'text-orange-600';
    if (action.includes('delete') || action.includes('remove')) return 'text-red-600';
    return 'text-slate-600';
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const exportReport = () => {
    if (!metrics) return;

    const report = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalUsers: metrics.totalUsers,
        activeUsers: metrics.activeUsers,
        pageViews: metrics.pageViews,
        averageSessionDuration: metrics.averageSessionDuration,
        bounceRate: metrics.bounceRate
      },
      topPages: metrics.topPages,
      contentPopularity: metrics.contentPopularity,
      recentActivities: getFilteredActivities().slice(0, 100),
      activeSessions: sessions.filter(s => !s.endTime)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_activity_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading user activity data...</p>
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

  const filteredActivities = getFilteredActivities();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">User Activity Monitor</h1>
              <p className="text-slate-600 mt-2">Real-time user activity tracking and engagement analytics</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Button onClick={fetchActivityData} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics.totalUsers}</p>
                      <p className="text-sm text-slate-600">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                      <p className="text-sm text-slate-600">Active Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics.pageViews.toLocaleString()}</p>
                      <p className="text-sm text-slate-600">Page Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatDuration(metrics.averageSessionDuration)}</p>
                      <p className="text-sm text-slate-600">Avg. Session</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold">{(metrics.bounceRate * 100).toFixed(1)}%</p>
                      <p className="text-sm text-slate-600">Bounce Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search users, actions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="profile">Profile</option>
                    <option value="jobs">Jobs</option>
                    <option value="events">Events</option>
                    <option value="mentorship">Mentorship</option>
                    <option value="stories">Stories</option>
                    <option value="directory">Directory</option>
                    <option value="system">System</option>
                  </select>
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">All Actions</option>
                    <option value="view">View</option>
                    <option value="click">Click</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity ({filteredActivities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.slice(0, 50).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {getCategoryIcon(activity.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{activity.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {activity.userRole}
                            </Badge>
                            <span className={`text-xs ${getActionColor(activity.action)}`}>
                              {activity.action}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            {activity.page} • {activity.category}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>{new Date(activity.timestamp).toLocaleString()}</span>
                            {activity.duration && (
                              <span>{formatDuration(activity.duration)}</span>
                            )}
                            {activity.ipAddress && (
                              <span>{activity.ipAddress}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No activity found for the selected criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-6">
            {/* Top Pages */}
            {metrics && metrics.topPages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Top Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.topPages.slice(0, 5).map((page, index) => (
                      <div key={page.page} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium truncate">{page.page}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{page.views}</div>
                          <div className="text-xs text-slate-500">{page.uniqueUsers} users</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Popularity */}
            {metrics && metrics.contentPopularity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Popular Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.contentPopularity.slice(0, 5).map((content) => (
                      <div key={content.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {content.type === 'job' && <Briefcase className="h-4 w-4 text-blue-600" />}
                          {content.type === 'event' && <Calendar className="h-4 w-4 text-green-600" />}
                          {content.type === 'story' && <Award className="h-4 w-4 text-purple-600" />}
                          {content.type === 'alumni' && <Users className="h-4 w-4 text-orange-600" />}
                          <span className="text-sm font-medium truncate">{content.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{content.views}</div>
                          <div className="text-xs text-slate-500">
                            {((content.conversionRate || 0) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Active Sessions ({sessions.filter(s => !s.endTime).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {sessions.filter(s => !s.endTime).slice(0, 10).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <div className="text-sm font-medium">{session.userName}</div>
                        <div className="text-xs text-slate-600">
                          {session.pages.length} pages • {formatDuration(session.duration)}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(session.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {sessions.filter(s => !s.endTime).length === 0 && (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">No active sessions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Journey Preview */}
            {metrics && metrics.userJourneys.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    User Journeys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.userJourneys.slice(0, 3).map((journey) => (
                      <div key={journey.userId} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{journey.userName}</span>
                          <Badge variant="outline">
                            {journey.conversions} conversions
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600 mb-1">
                          {journey.path.slice(0, 3).join(' → ')}
                          {journey.path.length > 3 && ' → ...'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDuration(journey.duration)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}