'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Mentorship from '@/components/mentorship/Mentorship';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar, 
  Award, 
  Briefcase, 
  BookOpen, 
  Link as LinkIcon,
  MessageCircle,
  Star,
  Edit,
  Share2,
  User
} from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
  current: boolean;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  period: string;
  gpa?: string;
  honors?: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

interface UserProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
}

export default function UserProfile({ userId, isOwnProfile = false }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample user data
  const userData = {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'sarahjohnson.dev',
    linkedin: 'sarah-johnson',
    twitter: 'sarahj_dev',
    graduationYear: 2020,
    degree: 'Bachelor of Science in Computer Science',
    currentCompany: 'Google',
    currentPosition: 'Software Engineer',
    industry: 'Technology',
    bio: 'Passionate software engineer with expertise in full-stack development and machine learning. Love building products that make a positive impact on people\'s lives.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning', 'Cloud Computing', 'Agile Development'],
    isMentor: true,
    mentorshipAreas: ['Career Guidance', 'Technical Skills', 'Industry Insights'],
    achievementsCount: 15,
    connectionsCount: 342
  };

  const experiences: Experience[] = [
    {
      id: '1',
      company: 'Google',
      position: 'Software Engineer',
      period: '2022 - Present',
      description: 'Working on the Google Cloud Platform team, developing scalable infrastructure solutions.',
      current: true
    },
    {
      id: '2',
      company: 'Meta',
      position: 'Software Engineer Intern',
      period: '2021 - 2021',
      description: 'Developed features for the Facebook Marketplace platform, improving user engagement by 15%.',
      current: false
    },
    {
      id: '3',
      company: 'Tech Startup',
      position: 'Junior Developer',
      period: '2020 - 2021',
      description: 'Built and maintained web applications using React and Node.js.',
      current: false
    }
  ];

  const education: Education[] = [
    {
      id: '1',
      institution: 'University Name',
      degree: 'Bachelor of Science in Computer Science',
      period: '2016 - 2020',
      gpa: '3.8/4.0',
      honors: ['Dean\'s List', 'Summa Cum Laude', 'Computer Science Department Award']
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Hackathon Winner',
      description: 'First place in TechCrunch Disrupt Hackathon 2021',
      date: '2021',
      category: 'Competition'
    },
    {
      id: '2',
      title: 'Best Thesis Award',
      description: 'Recognized for outstanding research in machine learning applications',
      date: '2020',
      category: 'Academic'
    },
    {
      id: '3',
      title: 'Open Source Contributor',
      description: 'Contributed to major open source projects with 1000+ stars',
      date: '2022',
      category: 'Community'
    },
    {
      id: '4',
      title: 'Tech Innovation Award',
      description: 'Innovative solution for accessibility in web applications',
      date: '2023',
      category: 'Professional'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="text-2xl">{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {userData.isMentor && (
                <Badge className="absolute -bottom-2 -right-2 bg-yellow-500 hover:bg-yellow-600">
                  <Star className="h-3 w-3 mr-1" />
                  Mentor
                </Badge>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">{userData.name}</h1>
                {isOwnProfile && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
              
              <p className="text-lg text-slate-600">{userData.currentPosition} at {userData.currentCompany}</p>
              <p className="text-slate-600">{userData.bio}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Class of {userData.graduationYear}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {userData.location}
                </span>
                <span className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {userData.industry}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{userData.connectionsCount} connections</Badge>
                <Badge variant="secondary">{userData.achievementsCount} achievements</Badge>
              </div>
            </div>
          </div>
          
          {/* Contact & Action Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {userData.email && (
                  <a href={`mailto:${userData.email}`} className="flex items-center text-blue-600 hover:text-blue-800">
                    <Mail className="h-4 w-4 mr-1" />
                    {userData.email}
                  </a>
                )}
                {userData.phone && (
                  <a href={`tel:${userData.phone}`} className="flex items-center text-blue-600 hover:text-blue-800">
                    <Phone className="h-4 w-4 mr-1" />
                    {userData.phone}
                  </a>
                )}
                {userData.website && (
                  <a href={`https://${userData.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    {userData.website}
                  </a>
                )}
              </div>
              
              {!isOwnProfile && (
                <div className="flex space-x-2">
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline">Connect</Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {userData.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mentorship */}
          {userData.isMentor && (
            <Mentorship alumniId={userData.id} isOwnProfile={isOwnProfile} />
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-sm text-slate-600">Updated profile information</p>
                  <span className="text-xs text-slate-400">2 days ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <p className="text-sm text-slate-600">Added new achievement: Tech Innovation Award</p>
                  <span className="text-xs text-slate-400">1 week ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <p className="text-sm text-slate-600">Connected with 5 new alumni</p>
                  <span className="text-xs text-slate-400">2 weeks ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          {experiences.map((experience) => (
            <Card key={experience.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-slate-900">{experience.position}</h3>
                      {experience.current && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-slate-600">{experience.company}</p>
                    <p className="text-sm text-slate-500">{experience.period}</p>
                    <p className="text-slate-700 mt-3">{experience.description}</p>
                  </div>
                  <Building className="h-8 w-8 text-slate-400 flex-shrink-0 ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          {education.map((edu) => (
            <Card key={edu.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">{edu.degree}</h3>
                    <p className="text-slate-600">{edu.institution}</p>
                    <p className="text-sm text-slate-500">{edu.period}</p>
                    {edu.gpa && (
                      <p className="text-sm text-slate-600">GPA: {edu.gpa}</p>
                    )}
                    {edu.honors && edu.honors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-slate-700 mb-2">Honors & Awards:</p>
                        <div className="flex flex-wrap gap-1">
                          {edu.honors.map((honor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {honor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <BookOpen className="h-8 w-8 text-slate-400 flex-shrink-0 ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-slate-900">{achievement.title}</h3>
                      <Badge variant="outline" className="text-xs">{achievement.category}</Badge>
                    </div>
                    <p className="text-slate-600">{achievement.description}</p>
                    <p className="text-sm text-slate-500">{achievement.date}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500 flex-shrink-0 ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}