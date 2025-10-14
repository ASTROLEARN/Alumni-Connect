'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, Calendar, Award, MessageSquare, Heart, BookOpen, LogOut } from 'lucide-react';
import AlumniDirectory from '@/components/alumni/AlumniDirectory';
import JobBoard from '@/components/jobs/JobBoard';
import AlumniJobBoard from '@/components/jobs/AlumniJobBoard';
import AlumniEvents from '@/components/events/AlumniEvents';
import MentorshipPage from '@/components/mentorship/MentorshipPage';
import Mentorship from '@/components/mentorship/Mentorship';
import AlumniMentorship from '@/components/alumni-mentorship/AlumniMentorship';
import AlumniJobs from '@/components/alumni-jobs/AlumniJobs';
import AlumniDonations from '@/components/alumni-donations/AlumniDonations';
import AlumniSuccessStories from '@/components/success-stories/AlumniSuccessStories';
import SuccessHub from '@/components/success-stories/SuccessHub';
import AuthModal from '@/components/auth/AuthModal';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AlumniDirectoryPage from '@/components/admin/AlumniDirectoryPage';
import PendingVerificationPage from '@/components/admin/PendingVerificationPage';
import AllUsersPage from '@/components/admin/AllUsersPage';
import AnalyticsPage from '@/components/admin/AnalyticsPage';
import NotificationCenter from '@/components/admin/NotificationCenter';
import ContentManagementHub from '@/components/admin/ContentManagementHub';
import UserActivityMonitor from '@/components/admin/UserActivityMonitor';
import CommunicationHub from '@/components/admin/CommunicationHub';
import AdvancedReporting from '@/components/admin/AdvancedReporting';
import WorkflowManagement from '@/components/admin/WorkflowManagement';
import StudentDashboard from '@/components/student/StudentDashboard';
import AlumniDashboard from '@/components/alumni-dashboard/AlumniDashboard';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import ProfileEdit from '@/components/profile/ProfileEdit';
import DynamicAlumniCards from '@/components/alumni/DynamicAlumniCards';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
import { useAuth } from '@/contexts/AuthContext';


type Section = 'home' | 'directory' | 'jobs' | 'events' | 'mentorship' | 'stories' | 'profile' | 'skills' | 'donations' | 'alumni' | 'pending' | 'users' | 'analytics' | 'notifications' | 'content' | 'activity' | 'communication' | 'reporting' | 'workflows';

export default function Home() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<Section>('home');
  const { user, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Effect to handle authentication state changes
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      // Force a re-render by updating a dummy state
      setCurrentSection(prev => prev === 'home' ? 'home' : 'home');
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  const features = [
    {
      icon: Users,
      title: 'Alumni Directory',
      description: 'Connect with fellow graduates and build your professional network',
      action: () => setCurrentSection('directory')
    },
    {
      icon: Briefcase,
      title: 'Job Opportunities',
      description: 'Discover career opportunities posted by alumni and employers',
      action: () => setCurrentSection('jobs')
    },
    {
      icon: Calendar,
      title: 'Events & Meetups',
      description: 'Stay updated with reunions, networking events, and webinars',
      action: () => setCurrentSection('events')
    },
    {
      icon: Award,
      title: 'Success Stories',
      description: 'Get inspired by achievements of our distinguished alumni',
      action: () => setCurrentSection('stories')
    },
    {
      icon: MessageSquare,
      title: 'Mentorship Program',
      description: 'Connect with mentors or become one to guide future graduates',
      action: () => setCurrentSection('mentorship')
    },
    {
      icon: Heart,
      title: 'Give Back',
      description: 'Support the next generation through donations and volunteering',
      action: () => {}
    }
  ];

  const upcomingEvents = [
    { title: 'Annual Alumni Reunion', date: 'Dec 15, 2024', attendees: 250 },
    { title: 'Tech Networking Night', date: 'Nov 28, 2024', attendees: 80 },
    { title: 'Career Fair 2025', date: 'Jan 10, 2025', attendees: 150 }
  ];

  // Render different sections based on currentSection
  const renderSection = () => {
    // If user is logged in, show role-based dashboard instead of home section
    if (currentSection === 'home' && user) {
      switch (user.role) {
        case 'ADMIN':
          return <AdminDashboard />;
        case 'STUDENT':
          return <StudentDashboard />;
        case 'ALUMNI':
          return <AlumniDashboard />;
        default:
          return <div>Unknown user role</div>;
      }
    }

    // Handle student-specific sections
    if (user && user.role === 'STUDENT') {
      switch (currentSection) {
        case 'home':
          return <StudentDashboard initialSection="dashboard" />;
        case 'jobs':
          return <StudentDashboard initialSection="jobs" />;
        case 'events':
          return <StudentDashboard initialSection="events" />;
        case 'mentorship':
          return <StudentDashboard initialSection="mentorship" />;
        case 'skills':
          return <StudentDashboard initialSection="skills" />;
        case 'stories':
          return <SuccessHub />;
      }
    }

    // Handle alumni-specific sections
    if (user && user.role === 'ALUMNI') {
      switch (currentSection) {
        case 'home':
          return <AlumniDashboard />;
        case 'mentorship':
          return <AlumniMentorship />;
        case 'jobs':
          return <AlumniJobs />;
        case 'events':
          return <AlumniEvents />;
        case 'stories':
          return <AlumniSuccessStories />;
        case 'donations':
          return <AlumniDonations />;
      }
    }

    // Handle admin-specific sections
    if (user && user.role === 'ADMIN') {
      switch (currentSection) {
        case 'alumni':
          return <AlumniDirectoryPage />;
        case 'pending':
          return <PendingVerificationPage />;
        case 'users':
          return <AllUsersPage />;
        case 'analytics':
          return <AnalyticsPage />;
        case 'notifications':
          return <NotificationCenter />;
        case 'content':
          return <ContentManagementHub />;
        case 'activity':
          return <UserActivityMonitor />;
        case 'communication':
          return <CommunicationHub />;
        case 'reporting':
          return <AdvancedReporting />;
        case 'workflows':
          return <WorkflowManagement />;
      }
    }

    switch (currentSection) {
      case 'directory':
        return <AlumniDirectory />;
      case 'jobs':
        return <JobBoard />;
      case 'events':
        return <AlumniEvents />;
      case 'stories':
        return <SuccessHub />;
      case 'mentorship':
        return <Mentorship />;
      case 'profile':
        return user ? (
          <div className="max-w-4xl mx-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Update your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEdit 
                  user={user} 
                  onUpdate={(updatedData) => {
                    console.log('Profile updated:', updatedData);
                  }} 
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-lg text-slate-600 mb-4">Please sign in to access your profile.</p>
                <AuthModal>
                  <Button>Sign In</Button>
                </AuthModal>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
              {/* Futuristic background elements */}
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px]" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-900/20" />
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
              
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 lg:py-40">
                <div className="text-center">
                  {/* Mobile-optimized badge */}
                  <div className="mb-4 sm:mb-6">
                    <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                      <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 mr-1.5 sm:mr-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="hidden sm:inline">Connecting 10,000+ Alumni Worldwide</span>
                      <span className="sm:hidden">10,000+ Alumni</span>
                    </div>
                  </div>
                  
                  {/* Mobile-optimized heading */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-tight">
                    <span className="block">Connect With Your</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mt-1 sm:mt-2">
                      Alumni Network
                    </span>
                  </h1>
                  
                  {/* Mobile-optimized description */}
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-12 text-slate-200 max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed font-light px-4">
                    Build meaningful connections, discover opportunities, and grow together with fellow graduates
                  </p>
                  
                  {/* Mobile-optimized CTA buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12 lg:mb-16 px-4">
                    <AuthModal>
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                        <span className="hidden sm:inline">Join the Network</span>
                        <span className="sm:hidden">Join Now</span>
                      </Button>
                    </AuthModal>
                    <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full font-medium transition-all duration-300 w-full sm:w-auto" onClick={() => router.push('/learn-more')}>
                      Learn More
                    </Button>
                  </div>
                  
                  {/* Mobile-optimized stats */}
                  <div className="grid grid-cols-3 gap-4 sm:gap-6 sm:flex sm:justify-center sm:space-x-6 sm:space-y-0 opacity-60 px-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-300">500+</div>
                      <div className="text-xs sm:text-sm text-slate-300">Companies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-cyan-300">50+</div>
                      <div className="text-xs sm:text-sm text-slate-300">Countries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-purple-300">24/7</div>
                      <div className="text-xs sm:text-sm text-slate-300">Support</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom gradient fade */}
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent" />
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need to Stay Connected</h2>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Explore all the features designed to help you maintain and strengthen your alumni relationships
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={feature.action}>
                      <CardHeader>
                        <feature.icon className="h-8 w-8 text-blue-600 mb-2" />
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-slate-600">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Recent Activity Section */}
            <section className="py-16 bg-slate-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">What's Happening</h2>
                </div>
                
                <Tabs defaultValue="alumni" className="max-w-4xl mx-auto">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="alumni">Recent Alumni</TabsTrigger>
                    <TabsTrigger value="events">Upcoming Events</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="alumni" className="mt-8">
                    <DynamicAlumniCards />
                  </TabsContent>
                  
                  <TabsContent value="events" className="mt-8">
                    <div className="space-y-4">
                      {upcomingEvents.map((event, index) => (
                        <Card key={index}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                  <Calendar className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">{event.title}</h3>
                                  <p className="text-sm text-slate-600">{event.date}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-slate-900">{event.attendees} attending</p>
                                <Button size="sm" className="mt-2">RSVP</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* CTA Section */}
            <section className="bg-slate-800 text-white py-16">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
                <p className="text-xl text-slate-300 mb-8">
                  Join thousands of alumni who are already building meaningful connections and growing their careers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <AuthModal>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      Create Your Profile
                    </Button>
                  </AuthModal>
                  <Button size="lg" variant="outline" className="border-white text-slate-900 bg-white hover:bg-slate-100 hover:border-slate-300" onClick={() => setCurrentSection('directory')}>
                    Explore Directory
                  </Button>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {user && (
                <HamburgerMenu 
                  currentSection={currentSection} 
                  onSectionChange={(section) => setCurrentSection(section as Section)} 
                />
              )}
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <button 
                onClick={() => setCurrentSection('home')}
                className="text-2xl font-bold text-slate-800 hover:text-slate-600 transition-colors"
              >
                AlumniConnect
              </button>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {!user && (
                <>
                  <AuthModal>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Sign In</Button>
                  </AuthModal>
                  <AuthModal>
                    <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Join Now</Button>
                  </AuthModal>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderSection()}
      </main>

      {/* Footer - only show on home page */}
      {currentSection === 'home' && (
        <footer className="bg-white border-t border-slate-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-slate-600">
              <p>&copy; 2024 AlumniConnect. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}