'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Award, 
  TrendingUp, 
  DollarSign,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function QuickStatsDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

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

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = "blue" 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    trend?: { value: number; label: string };
    color?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center space-x-1 mt-2">
            <TrendingUp className={`h-3 w-3 ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-xs ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Platform Statistics</h2>
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Statistics</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Statistics</h2>
          <p className="text-muted-foreground">
            Real-time insights about your alumni network
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </span>
          <Button onClick={fetchStats} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2" />
          User Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            subtitle={`${stats.users.newThisMonth} new this month`}
            icon={Users}
            trend={{ value: stats.users.newThisMonth, label: `${stats.users.newThisMonth} new` }}
            color="blue"
          />
          <StatCard
            title="Students"
            value={stats.users.students}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Alumni"
            value={stats.users.alumni}
            subtitle={`${stats.users.verifiedAlumni} verified`}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Administrators"
            value={stats.users.admins}
            icon={Users}
            color="red"
          />
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Platform Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Job Postings"
            value={stats.jobs.total}
            subtitle={`${stats.jobs.newThisMonth} new this month`}
            icon={Briefcase}
            trend={{ value: stats.jobs.newThisMonth, label: `${stats.jobs.newThisMonth} new` }}
            color="blue"
          />
          <StatCard
            title="Job Applications"
            value={stats.jobs.totalApplications}
            subtitle={`${stats.jobs.recentApplications} this month`}
            icon={Briefcase}
            color="green"
          />
          <StatCard
            title="Events"
            value={stats.events.total}
            subtitle={`${stats.events.upcoming} upcoming`}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="Event Registrations"
            value={stats.events.totalRegistrations}
            icon={Calendar}
            color="orange"
          />
        </div>
      </div>

      {/* Engagement Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Engagement Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Mentorship Requests"
            value={stats.mentorship.totalRequests}
            subtitle={`${stats.mentorship.pending} pending`}
            icon={MessageSquare}
            color="blue"
          />
          <StatCard
            title="Accepted Mentorships"
            value={stats.mentorship.accepted}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Success Stories"
            value={stats.content.successStories.total}
            subtitle={`${stats.content.successStories.published} published`}
            icon={Award}
            color="purple"
          />
          <StatCard
            title="Total Donations"
            value={`$${stats.content.donations.totalAmount.toLocaleString()}`}
            subtitle={`${stats.content.donations.total} donations`}
            icon={DollarSign}
            color="green"
          />
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">All systems operational</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Connected</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{lastUpdated}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}