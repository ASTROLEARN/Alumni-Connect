'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Award,
  Download,
  RefreshCw,
  Filter,
  Search,
  Target,
  Activity,
  Clock,
  MapPin,
  Star,
  Eye,
  MousePointer,
  Zap,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Calendar as CalendarIcon,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CrossPageAnalytics {
  userJourneys: Array<{
    userId: string;
    userName: string;
    path: string[];
    duration: number;
    pagesVisited: number;
    conversions: Array<{
      type: 'job_application' | 'event_registration' | 'mentorship_request' | 'alumni_connection';
      timestamp: string;
      value: number;
    }>;
    entryPoint: string;
    exitPoint: string;
    device: string;
    location?: string;
  }>;
  contentInteractions: Array<{
    contentType: 'job' | 'event' | 'story' | 'alumni_profile';
    contentId: string;
    title: string;
    views: number;
    clicks: number;
    shares: number;
    timeSpent: number;
    conversionRate: number;
    relatedContent: string[];
  }>;
  conversionFunnels: Array<{
    funnelName: string;
    steps: Array<{
      stepName: string;
      stepNumber: number;
      users: number;
      dropoffRate: number;
      avgTimeSpent: number;
    }>;
    totalConversions: number;
    conversionRate: number;
    avgConversionTime: number;
  }>;
  engagementMetrics: {
    dailyActiveUsers: Array<{
      date: string;
      students: number;
      alumni: number;
      admins: number;
      total: number;
    }>;
    pagePerformance: Array<{
      page: string;
      avgTimeSpent: number;
      bounceRate: number;
      scrollDepth: number;
      interactions: number;
    }>;
    featureUsage: Array<{
      feature: string;
      usageCount: number;
      uniqueUsers: number;
      satisfaction: number;
    }>;
  };
  retentionAnalysis: {
    userRetention: Array<{
      period: string;
      newUsers: number;
      returningUsers: number;
      retentionRate: number;
      churnRate: number;
    }>;
    cohortAnalysis: Array<{
      cohort: string;
      size: number;
      day1: number;
      day7: number;
      day30: number;
      day90: number;
    }>;
  };
}

interface ConversionMetrics {
  studentToAlumni: {
    totalStudents: number;
    convertedAlumni: number;
    conversionRate: number;
    avgConversionTime: number;
    topConversionPaths: Array<{
      path: string;
      conversions: number;
    }>;
  };
  jobApplications: {
    totalApplications: number;
    uniqueApplicants: number;
    hired: number;
    interviewRate: number;
    hireRate: number;
    avgTimeToHire: number;
    topPerformingJobs: Array<{
      jobId: string;
      title: string;
      applications: number;
      hires: number;
    }>;
  };
  eventEngagement: {
    totalEvents: number;
    totalRegistrations: number;
    attendanceRate: number;
    avgRegistrationsPerEvent: number;
    networkingConnections: number;
    topEventTypes: Array<{
      type: string;
      count: number;
      avgAttendance: number;
    }>;
  };
  mentorshipSuccess: {
    totalRequests: number;
    acceptedRequests: number;
    completedMentorships: number;
    successRate: number;
    avgMentorshipDuration: number;
    satisfactionScore: number;
    topMentors: Array<{
      mentorId: string;
      mentorName: string;
      mentorships: number;
      rating: number;
    }>;
  };
}

export default function AdvancedReporting() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<CrossPageAnalytics | null>(null);
  const [conversions, setConversions] = useState<ConversionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [reportType, setReportType] = useState<'journeys' | 'conversions' | 'engagement' | 'retention'>('journeys');
  const [selectedFunnel, setSelectedFunnel] = useState<string>('');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, conversionsRes] = await Promise.all([
        fetch(`/api/admin/cross-page-analytics?range=${timeRange}`),
        fetch(`/api/admin/conversion-metrics?range=${timeRange}`)
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (conversionsRes.ok) setConversions(await conversionsRes.json());
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch(`/api/admin/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeRange,
          reportType,
          includeAnalytics: !!analytics,
          includeConversions: !!conversions
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `advanced_report_${timeRange}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading advanced analytics...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Advanced Reporting</h1>
              <p className="text-slate-600 mt-2">Cross-page analytics, user journeys, and conversion metrics</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <Button onClick={fetchAnalyticsData} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={generateReport}>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="flex space-x-1">
            {[
              { id: 'journeys', label: 'User Journeys', icon: ArrowRight },
              { id: 'conversions', label: 'Conversions', icon: Target },
              { id: 'engagement', label: 'Engagement', icon: Activity },
              { id: 'retention', label: 'Retention', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  reportType === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Journeys Report */}
        {reportType === 'journeys' && analytics && (
          <div className="space-y-6">
            {/* Journey Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{analytics.userJourneys.length}</p>
                      <p className="text-sm text-slate-600">Total Journeys</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {formatDuration(analytics.userJourneys.reduce((sum, j) => sum + j.duration, 0) / analytics.userJourneys.length)}
                      </p>
                      <p className="text-sm text-slate-600">Avg. Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {analytics.userJourneys.reduce((sum, j) => sum + j.conversions.length, 0)}
                      </p>
                      <p className="text-sm text-slate-600">Total Conversions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {formatPercentage(analytics.userJourneys.filter(j => j.conversions.length > 0).length / analytics.userJourneys.length)}
                      </p>
                      <p className="text-sm text-slate-600">Conversion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top User Journeys */}
            <Card>
              <CardHeader>
                <CardTitle>Top User Journeys</CardTitle>
                <CardDescription>Most common paths and conversion patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.userJourneys.slice(0, 5).map((journey) => (
                    <div key={journey.userId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{journey.userName}</h3>
                          <p className="text-sm text-slate-600">
                            {journey.device} • {journey.location || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{journey.conversions.length} conversions</div>
                          <div className="text-xs text-slate-500">{formatDuration(journey.duration)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-slate-600">Path:</span>
                        <div className="flex items-center space-x-1">
                          {journey.path.slice(0, 4).map((page, index) => (
                            <React.Fragment key={index}>
                              <span className="text-sm bg-slate-100 px-2 py-1 rounded">{page}</span>
                              {index < journey.path.slice(0, 4).length - 1 && (
                                <ArrowRight className="h-3 w-3 text-slate-400" />
                              )}
                            </React.Fragment>
                          ))}
                          {journey.path.length > 4 && (
                            <span className="text-sm text-slate-500">+{journey.path.length - 4} more</span>
                          )}
                        </div>
                      </div>
                      {journey.conversions.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-600">Conversions:</span>
                          <div className="flex flex-wrap gap-1">
                            {journey.conversions.map((conversion, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {conversion.type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Interactions */}
            <Card>
              <CardHeader>
                <CardTitle>Content Interaction Analysis</CardTitle>
                <CardDescription>How users interact with different types of content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.contentInteractions.slice(0, 5).map((content) => (
                    <div key={content.contentId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{content.title}</h3>
                          <p className="text-sm text-slate-600">{content.contentType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatPercentage(content.conversionRate)} conversion</div>
                          <div className="text-xs text-slate-500">{formatDuration(content.timeSpent)} avg</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500">Views</div>
                          <div className="font-medium">{content.views}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Clicks</div>
                          <div className="font-medium">{content.clicks}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Shares</div>
                          <div className="font-medium">{content.shares}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Engagement</div>
                          <div className="font-medium">
                            {content.views > 0 ? formatPercentage((content.clicks + content.shares) / content.views) : '0%'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conversions Report */}
        {reportType === 'conversions' && conversions && (
          <div className="space-y-6">
            {/* Conversion Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatPercentage(conversions.studentToAlumni.conversionRate)}</p>
                      <p className="text-sm text-slate-600">Student → Alumni</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatPercentage(conversions.jobApplications.hireRate)}</p>
                      <p className="text-sm text-slate-600">Job Hire Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatPercentage(conversions.eventEngagement.attendanceRate)}</p>
                      <p className="text-sm text-slate-600">Event Attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatPercentage(conversions.mentorshipSuccess.successRate)}</p>
                      <p className="text-sm text-slate-600">Mentorship Success</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnels */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnels</CardTitle>
                <CardDescription>Track user progression through key conversion paths</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics?.conversionFunnels.slice(0, 2).map((funnel) => (
                    <div key={funnel.funnelName} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{funnel.funnelName}</h3>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatPercentage(funnel.conversionRate)} overall</div>
                          <div className="text-xs text-slate-500">{funnel.totalConversions} conversions</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {funnel.steps.map((step) => (
                          <div key={step.stepNumber} className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                              {step.stepNumber}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{step.stepName}</span>
                                <span className="text-sm">{step.users} users</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(step.users / funnel.steps[0].users) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                <span>{formatPercentage(1 - step.dropoffRate)} retention</span>
                                <span>{formatDuration(step.avgTimeSpent)} avg</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conversions.jobApplications.topPerformingJobs.slice(0, 5).map((job) => (
                      <div key={job.jobId} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{job.title}</div>
                          <div className="text-xs text-slate-600">{job.applications} applications</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">{job.hires} hired</div>
                          <div className="text-xs text-slate-500">
                            {job.applications > 0 ? formatPercentage(job.hires / job.applications) : '0%'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Mentors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conversions.mentorshipSuccess.topMentors.slice(0, 5).map((mentor) => (
                      <div key={mentor.mentorId} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{mentor.mentorName}</div>
                          <div className="text-xs text-slate-600">{mentor.mentorships} mentorships</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm font-medium">{mentor.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Engagement Report */}
        {reportType === 'engagement' && analytics && (
          <div className="space-y-6">
            {/* Daily Active Users */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>User engagement trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.engagementMetrics.dailyActiveUsers.slice(0, 7).map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Students</div>
                          <div className="text-sm font-bold text-blue-600">{day.students}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Alumni</div>
                          <div className="text-sm font-bold text-green-600">{day.alumni}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Total</div>
                          <div className="text-sm font-bold">{day.total}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Page Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Page Performance Metrics</CardTitle>
                <CardDescription>How users interact with different pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.engagementMetrics.pagePerformance.slice(0, 5).map((page) => (
                    <div key={page.page} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{page.page}</h3>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatDuration(page.avgTimeSpent)}</div>
                          <div className="text-xs text-slate-500">avg time</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500">Bounce Rate</div>
                          <div className="font-medium">{formatPercentage(page.bounceRate)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Scroll Depth</div>
                          <div className="font-medium">{formatPercentage(page.scrollDepth)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Interactions</div>
                          <div className="font-medium">{page.interactions}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Analytics</CardTitle>
                <CardDescription>Which features are most used and loved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.engagementMetrics.featureUsage.map((feature) => (
                    <div key={feature.feature} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{feature.feature}</h3>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{feature.usageCount}</div>
                            <div className="text-xs text-slate-500">uses</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{feature.uniqueUsers}</div>
                            <div className="text-xs text-slate-500">users</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{feature.satisfaction}/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(feature.satisfaction / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Retention Report */}
        {reportType === 'retention' && analytics && (
          <div className="space-y-6">
            {/* User Retention Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {formatPercentage(analytics.retentionAnalysis.userRetention[0]?.retentionRate || 0)}
                      </p>
                      <p className="text-sm text-slate-600">Retention Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {analytics.retentionAnalysis.userRetention[0]?.returningUsers || 0}
                      </p>
                      <p className="text-sm text-slate-600">Returning Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {formatPercentage(analytics.retentionAnalysis.userRetention[0]?.churnRate || 0)}
                      </p>
                      <p className="text-sm text-slate-600">Churn Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {analytics.retentionAnalysis.userRetention[0]?.newUsers || 0}
                      </p>
                      <p className="text-sm text-slate-600">New Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Retention Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>User Retention Over Time</CardTitle>
                <CardDescription>Monthly retention and churn metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.retentionAnalysis.userRetention.map((period) => (
                    <div key={period.period} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium">{period.period}</div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-xs text-slate-500">New Users</div>
                          <div className="text-sm font-bold">{period.newUsers}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Returning</div>
                          <div className="text-sm font-bold text-green-600">{period.returningUsers}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Retention</div>
                          <div className="text-sm font-bold text-blue-600">{formatPercentage(period.retentionRate)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Churn</div>
                          <div className="text-sm font-bold text-red-600">{formatPercentage(period.churnRate)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cohort Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cohort Analysis</CardTitle>
                <CardDescription>User retention by signup cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.retentionAnalysis.cohortAnalysis.map((cohort) => (
                    <div key={cohort.cohort} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{cohort.cohort} Cohort</h3>
                        <div className="text-sm text-slate-600">{cohort.size} users</div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-xs text-slate-500">Day 1</div>
                          <div className="text-sm font-bold">{formatPercentage(cohort.day1)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Day 7</div>
                          <div className="text-sm font-bold">{formatPercentage(cohort.day7)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Day 30</div>
                          <div className="text-sm font-bold">{formatPercentage(cohort.day30)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Day 90</div>
                          <div className="text-sm font-bold">{formatPercentage(cohort.day90)}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-1">
                        {[cohort.day1, cohort.day7, cohort.day30, cohort.day90].map((retention, index) => (
                          <div 
                            key={index}
                            className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"
                          >
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                              style={{ width: `${retention * 100}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}