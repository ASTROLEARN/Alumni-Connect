'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users
} from 'lucide-react';

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
  }[];
}

interface SuccessStoriesProps {
  stories?: SuccessStory[];
}

export default function SuccessStories({ stories = [] }: SuccessStoriesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('stories');

  // Sample success stories data
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
        location: 'San Francisco, CA'
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
        { title: 'Google AI Blog', url: '#' },
        { title: 'Tech Leadership Interview', url: '#' }
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
        location: 'Portland, OR'
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
        { title: 'EcoWear Website', url: '#' },
        { title: 'Forbes Feature', url: '#' }
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
        location: 'Boston, MA'
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
        { title: 'Research Profile', url: '#' },
        { title: 'Publication List', url: '#' }
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
        location: 'Austin, TX'
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
        { title: 'Tesla Engineering Blog', url: '#' },
        { title: 'Patent Portfolio', url: '#' }
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
        location: 'New York, NY'
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
        { title: 'Agency Website', url: '#' },
        { title: 'Industry Awards', url: '#' }
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
        location: 'New York, NY'
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
        { title: 'Professional Profile', url: '#' },
        { title: 'Student Mentorship Program', url: '#' }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Alumni Success Stories</h1>
        <p className="text-slate-600">Get inspired by achievements of our distinguished alumni</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{storyData.length}</div>
            <div className="text-sm text-slate-600">Success Stories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {storyData.filter(s => s.featured).length}
            </div>
            <div className="text-sm text-slate-600">Featured Stories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {storyData.reduce((sum, story) => sum + story.likes, 0)}
            </div>
            <div className="text-sm text-slate-600">Total Likes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {storyData.reduce((sum, story) => sum + story.views, 0)}
            </div>
            <div className="text-sm text-slate-600">Total Views</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
          <TabsTrigger value="share">Share Your Story</TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Search stories by title, alumni name, or keywords..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Liked</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">
                  Showing {filteredStories.length} of {storyData.length} stories
                </p>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Stories */}
          {filteredStories.filter(s => s.featured).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Featured Success Stories
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {filteredStories.filter(s => s.featured).map(story => (
                  <Card key={story.id} className="border-yellow-200 bg-yellow-50 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{story.title}</h3>
                            <p className="text-sm text-slate-600 mb-3">{story.summary}</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(story.achievementDate)}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {story.likes} likes
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {story.views} views
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={story.alumnus.avatar} alt={story.alumnus.name} />
                              <AvatarFallback>{story.alumnus.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">{story.alumnus.name}</p>
                              <p className="text-xs text-slate-600">{story.alumnus.currentRole} at {story.alumnus.company}</p>
                            </div>
                          </div>
                          <Button size="sm">Read Full Story</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Stories */}
          <div className="space-y-4">
            {filteredStories.map(story => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{story.title}</h3>
                        <p className="text-slate-600 mb-3">{story.summary}</p>
                      </div>
                      {story.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-slate-500">
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
                        {story.likes} likes
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {story.views} views
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {story.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {story.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{story.tags.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={story.alumnus.avatar} alt={story.alumnus.name} />
                          <AvatarFallback>{story.alumnus.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{story.alumnus.name}</p>
                          <p className="text-xs text-slate-600">Class of {story.alumnus.graduationYear} • {story.alumnus.degree}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4 mr-1" />
                          Like
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button size="sm">Read Full Story</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredStories.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No stories found</h3>
                <p className="text-slate-600 mb-4">Try adjusting your search criteria or filters</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedYear('all');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="share" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Share Your Success Story
                </CardTitle>
                <CardDescription>
                  Inspire others by sharing your journey and achievements since graduation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-slate-700">Inspire current students and fellow alumni</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-slate-700">Build your professional brand and network</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-slate-700">Give back to the alumni community</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-slate-700">Help others learn from your experiences</span>
                  </div>
                </div>
                <Button className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Submit Your Story
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  What Makes a Great Story?
                </CardTitle>
                <CardDescription>
                  Tips for sharing an impactful success story
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Be Authentic</h4>
                    <p className="text-sm text-slate-600">Share your genuine journey, including challenges and failures</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Provide Specific Examples</h4>
                    <p className="text-sm text-slate-600">Include concrete achievements and measurable results</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Offer Valuable Advice</h4>
                    <p className="text-sm text-slate-600">Share lessons learned that can help others in their journeys</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Highlight Alumni Connections</h4>
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
                  <div key={category} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <h4 className="font-medium text-slate-900 mb-2">{category}</h4>
                    <p className="text-sm text-slate-600">
                      {storyData.filter(s => s.category === category).length} stories
                    </p>
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