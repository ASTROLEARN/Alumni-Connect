'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageCircle, 
  Star, 
  User,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface MentorshipRequest {
  id: string;
  studentId: string;
  alumniId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  createdAt: string;
  student: {
    id: string;
    user: {
      id: string;
      name?: string;
      email: string;
    };
    graduationYear?: number;
    major?: string;
  };
}

interface MentorshipProps {
  alumniId: string;
  isOwnProfile: boolean;
}

export default function Mentorship({ alumniId, isOwnProfile }: MentorshipProps) {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socketio'
    });
    setSocket(socketInstance);

    // Authenticate with socket
    if (session?.user) {
      socketInstance.emit('authenticate', {
        userId: session.user.id,
        role: session.user.role,
      });
    }

    // Listen for new mentorship requests
    socketInstance.on('new_mentorship_request', (data) => {
      console.log('New mentorship request:', data);
      fetchRequests(); // Refresh requests list
    });

    // Listen for mentorship decisions
    socketInstance.on('mentorship_decision', (data) => {
      console.log('Mentorship decision received:', data);
      fetchRequests(); // Refresh requests list
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRequests();
    }
  }, [status]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/mentorship/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching mentorship requests:', error);
      setLoading(false);
    }
  };

  const handleRequestMentorship = async () => {
    if (!message.trim()) {
      alert('Please enter a message for your mentorship request.');
      return;
    }

    try {
      const response = await fetch('/api/mentorship/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alumniId,
          message,
        }),
      });

      if (response.ok) {
        // Emit socket event
        if (socket && session?.user) {
          socket.emit('mentorship_request', {
            studentId: session.user.id,
            studentName: session.user.name,
            alumniId,
            message,
          });
        }
        
        setMessage('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error requesting mentorship:', error);
    }
  };

  const handleDecision = async (requestId: string, accepted: boolean, customMessage?: string) => {
    try {
      const response = await fetch('/api/mentorship/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          accepted,
          message: customMessage,
        }),
      });

      if (response.ok) {
        // Emit socket event
        if (socket && session?.user) {
          const request = requests.find(r => r.id === requestId);
          if (request) {
            socket.emit('mentorship_decision', {
              studentId: request.studentId,
              alumniId: request.alumniId,
              accepted,
              message: customMessage,
            });
          }
        }
        
        fetchRequests();
      }
    } catch (error) {
      console.error('Error processing mentorship decision:', error);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED');
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">Please sign in to access mentorship features.</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 mr-2" />
          Mentorship
        </CardTitle>
        <CardDescription>
          {isOwnProfile 
            ? 'Manage mentorship requests from students'
            : 'Request mentorship from this alumni'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={isOwnProfile ? 'requests' : 'request'} className="space-y-4">
          {isOwnProfile && (
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="requests">Pending Requests</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          )}

          {!isOwnProfile && (
            <TabsContent value="request" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Why would you like this alumni to be your mentor?
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell them about your goals, what you hope to learn, and why you think they'd be a great mentor..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button 
                  onClick={handleRequestMentorship}
                  disabled={!message.trim()}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Mentorship Request
                </Button>
              </div>

              {/* Show existing requests from this user */}
              {requests.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Your Requests</h4>
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(request.status)}
                          <div>
                            <p className="text-sm text-slate-600">
                              {request.message}
                            </p>
                            <p className="text-xs text-slate-500">
                              Requested on {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}

          {isOwnProfile && (
            <>
              <TabsContent value="requests" className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No pending mentorship requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarFallback>
                                  {request.student.user.name?.split(' ').map(n => n[0]).join('') || 'S'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold">{request.student.user.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {request.student.major}, Class of {request.student.graduationYear}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{request.message}</p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  <span className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {request.student.user.email}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(request.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button 
                                size="sm" 
                                onClick={() => handleDecision(request.id, true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDecision(request.id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="accepted" className="space-y-4">
                {acceptedRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-slate-600">No accepted mentorship requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarFallback>
                                  {request.student.user.name?.split(' ').map(n => n[0]).join('') || 'S'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold">{request.student.user.name}</h4>
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    {request.student.major}, Class of {request.student.graduationYear}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{request.message}</p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  <span className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {request.student.user.email}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Accepted on {new Date(request.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {rejectedRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="h-12 w-12 text-black mx-auto mb-4" />
                    <p className="text-slate-600">No rejected mentorship requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rejectedRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-black opacity-75">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarFallback>
                                  {request.student.user.name?.split(' ').map(n => n[0]).join('') || 'S'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold">{request.student.user.name}</h4>
                                  <Badge variant="destructive" className="text-xs">
                                    {request.student.major}, Class of {request.student.graduationYear}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{request.message}</p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  <span className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {request.student.user.email}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Rejected on {new Date(request.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}