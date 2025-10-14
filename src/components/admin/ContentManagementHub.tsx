'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Award, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Plus,
  AlertTriangle,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';


interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  salary: string;
  requirements: string[];
  postedBy: string;
  postedById: string;
  postedAt: string;
  expiresAt: string;
  isActive: boolean;
  isApproved: boolean;
  applicationCount: number;
  category: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'workshop' | 'networking' | 'webinar' | 'conference' | 'reunion';
  maxAttendees: number;
  currentAttendees: number;
  organizer: string;
  organizerId: string;
  createdAt: string;
  isActive: boolean;
  isApproved: boolean;
  category: string;
}

interface SuccessStory {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  alumniId: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  isApproved: boolean;
  createdAt: string;
  publishedAt?: string;
  views: number;
  likes: number;
  featured: boolean;
}

interface MentorshipRequest {
  id: string;
  studentId: string;
  studentName: string;
  mentorId: string;
  mentorName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  category: string;
  goals: string[];
}

export default function ContentManagementHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'events' | 'stories' | 'mentorship'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchAllContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [jobs, events, stories, mentorshipRequests, searchTerm, filterStatus, activeTab]);

  useEffect(() => {
    const initializeSocket = () => {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
        path: '/api/socketio'
      });
      setSocket(socketInstance);

      if (user) {
        socketInstance.emit('authenticate', {
          userId: user.id,
          role: user.role,
        });
      }

      // Real-time updates for new content
      socketInstance.on('new_job_posted', (job: Job) => {
        setJobs(prev => [job, ...prev]);
      });

      socketInstance.on('new_event_created', (event: Event) => {
        setEvents(prev => [event, ...prev]);
      });

      socketInstance.on('new_story_submitted', (story: SuccessStory) => {
        setStories(prev => [story, ...prev]);
      });

      socketInstance.on('new_mentorship_request', (request: MentorshipRequest) => {
        setMentorshipRequests(prev => [request, ...prev]);
      });

      return () => {
        socketInstance.disconnect();
      };
    };

    initializeSocket();
  }, [user]);

  const fetchAllContent = async () => {
    try {
      const [jobsRes, eventsRes, storiesRes, mentorshipRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/events'),
        fetch('/api/success-stories'),
        fetch('/api/mentorship/requests')
      ]);

      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (storiesRes.ok) setStories(await storiesRes.json());
      if (mentorshipRes.ok) setMentorshipRequests(await mentorshipRes.json());
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    // This function would filter content based on search and status
    // Implementation depends on the active tab
  };

  const approveContent = async (type: string, id: string) => {
    try {
      const endpoint = `/api/admin/${type}/approve`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        // Update local state
        switch (type) {
          case 'jobs':
            setJobs(prev => prev.map(job => 
              job.id === id ? { ...job, isApproved: true } : job
            ));
            break;
          case 'events':
            setEvents(prev => prev.map(event => 
              event.id === id ? { ...event, isApproved: true } : event
            ));
            break;
          case 'stories':
            setStories(prev => prev.map(story => 
              story.id === id ? { ...story, isApproved: true } : story
            ));
            break;
        }
      }
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  const rejectContent = async (type: string, id: string, reason?: string) => {
    try {
      const endpoint = `/api/admin/${type}/reject`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reason })
      });

      if (response.ok) {
        // Update local state or remove item
        switch (type) {
          case 'jobs':
            setJobs(prev => prev.filter(job => job.id !== id));
            break;
          case 'events':
            setEvents(prev => prev.filter(event => event.id !== id));
            break;
          case 'stories':
            setStories(prev => prev.filter(story => story.id !== id));
            break;
        }
      }
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  const deleteContent = async (type: string, id: string) => {
    try {
      const endpoint = `/api/admin/${type}/${id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (response.ok) {
        // Remove from local state
        switch (type) {
          case 'jobs':
            setJobs(prev => prev.filter(job => job.id !== id));
            break;
          case 'events':
            setEvents(prev => prev.filter(event => event.id !== id));
            break;
          case 'stories':
            setStories(prev => prev.filter(story => story.id !== id));
            break;
          case 'mentorship':
            setMentorshipRequests(prev => prev.filter(req => req.id !== id));
            break;
        }
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const updateMentorshipStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/mentorship/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        setMentorshipRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status } : req
        ));
      }
    } catch (error) {
      console.error('Error updating mentorship status:', error);
    }
  };

  const getContentStats = () => {
    return {
      jobs: {
        total: jobs.length,
        pending: jobs.filter(j => !j.isApproved).length,
        active: jobs.filter(j => j.isActive && j.isApproved).length,
        expired: jobs.filter(j => new Date(j.expiresAt) < new Date()).length
      },
      events: {
        total: events.length,
        pending: events.filter(e => !e.isApproved).length,
        upcoming: events.filter(e => new Date(e.date) >= new Date() && e.isActive).length,
        past: events.filter(e => new Date(e.date) < new Date()).length
      },
      stories: {
        total: stories.length,
        pending: stories.filter(s => !s.isApproved).length,
        published: stories.filter(s => s.isPublished && s.isApproved).length,
        draft: stories.filter(s => !s.isPublished).length
      },
      mentorship: {
        total: mentorshipRequests.length,
        pending: mentorshipRequests.filter(m => m.status === 'pending').length,
        active: mentorshipRequests.filter(m => m.status === 'accepted').length,
        completed: mentorshipRequests.filter(m => m.status === 'completed').length
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading content management...</p>
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

  const stats = getContentStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Content Management Hub</h1>
              <p className="text-slate-600 mt-2">Manage and moderate all platform content</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.jobs.total}</p>
                    <p className="text-sm text-slate-600">Jobs ({stats.jobs.pending} pending)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.events.total}</p>
                    <p className="text-sm text-slate-600">Events ({stats.events.pending} pending)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.stories.total}</p>
                    <p className="text-sm text-slate-600">Stories ({stats.stories.pending} pending)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.mentorship.total}</p>
                    <p className="text-sm text-slate-600">Mentorship ({stats.mentorship.pending} pending)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'jobs', label: 'Jobs', icon: Briefcase, count: stats.jobs.pending },
            { id: 'events', label: 'Events', icon: Calendar, count: stats.events.pending },
            { id: 'stories', label: 'Success Stories', icon: Award, count: stats.stories.pending },
            { id: 'mentorship', label: 'Mentorship', icon: MessageSquare, count: stats.mentorship.pending }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <Badge className="bg-red-500 text-white text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Content Lists */}
        <div className="space-y-4">
          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <>
              {jobs.filter(job => !job.isApproved).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    Pending Approval ({jobs.filter(job => !job.isApproved).length})
                  </h3>
                  <div className="space-y-4">
                    {jobs.filter(job => !job.isApproved).map((job) => (
                      <Card key={job.id} className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-semibold">{job.title}</h3>
                                  <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-slate-600 mb-2">{job.company} • {job.location}</p>
                                <p className="text-sm text-slate-500 mb-2">
                                  Posted by {job.postedBy} on {new Date(job.postedAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {job.applicationCount} applications • Expires {new Date(job.expiresAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                size="sm"
                                onClick={() => approveContent('jobs', job.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectContent('jobs', job.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedItem(job);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Jobs */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Approved Jobs ({jobs.filter(job => job.isApproved).length})</h3>
                <div className="space-y-4">
                  {jobs.filter(job => job.isApproved).map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <Briefcase className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold">{job.title}</h3>
                                <Badge className="bg-green-100 text-green-800">Approved</Badge>
                                {!job.isActive && <Badge variant="outline">Inactive</Badge>}
                              </div>
                              <p className="text-slate-600 mb-2">{job.company} • {job.location} • {job.salary}</p>
                              <p className="text-sm text-slate-500 mb-2">
                                {job.applicationCount} applications • {job.type}
                              </p>
                              <p className="text-sm text-slate-500">
                                Expires {new Date(job.expiresAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(job);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteContent('jobs', job.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <>
              {events.filter(event => !event.isApproved).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    Pending Approval ({events.filter(event => !event.isApproved).length})
                  </h3>
                  <div className="space-y-4">
                    {events.filter(event => !event.isApproved).map((event) => (
                      <Card key={event.id} className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-semibold">{event.title}</h3>
                                  <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-slate-600 mb-2">
                                  {new Date(event.date).toLocaleDateString()} • {event.time}
                                </p>
                                <p className="text-sm text-slate-500 mb-2">
                                  Organized by {event.organizer} • {event.currentAttendees}/{event.maxAttendees} attendees
                                </p>
                                <p className="text-sm text-slate-500">
                                  {event.type} • {event.location}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                size="sm"
                                onClick={() => approveContent('events', event.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectContent('events', event.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Events */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Approved Events ({events.filter(event => event.isApproved).length})</h3>
                <div className="space-y-4">
                  {events.filter(event => event.isApproved).map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold">{event.title}</h3>
                                <Badge className="bg-green-100 text-green-800">Approved</Badge>
                                {!event.isActive && <Badge variant="outline">Inactive</Badge>}
                              </div>
                              <p className="text-slate-600 mb-2">
                                {new Date(event.date).toLocaleDateString()} • {event.time}
                              </p>
                              <p className="text-sm text-slate-500 mb-2">
                                {event.currentAttendees}/{event.maxAttendees} attendees • {event.type}
                              </p>
                              <p className="text-sm text-slate-500">
                                {event.location} • Organized by {event.organizer}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(event);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteContent('events', event.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Success Stories Tab */}
          {activeTab === 'stories' && (
            <>
              {stories.filter(story => !story.isApproved).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    Pending Approval ({stories.filter(story => !story.isApproved).length})
                  </h3>
                  <div className="space-y-4">
                    {stories.filter(story => !story.isApproved).map((story) => (
                      <Card key={story.id} className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Award className="h-6 w-6 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-semibold">{story.title}</h3>
                                  <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-slate-600 mb-2">By {story.author} • {story.category}</p>
                                <p className="text-sm text-slate-500 mb-2">
                                  {story.tags.join(', ')} • {story.views} views • {story.likes} likes
                                </p>
                                <p className="text-sm text-slate-500">
                                  Submitted {new Date(story.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                size="sm"
                                onClick={() => approveContent('stories', story.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectContent('stories', story.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Stories */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Published Stories ({stories.filter(story => story.isApproved && story.isPublished).length})</h3>
                <div className="space-y-4">
                  {stories.filter(story => story.isApproved).map((story) => (
                    <Card key={story.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <Award className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold">{story.title}</h3>
                                <Badge className="bg-green-100 text-green-800">Approved</Badge>
                                {story.isPublished && <Badge className="bg-blue-100 text-blue-800">Published</Badge>}
                                {story.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                              </div>
                              <p className="text-slate-600 mb-2">By {story.author} • {story.category}</p>
                              <p className="text-sm text-slate-500 mb-2">
                                {story.tags.join(', ')} • {story.views} views • {story.likes} likes
                              </p>
                              <p className="text-sm text-slate-500">
                                {story.isPublished 
                                  ? `Published ${new Date(story.publishedAt!).toLocaleDateString()}`
                                  : `Draft • Submitted ${new Date(story.createdAt).toLocaleDateString()}`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(story);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteContent('stories', story.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Mentorship Tab */}
          {activeTab === 'mentorship' && (
            <>
              {mentorshipRequests.filter(request => request.status === 'pending').length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    Pending Requests ({mentorshipRequests.filter(request => request.status === 'pending').length})
                  </h3>
                  <div className="space-y-4">
                    {mentorshipRequests.filter(request => request.status === 'pending').map((request) => (
                      <Card key={request.id} className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-semibold">
                                    {request.studentName} → {request.mentorName}
                                  </h3>
                                  <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-slate-600 mb-2">{request.category}</p>
                                <p className="text-sm text-slate-500 mb-2">
                                  Requested {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-slate-500">
                                  Goals: {request.goals.join(', ')}
                                </p>
                                {request.message && (
                                  <p className="text-sm text-slate-600 italic mt-2">
                                    "{request.message}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                size="sm"
                                onClick={() => updateMentorshipStatus(request.id, 'accepted')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateMentorshipStatus(request.id, 'rejected')}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* All Mentorship Requests */}
              <div>
                <h3 className="text-lg font-semibold mb-4">All Requests ({mentorshipRequests.length})</h3>
                <div className="space-y-4">
                  {mentorshipRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              request.status === 'accepted' ? 'bg-green-100' :
                              request.status === 'rejected' ? 'bg-red-100' :
                              request.status === 'completed' ? 'bg-blue-100' :
                              'bg-yellow-100'
                            }`}>
                              <MessageSquare className={`h-6 w-6 ${
                                request.status === 'accepted' ? 'text-green-600' :
                                request.status === 'rejected' ? 'text-red-600' :
                                request.status === 'completed' ? 'text-blue-600' :
                                'text-yellow-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {request.studentName} → {request.mentorName}
                                </h3>
                                <Badge className={
                                  request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {request.status}
                                </Badge>
                              </div>
                              <p className="text-slate-600 mb-2">{request.category}</p>
                              <p className="text-sm text-slate-500 mb-2">
                                Created {new Date(request.createdAt).toLocaleDateString()}
                                {request.updatedAt !== request.createdAt && (
                                  <> • Updated {new Date(request.updatedAt).toLocaleDateString()}</>
                                )}
                              </p>
                              <p className="text-sm text-slate-500">
                                Goals: {request.goals.join(', ')}
                              </p>
                              {request.message && (
                                <p className="text-sm text-slate-600 italic mt-2">
                                  "{request.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateMentorshipStatus(request.id, 'accepted')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateMentorshipStatus(request.id, 'rejected')}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {request.status === 'accepted' && (
                              <Button
                                size="sm"
                                onClick={() => updateMentorshipStatus(request.id, 'completed')}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Mark Complete
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteContent('mentorship', request.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}