'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Calendar,
  ExternalLink,
  Users,
  Plus
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import JobPostForm from './JobPostForm';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  salary?: string;
  postedDate: string;
  deadline?: string;
  description: string;
  requirements: string[];
  industry: string;
  experience: string;
  postedBy: {
    name: string;
    email: string;
    role: string;
    isAlumni: boolean;
  };
  applications: number;
}

export default function AlumniJobBoard() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

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

    // Listen for new job postings
    socketInstance.on('new_job_posted', (data) => {
      console.log('New job posted:', data);
      fetchJobs(); // Refresh jobs list
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const industries = ['all', 'Technology', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Consulting', 'Other'];
  const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || job.industry === selectedIndustry;
      const matchesType = selectedType === 'all' || job.type === selectedType;
      
      return matchesSearch && matchesIndustry && matchesType;
    });

    return filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  }, [jobs, searchQuery, selectedIndustry, selectedType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Alumni Job Board</h1>
            <p className="text-slate-600 mt-2">Exclusive opportunities posted by fellow alumni</p>
          </div>
          <JobPostForm onJobPosted={fetchJobs}>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Post Job</span>
            </Button>
          </JobPostForm>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{jobs.length}</div>
                  <div className="text-sm text-slate-600">Available Positions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {jobs.reduce((sum, job) => sum + job.applications, 0)}
                  </div>
                  <div className="text-sm text-slate-600">Total Applications</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(jobs.map(job => job.company)).size}
                  </div>
                  <div className="text-sm text-slate-600">Companies</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
              <p className="text-slate-600">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                        <Badge variant="outline">{job.type}</Badge>
                        {job.postedBy.isAlumni && (
                          <Badge className="bg-blue-100 text-blue-800">Alumni Posted</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 mb-3">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {job.requirements.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{job.applications} applications</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Posted by {job.postedBy.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}