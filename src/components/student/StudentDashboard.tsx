'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Award, 
  MessageSquare, 
  TrendingUp, 
  Bell,
  Target,
  BookOpen,
  Clock,
  CheckCircle,
  Send,
  Star,
  Heart,
  Eye,
  Bookmark,
  Share2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Quote,
  MapPin,
  Building,
  GraduationCap,
  Trophy,
  Sparkles,
  ArrowUpRight,
  TrendingUpIcon,
  UserCheck,
  Building2,
  Lightbulb,
  Play,
  Pause,
  Volume2,
  VolumeX,
  DollarSign,
  MapPin as MapPinIcon,
  Video,
  ExternalLink,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileHeader from '@/components/ui/ProfileHeader';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

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
  isApplied: boolean;
  isNew?: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endDate?: string;
  location: string;
  isVirtual: boolean;
  maxAttendees?: number;
  currentAttendees: number;
  category: string;
  organizer: {
    name: string;
    avatar?: string;
    role: string;
    isAlumni: boolean;
    id: string;
  };
  tags: string[];
  isRegistered: boolean;
  price?: number;
  image?: string;
  isFeatured?: boolean;
}

interface MentorshipRequest {
  id: string;
  alumniId: string;
  alumniName: string;
  alumniAvatar?: string;
  alumniEmail: string;
  alumniRole: string;
  alumniCompany: string;
  message: string;
  requestedAt: string;
  skills: string[];
  goals: string[];
  status: 'pending' | 'accepted' | 'declined';
  responseMessage?: string;
  respondedAt?: string;
}

interface CareerSkill {
  id: string;
  title: string;
  category: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  progress: number;
  isEnrolled: boolean;
  isCompleted: boolean;
  instructor: {
    name: string;
    avatar?: string;
    role: string;
    company: string;
  };
  modules: {
    title: string;
    duration: string;
    isCompleted: boolean;
  }[];
}

interface DashboardStats {
  totalJobs: number;
  newJobs: number;
  upcomingEvents: number;
  registeredEvents: number;
  pendingMentorshipRequests: number;
  activeMentors: number;
  skillsInProgress: number;
  completedSkills: number;
}

interface StudentDashboardProps {
  initialSection?: string;
}

export default function StudentDashboard({ initialSection }: StudentDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialSection || 'dashboard');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Update activeTab when initialSection prop changes
  useEffect(() => {
    if (initialSection) {
      setActiveTab(initialSection);
    }
  }, [initialSection]);
  
  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedJobIndustry, setSelectedJobIndustry] = useState('all');
  
  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [selectedEventCategory, setSelectedEventCategory] = useState('all');
  
  // Mentorship state
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [filteredMentorshipRequests, setFilteredMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [mentorshipSearchQuery, setMentorshipSearchQuery] = useState('');
  const [showMentorshipDialog, setShowMentorshipDialog] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [mentorshipMessage, setMentorshipMessage] = useState('');
  const [mentorshipSkills, setMentorshipSkills] = useState<string[]>([]);
  const [mentorshipGoals, setMentorshipGoals] = useState<string[]>([]);
  
  // Career Skills state
  const [careerSkills, setCareerSkills] = useState<CareerSkill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<CareerSkill[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('all');
  
  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    newJobs: 0,
    upcomingEvents: 0,
    registeredEvents: 0,
    pendingMentorshipRequests: 0,
    activeMentors: 0,
    skillsInProgress: 0,
    completedSkills: 0
  });

  // Sample data
  const sampleJobs: Job[] = [
    {
      id: '1',
      title: 'Software Engineering Intern',
      company: 'Google',
      location: 'Mountain View, CA',
      type: 'Internship',
      salary: '$45/hour',
      postedDate: '2024-01-15',
      deadline: '2024-02-15',
      description: 'Join our team to work on cutting-edge projects and learn from industry experts.',
      requirements: ['Currently pursuing CS degree', 'Strong programming skills', 'Team player'],
      industry: 'Technology',
      experience: 'Entry Level',
      postedBy: {
        name: 'Sarah Johnson',
        role: 'Engineering Manager',
        isAlumni: true
      },
      isBookmarked: false,
      isApplied: false,
      isNew: true
    },
    {
      id: '2',
      title: 'Product Management Intern',
      company: 'Microsoft',
      location: 'Redmond, WA',
      type: 'Internship',
      salary: '$40/hour',
      postedDate: '2024-01-10',
      deadline: '2024-02-10',
      description: 'Learn product management from the best in the industry.',
      requirements: ['Business or CS background', 'Analytical skills', 'Communication skills'],
      industry: 'Technology',
      experience: 'Entry Level',
      postedBy: {
        name: 'Michael Chen',
        role: 'Senior PM',
        isAlumni: true
      },
      isBookmarked: true,
      isApplied: false,
      isNew: false
    },
    {
      id: '3',
      title: 'Data Analyst',
      company: 'Amazon',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$85,000/year',
      postedDate: '2024-01-20',
      deadline: '2024-02-20',
      description: 'Analyze data to drive business decisions and insights.',
      requirements: ['SQL expertise', 'Python knowledge', 'Statistics background'],
      industry: 'Technology',
      experience: 'Entry Level',
      postedBy: {
        name: 'Emily Davis',
        role: 'Data Science Manager',
        isAlumni: true
      },
      isBookmarked: false,
      isApplied: true,
      isNew: true
    }
  ];

  const sampleEvents: Event[] = [
    {
      id: '1',
      title: 'Tech Career Fair 2024',
      description: 'Connect with top tech companies and explore internship opportunities.',
      date: '2024-02-01',
      time: '10:00 AM',
      endDate: '4:00 PM',
      location: 'University Campus',
      isVirtual: false,
      maxAttendees: 500,
      currentAttendees: 342,
      category: 'Career Fair',
      organizer: {
        name: 'Career Services',
        role: 'Event Organizer',
        isAlumni: true,
        id: 'organizer1'
      },
      tags: ['Career', 'Technology', 'Networking'],
      isRegistered: true,
      price: 0,
      isFeatured: true
    },
    {
      id: '2',
      title: 'Alumni Networking Night',
      description: 'Meet successful alumni and learn from their experiences.',
      date: '2024-02-15',
      time: '6:00 PM',
      endDate: '9:00 PM',
      location: 'Grand Hotel',
      isVirtual: false,
      maxAttendees: 200,
      currentAttendees: 156,
      category: 'Networking',
      organizer: {
        name: 'Alumni Association',
        role: 'President',
        isAlumni: true,
        id: 'organizer2'
      },
      tags: ['Networking', 'Alumni', 'Career'],
      isRegistered: false,
      price: 25,
      isFeatured: false
    },
    {
      id: '3',
      title: 'AI & Machine Learning Workshop',
      description: 'Learn about the latest trends in AI and ML from industry experts.',
      date: '2024-02-20',
      time: '2:00 PM',
      endDate: '5:00 PM',
      location: 'Online via Zoom',
      isVirtual: true,
      maxAttendees: 1000,
      currentAttendees: 423,
      category: 'Workshop',
      organizer: {
        name: 'Dr. Sarah Johnson',
        role: 'AI Research Lead',
        isAlumni: true,
        id: 'organizer3'
      },
      tags: ['AI', 'Machine Learning', 'Technology'],
      isRegistered: true,
      price: 0,
      isFeatured: true
    }
  ];

  const sampleMentorshipRequests: MentorshipRequest[] = [
    {
      id: '1',
      alumniId: 'alumni1',
      alumniName: 'Sarah Johnson',
      alumniEmail: 'sarah.johnson@email.com',
      alumniRole: 'Senior Software Engineer',
      alumniCompany: 'Google',
      message: 'I would be happy to mentor you in software engineering. Let me know what specific areas you\'d like to focus on.',
      requestedAt: '2024-01-15T10:30:00Z',
      skills: ['Software Engineering', 'Leadership', 'Career Development'],
      goals: ['Get internship at tech company', 'Improve coding skills', 'Learn about industry best practices'],
      status: 'accepted',
      responseMessage: 'I\'d be happy to help! Let\'s schedule a call next week to discuss your goals.'
    },
    {
      id: '2',
      alumniId: 'alumni2',
      alumniName: 'Michael Chen',
      alumniEmail: 'michael.chen@email.com',
      alumniRole: 'Product Manager',
      alumniCompany: 'Microsoft',
      message: 'Looking forward to guiding you in product management and career development.',
      requestedAt: '2024-01-14T15:45:00Z',
      skills: ['Product Management', 'Strategy', 'Leadership'],
      goals: ['Transition to product management', 'Build leadership skills', 'Network with industry professionals'],
      status: 'pending'
    }
  ];

  const sampleCareerSkills: CareerSkill[] = [
    {
      id: '1',
      title: 'Introduction to Python Programming',
      category: 'Programming',
      description: 'Learn the fundamentals of Python programming language.',
      level: 'Beginner',
      duration: '4 weeks',
      progress: 75,
      isEnrolled: true,
      isCompleted: false,
      instructor: {
        name: 'Dr. John Smith',
        role: 'Computer Science Professor',
        company: 'University'
      },
      modules: [
        { title: 'Python Basics', duration: '1 week', isCompleted: true },
        { title: 'Data Types and Variables', duration: '1 week', isCompleted: true },
        { title: 'Control Structures', duration: '1 week', isCompleted: true },
        { title: 'Functions and Modules', duration: '1 week', isCompleted: false }
      ]
    },
    {
      id: '2',
      title: 'Data Structures and Algorithms',
      category: 'Computer Science',
      description: 'Master essential data structures and algorithms for technical interviews.',
      level: 'Intermediate',
      duration: '6 weeks',
      progress: 40,
      isEnrolled: true,
      isCompleted: false,
      instructor: {
        name: 'Prof. Emily Davis',
        role: 'CS Professor',
        company: 'University'
      },
      modules: [
        { title: 'Arrays and Strings', duration: '1 week', isCompleted: true },
        { title: 'Linked Lists', duration: '1 week', isCompleted: true },
        { title: 'Trees and Graphs', duration: '2 weeks', isCompleted: false },
        { title: 'Sorting Algorithms', duration: '2 weeks', isCompleted: false }
      ]
    },
    {
      id: '3',
      title: 'Web Development Fundamentals',
      category: 'Web Development',
      description: 'Build modern web applications using HTML, CSS, and JavaScript.',
      level: 'Beginner',
      duration: '8 weeks',
      progress: 0,
      isEnrolled: false,
      isCompleted: false,
      instructor: {
        name: 'Alex Thompson',
        role: 'Senior Frontend Developer',
        company: 'Tech Corp'
      },
      modules: [
        { title: 'HTML5 Basics', duration: '2 weeks', isCompleted: false },
        { title: 'CSS3 Styling', duration: '2 weeks', isCompleted: false },
        { title: 'JavaScript Fundamentals', duration: '2 weeks', isCompleted: false },
        { title: 'Building a Complete Website', duration: '2 weeks', isCompleted: false }
      ]
    }
  ];

  // Sample alumni data for mentorship
  const sampleAlumni = [
    {
      id: 'alumni1',
      name: 'Sarah Johnson',
      role: 'Senior Software Engineer',
      company: 'Google',
      avatar: '',
      email: 'sarah.johnson@email.com',
      skills: ['Software Engineering', 'Leadership', 'AI/ML', 'Cloud Computing'],
      bio: 'Passionate about mentoring the next generation of engineers.'
    },
    {
      id: 'alumni2',
      name: 'Michael Chen',
      role: 'Product Manager',
      company: 'Microsoft',
      avatar: '',
      email: 'michael.chen@email.com',
      skills: ['Product Management', 'Strategy', 'Leadership', 'Business Analysis'],
      bio: 'Experienced PM with background in tech and business strategy.'
    },
    {
      id: 'alumni3',
      name: 'Emily Davis',
      role: 'Data Scientist',
      company: 'Amazon',
      avatar: '',
      email: 'emily.davis@email.com',
      skills: ['Data Science', 'Machine Learning', 'Statistics', 'Python'],
      bio: 'Data scientist with expertise in ML and statistical analysis.'
    }
  ];

  useEffect(() => {
    // Initialize data
    setJobs(sampleJobs);
    setEvents(sampleEvents);
    setMentorshipRequests(sampleMentorshipRequests);
    setCareerSkills(sampleCareerSkills);
    
    // Calculate stats
    const now = new Date();
    const upcomingEventsCount = sampleEvents.filter(event => new Date(event.date + ' ' + event.time) > now).length;
    const registeredEventsCount = sampleEvents.filter(event => event.isRegistered).length;
    const pendingMentorshipCount = sampleMentorshipRequests.filter(req => req.status === 'pending').length;
    const activeMentorsCount = sampleMentorshipRequests.filter(req => req.status === 'accepted').length;
    const skillsInProgressCount = sampleCareerSkills.filter(skill => skill.isEnrolled && !skill.isCompleted).length;
    const completedSkillsCount = sampleCareerSkills.filter(skill => skill.isCompleted).length;
    const newJobsCount = sampleJobs.filter(job => new Date(job.postedDate) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length;

    setStats({
      totalJobs: sampleJobs.length,
      newJobs: newJobsCount,
      upcomingEvents: upcomingEventsCount,
      registeredEvents: registeredEventsCount,
      pendingMentorshipRequests: pendingMentorshipCount,
      activeMentors: activeMentorsCount,
      skillsInProgress: skillsInProgressCount,
      completedSkills: completedSkillsCount
    });

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socketio'
    });
    setSocket(socketInstance);

    // Listen for real-time updates
    socketInstance.on('new_job_posted', (data) => {
      setJobs(prev => [data, ...prev]);
      setStats(prev => ({ ...prev, totalJobs: prev.totalJobs + 1, newJobs: prev.newJobs + 1 }));
    });

    socketInstance.on('new_event_created', (data) => {
      setEvents(prev => [data, ...prev]);
      setStats(prev => ({ ...prev, upcomingEvents: prev.upcomingEvents + 1 }));
    });

    socketInstance.on('mentorship_response', (data) => {
      setMentorshipRequests(prev => prev.map(req => 
        req.id === data.requestId ? { ...req, status: data.accepted ? 'accepted' : 'declined', responseMessage: data.responseMessage } : req
      ));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Filter jobs
  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = jobSearchQuery === '' || 
        job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(jobSearchQuery.toLowerCase());

      const matchesType = selectedJobType === 'all' || job.type === selectedJobType;
      const matchesIndustry = selectedJobIndustry === 'all' || job.industry === selectedJobIndustry;

      return matchesSearch && matchesType && matchesIndustry;
    });

    setFilteredJobs(filtered);
  }, [jobs, jobSearchQuery, selectedJobType, selectedJobIndustry]);

  // Filter events
  useEffect(() => {
    let filtered = events.filter(event => {
      const matchesSearch = eventSearchQuery === '' || 
        event.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(eventSearchQuery.toLowerCase()));

      const matchesCategory = selectedEventCategory === 'all' || event.category === selectedEventCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredEvents(filtered);
  }, [events, eventSearchQuery, selectedEventCategory]);

  // Filter mentorship requests
  useEffect(() => {
    let filtered = mentorshipRequests.filter(request => {
      return mentorshipSearchQuery === '' || 
        request.alumniName.toLowerCase().includes(mentorshipSearchQuery.toLowerCase()) ||
        request.alumniRole.toLowerCase().includes(mentorshipSearchQuery.toLowerCase()) ||
        request.skills.some(skill => skill.toLowerCase().includes(mentorshipSearchQuery.toLowerCase()));
    });

    setFilteredMentorshipRequests(filtered);
  }, [mentorshipRequests, mentorshipSearchQuery]);

  // Filter career skills
  useEffect(() => {
    let filtered = careerSkills.filter(skill => {
      const matchesSearch = skillSearchQuery === '' || 
        skill.title.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(skillSearchQuery.toLowerCase());

      const matchesCategory = selectedSkillCategory === 'all' || skill.category === selectedSkillCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredSkills(filtered);
  }, [careerSkills, skillSearchQuery, selectedSkillCategory]);

  const handleJobApply = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, isApplied: true } : job
    ));
  };

  const handleJobBookmark = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
    ));
  };

  const handleEventRegister = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, isRegistered: true, currentAttendees: event.currentAttendees + 1 } : event
    ));
    setStats(prev => ({ ...prev, registeredEvents: prev.registeredEvents + 1 }));
  };

  const handleEventUnregister = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, isRegistered: false, currentAttendees: event.currentAttendees - 1 } : event
    ));
    setStats(prev => ({ ...prev, registeredEvents: prev.registeredEvents - 1 }));
  };

  const handleMentorshipRequest = (alumni: any) => {
    setSelectedAlumni(alumni);
    setShowMentorshipDialog(true);
  };

  const submitMentorshipRequest = () => {
    if (selectedAlumni && mentorshipMessage.trim() && socket) {
      const newRequest: MentorshipRequest = {
        id: Date.now().toString(),
        alumniId: selectedAlumni.id,
        alumniName: selectedAlumni.name,
        alumniEmail: selectedAlumni.email,
        alumniRole: selectedAlumni.role,
        alumniCompany: selectedAlumni.company,
        message: mentorshipMessage,
        requestedAt: new Date().toISOString(),
        skills: mentorshipSkills,
        goals: mentorshipGoals,
        status: 'pending'
      };

      setMentorshipRequests(prev => [newRequest, ...prev]);
      setStats(prev => ({ ...prev, pendingMentorshipRequests: prev.pendingMentorshipRequests + 1 }));

      // Emit socket event
      socket.emit('new_mentorship_request', {
        ...newRequest,
        studentId: user?.id,
        studentName: user?.name,
        studentEmail: user?.email
      });

      setShowMentorshipDialog(false);
      setSelectedAlumni(null);
      setMentorshipMessage('');
      setMentorshipSkills([]);
      setMentorshipGoals([]);
    }
  };

  const handleSkillEnroll = (skillId: string) => {
    setCareerSkills(prev => prev.map(skill => 
      skill.id === skillId ? { ...skill, isEnrolled: true } : skill
    ));
    setStats(prev => ({ ...prev, skillsInProgress: prev.skillsInProgress + 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'bg-blue-100 text-blue-800';
      case 'Part-time': return 'bg-green-100 text-green-800';
      case 'Contract': return 'bg-purple-100 text-purple-800';
      case 'Internship': return 'bg-yellow-100 text-yellow-800';
      case 'Remote': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMentorshipStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
      {/* Profile Header */}
      <ProfileHeader 
        user={user!} 
      />

      {/* Main Content - Show only the active section */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.newJobs} new this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.registeredEvents} registered
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mentorship</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeMentors}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingMentorshipRequests} pending requests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Career Skills</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.skillsInProgress}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedSkills} completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Job Opportunities</CardTitle>
                  <CardDescription>Latest opportunities posted by alumni and companies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.slice(0, 3).map(job => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{job.title}</h4>
                          <p className="text-xs text-muted-foreground">{job.company} • {job.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getJobTypeColor(job.type)}>{job.type}</Badge>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Don't miss these upcoming opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.slice(0, 3).map(event => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">{formatDate(event.date)} • {event.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {event.isRegistered ? (
                            <Badge className="bg-green-100 text-green-800">Registered</Badge>
                          ) : (
                            <Button size="sm" variant="outline">Register</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with these popular actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col" onClick={() => setActiveTab('jobs')}>
                    <Briefcase className="h-6 w-6 mb-2" />
                    <span>Browse Jobs</span>
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => setActiveTab('events')}>
                    <Calendar className="h-6 w-6 mb-2" />
                    <span>Find Events</span>
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => setActiveTab('mentorship')}>
                    <MessageSquare className="h-6 w-6 mb-2" />
                    <span>Find Mentor</span>
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => setActiveTab('skills')}>
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span>Learn Skills</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Jobs & Internships Section */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Jobs & Internships</h2>
                <p className="text-slate-600 mt-1">Discover opportunities posted by alumni and companies</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{filteredJobs.length} opportunities</Badge>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search jobs by title, company, or keywords..."
                    className="pl-10"
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedJobIndustry} onValueChange={setSelectedJobIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Job Listings */}
            <div className="space-y-6">
              {filteredJobs.map(job => (
                <Card key={job.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Job Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                              {job.isNew && (
                                <Badge className="bg-red-100 text-red-800 animate-pulse">NEW</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span className="flex items-center font-medium">
                                <Building className="h-4 w-4 mr-1 text-blue-600" />
                                {job.company}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-green-600" />
                                {job.location}
                              </span>
                              {job.salary && (
                                <span className="flex items-center font-medium text-green-700">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {job.salary}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant={job.isBookmarked ? "default" : "outline"} 
                              onClick={() => handleJobBookmark(job.id)}
                              className={job.isBookmarked ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                            >
                              <Bookmark className={`h-4 w-4 ${job.isBookmarked ? 'fill-current' : ''}`} />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Job Description */}
                        <div className="space-y-3">
                          <p className="text-slate-700 leading-relaxed">{job.description}</p>
                          
                          {/* Key Requirements */}
                          <div>
                            <h4 className="font-medium text-slate-900 mb-2">Key Requirements:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                              {job.requirements.slice(0, 3).map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                              {job.requirements.length > 3 && (
                                <li className="text-blue-600 font-medium">+{job.requirements.length - 3} more requirements</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Tags and Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${getJobTypeColor(job.type)} font-medium`}>{job.type}</Badge>
                          <Badge variant="outline" className="border-slate-300">{job.industry}</Badge>
                          <Badge variant="outline" className="border-slate-300">{job.experience}</Badge>
                          {job.postedBy.isAlumni && (
                            <Badge className="bg-purple-100 text-purple-800">Alumni Posted</Badge>
                          )}
                        </div>

                        {/* Posted by Info */}
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={job.postedBy.avatar} />
                              <AvatarFallback>{job.postedBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Posted by {job.postedBy.name}</p>
                              <p className="text-xs text-slate-600">{job.postedBy.role}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div className="text-sm text-slate-600">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Posted {formatDate(job.postedDate)}
                              </span>
                              {job.deadline && (
                                <span className="flex items-center text-orange-600 font-medium">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Deadline {formatDate(job.deadline)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {job.isApplied ? (
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Applied
                                </Badge>
                                <Button size="sm" variant="outline">View Application</Button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => handleJobApply(job.id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Apply Now
                                  <ArrowUpRight className="h-4 w-4 ml-1" />
                                </Button>
                                <Button size="sm" variant="outline">Save for Later</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Events Section */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Events</h2>
                <p className="text-slate-600 mt-1">Discover and register for upcoming events</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{filteredEvents.length} events</Badge>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search events by title, description, or tags..."
                    className="pl-10"
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedEventCategory} onValueChange={setSelectedEventCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Career Fair">Career Fair</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Event Listings */}
            <div className="space-y-6">
              {filteredEvents.map(event => (
                <Card key={event.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Event Image/Visual */}
                      <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-gradient-to-br from-green-100 to-blue-100 h-48 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Calendar className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <div className="text-lg font-bold text-green-800">{formatDate(event.date)}</div>
                            <div className="text-sm text-green-600">{event.time}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        {/* Event Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                              {event.isFeatured && (
                                <Badge className="bg-purple-100 text-purple-800">FEATURED</Badge>
                              )}
                              {event.isVirtual && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Video className="h-3 w-3 mr-1" />
                                  Virtual
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span className="flex items-center font-medium">
                                <MapPin className="h-4 w-4 mr-1 text-green-600" />
                                {event.location}
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-blue-600" />
                                {event.currentAttendees}/{event.maxAttendees || '∞'} attending
                              </span>
                              {event.price !== undefined && event.price > 0 && (
                                <span className="flex items-center font-medium text-green-700">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  ${event.price}
                                </span>
                              )}
                              {event.price === 0 && (
                                <Badge className="bg-green-100 text-green-800">FREE</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Event Description */}
                        <div className="space-y-3">
                          <p className="text-slate-700 leading-relaxed">{event.description}</p>
                          
                          {/* Event Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-1">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-sm">Duration</span>
                              </div>
                              <div className="text-sm text-slate-600">
                                {event.time} {event.endDate ? `- ${event.endDate}` : ''}
                              </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-1">
                                <Users className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-sm">Organizer</span>
                              </div>
                              <div className="text-sm text-slate-600">
                                {event.organizer.name} • {event.organizer.role}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tags and Categories */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 font-medium">{event.category}</Badge>
                          {event.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="border-slate-300 text-xs">{tag}</Badge>
                          ))}
                        </div>

                        {/* Organizer Info */}
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={event.organizer.avatar} />
                              <AvatarFallback>{event.organizer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Organized by {event.organizer.name}</p>
                              <p className="text-xs text-slate-600">{event.organizer.role}</p>
                            </div>
                            {event.organizer.isAlumni && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">Alumni</Badge>
                            )}
                          </div>
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div className="text-sm text-slate-600">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(event.date)}
                              </span>
                              {event.maxAttendees && (
                                <span className={`flex items-center font-medium ${
                                  event.currentAttendees >= event.maxAttendees * 0.9 ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                  <Users className="h-4 w-4 mr-1" />
                                  {event.maxAttendees - event.currentAttendees} spots left
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {event.isRegistered ? (
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Registered
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEventUnregister(event.id)}
                                >
                                  Unregister
                                </Button>
                              </div>
                            ) : event.maxAttendees && event.currentAttendees >= event.maxAttendees ? (
                              <Badge className="bg-red-100 text-red-800">Event Full</Badge>
                            ) : (
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => handleEventRegister(event.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Register Now
                                  <ArrowUpRight className="h-4 w-4 ml-1" />
                                </Button>
                                <Button size="sm" variant="outline">Add to Calendar</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Mentorship Section */}
        {activeTab === 'mentorship' && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Mentorship</h2>
                <p className="text-slate-600 mt-1">Connect with alumni mentors for guidance and support</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{stats.activeMentors} active mentors</Badge>
              </div>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search mentorship requests..."
                    className="pl-10"
                    value={mentorshipSearchQuery}
                    onChange={(e) => setMentorshipSearchQuery(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Available Alumni for Mentorship */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  Available Mentors
                </CardTitle>
                <CardDescription>Connect with experienced alumni who can guide your career journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sampleAlumni.map(alumni => (
                    <Card key={alumni.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 group">
                      <CardContent className="p-6">
                        {/* Mentor Header */}
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="relative">
                            <Avatar className="w-16 h-16 ring-4 ring-purple-100">
                              <AvatarImage src={alumni.avatar} />
                              <AvatarFallback className="text-lg font-bold bg-purple-600 text-white">
                                {alumni.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{alumni.name}</h4>
                            <p className="text-sm text-slate-600">{alumni.role}</p>
                            <p className="text-sm font-medium text-purple-600">{alumni.company}</p>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-slate-900 mb-2">Expertise Areas:</h5>
                          <div className="flex flex-wrap gap-1">
                            {alumni.skills.slice(0, 4).map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs border-purple-200 text-purple-700">
                                {skill}
                              </Badge>
                            ))}
                            {alumni.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs border-slate-200">
                                +{alumni.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="mb-4">
                          <p className="text-sm text-slate-600 leading-relaxed">{alumni.bio}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                          <div className="bg-purple-50 p-2 rounded">
                            <div className="text-lg font-bold text-purple-700">5+</div>
                            <div className="text-xs text-purple-600">Years Experience</div>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <div className="text-lg font-bold text-blue-700">15+</div>
                            <div className="text-xs text-blue-600">Mentees</div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                          size="sm" 
                          className="w-full bg-purple-600 hover:bg-purple-700 group-hover:shadow-lg transition-all duration-300"
                          onClick={() => handleMentorshipRequest(alumni)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Request Mentorship
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Mentorship Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  My Mentorship Requests
                </CardTitle>
                <CardDescription>Track the status of your mentorship requests and conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMentorshipRequests.map(request => (
                    <Card key={request.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${
                      request.status === 'accepted' ? 'border-l-green-500' :
                      request.status === 'pending' ? 'border-l-yellow-500' :
                      'border-l-red-500'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Mentor Avatar */}
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={request.alumniAvatar} />
                              <AvatarFallback className="bg-slate-200">
                                {request.alumniName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {request.status === 'accepted' && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-3">
                            {/* Request Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-bold text-slate-900">{request.alumniName}</h4>
                                  <Badge className={
                                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600">{request.alumniRole} at {request.alumniCompany}</p>
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatDate(request.requestedAt)}
                              </div>
                            </div>

                            {/* Message */}
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-sm text-slate-700 leading-relaxed">{request.message}</p>
                            </div>

                            {/* Skills and Goals */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-xs font-medium text-slate-900 mb-1">Skills to Develop:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {request.skills.map(skill => (
                                    <Badge key={skill} variant="outline" className="text-xs border-blue-200 text-blue-700">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-xs font-medium text-slate-900 mb-1">Career Goals:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {request.goals.map(goal => (
                                    <Badge key={goal} variant="outline" className="text-xs border-green-200 text-green-700">
                                      {goal}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Response */}
                            {request.responseMessage && (
                              <div className="bg-green-50 p-3 rounded-lg border-l-4 border-l-green-500">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="text-sm font-medium text-green-800">Response from {request.alumniName}:</h5>
                                  {request.respondedAt && (
                                    <span className="text-xs text-green-600">
                                      {formatDate(request.respondedAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-green-700 leading-relaxed">{request.responseMessage}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                              <div className="text-xs text-slate-500">
                                Request ID: {request.id}
                              </div>
                              <div className="flex space-x-2">
                                {request.status === 'accepted' && (
                                  <>
                                    <Button size="sm" variant="outline">
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      Message
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Schedule Call
                                    </Button>
                                  </>
                                )}
                                {request.status === 'pending' && (
                                  <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                                    Cancel Request
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Career Skills Section */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Career Skills</h2>
                <p className="text-slate-600 mt-1">Enhance your professional skills with our curated courses</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{stats.skillsInProgress} in progress</Badge>
                <Badge variant="outline">{stats.completedSkills} completed</Badge>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search skills by title or description..."
                    className="pl-10"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedSkillCategory} onValueChange={setSelectedSkillCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map(skill => (
                <Card key={skill.id} className={`hover:shadow-xl transition-all duration-300 border-l-4 ${
                  skill.isCompleted ? 'border-l-green-500' :
                  skill.isEnrolled ? 'border-l-blue-500' :
                  'border-l-orange-500'
                } group`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {skill.title}
                          </CardTitle>
                          {skill.isCompleted && (
                            <Badge className="bg-green-100 text-green-800">
                              <Trophy className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {skill.isEnrolled && !skill.isCompleted && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Play className="h-3 w-3 mr-1" />
                              In Progress
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                          <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                          <Badge variant="outline" className="text-xs">{skill.duration}</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Heart className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">{skill.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    {/* Progress Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900">Progress</span>
                        <span className={`text-sm font-bold ${
                          skill.progress === 100 ? 'text-green-600' :
                          skill.progress > 50 ? 'text-blue-600' :
                          'text-orange-600'
                        }`}>
                          {skill.progress}%
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={skill.progress} className="h-3" />
                        {skill.progress === 100 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Instructor Info */}
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={skill.instructor.avatar} />
                          <AvatarFallback>{skill.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{skill.instructor.name}</p>
                          <p className="text-xs text-slate-600">{skill.instructor.role} at {skill.instructor.company}</p>
                        </div>
                      </div>
                    </div>

                    {/* Modules */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-slate-900">Course Modules:</h5>
                      <div className="space-y-1">
                        {skill.modules.map((module, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 rounded bg-slate-50">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              module.isCompleted ? 'bg-green-500' : 'bg-slate-300'
                            }`}>
                              {module.isCompleted && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <span className={`text-sm flex-1 ${
                              module.isCompleted ? 'text-slate-900 line-through' : 'text-slate-600'
                            }`}>
                              {module.title}
                            </span>
                            <span className="text-xs text-slate-500">{module.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-lg font-bold text-blue-700">{skill.modules.length}</div>
                        <div className="text-xs text-blue-600">Modules</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-lg font-bold text-green-700">
                          {skill.modules.filter(m => m.isCompleted).length}
                        </div>
                        <div className="text-xs text-green-600">Completed</div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <div className="text-lg font-bold text-orange-700">
                          {skill.modules.filter(m => !m.isCompleted).length}
                        </div>
                        <div className="text-xs text-orange-600">Remaining</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      {skill.isEnrolled ? (
                        skill.isCompleted ? (
                          <>
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                              <Trophy className="h-4 w-4 mr-1" />
                              Certificate
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <BookOpen className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                              <Play className="h-4 w-4 mr-1" />
                              Continue
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                          </>
                        )
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleSkillEnroll(skill.id)}
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Enroll Now
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mentorship Request Dialog */}
      <Dialog open={showMentorshipDialog} onOpenChange={setShowMentorshipDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Mentorship from {selectedAlumni?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you'd like their mentorship..."
                value={mentorshipMessage}
                onChange={(e) => setMentorshipMessage(e.target.value)}
              />
            </div>
            <div>
              <Label>Skills you want to develop</Label>
              <Input
                placeholder="e.g., Programming, Leadership, Communication"
                value={mentorshipSkills.join(', ')}
                onChange={(e) => setMentorshipSkills(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              />
            </div>
            <div>
              <Label>Your goals</Label>
              <Input
                placeholder="e.g., Get internship, Improve skills, Career guidance"
                value={mentorshipGoals.join(', ')}
                onChange={(e) => setMentorshipGoals(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={submitMentorshipRequest} disabled={!mentorshipMessage.trim()}>
                Send Request
              </Button>
              <Button variant="outline" onClick={() => setShowMentorshipDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}