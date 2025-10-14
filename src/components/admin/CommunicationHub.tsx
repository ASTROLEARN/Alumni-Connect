'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Bell, 
  Users, 
  User, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Smile,
  MoreHorizontal,
  Phone,
  Video,
  Calendar,
  Star,
  Trash2,
  Archive,
  Reply,
  Forward,
  Download,
  RefreshCw,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';


interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  receiverId: string;
  receiverName: string;
  content: string;
  type: 'direct' | 'announcement' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  createdAt: string;
  readAt?: string;
  threadId?: string;
  metadata?: Record<string, any>;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  targetAudience: 'all' | 'students' | 'alumni' | 'admins';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  scheduledAt?: string;
  expiresAt?: string;
  deliveryMethod: 'in_app' | 'email' | 'both';
  readCount: number;
  totalRecipients: number;
  createdAt: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'welcome' | 'notification' | 'reminder' | 'announcement' | 'follow_up';
  variables: string[];
  isActive: boolean;
  lastUsed?: string;
  usageCount: number;
}

interface Conversation {
  id: string;
  participants: Array<{
    userId: string;
    name: string;
    role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
    lastActive: string;
  }>;
  lastMessage: Message;
  unreadCount: number;
  isArchived: boolean;
  tags: string[];
  createdAt: string;
}

export default function CommunicationHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements' | 'emails' | 'templates'>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    recipient: '',
    subject: '',
    content: '',
    priority: 'medium' as const,
    deliveryMethod: 'in_app' as const
  });

  useEffect(() => {
    fetchCommunicationData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

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

      // Real-time message updates
      socketInstance.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
        updateConversationLastMessage(message);
      });

      socketInstance.on('message_delivered', (data: { messageId: string; timestamp: string }) => {
        setMessages(prev =>
          prev.map(msg => msg.id === data.messageId 
            ? { ...msg, status: 'delivered' } 
            : msg
          )
        );
      });

      socketInstance.on('message_read', (data: { messageId: string; timestamp: string }) => {
        setMessages(prev =>
          prev.map(msg => msg.id === data.messageId 
            ? { ...msg, status: 'read', readAt: data.timestamp } 
            : msg
          )
        );
      });

      return () => {
        socketInstance.disconnect();
      };
    };

    initializeSocket();
  }, [user]);

  const fetchCommunicationData = async () => {
    try {
      const [conversationsRes, announcementsRes, templatesRes] = await Promise.all([
        fetch('/api/admin/conversations'),
        fetch('/api/admin/announcements'),
        fetch('/api/admin/email-templates')
      ]);

      if (conversationsRes.ok) setConversations(await conversationsRes.json());
      if (announcementsRes.ok) setAnnouncements(await announcementsRes.json());
      if (templatesRes.ok) setEmailTemplates(await templatesRes.json());
    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}/messages`);
      if (response.ok) {
        setMessages(await response.json());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const updateConversationLastMessage = (message: Message) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.participants.some(p => p.userId === message.senderId) || 
            conv.participants.some(p => p.userId === message.receiverId)) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount: message.senderId !== user?.id ? conv.unreadCount + 1 : conv.unreadCount
          };
        }
        return conv;
      })
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        conversationId: selectedConversation,
        content: newMessage,
        type: 'direct' as const,
        priority: 'medium' as const
      };

      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        setNewMessage('');
        // Socket will handle real-time update
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendAnnouncement = async () => {
    if (!composeData.subject.trim() || !composeData.content.trim()) return;

    try {
      const announcementData = {
        title: composeData.subject,
        content: composeData.content,
        targetAudience: 'all' as const,
        priority: composeData.priority,
        deliveryMethod: composeData.deliveryMethod
      };

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      });

      if (response.ok) {
        setShowCompose(false);
        setComposeData({
          recipient: '',
          subject: '',
          content: '',
          priority: 'medium',
          deliveryMethod: 'in_app'
        });
        fetchCommunicationData();
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
    }
  };

  const sendEmail = async (templateId: string, recipientEmail: string, variables: Record<string, string>) => {
    try {
      const emailData = {
        templateId,
        recipientEmail,
        variables
      };

      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        // Update template usage count
        setEmailTemplates(prev =>
          prev.map(template =>
            template.id === templateId
              ? { ...template, usageCount: template.usageCount + 1, lastUsed: new Date().toISOString() }
              : template
          )
        );
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/admin/messages/${messageId}/read`, {
        method: 'POST'
      });

      setMessages(prev =>
        prev.map(msg => msg.id === messageId 
          ? { ...msg, status: 'read', readAt: new Date().toISOString() } 
          : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      await fetch(`/api/admin/conversations/${conversationId}/archive`, {
        method: 'POST'
      });

      setConversations(prev =>
        prev.map(conv => conv.id === conversationId 
          ? { ...conv, isArchived: true } 
          : conv
        )
      );
    } catch (error) {
      console.error('Error archiving conversation:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Clock className="h-3 w-3 text-slate-400" />;
      case 'delivered': return <CheckCircle className="h-3 w-3 text-blue-600" />;
      case 'read': return <CheckCircle className="h-3 w-3 text-green-600" />;
      default: return <AlertCircle className="h-3 w-3 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading communication hub...</p>
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
              <h1 className="text-3xl font-bold text-slate-900">Communication Hub</h1>
              <p className="text-slate-600 mt-2">Manage messages, announcements, and email communications</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowCompose(true)}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>New Message</span>
              </Button>
              <Button onClick={fetchCommunicationData} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{conversations.length}</p>
                    <p className="text-sm text-slate-600">Conversations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{announcements.filter(a => a.isActive).length}</p>
                    <p className="text-sm text-slate-600">Active Announcements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{emailTemplates.length}</p>
                    <p className="text-sm text-slate-600">Email Templates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
                    </p>
                    <p className="text-sm text-slate-600">Unread Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Compose New Message
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowCompose(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Recipient email or name..."
                  value={composeData.recipient}
                  onChange={(e) => setComposeData(prev => ({ ...prev, recipient: e.target.value }))}
                />
                <Input
                  placeholder="Subject..."
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                />
                <Textarea
                  placeholder="Message content..."
                  value={composeData.content}
                  onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={composeData.priority}
                    onChange={(e) => setComposeData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <select
                    value={composeData.deliveryMethod}
                    onChange={(e) => setComposeData(prev => ({ ...prev, deliveryMethod: e.target.value as any }))}
                    className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="in_app">In-App Only</option>
                    <option value="email">Email Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCompose(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={sendAnnouncement}
                    disabled={!composeData.subject.trim() || !composeData.content.trim()}
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'messages', label: 'Messages', icon: MessageSquare, count: conversations.reduce((sum, conv) => sum + conv.unreadCount, 0) },
            { id: 'announcements', label: 'Announcements', icon: Bell, count: announcements.filter(a => a.isActive).length },
            { id: 'emails', label: 'Email Templates', icon: Mail, count: emailTemplates.length }
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

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Conversations List */}
          <div className="space-y-4">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Conversations List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {conversations.filter(conv => !conv.isArchived).map((conversation) => (
                <Card 
                  key={conversation.id}
                  className={`cursor-pointer transition-colors ${
                    selectedConversation === conversation.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {conversation.participants.find(p => p.userId !== user?.id)?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {conversation.participants.find(p => p.userId !== user?.id)?.role}
                          </div>
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 truncate">
                      {conversation.lastMessage.content}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-slate-500">
                        {new Date(conversation.lastMessage.createdAt).toLocaleTimeString()}
                      </div>
                      <Badge className={getPriorityColor(conversation.lastMessage.priority)}>
                        {conversation.lastMessage.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <>
                {selectedConversation ? (
                  <Card className="h-96 flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {conversations.find(c => c.id === selectedConversation)?.participants.find(p => p.userId !== user?.id)?.name || 'Conversation'}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${
                            message.senderId === user?.id 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-200 text-slate-900'
                          } rounded-lg p-3`}>
                            <div className="text-sm">{message.content}</div>
                            <div className={`flex items-center justify-between mt-1 text-xs ${
                              message.senderId === user?.id ? 'text-blue-100' : 'text-slate-500'
                            }`}>
                              <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                              {message.senderId === user?.id && getStatusIcon(message.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <CardContent className="text-center">
                      <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                      <p className="text-slate-600">Choose a conversation from the list to start messaging</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{announcement.title}</h3>
                              <Badge className={getPriorityColor(announcement.priority)}>
                                {announcement.priority}
                              </Badge>
                              {announcement.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge variant="outline">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">
                              By {announcement.senderName} • {announcement.targetAudience} • {announcement.deliveryMethod}
                            </p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <div>{announcement.readCount}/{announcement.totalRecipients} read</div>
                            <div>{new Date(announcement.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <p className="text-slate-700 mb-3">{announcement.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            {announcement.scheduledAt && `Scheduled: ${new Date(announcement.scheduledAt).toLocaleDateString()}`}
                            {announcement.expiresAt && ` • Expires: ${new Date(announcement.expiresAt).toLocaleDateString()}`}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email Templates Tab */}
            {activeTab === 'emails' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emailTemplates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{template.name}</h3>
                              <Badge variant="outline">{template.category}</Badge>
                              {template.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge variant="outline">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">Subject: {template.subject}</p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <div>{template.usageCount} uses</div>
                            <div>
                              {template.lastUsed 
                                ? new Date(template.lastUsed).toLocaleDateString() 
                                : 'Never used'
                              }
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-700 mb-3 line-clamp-2">{template.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            Variables: {template.variables.join(', ')}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Send className="h-3 w-3 mr-1" />
                              Use
                            </Button>
                          </div>
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