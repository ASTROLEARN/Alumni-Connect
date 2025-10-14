'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X, 
  Search,
  Filter,
  Clock,
  User,
  Briefcase,
  Calendar,
  MessageSquare,
  Award,
  Trash2,
  Eye,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';


interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  category: 'job' | 'event' | 'mentorship' | 'alumni' | 'system' | 'user';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId?: string;
  userName?: string;
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
  byCategory: {
    job: number;
    event: number;
    mentorship: number;
    alumni: number;
    system: number;
    user: number;
  };
  byType: {
    info: number;
    warning: number;
    success: number;
    error: number;
  };
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, filterCategory, filterType, filterPriority, showUnreadOnly]);

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

      // Listen for new notifications
      socketInstance.on('new_notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      // Listen for job posting notifications
      socketInstance.on('new_job_posted', (data) => {
        const notification: Notification = {
          id: `job_${Date.now()}`,
          type: 'info',
          title: 'New Job Posted',
          message: `New job "${data.title}" posted by ${data.postedBy}`,
          category: 'job',
          priority: 'medium',
          userId: data.postedById,
          userName: data.postedBy,
          targetUrl: '/jobs',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [notification, ...prev]);
      });

      // Listen for event creation notifications
      socketInstance.on('new_event_created', (data) => {
        const notification: Notification = {
          id: `event_${Date.now()}`,
          type: 'info',
          title: 'New Event Created',
          message: `New event "${data.title}" scheduled for ${data.date}`,
          category: 'event',
          priority: 'medium',
          userId: data.createdById,
          userName: data.createdBy,
          targetUrl: '/events',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [notification, ...prev]);
      });

      // Listen for mentorship request notifications
      socketInstance.on('new_mentorship_request', (data) => {
        const notification: Notification = {
          id: `mentorship_${Date.now()}`,
          type: 'info',
          title: 'New Mentorship Request',
          message: `${data.studentName} requested mentorship from ${data.mentorName}`,
          category: 'mentorship',
          priority: 'high',
          userId: data.studentId,
          userName: data.studentName,
          targetUrl: '/mentorship',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [notification, ...prev]);
      });

      // Listen for alumni verification notifications
      socketInstance.on('new_alumni_verification', (data) => {
        const notification: Notification = {
          id: `verification_${Date.now()}`,
          type: 'warning',
          title: 'Alumni Verification Required',
          message: `${data.userName} has submitted alumni profile for verification`,
          category: 'alumni',
          priority: 'high',
          userId: data.userId,
          userName: data.userName,
          targetUrl: '/admin/pending',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [notification, ...prev]);
      });

      return () => {
        socketInstance.disconnect();
      };
    };

    initializeSocket();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (showUnreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }

    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(n => n.category === filterCategory);
    }

    if (filterType) {
      filtered = filtered.filter(n => n.type === filterType);
    }

    if (filterPriority) {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', {
        method: 'POST'
      });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    try {
      const response = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          type: 'info',
          priority: 'high'
        }),
      });

      if (response.ok) {
        setBroadcastTitle('');
        setBroadcastMessage('');
        setShowBroadcast(false);
        
        // Add confirmation notification
        const confirmation: Notification = {
          id: `broadcast_${Date.now()}`,
          type: 'success',
          title: 'Broadcast Sent',
          message: 'Your announcement has been sent to all users',
          category: 'system',
          priority: 'medium',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [confirmation, ...prev]);
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'mentorship': return <MessageSquare className="h-4 w-4" />;
      case 'alumni': return <User className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading notifications...</p>
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
              <h1 className="text-3xl font-bold text-slate-900">Notification Center</h1>
              <p className="text-slate-600 mt-2">Real-time notifications and system alerts</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowBroadcast(true)}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Broadcast</span>
              </Button>
              <Button 
                onClick={markAllAsRead}
                variant="outline"
                disabled={!notifications.some(n => !n.isRead)}
              >
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-sm text-slate-600">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.unread}</p>
                      <p className="text-sm text-slate-600">Unread</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.urgent}</p>
                      <p className="text-sm text-slate-600">Urgent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.byCategory.job}</p>
                      <p className="text-sm text-slate-600">Jobs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.byCategory.event}</p>
                      <p className="text-sm text-slate-600">Events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.byCategory.mentorship}</p>
                      <p className="text-sm text-slate-600">Mentorship</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Broadcast Modal */}
        {showBroadcast && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Send Broadcast Announcement
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowBroadcast(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Announcement title..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Announcement message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowBroadcast(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={sendBroadcast}
                    disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
                  >
                    Send Broadcast
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="job">Jobs</option>
                <option value="event">Events</option>
                <option value="mentorship">Mentorship</option>
                <option value="alumni">Alumni</option>
                <option value="user">Users</option>
                <option value="system">System</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="unreadOnly"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="unreadOnly" className="text-sm">Unread only</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`hover:shadow-lg transition-shadow duration-300 ${
                  !notification.isRead ? 'border-blue-200 bg-blue-50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'warning' ? 'bg-yellow-100' :
                        notification.type === 'error' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        {getCategoryIcon(notification.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{notification.title}</h3>
                          {getTypeIcon(notification.type)}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-slate-600 mb-3">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                          {notification.userName && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{notification.userName}</span>
                            </div>
                          )}
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {!notification.isRead && (
                        <Button 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Mark Read
                        </Button>
                      )}
                      {notification.targetUrl && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = notification.targetUrl!}
                        >
                          View
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Notifications Found</h3>
                <p className="text-slate-600">
                  {searchTerm || filterCategory || filterType || filterPriority || showUnreadOnly
                    ? 'Try adjusting your filter criteria.'
                    : 'You\'re all caught up! No new notifications.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}