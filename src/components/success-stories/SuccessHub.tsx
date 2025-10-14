'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Award, 
  TrendingUp, 
  Building, 
  Calendar, 
  ExternalLink,
  Heart,
  Share2,
  Star,
  BookOpen,
  Users,
  Trophy,
  Sparkles,
  MapPin,
  GraduationCap,
  Briefcase,
  Clock,
  Eye,
  Bookmark,
  Plus,
  Video,
  FileText,
  Link,
  ChevronRight,
  ArrowUpRight,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    linkedin?: string;
    twitter?: string;
  };
  category: string;
  tags: string[];
  achievementDate: string;
  featured: boolean;
  likes: number;
  views: number;
  keyAchievements: string[];
  challenges: string[];
  advice: string;
  relatedLinks?: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'website' | 'publication';
  }[];
  media?: {
    type: 'image' | 'video';
    url: string;
    caption: string;
  }[];
  milestones?: {
    date: string;
    title: string;
    description: string;
  }[];
}

interface SuccessHubProps {
  stories?: SuccessStory[];
}

export default function SuccessHub({ stories = [] }: SuccessHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('stories');
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [showStoryDialog, setShowStoryDialog] = useState(false);

  // Enhanced success stories data with more details
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
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        twitter: 'https://twitter.com/sarahjohnson'
      },
      category: 'Career Achievement',
      tags: ['Technology', 'AI', 'Leadership', 'Google'],
      achievementDate: '2024',
      featured: true,
      likes: 234,
      views: 1520,
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
      milestones: [
        { date: '2020-06', title: 'Graduation', description: 'Graduated with honors in Computer Science' },
        { date: '2020-08', title: 'Joined Google', description: 'Started as Software Engineer' },
        { date: '2022-03', title: 'First Promotion', description: 'Promoted to Senior Engineer' },
        { date: '2023-11', title: 'Innovation Award', description: 'Received Google Innovation Award' }
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
        linkedin: 'https://linkedin.com/in/michaelchen'
      },
      category: 'Entrepreneurship',
      tags: ['Entrepreneurship', 'Sustainability', 'Fashion', 'Startup'],
      achievementDate: '2024',
      featured: true,
      likes: 189,
      views: 1240,
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
        { type: 'image', url: '#', caption: 'Michael at EcoWear flagship store' }
      ],
      milestones: [
        { date: '2019-05', title: 'Graduation', description: 'Graduated with Business Administration degree' },
        { date: '2019-09', title: 'EcoWear Founded', description: 'Launched with $5,000 initial investment' },
        { date: '2021-06', title: 'First Major Retailer', description: 'Secured first major retail partnership' },
        { date: '2023-03', title: 'Forbes Recognition', description: 'Featured in Forbes 30 Under 30' }
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
        linkedin: 'https://linkedin.com/in/emilydavis'
      },
      category: 'Academic Achievement',
      tags: ['Research', 'Healthcare', 'Data Science', 'First-Generation'],
      achievementDate: '2023',
      featured: false,
      likes: 156,
      views: 980,
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
        { title: 'Publication List', url: '#', type: 'publication' }
      ],
      media: [
        { type: 'image', url: '#', caption: 'Emily presenting at medical conference' }
      ],
      milestones: [
        { date: '2018-05', title: 'Graduation', description: 'First in family to graduate from college' },
        { date: '2018-07', title: 'Amazon Data Scientist', description: 'Started career at Amazon' },
        { date: '2020-01', title: 'Career Transition', description: 'Moved to medical research' },
        { date: '2022-09', title: 'Research Breakthrough', description: 'Published disease prediction algorithm' }
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
        linkedin: 'https://linkedin.com/in/davidwilson'
      },
      category: 'Innovation',
      tags: ['Engineering', 'Electric Vehicles', 'Sustainability', 'Tesla'],
      achievementDate: '2024',
      featured: false,
      likes: 145,
      views: 890,
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
        { title: 'Patent Portfolio', url: '#', type: 'publication' }
      ],
      media: [
        { type: 'image', url: '#', caption: 'David with Tesla engineering team' }
      ],
      milestones: [
        { date: '2021-05', title: 'Graduation', description: 'Graduated with Mechanical Engineering degree' },
        { date: '2021-06', title: 'Joined Tesla', description: 'Started as Mechanical Engineer' },
        { date: '2022-12', title: 'First Patent', description: 'Patented battery cooling technology' },
        { date: '2023-08', title: 'Team Lead', description: 'Promoted to Senior Engineer position' }
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
        linkedin: 'https://linkedin.com/in/lisaanderson'
      },
      category: 'Entrepreneurship',
      tags: ['Marketing', 'Entrepreneurship', 'Digital Media', 'Leadership'],
      achievementDate: '2024',
      featured: false,
      likes: 167,
      views: 1100,
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
      media: [
        { type: 'image', url: '#', caption: 'Lisa receiving marketing industry award' }
      ],
      milestones: [
        { date: '2017-05', title: 'Graduation', description: 'Graduated with Marketing degree' },
        { date: '2019-03', title: 'First Major Campaign', description: 'Led successful campaign for Fortune 500 company' },
        { date: '2022-01', title: 'Agency Founded', description: 'Launched Digital Dynamics Agency' },
        { date: '2023-11', title: 'Industry Recognition', description: 'Named to Top 40 Under 40' }
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
        linkedin: 'https://linkedin.com/in/jamesrodriguez'
      },
      category: 'Career Achievement',
      tags: ['Finance', 'Investment Banking', 'Wall Street', 'Analytics'],
      achievementDate: '2024',
      featured: false,
      likes: 134,
      views: 760,
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
      media: [
        { type: 'image', url: '#', caption: 'James at Goldman Sachs office' }
      ],
      milestones: [
        { date: '2022-05', title: 'Graduation', description: 'Graduated with Finance degree' },
        { date: '2022-07', title: 'Goldman Sachs', description: 'Joined as Financial Analyst' },
        { date: '2023-12', title: 'Early Promotion', description: 'Promoted ahead of schedule' },
        { date: '2024-03', title: 'Mentorship Program', description: 'Launched student mentorship initiative' }
      ]
    }
  ];

  const storyData = stories.length > 0 ? stories : sampleStories;

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

  // Stats calculations
  const stats = useMemo(() => {
    const totalStories = storyData.length;
    const featuredStories = storyData.filter(s => s.featured).length;
    const totalLikes = storyData.reduce((sum, s) => sum + s.likes, 0);
    const totalViews = storyData.reduce((sum, s) => sum + s.views, 0);
    const thisYearStories = storyData.filter(s => new Date(s.achievementDate).getFullYear() === new Date().getFullYear()).length;

    return {
      totalStories,
      featuredStories,
      totalLikes,
      totalViews,
      thisYearStories
    };
  }, [storyData]);

  const handleStoryClick = (story: SuccessStory) => {
    setSelectedStory(story);
    setShowStoryDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Eye className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'website': return <ExternalLink className="h-4 w-4" />;
      case 'publication': return <BookOpen className="h-4 w-4" />;
      default: return <Link className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">Success Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Alumni Success Stories
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover inspiring journeys, learn from experiences, and connect with successful alumni who are making an impact worldwide
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStories}</div>
              <div className="text-sm text-slate-600">Total Stories</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.featuredStories}</div>
              <div className="text-sm text-slate-600">Featured</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.totalLikes}</div>
              <div className="text-sm text-slate-600">Total Likes</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.totalViews}</div>
              <div className="text-sm text-slate-600">Total Views</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.thisYearStories}</div>
              <div className="text-sm text-slate-600">This Year</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stories">Success Stories</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                      placeholder="Search stories, alumni, or keywords..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
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
                      <SelectTrigger className="w-32">
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
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredStories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className={`h-full hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                        story.featured ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleStoryClick(story)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {story.featured && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-2">
                                <Star className="h-3 w-3 mr-1" />
                                FEATURED
                              </Badge>
                            )}
                            <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                              {story.title}
                            </CardTitle>
                          </div>
                        </div>
                        <CardDescription className="text-sm line-clamp-3">
                          {story.summary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Alumni Info */}
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={story.alumnus.avatar} />
                            <AvatarFallback>
                              {story.alumnus.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {story.alumnus.name}
                            </p>
                            <p className="text-sm text-slate-600 truncate">
                              {story.alumnus.currentRole} at {story.alumnus.company}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {story.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {story.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{story.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span>{story.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{story.views}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(story.achievementDate).getFullYear()}</span>
                          </div>
                        </div>

                        {/* Key Achievements Preview */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-slate-900">Key Achievements:</h4>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {story.keyAchievements.slice(0, 2).map((achievement, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="line-clamp-1">{achievement}</span>
                              </li>
                            ))}
                            {story.keyAchievements.length > 2 && (
                              <li className="text-blue-600 font-medium">
                                +{story.keyAchievements.length - 2} more achievements
                              </li>
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => {
                const categoryStories = storyData.filter(s => s.category === category);
                const totalLikes = categoryStories.reduce((sum, s) => sum + s.likes, 0);
                const totalViews = categoryStories.reduce((sum, s) => sum + s.views, 0);
                
                return (
                  <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{category}</span>
                        <Badge variant="outline">{categoryStories.length}</Badge>
                      </CardTitle>
                      <CardDescription>
                        Explore success stories in {category.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Total Likes</span>
                          <span className="font-medium">{totalLikes}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Total Views</span>
                          <span className="font-medium">{totalViews}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Featured Stories</span>
                          <span className="font-medium">
                            {categoryStories.filter(s => s.featured).length}
                          </span>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          variant="outline"
                          onClick={() => {
                            setSelectedCategory(category);
                            setActiveTab('stories');
                          }}
                        >
                          View Stories
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Most Liked Stories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flame className="h-5 w-5 mr-2 text-red-500" />
                    Most Popular Stories
                  </CardTitle>
                  <CardDescription>
                    Stories that resonated most with our community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {storyData
                      .sort((a, b) => b.likes - a.likes)
                      .slice(0, 5)
                      .map((story, index) => (
                        <div 
                          key={story.id} 
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleStoryClick(story)}
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 line-clamp-2">
                              {story.title}
                            </h4>
                            <p className="text-sm text-slate-600 line-clamp-1">
                              {story.alumnus.name}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <div className="flex items-center space-x-1 text-xs text-slate-500">
                                <Heart className="h-3 w-3" />
                                <span>{story.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-slate-500">
                                <Eye className="h-3 w-3" />
                                <span>{story.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Success Stories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    Recent Success Stories
                  </CardTitle>
                  <CardDescription>
                    Latest achievements from our alumni community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {storyData
                      .sort((a, b) => new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime())
                      .slice(0, 5)
                      .map((story, index) => (
                        <div 
                          key={story.id} 
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleStoryClick(story)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={story.alumnus.avatar} />
                            <AvatarFallback>
                              {story.alumnus.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 line-clamp-2">
                              {story.title}
                            </h4>
                            <p className="text-sm text-slate-600 line-clamp-1">
                              {story.alumnus.name} • {story.alumnus.company}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {story.category}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {formatDate(story.achievementDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* Story Detail Dialog */}
      <Dialog open={showStoryDialog} onOpenChange={setShowStoryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStory && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold mb-2">
                      {selectedStory.title}
                    </DialogTitle>
                    {selectedStory.featured && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        FEATURED STORY
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Alumni Info */}
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedStory.alumnus.avatar} />
                    <AvatarFallback className="text-lg">
                      {selectedStory.alumnus.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedStory.alumnus.name}
                    </h3>
                    <p className="text-slate-600">{selectedStory.alumnus.currentRole}</p>
                    <p className="text-slate-600">{selectedStory.alumnus.company} • {selectedStory.alumnus.location}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <GraduationCap className="h-4 w-4" />
                        <span>Class of {selectedStory.alumnus.graduationYear}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{selectedStory.alumnus.degree}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Content */}
                <div className="prose max-w-none">
                  <h4 className="text-lg font-semibold mb-3">Story</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedStory.fullStory}
                  </p>
                </div>

                {/* Key Achievements */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Key Achievements</h4>
                  <ul className="space-y-2">
                    {selectedStory.keyAchievements.map((achievement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-slate-700">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Challenges Overcome</h4>
                  <ul className="space-y-2">
                    {selectedStory.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-slate-700">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Advice */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Advice for Current Students</h4>
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-700">
                    {selectedStory.advice}
                  </blockquote>
                </div>

                {/* Timeline */}
                {selectedStory.milestones && selectedStory.milestones.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Career Timeline</h4>
                    <div className="space-y-3">
                      {selectedStory.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{milestone.title}</p>
                            <p className="text-sm text-slate-600">{milestone.description}</p>
                            <p className="text-xs text-slate-500">{milestone.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Links */}
                {selectedStory.relatedLinks && selectedStory.relatedLinks.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Related Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedStory.relatedLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          {getMediaIcon(link.type)}
                          <span className="text-sm text-slate-700">{link.title}</span>
                          <ArrowUpRight className="h-4 w-4 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStory.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {/* Engagement */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Like ({selectedStory.likes})
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                  <div className="text-sm text-slate-500">
                    {selectedStory.views} views
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}