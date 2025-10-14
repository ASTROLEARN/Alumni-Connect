'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Users, Mail, Building, MapPin, GraduationCap, Filter, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

export default function AlumniDirectoryPage() {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  useEffect(() => {
    filterAlumniList();
  }, [alumni, searchTerm, filterIndustry, filterLocation]);

  const fetchAlumni = async () => {
    try {
      const response = await fetch('/api/alumni');
      if (response.ok) {
        const data = await response.json();
        setAlumni(data);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAlumniList = () => {
    let filtered = alumni.filter(a => a.verified);

    if (searchTerm) {
      filtered = filtered.filter(alumni => 
        alumni.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.major.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterIndustry) {
      filtered = filtered.filter(alumni => 
        alumni.industry?.toLowerCase().includes(filterIndustry.toLowerCase())
      );
    }

    if (filterLocation) {
      filtered = filtered.filter(alumni => 
        alumni.location?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    setFilteredAlumni(filtered);
  };

  const getUniqueIndustries = () => {
    const industries = alumni
      .filter(a => a.verified && a.industry)
      .map(a => a.industry!)
      .filter((value, index, self) => self.indexOf(value) === index);
    return industries;
  };

  const getUniqueLocations = () => {
    const locations = alumni
      .filter(a => a.verified && a.location)
      .map(a => a.location!)
      .filter((value, index, self) => self.indexOf(value) === index);
    return locations;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Position', 'Industry', 'Location', 'Graduation Year', 'Major'];
    const csvContent = [
      headers.join(','),
      ...filteredAlumni.map(alumni => [
        alumni.user.name || '',
        alumni.user.email,
        alumni.company || '',
        alumni.position || '',
        alumni.industry || '',
        alumni.location || '',
        alumni.graduationYear,
        alumni.major
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'alumni_directory.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading alumni directory...</p>
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
              <h1 className="text-3xl font-bold text-slate-900">Alumni Directory</h1>
              <p className="text-slate-600 mt-2">Manage and view all verified alumni profiles</p>
            </div>
            <Button onClick={exportToCSV} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{filteredAlumni.length}</p>
                    <p className="text-sm text-slate-600">Total Alumni</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{getUniqueIndustries().length}</p>
                    <p className="text-sm text-slate-600">Industries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{getUniqueLocations().length}</p>
                    <p className="text-sm text-slate-600">Locations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.max(...alumni.filter(a => a.verified).map(a => a.graduationYear), 0)}
                    </p>
                    <p className="text-sm text-slate-600">Latest Grad Year</p>
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
                  placeholder="Search by name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                placeholder="Filter by industry..."
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
              />
              <Input
                placeholder="Filter by location..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Alumni List */}
        <div className="space-y-4">
          {filteredAlumni.length > 0 ? (
            filteredAlumni.map((alumni) => (
              <Card key={alumni.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{alumni.user.name}</h3>
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
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
                          <p className="mt-3 text-sm text-slate-600 italic">
                            "{alumni.bio}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {alumni.industry && (
                        <Badge variant="secondary">{alumni.industry}</Badge>
                      )}
                      {alumni.linkedin && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={alumni.linkedin} target="_blank" rel="noopener noreferrer">
                            LinkedIn
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Alumni Found</h3>
                <p className="text-slate-600">
                  {searchTerm || filterIndustry || filterLocation 
                    ? 'Try adjusting your search criteria or filters.'
                    : 'There are no verified alumni profiles to display.'
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