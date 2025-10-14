'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Award, 
  TrendingUp, 
  Building, 
  Calendar, 
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Star,
  BookOpen,
  Target,
  Lightbulb,
  Users,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ThumbsUp,
  Eye,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Quote,
  MapPin,
  Briefcase,
  GraduationCap,
  Trophy,
  Sparkles,
  ArrowUpRight,
  Clock,
  TrendingUpIcon,
  UserCheck,
  Building2,
  CheckCircle,
  X,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface SuccessStory {
  id: string;
  title: string;
  summary: string;
  fullStory: string;
  alumnus: {
    name: string;
    avatar?: string;
    graduationYear: number;
    degree: string;
    currentRole: string;
    company: string;
    location: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  };
  category: string;
  tags: string[];
  achievementDate: string;
  featured: boolean;
  likes: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  keyAchievements: string[];
  challenges: string[];
  advice: string;
  relatedLinks?: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'podcast' | 'website';
  }[];
  media?: {
    type: 'image' | 'video';
    url: string;
    caption: string;
  }[];
  timeline?: {
    date: string;
    title: string;
    description: string;
  }[];
}

interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export default function AlumniSuccessStories() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('stories');
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // Story submission form states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    fullStory: '',
    category: '',
    tags: '',
    keyAchievements: '',
    challenges: '',
    advice: '',
    currentRole: '',
    company: '',
    location: '',
    linkedinUrl: '',
    twitterUrl: ''
  });

  // Form handler functions
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitStory = async () => {
    if (!user) {
      alert('Please log in to submit your story');
      return;
    }

    // Basic validation
    if (!formData.title || !formData.summary || !formData.fullStory || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new story object
      const newStory: SuccessStory = {
        id: Date.now().toString(),
        title: formData.title,
        summary: formData.summary,
        fullStory: formData.fullStory,
        alumnus: {
          name: user.name || 'Anonymous',
          graduationYear: user.graduationYear || new Date().getFullYear(),
          degree: user.degree || 'Alumni',
          currentRole: formData.currentRole || 'Professional',
          company: formData.company || '',
          location: formData.location || '',
          linkedinUrl: formData.linkedinUrl || undefined,
          twitterUrl: formData.twitterUrl || undefined
        },
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        achievementDate: new Date().getFullYear().toString(),
        featured: false,
        likes: 0,
        views: 0,
        isLiked: false,
        isBookmarked: false,
        keyAchievements: formData.keyAchievements.split('\n').filter(achievement => achievement.trim()),
        challenges: formData.challenges.split('\n').filter(challenge => challenge.trim()),
        advice: formData.advice,
        relatedLinks: [],
        timeline: []
      };

      // Add to stories array (in a real app, this would be an API call)
      sampleStories.unshift(newStory);
      
      setSubmitSuccess(true);
      setIsSubmitting(false);
      
      // Reset form
      setFormData({
        title: '',
        summary: '',
        fullStory: '',
        category: '',
        tags: '',
        keyAchievements: '',
        challenges: '',
        advice: '',
        currentRole: '',
        company: '',
        location: '',
        linkedinUrl: '',
        twitterUrl: ''
      });

      // Close modal after success
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting story:', error);
      setIsSubmitting(false);
      alert('Failed to submit story. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      fullStory: '',
      category: '',
      tags: '',
      keyAchievements: '',
      challenges: '',
      advice: '',
      currentRole: '',
      company: '',
      location: '',
      linkedinUrl: '',
      twitterUrl: ''
    });
    setSubmitSuccess(false);
  };

  // Enhanced sample success stories data
  const sampleStories: SuccessStory[] = [
    {
      id: '1',
      title: 'From Graduate to Tech Leader: Building AI Solutions at Google',
      summary: 'How Sarah Johnson transformed her passion for computer science into a leadership role at Google, developing cutting-edge AI solutions that impact millions of users worldwide.',
      fullStory: 'Sarah Johnson graduated in 2020 with a degree in Computer Science. During her time at university, she was actively involved in hackathons and research projects. Her breakthrough came when she developed an innovative machine learning model for predicting student success rates, which caught the attention of Google recruiters. Today, she leads a team of engineers working on AI-powered educational tools that have helped over 10 million students worldwide. Sarah attributes her success to the strong foundation she built at university and the mentorship she received from alumni who paved the way before her.',
      alumnus: {
        name: 'Sarah Johnson',
        graduationYear: 2020,
        degree: 'Computer Science',
        currentRole: 'Senior Software Engineer',
        company: 'Google',
        location: 'San Francisco, CA',
        linkedinUrl: '#',
        twitterUrl: '#'
      },
      category: 'Career Achievement',
      tags: ['Technology', 'AI', 'Leadership', 'Google'],
      achievementDate: '2024',
      featured: true,
      likes: 234,
      views: 1520,
      isLiked: false,
      isBookmarked: false,
      keyAchievements: [
        'Promoted to Senior Engineer in 2 years',
        'Led development of AI tools used by 10M+ students',
        'Received Google Innovation Award 2023',
        'Mentored 15+ junior engineers'
      ],
      challenges: [
        'Breaking into the competitive tech industry',
        'Balancing work with continued learning',
        'Leading teams as a young professional'
      ],
      advice: 'Never stop learning and don\'t be afraid to take on challenges that seem beyond your current capabilities. The best growth happens outside your comfort zone.',
      relatedLinks: [
        { title: 'Google AI Blog', url: '#', type: 'article' },
        { title: 'Tech Leadership Interview', url: '#', type: 'video' }
      ],
      media: [
        { type: 'image', url: '#', caption: 'Sarah receiving Google Innovation Award' }
      ],
      timeline: [
        { date: '2020', title: 'Graduation', description: 'Graduated with Computer Science degree' },
        { date: '2020', title: 'Joined Google', description: 'Started as Software Engineer' },
        { date: '2022', title: 'First Promotion', description: 'Promoted to Senior Engineer' },
        { date: '2023', title: 'Innovation Award', description: 'Received Google Innovation Award' },
        { date: '2024', title: 'Team Lead', description: 'Now leads AI education tools team' }
      ]
    },
    {
      id: '2',
      title: 'Entrepreneurial Journey: Building a Sustainable Fashion Brand',
      summary: 'Michael Chen turned his business degree and passion for sustainability into a successful eco-friendly fashion startup that\'s revolutionizing the industry.',
      fullStory: 'After graduating with a Business Administration degree in 2019, Michael Chen combined his business acumen with his passion for environmental sustainability. He noticed a gap in the market for stylish, sustainable clothing that didn\'t compromise on design or ethics. Starting with just $5,000 in savings, Michael launched EcoWear, a fashion brand that uses recycled materials and ethical manufacturing processes. Today, EcoWear is a multi-million dollar company with products in over 200 retail locations worldwide. Michael\'s innovative approach to sustainable fashion has earned him numerous awards and recognition as a leader in ethical entrepreneurship.',
      alumnus: {
        name: 'Michael Chen',
        graduationYear: 2019,
        degree: 'Business Administration',
        currentRole: 'CEO & Founder',
        company: 'EcoWear',
        location: 'Portland, OR',
        linkedinUrl: '#',
        twitterUrl: '#'
      },
      category: 'Entrepreneurship',
      tags: ['Entrepreneurship', 'Sustainability', 'Fashion', 'Startup'],
      achievementDate: '2024',
      featured: true,
      likes: 189,
      views: 1240,
      isLiked: false,
      isBookmarked: false,
      keyAchievements: [
        'Built $5M+ revenue company from scratch',
        'Featured in Forbes 30 Under 30',
        'Expanded to 200+ retail locations',
        'Created 50+ green jobs'
      ],
      challenges: [
        'Securing initial funding with no track record',
        'Educating consumers about sustainable fashion',
        'Scaling manufacturing while maintaining ethics'
      ],
      advice: 'Find a problem you\'re passionate about solving and pursue it relentlessly. Success comes from persistence and the willingness to learn from failures.',
      relatedLinks: [
        { title: 'EcoWear Website', url: '#', type: 'website' },
        { title: 'Forbes Feature', url: '#', type: 'article' }
      ],
      media: [
        { type: 'image', url: '#', caption: 'EcoWear flagship store opening' }
      ],
      timeline: [
        { date: '2019', title: 'Graduation', description: 'Graduated with Business Administration degree' },
        { date: '2019', title: 'EcoWear Founded', description: 'Started company with $5,000 savings' },
        { date: '2021', title: 'First Retail Deal', description: 'Products in first retail store' },
        { date: '2023', title: 'Forbes Recognition', description: 'Featured in Forbes 30 Under 30' },
        { date: '2024', title: 'Major Expansion', description: 'Expanded to 200+ retail locations' }
      ]
    },
    {
      id: '3',
      title: 'Breaking Barriers: From First-Generation Student to Medical Researcher',
      summary: 'Emily Davis overcame numerous obstacles as a first-generation student to become a leading researcher in medical data science, publishing groundbreaking work on disease prediction.',
      fullStory: 'As a first-generation college student, Emily Davis faced numerous challenges while pursuing her Data Science degree. However, her determination and the support she received from professors and alumni helped her excel. After graduating in 2018, Emily joined Amazon as a data scientist but soon realized her true calling was in medical research. She made a bold career move to join a research institution where she could apply her skills to healthcare. Today, Emily leads a research team that has developed groundbreaking algorithms for early disease prediction, potentially saving thousands of lives. Her work has been published in top medical journals and has earned her recognition as one of the leading young researchers in her field.',
      alumnus: {
        name: 'Emily Davis',
        graduationYear: 2018,
        degree: 'Data Science',
        currentRole: 'Senior Research Scientist',
        company: 'Medical Research Institute',
        location: 'Boston, MA',
        linkedinUrl: '#',
        twitterUrl: '#'
      },
      category: 'Academic Achievement',
      tags: ['Research', 'Healthcare', 'Data Science', 'First-Generation'],
      achievementDate: '2023',
      featured: false,
      likes: 156,
      views: 980,
      isLiked: false,
      isBookmarked: false,
      keyAchievements: [
        'Published 15+ peer-reviewed research papers',
        'Developed disease prediction algorithm with 95% accuracy',
        'Received National Science Foundation Grant',
        'Mentored 20+ underrepresented students'
      ],
      challenges: [
        'Navigating college as first-generation student',
        'Transitioning from corporate to academic research',
        'Securing research funding'
      ],
      advice: 'Your background doesn\'t define your future. Seek mentors, ask for help when needed, and remember that every expert was once a beginner.',
      relatedLinks: [
        { title: 'Research Profile', url: '#', type: 'website' },
        { title: 'Publication List', url: '#', type: 'article' }
      ],
      timeline: [
        { date: '2018', title: 'Graduation', description: 'First-generation graduate with Data Science degree' },
        { date: '2018', title: 'Joined Amazon', description: 'Started as Data Scientist at Amazon' },
        { date: '2020', title: 'Career Shift', description: 'Moved to medical research field' },
        { date: '2022', title: 'Major Breakthrough', description: 'Developed disease prediction algorithm' },
        { date: '2023', title: 'Research Leadership', description: 'Now leads research team' }
      ]
    },
    {
      id: '4',
      title: 'Engineering Innovation: Designing the Future of Electric Vehicles',
      summary: 'David Wilson\'s passion for sustainable transportation led him to Tesla, where he now leads a team designing next-generation electric vehicle components.',
      fullStory: 'David Wilson graduated with a Mechanical Engineering degree in 2021, right as the electric vehicle revolution was gaining momentum. His senior project on battery efficiency improvements caught the attention of Tesla recruiters. Starting as an entry-level engineer, David quickly made his mark by proposing innovative cooling solutions for battery packs. His designs are now used in Tesla\'s latest models, improving range and safety. In just three years, David has been promoted twice and now leads a team of engineers working on the next generation of EV technology. He credits his rapid success to the hands-on experience he gained through university projects and internships.',
      alumnus: {
        name: 'David Wilson',
        graduationYear: 2021,
        degree: 'Mechanical Engineering',
        currentRole: 'Senior Engineer',
        company: 'Tesla',
        location: 'Austin, TX',
        linkedinUrl: '#',
        twitterUrl: '#'
      },
      category: 'Innovation',
      tags: ['Engineering', 'Electric Vehicles', 'Sustainability', 'Tesla'],
      achievementDate: '2024',
      featured: false,
      likes: 145,
      views: 890,
      isLiked: false,
      isBookmarked: false,
      keyAchievements: [
        'Promoted twice in 3 years at Tesla',
        'Patented battery cooling technology',
        'Leads team of 12 engineers',
        'Contributed to 3+ Tesla vehicle models'
      ],
      challenges: [
        'Competing in a rapidly evolving industry',
        'Managing complex engineering projects',
        'Balancing innovation with practicality'
      ],
      advice: 'Focus on solving real problems, not just theoretical concepts. The best engineers are those who understand both the technical and practical aspects of their work.',
      relatedLinks: [
        { title: 'Tesla Engineering Blog', url: '#', type: 'article' },
        { title: 'Patent Portfolio', url: '#', type: 'website' }
      ],
      timeline: [
        { date: '2021', title: 'Graduation', description: 'Graduated with Mechanical Engineering degree' },
        { date: '2021', title: 'Joined Tesla', description: 'Started as entry-level engineer' },
        { date: '2022', title: 'First Patent', description: 'Patented battery cooling technology' },
        { date: '2023', title: 'First Promotion', description: 'Promoted to Senior Engineer' },
        { date: '2024', title: 'Team Leadership', description: 'Now leads engineering team' }
      ]
    },
    {
      id: '5',
      title: 'From Student to CEO: Building a Marketing Empire',
      summary: 'Lisa Anderson transformed her marketing degree and internship experience into a successful career, eventually founding her own digital marketing agency.',
      fullStory: 'Lisa Anderson graduated with a Marketing degree in 2017 and quickly made her mark in the industry. Her strategic approach to digital marketing and understanding of consumer behavior helped her rise through the ranks at several top agencies. In 2022, Lisa took the leap and founded her own digital marketing agency, which now serves Fortune 500 clients. Her agency is known for innovative campaigns that blend traditional marketing wisdom with cutting-edge digital strategies. Lisa is also passionate about giving back and regularly mentors young marketing professionals, helping them navigate the evolving digital landscape.',
      alumnus: {
        name: 'Lisa Anderson',
        graduationYear: 2017,
        degree: 'Marketing',
        currentRole: 'CEO & Founder',
        company: 'Digital Dynamics Agency',
        location: 'New York, NY',
        linkedinUrl: '#',
        twitterUrl: '#'
      },
      category: 'Entrepreneurship',
      tags: ['Marketing', 'Entrepreneurship', 'Digital Media', 'Leadership'],
      achievementDate: '2024',
      featured: false,
      likes: 167,
      views: 1100,
      isLiked: false,
      isBookmarked: false,
      keyAchievements: [
        'Founded multi-million dollar agency',
        'Named to Top 40 Under 40 in Marketing',
        'Grew agency to 50+ employees',
        'Won 15+ marketing industry awards'
      ],
      challenges: [
        'Building client trust as a new agency',
        'Scaling team while maintaining quality',
        'Adapting to rapid digital marketing changes'
      ],
      advice: 'Build relationships, not just campaigns. The strongest professional network and reputation will take you further than any single marketing tactic.',
      relatedLinks: [
        { title: 'Agency Website', url: '#', type: 'website' },
        { title: 'Industry Awards', url: '#', type: 'article' }
      ],
      timeline: [
        { date: '2017', title: 'Graduation', description: 'Graduated with Marketing degree' },
        { date: '2019', title: 'Career Growth', description: 'Rose through ranks at top agencies' },
        { date: '2022', title: 'Agency Founded', description: 'Founded Digital Dynamics Agency' },
        { date: '2023', title: 'Major Recognition', description: 'Named to Top 40 Under 40' },
        { date: '2024', title: 'Industry Leader', description: 'Now serves Fortune 500 clients' }
      ]
    },
    {
      id: '6',
      title: 'Financial Wizard: From Classroom to Wall Street',
      summary: 'James Rodriguez leveraged his finance degree and analytical skills to become a successful financial analyst at Goldman Sachs.',
      fullStory: 'James Rodriguez graduated in 2022 with a Finance degree and a clear goal: to make it on Wall Street. Through rigorous preparation, networking with alumni, and exceptional academic performance, James secured a position at Goldman Sachs. In his first two years, he has consistently exceeded expectations and is known for his innovative approach to financial modeling and risk assessment. James is also committed to giving back and regularly returns to campus to mentor current students interested in finance careers. His story is a testament to how dedication, preparation, and leveraging alumni networks can lead to success in competitive industries.',
      alumnus: {
        name: 'James Rodriguez',
        graduationYear: 2022,
        degree: 'Finance',
        currentRole: 'Financial Analyst',
        company: 'Goldman Sachs',
        location: 'New York, NY',
        linkedinUrl: '#',
        twitterUrl: '#'
      },
      category: 'Career Achievement',
      tags: ['Finance', 'Investment Banking', 'Wall Street', 'Analytics'],
      achievementDate: '2024',
      featured: false,
      likes: 134,
      views: 760,
      isLiked: false,
      isBookmarked: false,
      keyAchievements: [
        'Top performer in analyst class',
        'Promoted ahead of schedule',
        'Developed new risk assessment models',
        'Mentored 10+ current students'
      ],
      challenges: [
        'Breaking into competitive investment banking',
        'Mastering complex financial modeling',
        'Managing high-pressure work environment'
      ],
      advice: 'Start early, network strategically, and never stop learning. The finance industry rewards those who combine technical skills with strong relationships.',
      relatedLinks: [
        { title: 'Professional Profile', url: '#', type: 'website' },
        { title: 'Student Mentorship Program', url: '#', type: 'article' }
      ],
      timeline: [
        { date: '2022', title: 'Graduation', description: 'Graduated with Finance degree' },
        { date: '2022', title: 'Joined Goldman Sachs', description: 'Started as Financial Analyst' },
        { date: '2023', title: 'Early Success', description: 'Recognized as top performer' },
        { date: '2024', title: 'Ahead of Schedule', description: 'Promoted ahead of schedule' },
        { date: '2024', title: 'Mentorship', description: 'Started mentoring current students' }
      ]
    }
  ];

  const storyData = sampleStories;

  // Get unique values for filters
  const categories = useMemo(() => {
    const unique = [...new Set(storyData.map(s => s.category))];
    return unique.sort();
  }, [storyData]);

  const years = useMemo(() => {
    const unique = [...new Set(storyData.map(s => new Date(s.achievementDate).getFullYear()))];
    return unique.sort((a, b) => b - a);
  }, [storyData]);

  // Filter and sort stories
  const filteredStories = useMemo(() => {
    let filtered = storyData.filter(story => {
      const matchesSearch = searchQuery === '' || 
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.alumnus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
      const matchesYear = selectedYear === 'all' || new Date(story.achievementDate).getFullYear().toString() === selectedYear;

      return matchesSearch && matchesCategory && matchesYear;
    });

    // Sort stories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime();
        case 'popular':
          return b.likes - a.likes;
        case 'views':
          return b.views - a.views;
        default:
          return 0;
      }
    });

    return filtered;
  }, [storyData, searchQuery, selectedCategory, selectedYear, sortBy]);

  // Auto-play featured stories
  useEffect(() => {
    const featuredStories = storyData.filter(s => s.featured);
    if (featuredStories.length > 1 && isPlaying) {
      const interval = setInterval(() => {
        setCurrentStoryIndex((prev) => (prev + 1) % featuredStories.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, storyData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handleLikeStory = (storyId: string) => {
    const storyIndex = storyData.findIndex(s => s.id === storyId);
    if (storyIndex !== -1) {
      const updatedStory = { ...storyData[storyIndex] };
      updatedStory.isLiked = !updatedStory.isLiked;
      updatedStory.likes += updatedStory.isLiked ? 1 : -1;
      // In a real app, you would update this in your backend
    }
  };

  const handleBookmarkStory = (storyId: string) => {
    const storyIndex = storyData.findIndex(s => s.id === storyId);
    if (storyIndex !== -1) {
      const updatedStory = { ...storyData[storyIndex] };
      updatedStory.isBookmarked = !updatedStory.isBookmarked;
      // In a real app, you would update this in your backend
    }
  };

  const handleStoryClick = (story: SuccessStory) => {
    setSelectedStory(story);
    setShowStoryModal(true);
    // Increment view count
    story.views += 1;
  };

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      const comment: Comment = {
        id: Date.now().toString(),
        authorName: user.name,
        authorAvatar: '',
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  const featuredStories = storyData.filter(s => s.featured);
  const totalLikes = storyData.reduce((sum, story) => sum + story.likes, 0);
  const totalViews = storyData.reduce((sum, story) => sum + story.views, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 flex items-center justify-center space-x-3">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <span>Alumni Success Stories</span>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get inspired by the remarkable achievements of our distinguished alumni community
          </p>
        </motion.div>
      </div>

      {/* Interactive Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
              {storyData.length}
            </div>
            <div className="text-sm text-slate-600 mt-1">Success Stories</div>
            <TrendingUpIcon className="h-4 w-4 text-blue-400 mx-auto mt-2" />
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
              {featuredStories.length}
            </div>
            <div className="text-sm text-slate-600 mt-1">Featured Stories</div>
            <Star className="h-4 w-4 text-green-400 mx-auto mt-2" />
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">
              {totalLikes}
            </div>
            <div className="text-sm text-slate-600 mt-1">Total Likes</div>
            <Heart className="h-4 w-4 text-purple-400 mx-auto mt-2" />
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 group-hover:scale-110 transition-transform duration-300">
              {totalViews}
            </div>
            <div className="text-sm text-slate-600 mt-1">Total Views</div>
            <Eye className="h-4 w-4 text-orange-400 mx-auto mt-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Featured Stories Carousel */}
      {featuredStories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-500" />
              Featured Success Stories
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStoryIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="cursor-pointer"
                onClick={() => handleStoryClick(featuredStories[currentStoryIndex])}
              >
                <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured Story
                        </Badge>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {featuredStories[currentStoryIndex].title}
                        </h3>
                        <p className="text-slate-600 text-lg">
                          {featuredStories[currentStoryIndex].summary}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(featuredStories[currentStoryIndex].achievementDate)}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {featuredStories[currentStoryIndex].likes} likes
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {featuredStories[currentStoryIndex].views} views
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={featuredStories[currentStoryIndex].alumnus.avatar} />
                            <AvatarFallback>
                              {featuredStories[currentStoryIndex].alumnus.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">
                              {featuredStories[currentStoryIndex].alumnus.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {featuredStories[currentStoryIndex].alumnus.currentRole} at {featuredStories[currentStoryIndex].alumnus.company}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center">
                          <Trophy className="h-16 w-16 text-yellow-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {featuredStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStoryIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentStoryIndex ? 'bg-yellow-500' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Carousel Arrows */}
            <Button
              variant="outline"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setCurrentStoryIndex((prev) => (prev - 1 + featuredStories.length) % featuredStories.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setCurrentStoryIndex((prev) => (prev + 1) % featuredStories.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
          <TabsTrigger value="share">Share Your Story</TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="space-y-8">
          {/* Enhanced Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search stories by title, alumni name, or keywords..."
                    className="pl-12 h-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Enhanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Liked</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="h-10">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                </div>

                {/* Results Count */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">
                    Showing <span className="font-semibold">{filteredStories.length}</span> of <span className="font-semibold">{storyData.length}</span> stories
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {filteredStories.filter(s => s.featured).length} Featured
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {filteredStories.filter(s => s.isBookmarked).length} Bookmarked
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stories Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <AnimatePresence>
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className={`hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                      story.featured ? 'border-yellow-200 bg-yellow-50' : ''
                    }`}
                    onClick={() => handleStoryClick(story)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Story Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                                {story.title}
                              </h3>
                              {story.featured && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-600 line-clamp-3">{story.summary}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookmarkStory(story.id);
                              }}
                            >
                              {story.isBookmarked ? (
                                <BookmarkCheck className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Story Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(story.achievementDate)}
                          </span>
                          <span className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {story.category}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {story.likes}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {story.views}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {story.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {story.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{story.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Alumni Info */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={story.alumnus.avatar} />
                              <AvatarFallback>
                                {story.alumnus.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">{story.alumnus.name}</p>
                              <p className="text-xs text-slate-600">
                                Class of {story.alumnus.graduationYear} • {story.alumnus.degree}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* No Results */}
          {filteredStories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No stories found</h3>
                  <p className="text-slate-600 mb-6">Try adjusting your search criteria or filters</p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedYear('all');
                    }}
                    className="px-6"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="interactive" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Explorer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Explore by Category
                </CardTitle>
                <CardDescription>
                  Discover stories based on achievement categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map(category => {
                    const categoryStories = storyData.filter(s => s.category === category);
                    const categoryLikes = categoryStories.reduce((sum, s) => sum + s.likes, 0);
                    
                    return (
                      <div 
                        key={category}
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{category}</h4>
                          <Badge variant="outline">{categoryStories.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>{categoryLikes} total likes</span>
                          <Progress value={(categoryStories.length / storyData.length) * 100} className="w-20" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Trending Stories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Trending This Week
                </CardTitle>
                <CardDescription>
                  Most popular stories based on views and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storyData
                    .sort((a, b) => (b.likes + b.views) - (a.likes + a.views))
                    .slice(0, 5)
                    .map((story, index) => (
                      <div 
                        key={story.id}
                        className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors duration-200"
                        onClick={() => handleStoryClick(story)}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-slate-900 line-clamp-1">{story.title}</h5>
                          <p className="text-sm text-slate-600">{story.alumnus.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-slate-500">
                            <Heart className="h-3 w-3" />
                            <span>{story.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alumni Network Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                Alumni Around the World
              </CardTitle>
              <CardDescription>
                Explore the global reach of our alumni community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Building2 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <h4 className="font-semibold text-slate-900">San Francisco</h4>
                  <p className="text-sm text-slate-600">12 Alumni</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Building2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <h4 className="font-semibold text-slate-900">New York</h4>
                  <p className="text-sm text-slate-600">8 Alumni</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Building2 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <h4 className="font-semibold text-slate-900">Boston</h4>
                  <p className="text-sm text-slate-600">6 Alumni</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Building2 className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <h4 className="font-semibold text-slate-900">Austin</h4>
                  <p className="text-sm text-slate-600">4 Alumni</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Share Your Success Story
                </CardTitle>
                <CardDescription>
                  Inspire others by sharing your journey and achievements since graduation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-slate-700">Inspire current students and fellow alumni</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-slate-700">Build your professional brand and network</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Heart className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-slate-700">Give back to the alumni community</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-orange-600" />
                    <span className="text-sm text-slate-700">Help others learn from your experiences</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 text-lg"
                  onClick={() => setShowSubmitModal(true)}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Submit Your Story
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  What Makes a Great Story?
                </CardTitle>
                <CardDescription>
                  Tips for sharing an impactful success story
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-medium text-slate-900 mb-2">Be Authentic</h4>
                    <p className="text-sm text-slate-600">Share your genuine journey, including challenges and failures</p>
                  </div>
                  <div className="p-4 border-l-4 border-green-500 bg-green-50">
                    <h4 className="font-medium text-slate-900 mb-2">Provide Specific Examples</h4>
                    <p className="text-sm text-slate-600">Include concrete achievements and measurable results</p>
                  </div>
                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                    <h4 className="font-medium text-slate-900 mb-2">Offer Valuable Advice</h4>
                    <p className="text-sm text-slate-600">Share lessons learned that can help others in their journeys</p>
                  </div>
                  <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                    <h4 className="font-medium text-slate-900 mb-2">Highlight Alumni Connections</h4>
                    <p className="text-sm text-slate-600">Mention how your education and alumni network contributed to your success</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Story Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Story Categories</CardTitle>
              <CardDescription>
                Share your story in one of these categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <motion.div
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-6 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                  >
                    <h4 className="font-medium text-slate-900 mb-2">{category}</h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {storyData.filter(s => s.category === category).length} stories
                    </p>
                    <Progress value={(storyData.filter(s => s.category === category).length / storyData.length) * 100} className="h-2" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Story Detail Modal */}
      <Dialog open={showStoryModal} onOpenChange={setShowStoryModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStory && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedStory.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Alumni Header */}
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedStory.alumnus.avatar} />
                    <AvatarFallback className="text-lg">
                      {selectedStory.alumnus.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{selectedStory.alumnus.name}</h3>
                    <p className="text-slate-600">{selectedStory.alumnus.currentRole} at {selectedStory.alumnus.company}</p>
                    <p className="text-sm text-slate-500">
                      Class of {selectedStory.alumnus.graduationYear} • {selectedStory.alumnus.degree} • {selectedStory.alumnus.location}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {selectedStory.alumnus.linkedinUrl && (
                      <Button variant="outline" size="sm">
                        LinkedIn
                      </Button>
                    )}
                    {selectedStory.alumnus.twitterUrl && (
                      <Button variant="outline" size="sm">
                        Twitter
                      </Button>
                    )}
                  </div>
                </div>

                {/* Story Content */}
                <div className="prose max-w-none">
                  <h4 className="text-lg font-semibold mb-3">Story</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedStory.fullStory}</p>
                </div>

                {/* Key Achievements */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                    Key Achievements
                  </h4>
                  <ul className="space-y-2">
                    {selectedStory.keyAchievements.map((achievement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-red-600" />
                    Challenges Overcome
                  </h4>
                  <ul className="space-y-2">
                    {selectedStory.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-slate-700">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Advice */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <Quote className="h-5 w-5 mr-2 text-blue-600" />
                    Advice for Current Students
                  </h4>
                  <p className="text-slate-700 italic">"{selectedStory.advice}"</p>
                </div>

                {/* Timeline */}
                {selectedStory.timeline && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-purple-600" />
                      Journey Timeline
                    </h4>
                    <div className="space-y-4">
                      {selectedStory.timeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-16 text-sm font-medium text-slate-600">
                            {event.date}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-900">{event.title}</h5>
                            <p className="text-sm text-slate-600">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant={selectedStory.isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLikeStory(selectedStory.id)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {selectedStory.likes} Likes
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant={selectedStory.isBookmarked ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleBookmarkStory(selectedStory.id)}
                    >
                      {selectedStory.isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                      ) : (
                        <Bookmark className="h-4 w-4 mr-2" />
                      )}
                      Bookmark
                    </Button>
                  </div>
                  <div className="text-sm text-slate-500">
                    {selectedStory.views} views
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Comments ({comments.length})</h4>
                  
                  {/* Add Comment */}
                  {user && (
                    <div className="space-y-3 mb-6">
                      <Textarea
                        placeholder="Share your thoughts about this story..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3 p-3 bg-slate-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.authorAvatar} />
                          <AvatarFallback>
                            {comment.authorName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-slate-900">{comment.authorName}</h5>
                            <span className="text-sm text-slate-500">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Story Submission Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <Sparkles className="h-6 w-6 mr-2 text-yellow-600" />
              Share Your Success Story
            </DialogTitle>
          </DialogHeader>
          
          {submitSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Story Submitted Successfully!</h3>
              <p className="text-slate-600 mb-4">Thank you for sharing your inspiring journey with the alumni community.</p>
              <p className="text-sm text-slate-500">Your story will be reviewed and published shortly.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentRole">Current Role *</Label>
                    <Input
                      id="currentRole"
                      value={formData.currentRole}
                      onChange={(e) => handleInputChange('currentRole', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="e.g., Google"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              </div>

              {/* Story Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                  Story Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Story Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter an engaging title for your story"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Career Achievement">Career Achievement</SelectItem>
                        <SelectItem value="Entrepreneurship">Entrepreneurship</SelectItem>
                        <SelectItem value="Academic Achievement">Academic Achievement</SelectItem>
                        <SelectItem value="Innovation">Innovation</SelectItem>
                        <SelectItem value="Community Impact">Community Impact</SelectItem>
                        <SelectItem value="Personal Growth">Personal Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="summary">Summary *</Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => handleInputChange('summary', e.target.value)}
                      placeholder="Brief summary of your story (2-3 sentences)"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullStory">Full Story *</Label>
                    <Textarea
                      id="fullStory"
                      value={formData.fullStory}
                      onChange={(e) => handleInputChange('fullStory', e.target.value)}
                      placeholder="Share your complete journey, challenges, and achievements..."
                      rows={8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g., Technology, Leadership, Innovation (comma separated)"
                    />
                  </div>
                </div>
              </div>

              {/* Achievements & Challenges Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Achievements & Challenges
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyAchievements">Key Achievements</Label>
                    <Textarea
                      id="keyAchievements"
                      value={formData.keyAchievements}
                      onChange={(e) => handleInputChange('keyAchievements', e.target.value)}
                      placeholder="List your key achievements (one per line)"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="challenges">Challenges Faced</Label>
                    <Textarea
                      id="challenges"
                      value={formData.challenges}
                      onChange={(e) => handleInputChange('challenges', e.target.value)}
                      placeholder="Describe the challenges you overcame (one per line)"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="advice">Advice for Others</Label>
                    <Textarea
                      id="advice"
                      value={formData.advice}
                      onChange={(e) => handleInputChange('advice', e.target.value)}
                      placeholder="Share advice that could help current students and fellow alumni"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button variant="outline" onClick={() => { setShowSubmitModal(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitStory}
                  disabled={isSubmitting || !formData.title || !formData.summary || !formData.fullStory || !formData.category}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Story
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}