'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  Mail, 
  Calendar, 
  Shield, 
  UserCheck, 
  UserX, 
  Filter,
  Download,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  verified: boolean;
  createdAt: string;
  phone?: string;
}

export default function AllUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsersList();
  }, [users, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsersList = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole) {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (filterStatus) {
      filtered = filtered.filter(user => 
        filterStatus === 'verified' ? user.verified : !user.verified
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleStats = () => {
    return {
      total: users.length,
      students: users.filter(u => u.role === 'STUDENT').length,
      alumni: users.filter(u => u.role === 'ALUMNI').length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      verified: users.filter(u => u.verified).length,
      unverified: users.filter(u => !u.verified).length
    };
  };

  const getRecentUsers = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return users.filter(user => 
      new Date(user.createdAt) >= sevenDaysAgo
    ).length;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Verified', 'Phone', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.name || '',
        user.email,
        user.role,
        user.verified ? 'Yes' : 'No',
        user.phone || '',
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'users_list.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'ALUMNI':
        return 'default';
      case 'STUDENT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading users...</p>
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

  const stats = getRoleStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">All Users</h1>
              <p className="text-slate-600 mt-2">Manage all registered users on the platform</p>
            </div>
            <Button onClick={exportToCSV} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-slate-600">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{getRecentUsers()}</p>
                    <p className="text-sm text-slate-600">New This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.students}</p>
                    <p className="text-sm text-slate-600">Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.alumni}</p>
                    <p className="text-sm text-slate-600">Alumni</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.verified}</p>
                    <p className="text-sm text-slate-600">Verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserX className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.unverified}</p>
                    <p className="text-sm text-slate-600">Unverified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="ALUMNI">Alumni</option>
                <option value="ADMIN">Admins</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        user.role === 'ADMIN' ? 'bg-red-100' :
                        user.role === 'ALUMNI' ? 'bg-blue-100' :
                        'bg-green-100'
                      }`}>
                        <Users className={`h-8 w-8 ${
                          user.role === 'ADMIN' ? 'text-red-600' :
                          user.role === 'ALUMNI' ? 'text-blue-600' :
                          'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{user.name || 'Unnamed User'}</h3>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                          {user.verified ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                              Unverified
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Users Found</h3>
                <p className="text-slate-600">
                  {searchTerm || filterRole || filterStatus 
                    ? 'Try adjusting your search criteria or filters.'
                    : 'There are no registered users to display.'
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