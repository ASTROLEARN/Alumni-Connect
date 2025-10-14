'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Search,
  Filter,
  Calendar,
  Star,
  BookOpen,
  Briefcase,
  Award,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

interface MentorshipRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentEmail: string;
  studentYear: string;
  studentMajor: string;
  message: string;
  requestedAt: string;
  skills: string[];
  goals: string[];
  status: 'pending' | 'accepted' | 'declined';
  responseMessage?: string;
  respondedAt?: string;
}

interface MentorshipSession {
  id: string;
  studentName: string;
  studentAvatar?: string;
  topic: string;
  scheduledDate: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export default function AlumniMentorship() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MentorshipRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Simulate API calls
    const fetchMentorshipData = async () => {
      // Mock mentorship requests
      const mockRequests: MentorshipRequest[] = [
        {
          id: '1',
          studentId: 'student1',
          studentName: 'John Smith',
          studentAvatar: '',
          studentEmail: 'john.smith@university.edu',
          studentYear: 'Junior',
          studentMajor: 'Computer Science',
          message: 'I would love to learn from your experience in software engineering. Could you guide me on career development and help me prepare for technical interviews?',
          requestedAt: '2024-01-15T10:30:00Z',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          goals: ['Get internship at tech company', 'Improve coding skills', 'Learn about industry best practices'],
          status: 'pending'
        },
        {
          id: '2',
          studentId: 'student2',
          studentName: 'Emily Chen',
          studentAvatar: '',
          studentEmail: 'emily.chen@university.edu',
          studentYear: 'Sophomore',
          studentMajor: 'Business Administration',
          message: 'Interested in learning about product management and your journey at Google. I want to understand what it takes to become a successful PM.',
          requestedAt: '2024-01-14T15:45:00Z',
          skills: ['Project Management', 'Data Analysis', 'Communication'],
          goals: ['Transition to product management', 'Build leadership skills', 'Network with industry professionals'],
          status: 'pending'
        },
        {
          id: '3',
          studentId: 'student3',
          studentName: 'Michael Rodriguez',
          studentAvatar: '',
          studentEmail: 'michael.rodriguez@university.edu',
          studentYear: 'Senior',
          studentMajor: 'Data Science',
          message: 'Would you be available to mentor me in data science and machine learning? I\'m working on a research project and could use some guidance.',
          requestedAt: '2024-01-13T09:20:00Z',
          skills: ['Python', 'Machine Learning', 'Statistics', 'SQL'],
          goals: ['Complete research project', 'Learn advanced ML techniques', 'Publish paper'],
          status: 'accepted',
          responseMessage: 'I\'d be happy to help with your research project! Let\'s schedule a call next week to discuss your goals.',
          respondedAt: '2024-01-13T14:30:00Z'
        },
        {
          id: '4',
          studentId: 'student4',
          studentName: 'Sarah Johnson',
          studentAvatar: '',
          studentEmail: 'sarah.johnson@university.edu',
          studentYear: 'Freshman',
          studentMajor: 'Computer Engineering',
          message: 'I\'m new to programming and would love some guidance on how to get started with software development.',
          requestedAt: '2024-01-12T16:15:00Z',
          skills: ['Beginner Programming', 'Problem Solving'],
          goals: ['Learn programming fundamentals', 'Build first project', 'Join tech community'],
          status: 'declined',
          responseMessage: 'Thank you for your interest! I\'m currently at capacity with mentorship commitments, but I recommend checking out our university\'s coding club.',
          respondedAt: '2024-01-12T18:45:00Z'
        }
      ];

      // Mock mentorship sessions
      const mockSessions: MentorshipSession[] = [
        {
          id: '1',
          studentName: 'Michael Rodriguez',
          studentAvatar: '',
          topic: 'Machine Learning Research Guidance',
          scheduledDate: '2024-01-20T14:00:00Z',
          duration: 60,
          status: 'scheduled',
          notes: 'Discuss research methodology and ML model selection'
        },
        {
          id: '2',
          studentName: 'Alex Thompson',
          studentAvatar: '',
          topic: 'Career Planning Session',
          scheduledDate: '2024-01-10T15:30:00Z',
          duration: 45,
          status: 'completed',
          notes: 'Discussed career path in software engineering, provided resources for interview preparation'
        }
      ];

      setRequests(mockRequests);
      setSessions(mockSessions);
      setFilteredRequests(mockRequests);
    };

    fetchMentorshipData();

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socketio'
    });
    setSocket(socketInstance);

    // Listen for new mentorship requests
    socketInstance.on('new_mentorship_request', (data) => {
      setRequests(prev => [data, ...prev]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    // Filter requests based on search and status
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.studentMajor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        request.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, searchQuery, statusFilter]);

  const handleAcceptRequest = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setResponseMessage('');
      setShowResponseDialog(true);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setResponseMessage('');
      setShowResponseDialog(true);
    }
  };

  const submitResponse = async (accepted: boolean) => {
    if (selectedRequest && socket) {
      const updatedRequest: MentorshipRequest = {
        ...selectedRequest,
        status: accepted ? 'accepted' : 'declined',
        responseMessage,
        respondedAt: new Date().toISOString()
      };

      // Update local state
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedRequest : r));

      // Emit socket event
      socket.emit('mentorship_response', {
        requestId: selectedRequest.id,
        studentId: selectedRequest.studentId,
        alumniId: user?.id,
        accepted,
        responseMessage
      });

      setShowResponseDialog(false);
      setSelectedRequest(null);
      setResponseMessage('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mentorship Program</h1>
          <p className="text-slate-600 mt-2">Guide and inspire the next generation of professionals</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
            <div className="text-sm text-slate-600">Pending Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
            <div className="text-sm text-slate-600">Active Mentees</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{completedSessions}</div>
            <div className="text-sm text-slate-600">Sessions Completed</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Mentorship Requests</TabsTrigger>
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="impact">My Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search by student name, major, skills..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All ({requests.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending ({pendingCount})
                  </Button>
                  <Button
                    variant={statusFilter === 'accepted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('accepted')}
                  >
                    Accepted ({acceptedCount})
                  </Button>
                  <Button
                    variant={statusFilter === 'declined' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('declined')}
                  >
                    Declined ({requests.filter(r => r.status === 'declined').length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.studentAvatar} />
                        <AvatarFallback>
                          {request.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{request.studentName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                          <span>{request.studentYear} • {request.studentMajor}</span>
                          <span>•</span>
                          <span>{request.studentEmail}</span>
                        </div>
                        <p className="text-slate-700 mb-4">{request.message}</p>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-slate-900 mb-2">Skills & Interests:</h4>
                            <div className="flex flex-wrap gap-2">
                              {request.skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-slate-900 mb-2">Goals:</h4>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {request.goals.map((goal, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{goal}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-3">
                          Requested {formatDate(request.requestedAt)}
                        </p>

                        {request.responseMessage && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Your Response:</h4>
                            <p className="text-sm text-blue-800">{request.responseMessage}</p>
                            {request.respondedAt && (
                              <p className="text-xs text-blue-600 mt-1">
                                Responded {formatDate(request.respondedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex space-x-3 mt-6 pt-4 border-t">
                      <Button 
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Request
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleDeclineRequest(request.id)}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline Request
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-6">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={session.studentAvatar} />
                        <AvatarFallback>
                          {session.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-900">{session.studentName}</h3>
                        <p className="text-sm text-slate-600">{session.topic}</p>
                      </div>
                    </div>
                    <Badge className={
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {session.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>{formatDate(session.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>{session.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-slate-500" />
                      <span>Mentorship Session</span>
                    </div>
                  </div>

                  {session.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <h4 className="text-sm font-medium text-slate-900 mb-1">Notes:</h4>
                      <p className="text-sm text-slate-700">{session.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Users className="h-8 w-8 mx-auto text-blue-600" />
                <CardTitle className="text-2xl">{acceptedCount}</CardTitle>
                <CardDescription>Active Mentees</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto text-green-600" />
                <CardTitle className="text-2xl">{completedSessions}</CardTitle>
                <CardDescription>Sessions Completed</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Clock className="h-8 w-8 mx-auto text-purple-600" />
                <CardTitle className="text-2xl">
                  {sessions.reduce((total, session) => total + session.duration, 0)}
                </CardTitle>
                <CardDescription>Minutes Mentored</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Star className="h-8 w-8 mx-auto text-yellow-600" />
                <CardTitle className="text-2xl">4.9</CardTitle>
                <CardDescription>Average Rating</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mentorship Impact</CardTitle>
              <CardDescription>Your contribution to student development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Skills Shared</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Software Engineering</Badge>
                    <Badge variant="outline">Leadership</Badge>
                    <Badge variant="outline">Career Development</Badge>
                    <Badge variant="outline">Technical Interview Prep</Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Student Outcomes</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• 3 students secured internships</li>
                    <li>• 2 students improved their academic performance</li>
                    <li>• 1 student started their own project</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === 'pending' ? 'Respond to Mentorship Request' : 'Update Response'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Request from {selectedRequest.studentName}</h4>
                <p className="text-sm text-slate-700">{selectedRequest.message}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                placeholder="Write your response to the student..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={() => submitResponse(true)}
                className="flex-1"
                disabled={!responseMessage.trim()}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept & Send Response
              </Button>
              <Button 
                variant="outline" 
                onClick={() => submitResponse(false)}
                className="flex-1"
                disabled={!responseMessage.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline & Send Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}