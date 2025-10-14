'use client';

import { useState, useMemo } from 'react';
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
  Bookmark,
  Share2
} from 'lucide-react';

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
    avatar?: string;
    role: string;
    isAlumni: boolean;
  };
  isBookmarked: boolean;
}

interface JobBoardProps {
  jobs?: Job[];
}

export default function JobBoard({ jobs = [] }: JobBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Sample job data
  const sampleJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$150,000 - $200,000',
      postedDate: '2024-11-01',
      deadline: '2024-12-15',
      description: 'We are looking for a talented Senior Software Engineer to join our team and work on cutting-edge cloud infrastructure projects.',
      requirements: ['5+ years of experience', 'Expert in JavaScript/TypeScript', 'Experience with cloud platforms', 'Strong problem-solving skills'],
      industry: 'Technology',
      experience: 'Senior Level',
      postedBy: {
        name: 'Sarah Johnson',
        role: 'Engineering Manager',
        isAlumni: true
      },
      isBookmarked: false
    },
    {
      id: '2',
      title: 'Product Marketing Manager',
      company: 'Nike',
      location: 'Portland, OR',
      type: 'Full-time',
      salary: '$90,000 - $120,000',
      postedDate: '2024-10-28',
      deadline: '2024-12-01',
      description: 'Join our marketing team to drive product strategy and launch innovative campaigns that connect with athletes worldwide.',
      requirements: ['3+ years in product marketing', 'Experience in sports industry', 'Strong analytical skills', 'MBA preferred'],
      industry: 'Retail',
      experience: 'Mid Level',
      postedBy: {
        name: 'Lisa Anderson',
        role: 'Marketing Director',
        isAlumni: true
      },
      isBookmarked: true
    },
    {
      id: '3',
      title: 'Data Science Intern',
      company: 'Amazon',
      location: 'Seattle, WA',
      type: 'Internship',
      salary: '$40 - $50 per hour',
      postedDate: '2024-10-25',
      deadline: '2024-11-30',
      description: 'Exciting internship opportunity for students passionate about data science and machine learning.',
      requirements: ['Currently pursuing degree in Data Science or related field', 'Python programming skills', 'Basic knowledge of ML algorithms', 'Strong academic record'],
      industry: 'Technology',
      experience: 'Entry Level',
      postedBy: {
        name: 'Emily Davis',
        role: 'Data Scientist',
        isAlumni: true
      },
      isBookmarked: false
    },
    {
      id: '4',
      title: 'Financial Analyst',
      company: 'Goldman Sachs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$80,000 - $100,000',
      postedDate: '2024-10-20',
      deadline: '2024-11-25',
      description: 'Seeking a detail-oriented Financial Analyst to join our investment banking team and work on high-profile deals.',
      requirements: ['Bachelor\'s in Finance or related field', 'Strong analytical skills', 'Experience with financial modeling', 'CFA or progress towards CFA preferred'],
      industry: 'Finance',
      experience: 'Entry Level',
      postedBy: {
        name: 'James Rodriguez',
        role: 'Senior Analyst',
        isAlumni: true
      },
      isBookmarked: false
    },
    {
      id: '5',
      title: 'UX Designer (Contract)',
      company: 'Tech Startup',
      location: 'Remote',
      type: 'Contract',
      salary: '$70 - $90 per hour',
      postedDate: '2024-10-15',
      deadline: '2024-11-20',
      description: 'Looking for an experienced UX Designer to help redesign our mobile app and improve user experience.',
      requirements: ['3+ years UX design experience', 'Proficiency in Figma/Sketch', 'Mobile app design experience', 'Strong portfolio'],
      industry: 'Technology',
      experience: 'Mid Level',
      postedBy: {
        name: 'Michael Chen',
        role: 'Product Manager',
        isAlumni: true
      },
      isBookmarked: true
    },
    {
      id: '6',
      title: 'Mechanical Engineer',
      company: 'Tesla',
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$85,000 - $110,000',
      postedDate: '2024-10-10',
      deadline: '2024-12-10',
      description: 'Join our innovative team to design and develop next-generation electric vehicle components.',
      requirements: ['Bachelor\'s in Mechanical Engineering', '3+ years in automotive industry', 'CAD software proficiency', 'Experience with EV systems'],
      industry: 'Automotive',
      experience: 'Mid Level',
      postedBy: {
        name: 'David Wilson',
        role: 'Senior Engineer',
        isAlumni: true
      },
      isBookmarked: false
    }
  ];

  const jobData = jobs.length > 0 ? jobs : sampleJobs;

  // Get unique values for filters
  const industries = useMemo(() => {
    const unique = [...new Set(jobData.map(j => j.industry))];
    return unique.sort();
  }, [jobData]);

  const locations = useMemo(() => {
    const unique = [...new Set(jobData.map(j => j.location))];
    return unique.sort();
  }, [jobData]);

  const experiences = useMemo(() => {
    const unique = [...new Set(jobData.map(j => j.experience))];
    return unique.sort();
  }, [jobData]);

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobData.filter(job => {
      const matchesSearch = searchQuery === '' || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || job.type === selectedType;
      const matchesIndustry = selectedIndustry === 'all' || job.industry === selectedIndustry;
      const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
      const matchesExperience = selectedExperience === 'all' || job.experience === selectedExperience;

      return matchesSearch && matchesType && matchesIndustry && matchesLocation && matchesExperience;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'salary':
          // Simple salary comparison (would need more sophisticated parsing in real app)
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobData, searchQuery, selectedType, selectedIndustry, selectedLocation, selectedExperience, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'bg-blue-100 text-blue-800';
      case 'Part-time': return 'bg-green-100 text-green-800';
      case 'Contract': return 'bg-purple-100 text-purple-800';
      case 'Internship': return 'bg-yellow-100 text-yellow-800';
      case 'Remote': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Job Opportunities</h1>
        <p className="text-slate-600">Discover career opportunities posted by alumni and employers</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{jobData.length}</div>
            <div className="text-sm text-slate-600">Total Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{jobData.filter(j => j.type === 'Full-time').length}</div>
            <div className="text-sm text-slate-600">Full-time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{jobData.filter(j => j.postedBy.isAlumni).length}</div>
            <div className="text-sm text-slate-600">Posted by Alumni</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{jobData.filter(j => new Date(j.deadline || '') > new Date()).length}</div>
            <div className="text-sm text-slate-600">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search jobs by title, company, or keywords..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {jobTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Select value={selectedExperience} onValueChange={setSelectedExperience}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {experiences.map(exp => (
                  <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">
              Showing {filteredJobs.length} of {jobData.length} opportunities
            </p>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map(job => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Job Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {job.company}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Bookmark className={`h-4 w-4 ${job.isBookmarked ? 'fill-current' : ''}`} />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={getTypeColor(job.type)}>
                      {job.type}
                    </Badge>
                    {job.salary && (
                      <Badge variant="outline" className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {job.salary}
                      </Badge>
                    )}
                    <Badge variant="outline" className="flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {job.experience}
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(job.postedDate)}
                    </Badge>
                    {job.deadline && new Date(job.deadline) > new Date() && (
                      <Badge variant="destructive" className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Apply by {new Date(job.deadline).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-slate-700 line-clamp-2">{job.description}</p>

                  {/* Requirements */}
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-2">Key Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Posted By */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={job.postedBy.avatar} alt={job.postedBy.name} />
                        <AvatarFallback>{job.postedBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{job.postedBy.name}</p>
                        <p className="text-xs text-slate-600">{job.postedBy.role}</p>
                      </div>
                      {job.postedBy.isAlumni && (
                        <Badge variant="secondary" className="text-xs">Alumni</Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">Apply Now</Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your search criteria or filters</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedIndustry('all');
              setSelectedLocation('all');
              setSelectedExperience('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Post a Job CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Have a job opportunity?</h3>
          <p className="text-slate-600 mb-4">Share opportunities with our talented alumni network</p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Post a Job
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}