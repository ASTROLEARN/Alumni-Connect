'use client';

import React, { useState, useEffect } from 'react';
import ProfileHeader from '@/components/ui/ProfileHeader';
import { useAuth } from '@/contexts/AuthContext';
import { createAuthorizedFetch } from '@/lib/auth-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, XCircle, TrendingUp, Calendar, MessageSquare, Award } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

import QuickStatsDashboard from './QuickStatsDashboard';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  verified: boolean;
  createdAt: string;
}

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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [pendingAlumni, setPendingAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
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
    const fetchData = async () => {
      console.log('AdminDashboard: Starting data fetch, user:', user);
      try {
        await Promise.all([
          fetchUsers(),
          fetchAlumni(),
          fetchPendingAlumni()
        ]);
        console.log('AdminDashboard: All data fetched successfully');
      } catch (error) {
        console.error('AdminDashboard: Error fetching data:', error);
      } finally {
        console.log('AdminDashboard: Setting loading to false');
        setLoading(false);
      }
    };

    if (user && user.role === 'ADMIN') {
      fetchData();
    } else {
      console.log('AdminDashboard: User not admin or not logged in, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    if (!authorizedFetch) return;
    
    try {
      console.log('AdminDashboard: Fetching users...');
      const response = await authorizedFetch('/api/users');
      console.log('AdminDashboard: Users response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('AdminDashboard: Users data received:', data);
        setUsers(data);
      } else if (response.status === 401) {
        console.log('AdminDashboard: Users API returned 401 - user may not be authenticated');
        setUsers([]); // Set empty array to avoid undefined issues
      } else {
        console.error('AdminDashboard: Users API failed:', response.status, response.statusText);
        setUsers([]);
      }
    } catch (error) {
      console.error('AdminDashboard: Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchAlumni = async () => {
    if (!authorizedFetch) return;
    
    try {
      console.log('AdminDashboard: Fetching alumni...');
      const response = await authorizedFetch('/api/alumni');
      console.log('AdminDashboard: Alumni response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('AdminDashboard: Alumni data received:', data);
        setAlumni(data);
      } else if (response.status === 401) {
        console.log('AdminDashboard: Alumni API returned 401 - user may not be authenticated');
        setAlumni([]); // Set empty array to avoid undefined issues
      } else {
        console.error('AdminDashboard: Alumni API failed:', response.status, response.statusText);
        setAlumni([]);
      }
    } catch (error) {
      console.error('AdminDashboard: Error fetching alumni:', error);
      setAlumni([]);
    }
  };

  const fetchPendingAlumni = async () => {
    if (!authorizedFetch) return;
    
    try {
      console.log('AdminDashboard: Fetching pending alumni...');
      const response = await authorizedFetch('/api/admin/alumni-verification');
      console.log('AdminDashboard: Pending alumni response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('AdminDashboard: Pending alumni data received:', data);
        setPendingAlumni(data);
      } else if (response.status === 401) {
        console.log('AdminDashboard: Pending alumni API returned 401 - user may not be authenticated');
        setPendingAlumni([]); // Set empty array to avoid undefined issues
      } else {
        console.error('AdminDashboard: Pending alumni API failed:', response.status, response.statusText);
        setPendingAlumni([]);
      }
    } catch (error) {
      console.error('AdminDashboard: Error fetching pending alumni:', error);
      setPendingAlumni([]);
    }
  };

  const handleVerifyAlumni = async (alumniId: string) => {
    if (!authorizedFetch) return;
    
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
        fetchAlumni();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error verifying alumni:', error);
    }
  };

  const handleRejectAlumni = async (alumniId: string) => {
    if (!authorizedFetch) return;
    
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
        fetchUsers();
      }
    } catch (error) {
      console.error('Error rejecting alumni:', error);
    }
  };

  const stats = {
    totalUsers: users.length,
    totalStudents: users.filter(u => u.role === 'STUDENT').length,
    totalAlumni: users.filter(u => u.role === 'ALUMNI').length,
    verifiedAlumni: alumni.filter(a => a.verified).length,
    pendingVerification: pendingAlumni.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
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
          <p className="text-slate-600 mb-4">You need administrator privileges to access this dashboard.</p>
          <p className="text-sm text-slate-500">Current role: {user?.role || 'Not logged in'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Profile Header */}
        <ProfileHeader 
          user={user!} 
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alumni</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAlumni}</div>
              <p className="text-xs text-muted-foreground">Registered alumni</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Alumni</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedAlumni}</div>
              <p className="text-xs text-muted-foreground">Approved profiles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerification}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Dashboard */}
        <QuickStatsDashboard />

        {/* Recent Activity Overview */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Verification Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-yellow-600" />
                  Pending Verification
                </CardTitle>
                <CardDescription>
                  Alumni profiles awaiting verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAlumni.length > 0 ? (
                  <div className="space-y-3">
                    {pendingAlumni.slice(0, 3).map((alumni) => (
                      <div key={alumni.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{alumni.user.name}</h4>
                            <p className="text-xs text-slate-600">{alumni.user.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleVerifyAlumni(alumni.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectAlumni(alumni.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingAlumni.length > 3 && (
                      <p className="text-sm text-slate-600 text-center">
                        +{pendingAlumni.length - 3} more pending verification
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">No pending verification requests</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Alumni */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Alumni
                </CardTitle>
                <CardDescription>
                  Recently verified alumni members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alumni.filter(a => a.verified).length > 0 ? (
                  <div className="space-y-3">
                    {alumni.filter(a => a.verified).slice(0, 3).map((alumni) => (
                      <div key={alumni.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{alumni.user.name}</h4>
                            <p className="text-xs text-slate-600">{alumni.position} at {alumni.company}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      </div>
                    ))}
                    {alumni.filter(a => a.verified).length > 3 && (
                      <p className="text-sm text-slate-600 text-center">
                        +{alumni.filter(a => a.verified).length - 3} more alumni
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">No verified alumni yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}