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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users,
  Calendar,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Building,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  salary: string;
  currency: string;
  description: string;
  requirements: string[];
  skills: string[];
  postedAt: string;
  expiresAt: string;
  status: 'active' | 'closed' | 'draft';
  applicationCount: number;
  viewCount: number;
  isRemote: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  category: string;
  alumniId: string;
  alumniName: string;
}

interface JobApplication {
  id: string;
  jobId: string;
  studentName: string;
  studentEmail: string;
  studentMajor: string;
  studentYear: string;
  resumeUrl?: string;
  coverLetter: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

export default function AlumniJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showApplications, setShowApplications] = useState<Job | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Form state for creating a job
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time' as const,
    salary: '',
    currency: 'USD',
    description: '',
    requirements: '',
    skills: '',
    experienceLevel: 'entry' as const,
    category: '',
    isRemote: false,
    expiresAt: ''
  });

  useEffect(() => {
    // Simulate API calls
    const fetchJobsData = async () => {
      // Mock jobs posted by alumni
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Software Engineering Intern',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          type: 'internship',
          salary: '45',
          currency: 'USD',
          description: 'Join our dynamic team as a Software Engineering Intern! Work on cutting-edge projects and learn from experienced engineers.',
          requirements: ['Currently enrolled in Computer Science program', 'Strong programming skills in JavaScript/Python', 'Knowledge of data structures and algorithms', 'Excellent problem-solving abilities'],
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Git'],
          postedAt: '2024-01-15T10:00:00Z',
          expiresAt: '2024-02-15T23:59:59Z',
          status: 'active',
          applicationCount: 12,
          viewCount: 245,
          isRemote: false,
          experienceLevel: 'entry',
          category: 'Engineering',
          alumniId: user?.id || '',
          alumniName: user?.name || ''
        },
        {
          id: '2',
          title: 'Product Manager',
          company: 'InnovateLab',
          location: 'New York, NY',
          type: 'full-time',
          salary: '95000',
          currency: 'USD',
          description: 'We are looking for a passionate Product Manager to join our growing team. Lead product development from conception to launch.',
          requirements: ['3+ years of product management experience', 'Strong analytical and strategic thinking', 'Experience with Agile methodologies', 'Excellent communication skills'],
          skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Leadership', 'Communication'],
          postedAt: '2024-01-10T14:30:00Z',
          expiresAt: '2024-02-10T23:59:59Z',
          status: 'active',
          applicationCount: 8,
          viewCount: 189,
          isRemote: true,
          experienceLevel: 'mid',
          category: 'Product',
          alumniId: user?.id || '',
          alumniName: user?.name || ''
        },
        {
          id: '3',
          title: 'Data Analyst Intern',
          company: 'DataTech Solutions',
          location: 'Remote',
          type: 'internship',
          salary: '35',
          currency: 'USD',
          description: 'Exciting opportunity for students interested in data analysis and business intelligence. Work with real-world datasets.',
          requirements: ['Pursuing degree in Data Science, Statistics, or related field', 'Proficiency in SQL and Excel', 'Basic knowledge of Python/R', 'Strong analytical mindset'],
          skills: ['SQL', 'Python', 'Excel', 'Data Visualization', 'Statistics'],
          postedAt: '2024-01-08T09:15:00Z',
          expiresAt: '2024-02-08T23:59:59Z',
          status: 'active',
          applicationCount: 15,
          viewCount: 312,
          isRemote: true,
          experienceLevel: 'entry',
          category: 'Data Science',
          alumniId: user?.id || '',
          alumniName: user?.name || ''
        }
      ];

      // Mock applications
      const mockApplications: JobApplication[] = [
        {
          id: '1',
          jobId: '1',
          studentName: 'John Smith',
          studentEmail: 'john.smith@university.edu',
          studentMajor: 'Computer Science',
          studentYear: 'Junior',
          resumeUrl: '/resumes/john_smith.pdf',
          coverLetter: 'I am excited to apply for the Software Engineering Intern position at TechCorp Inc...',
          appliedAt: '2024-01-16T11:30:00Z',
          status: 'pending'
        },
        {
          id: '2',
          jobId: '1',
          studentName: 'Emily Chen',
          studentEmail: 'emily.chen@university.edu',
          studentMajor: 'Computer Engineering',
          studentYear: 'Senior',
          resumeUrl: '/resumes/emily_chen.pdf',
          coverLetter: 'As a senior Computer Engineering student, I have developed strong technical skills...',
          appliedAt: '2024-01-16T14:20:00Z',
          status: 'reviewed'
        },
        {
          id: '3',
          jobId: '2',
          studentName: 'Michael Rodriguez',
          studentEmail: 'michael.rodriguez@university.edu',
          studentMajor: 'Business Administration',
          studentYear: 'Graduate',
          resumeUrl: '/resumes/michael_rodriguez.pdf',
          coverLetter: 'With my background in business and experience in project management...',
          appliedAt: '2024-01-15T16:45:00Z',
          status: 'pending'
        }
      ];

      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
      setApplications(mockApplications);
    };

    fetchJobsData();

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socketio'
    });
    setSocket(socketInstance);

    // Listen for new job applications
    socketInstance.on('new_job_application', (data) => {
      setApplications(prev => [data, ...prev]);
      setJobs(prev => prev.map(job => 
        job.id === data.jobId 
          ? { ...job, applicationCount: job.applicationCount + 1 }
          : job
      ));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  useEffect(() => {
    // Filter jobs based on search and status
    let filtered = jobs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, statusFilter]);

  const handleCreateJob = async () => {
    if (!user) return;

    const newJob: Job = {
      id: Date.now().toString(),
      title: jobForm.title,
      company: jobForm.company,
      location: jobForm.location,
      type: jobForm.type,
      salary: jobForm.salary,
      currency: jobForm.currency,
      description: jobForm.description,
      requirements: jobForm.requirements.split('\n').filter(req => req.trim()),
      skills: jobForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      postedAt: new Date().toISOString(),
      expiresAt: jobForm.expiresAt,
      status: 'active',
      applicationCount: 0,
      viewCount: 0,
      isRemote: jobForm.isRemote,
      experienceLevel: jobForm.experienceLevel,
      category: jobForm.category,
      alumniId: user.id,
      alumniName: user.name
    };

    // Update local state
    setJobs(prev => [newJob, ...prev]);

    // Emit socket event for real-time update
    if (socket) {
      socket.emit('new_job_posted', newJob);
    }

    // Reset form and close dialog
    setJobForm({
      title: '',
      company: '',
      location: '',
      type: 'full-time',
      salary: '',
      currency: 'USD',
      description: '',
      requirements: '',
      skills: '',
      experienceLevel: 'entry',
      category: '',
      isRemote: false,
      expiresAt: ''
    });
    setShowCreateJob(false);
  };

  const handleViewApplications = (job: Job) => {
    setShowApplications(job);
  };

  const getJobTypeBadge = (type: string) => {
    switch (type) {
      case 'full-time':
        return <Badge className="bg-blue-100 text-blue-800">Full Time</Badge>;
      case 'part-time':
        return <Badge className="bg-green-100 text-green-800">Part Time</Badge>;
      case 'internship':
        return <Badge className="bg-purple-100 text-purple-800">Internship</Badge>;
      case 'contract':
        return <Badge className="bg-orange-100 text-orange-800">Contract</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800">Reviewed</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalApplications = applications.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const totalViews = jobs.reduce((sum, job) => sum + job.viewCount, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Job Opportunities</h1>
          <p className="text-slate-600 mt-2">Post and manage job opportunities for students and alumni</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeJobs}</div>
            <div className="text-sm text-slate-600">Active Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalApplications}</div>
            <div className="text-sm text-slate-600">Applications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalViews}</div>
            <div className="text-sm text-slate-600">Total Views</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs">My Job Posts</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          {/* Create Job Button */}
          <div className="flex justify-between items-center">
            <Dialog open={showCreateJob} onOpenChange={setShowCreateJob}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Job Posting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={jobForm.title}
                        onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={jobForm.company}
                        onChange={(e) => setJobForm(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="e.g. TechCorp Inc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={jobForm.location}
                        onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Job Type</Label>
                      <Select value={jobForm.type} onValueChange={(value: any) => setJobForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="salary">Salary</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={jobForm.salary}
                        onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                        placeholder="e.g. 75000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={jobForm.currency} onValueChange={(value) => setJobForm(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select value={jobForm.experienceLevel} onValueChange={(value: any) => setJobForm(prev => ({ ...prev, experienceLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={jobForm.category}
                      onChange={(e) => setJobForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Engineering, Design, Marketing"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={jobForm.description}
                      onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={jobForm.requirements}
                      onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="List the requirements (one per line)..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      value={jobForm.skills}
                      onChange={(e) => setJobForm(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="e.g. JavaScript, React, Python (comma separated)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expires">Expires At</Label>
                      <Input
                        id="expires"
                        type="date"
                        value={jobForm.expiresAt}
                        onChange={(e) => setJobForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remote"
                        checked={jobForm.isRemote}
                        onChange={(e) => setJobForm(prev => ({ ...prev, isRemote: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="remote">Remote Position</Label>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={handleCreateJob} className="flex-1">
                      Post Job
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateJob(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search by title, company, or skills..."
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
                    All ({jobs.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('active')}
                  >
                    Active ({activeJobs})
                  </Button>
                  <Button
                    variant={statusFilter === 'closed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('closed')}
                  >
                    Closed ({jobs.filter(j => j.status === 'closed').length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
                        {getJobTypeBadge(job.type)}
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                        <span className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{job.company}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </span>
                        {job.isRemote && (
                          <span className="flex items-center space-x-1">
                            <Globe className="h-4 w-4" />
                            <span>Remote</span>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 mb-4">{job.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-slate-900 mb-2">Key Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.currency} {job.salary}/hr</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Posted {formatDate(job.postedAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{job.applicationCount} applications</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{job.viewCount} views</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => handleViewApplications(job)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Applications ({job.applicationCount})
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{application.studentName}</h3>
                        {getApplicationStatusBadge(application.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                        <span>{application.studentEmail}</span>
                        <span>•</span>
                        <span>{application.studentYear} • {application.studentMajor}</span>
                      </div>
                      <p className="text-slate-700 mb-4">{application.coverLetter}</p>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Applied {formatDate(application.appliedAt)}</span>
                          </span>
                          {application.resumeUrl && (
                            <span className="flex items-center space-x-1">
                              <ExternalLink className="h-4 w-4" />
                              <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Resume
                              </a>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                    <Button variant="outline" size="sm">
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Briefcase className="h-8 w-8 mx-auto text-blue-600" />
                <CardTitle className="text-2xl">{jobs.length}</CardTitle>
                <CardDescription>Total Jobs Posted</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Users className="h-8 w-8 mx-auto text-green-600" />
                <CardTitle className="text-2xl">{totalApplications}</CardTitle>
                <CardDescription>Total Applications</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Eye className="h-8 w-8 mx-auto text-purple-600" />
                <CardTitle className="text-2xl">{totalViews}</CardTitle>
                <CardDescription>Total Views</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-yellow-600" />
                <CardTitle className="text-2xl">
                  {totalApplications > 0 ? Math.round((applications.filter(a => a.status === 'accepted').length / totalApplications) * 100) : 0}%
                </CardTitle>
                <CardDescription>Acceptance Rate</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Performance</CardTitle>
              <CardDescription>Overview of your job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{job.title} at {job.company}</h4>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-600">Applications</div>
                        <div className="font-medium">{job.applicationCount}</div>
                      </div>
                      <div>
                        <div className="text-slate-600">Views</div>
                        <div className="font-medium">{job.viewCount}</div>
                      </div>
                      <div>
                        <div className="text-slate-600">Conversion Rate</div>
                        <div className="font-medium">
                          {job.viewCount > 0 ? Math.round((job.applicationCount / job.viewCount) * 100) : 0}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-600">Posted</div>
                        <div className="font-medium">{formatDate(job.postedAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}