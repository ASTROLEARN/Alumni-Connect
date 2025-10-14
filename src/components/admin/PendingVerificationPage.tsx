'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, CheckCircle, XCircle, Clock, Mail, Building, GraduationCap, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createAuthorizedFetch } from '@/lib/auth-utils';
import { io, Socket } from 'socket.io-client';

interface Alumni {
  id: string;
  userId: string;
  graduationYear: number;
  major: string;
  company?: string;
  position?: string;
  industry?: string;
  location?: string;
  linkedin?: string;
  bio?: string;
  verified: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
  };
}

export default function PendingVerificationPage() {
  const { user } = useAuth();
  const [pendingAlumni, setPendingAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const authorizedFetch = user ? createAuthorizedFetch(user.id) : null;

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
        path: '/api/socketio'
      });
    setSocket(socketInstance);

    // Authenticate with socket
    if (user) {
      socketInstance.emit('authenticate', {
        userId: user.id,
        role: user.role,
      });
    }

    // Listen for new alumni verification requests
    socketInstance.on('new_alumni_verification', (data) => {
      console.log('New alumni verification request:', data);
      fetchPendingAlumni(); // Refresh pending alumni list
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPendingAlumni();
    }
  }, [user]);

  const fetchPendingAlumni = async () => {
    if (!authorizedFetch) return;
    
    try {
      const response = await authorizedFetch('/api/admin/alumni-verification');
      if (response.ok) {
        const data = await response.json();
        setPendingAlumni(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching pending alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (alumniList: Alumni[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCount = alumniList.filter(alumni => {
      const createdDate = new Date(alumni.user.createdAt);
      return createdDate >= today;
    }).length;

    const weekCount = alumniList.filter(alumni => {
      const createdDate = new Date(alumni.user.createdAt);
      return createdDate >= weekStart;
    }).length;

    const monthCount = alumniList.filter(alumni => {
      const createdDate = new Date(alumni.user.createdAt);
      return createdDate >= monthStart;
    }).length;

    setStats({
      total: alumniList.length,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount
    });
  };

  const handleVerifyAlumni = async (alumniId: string) => {
    if (!authorizedFetch) return;
    
    setProcessing(alumniId);
    try {
      const response = await authorizedFetch('/api/admin/alumni-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alumniId,
          approved: true,
        }),
      });

      if (response.ok) {
        // Emit socket event
        if (socket && user) {
          socket.emit('alumni_verification_decision', {
            alumniId,
            approved: true,
            adminId: user.id,
          });
        }
        
        // Refresh data
        fetchPendingAlumni();
      }
    } catch (error) {
      console.error('Error verifying alumni:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectAlumni = async (alumniId: string) => {
    if (!authorizedFetch) return;
    
    setProcessing(alumniId);
    try {
      const response = await authorizedFetch('/api/admin/alumni-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alumniId,
          approved: false,
        }),
      });

      if (response.ok) {
        // Emit socket event
        if (socket && user) {
          socket.emit('alumni_verification_decision', {
            alumniId,
            approved: false,
            adminId: user.id,
          });
        }
        
        // Refresh data
        fetchPendingAlumni();
      }
    } catch (error) {
      console.error('Error rejecting alumni:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkAction = async (approved: boolean) => {
    if (pendingAlumni.length === 0 || !authorizedFetch) return;
    
    const alumniIds = pendingAlumni.map(a => a.id);
    setProcessing('bulk');
    
    try {
      await Promise.all(alumniIds.map(alumniId => 
        authorizedFetch('/api/admin/alumni-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alumniId,
            approved,
          }),
        })
      ));

      // Emit socket events
      if (socket && user) {
        alumniIds.forEach(alumniId => {
          socket.emit('alumni_verification_decision', {
            alumniId,
            approved,
            adminId: user.id,
          });
        });
      }

      fetchPendingAlumni();
    } catch (error) {
      console.error('Error in bulk action:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading pending verifications...</p>
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
              <h1 className="text-3xl font-bold text-slate-900">Pending Verification</h1>
              <p className="text-slate-600 mt-2">Review and verify alumni profile requests</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={fetchPendingAlumni} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-slate-600">Total Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.today}</p>
                    <p className="text-sm text-slate-600">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.thisWeek}</p>
                    <p className="text-sm text-slate-600">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.thisMonth}</p>
                    <p className="text-sm text-slate-600">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Actions */}
          {pendingAlumni.length > 0 && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{pendingAlumni.length} pending verification requests</span>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleBulkAction(true)}
                    disabled={processing === 'bulk'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processing === 'bulk' ? 'Processing...' : 'Approve All'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction(false)}
                    disabled={processing === 'bulk'}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    {processing === 'bulk' ? 'Processing...' : 'Reject All'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Pending Alumni List */}
        <div className="space-y-4">
          {pendingAlumni.length > 0 ? (
            pendingAlumni.map((alumni) => (
              <Card key={alumni.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{alumni.user.name}</h3>
                          <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                            Pending
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{alumni.user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>{alumni.position} at {alumni.company}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4" />
                            <span>{alumni.major}, Class of {alumni.graduationYear}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{alumni.location}</span>
                          </div>
                        </div>
                        {alumni.bio && (
                          <p className="text-sm text-slate-600 italic mb-3">
                            "{alumni.bio}"
                          </p>
                        )}
                        <div className="text-xs text-slate-500">
                          Applied {new Date(alumni.user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        onClick={() => handleVerifyAlumni(alumni.id)}
                        disabled={processing === alumni.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {processing === alumni.id ? 'Processing...' : 'Verify'}
                      </Button>
                      <Button 
                        onClick={() => handleRejectAlumni(alumni.id)}
                        disabled={processing === alumni.id}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {processing === alumni.id ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h3>
                <p className="text-slate-600 mb-4">
                  There are no pending alumni verification requests at this time.
                </p>
                <p className="text-sm text-slate-500">
                  New verification requests will appear here automatically.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}