'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, MapPin, Building, Mail, Phone, Calendar, Star, ArrowLeft } from 'lucide-react';
import UserProfile from './UserProfile';

interface Alumni {
  id: string;
  name: string;
  avatar?: string;
  graduationYear: number;
  degree: string;
  company: string;
  position: string;
  location: string;
  industry: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  achievements: string[];
  isMentor: boolean;
}

interface AlumniDirectoryProps {
  alumni?: Alumni[];
}

export default function AlumniDirectory({ alumni = [] }: AlumniDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Sample alumni data
  const sampleAlumni: Alumni[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      graduationYear: 2020,
      degree: 'Computer Science',
      company: 'Google',
      position: 'Software Engineer',
      location: 'San Francisco, CA',
      industry: 'Technology',
      email: 'sarah.johnson@email.com',
      linkedin: 'sarah-johnson',
      achievements: ['Dean\'s List', 'Hackathon Winner'],
      isMentor: true
    },
    {
      id: '2',
      name: 'Michael Chen',
      graduationYear: 2019,
      degree: 'Business Administration',
      company: 'Microsoft',
      position: 'Product Manager',
      location: 'Seattle, WA',
      industry: 'Technology',
      email: 'michael.chen@email.com',
      linkedin: 'michael-chen',
      achievements: ['Student President', 'Innovation Award'],
      isMentor: true
    },
    {
      id: '3',
      name: 'Emily Davis',
      graduationYear: 2018,
      degree: 'Data Science',
      company: 'Amazon',
      position: 'Data Scientist',
      location: 'New York, NY',
      industry: 'Technology',
      email: 'emily.davis@email.com',
      linkedin: 'emily-davis',
      achievements: ['Research Publication', 'Best Thesis Award'],
      isMentor: false
    },
    {
      id: '4',
      name: 'David Wilson',
      graduationYear: 2021,
      degree: 'Mechanical Engineering',
      company: 'Tesla',
      position: 'Mechanical Engineer',
      location: 'Austin, TX',
      industry: 'Automotive',
      email: 'david.wilson@email.com',
      linkedin: 'david-wilson',
      achievements: ['Design Competition Winner', 'Patent Holder'],
      isMentor: false
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      graduationYear: 2017,
      degree: 'Marketing',
      company: 'Nike',
      position: 'Marketing Director',
      location: 'Portland, OR',
      industry: 'Retail',
      email: 'lisa.anderson@email.com',
      linkedin: 'lisa-anderson',
      achievements: ['Marketing Excellence Award', 'Brand Strategy Leader'],
      isMentor: true
    },
    {
      id: '6',
      name: 'James Rodriguez',
      graduationYear: 2022,
      degree: 'Finance',
      company: 'Goldman Sachs',
      position: 'Financial Analyst',
      location: 'New York, NY',
      industry: 'Finance',
      email: 'james.rodriguez@email.com',
      linkedin: 'james-rodriguez',
      achievements: ['Summa Cum Laude', 'Investment Competition Winner'],
      isMentor: false
    }
  ];

  const alumniData = alumni.length > 0 ? alumni : sampleAlumni;

  // Get unique values for filters
  const industries = useMemo(() => {
    const unique = [...new Set(alumniData.map(a => a.industry))];
    return unique.sort();
  }, [alumniData]);

  const years = useMemo(() => {
    const unique = [...new Set(alumniData.map(a => a.graduationYear))];
    return unique.sort((a, b) => b - a);
  }, [alumniData]);

  const locations = useMemo(() => {
    const unique = [...new Set(alumniData.map(a => a.location))];
    return unique.sort();
  }, [alumniData]);

  // Filter and sort alumni
  const filteredAlumni = useMemo(() => {
    let filtered = alumniData.filter(alumni => {
      const matchesSearch = searchQuery === '' || 
        alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alumni.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alumni.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alumni.degree.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesIndustry = selectedIndustry === 'all' || alumni.industry === selectedIndustry;
      const matchesYear = selectedYear === 'all' || alumni.graduationYear.toString() === selectedYear;
      const matchesLocation = selectedLocation === 'all' || alumni.location === selectedLocation;

      return matchesSearch && matchesIndustry && matchesYear && matchesLocation;
    });

    // Sort alumni
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'year':
          return b.graduationYear - a.graduationYear;
        case 'company':
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });

    return filtered;
  }, [alumniData, searchQuery, selectedIndustry, selectedYear, selectedLocation, sortBy]);

  // If a user is selected, show their profile
  if (selectedUser) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedUser(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>
        <UserProfile userId={selectedUser} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Alumni Directory</h1>
        <p className="text-slate-600">Connect with fellow graduates and expand your professional network</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search by name, company, position, or degree..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Graduation Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="year">Graduation Year</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">
              Showing {filteredAlumni.length} of {alumniData.length} alumni
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map(alumni => (
            <Card key={alumni.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={alumni.avatar} alt={alumni.name} />
                    <AvatarFallback>{alumni.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{alumni.name}</h3>
                      {alumni.isMentor && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Mentor
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{alumni.position} at {alumni.company}</p>
                    <div className="flex items-center text-xs text-slate-500 mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      Class of {alumni.graduationYear} • {alumni.degree}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      {alumni.location}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {alumni.achievements.slice(0, 2).map((achievement, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {achievement}
                        </Badge>
                      ))}
                      {alumni.achievements.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{alumni.achievements.length - 2} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedUser(alumni.id)}
                      >
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlumni.map(alumni => (
            <Card key={alumni.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={alumni.avatar} alt={alumni.name} />
                    <AvatarFallback>{alumni.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{alumni.name}</h3>
                      {alumni.isMentor && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Mentor
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{alumni.position} at {alumni.company}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Class of {alumni.graduationYear}
                      </span>
                      <span className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {alumni.degree}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {alumni.location}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {alumni.achievements.map((achievement, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => setSelectedUser(alumni.id)}
                    >
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                    {alumni.linkedin && (
                      <Button size="sm" variant="outline">
                        LinkedIn
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {filteredAlumni.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No alumni found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your search criteria or filters</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedIndustry('all');
              setSelectedYear('all');
              setSelectedLocation('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}