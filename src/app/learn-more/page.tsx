'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Award, 
  MessageSquare, 
  Heart, 
  TrendingUp,
  Shield,
  Globe,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

export default function LearnMore() {
  const router = useRouter();
  const features = [
    {
      icon: Users,
      title: 'Alumni Directory',
      description: 'Connect with fellow graduates and build your professional network',
      benefits: ['Search by name, company, or graduation year', 'Verified alumni profiles', 'Direct messaging capabilities']
    },
    {
      icon: Briefcase,
      title: 'Career Opportunities',
      description: 'Discover exclusive job postings from alumni and partner companies',
      benefits: ['Internship opportunities for students', 'Full-time positions for graduates', 'Company insights from alumni']
    },
    {
      icon: Calendar,
      title: 'Events & Networking',
      description: 'Attend virtual and in-person events to expand your network',
      benefits: ['Career fairs and workshops', 'Alumni reunions', 'Industry networking events']
    },
    {
      icon: Award,
      title: 'Success Stories',
      description: 'Get inspired by achievements of our distinguished alumni',
      benefits: ['Career journey insights', 'Success tips and advice', 'Motivational stories']
    },
    {
      icon: MessageSquare,
      title: 'Mentorship Program',
      description: 'Connect with experienced mentors or become one yourself',
      benefits: ['One-on-one guidance', 'Career advice', 'Skill development support']
    },
    {
      icon: Heart,
      title: 'Give Back',
      description: 'Support the next generation through donations and volunteering',
      benefits: ['Scholarship programs', 'Mentoring opportunities', 'Community impact']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer at Google',
      year: 'Class of 2020',
      quote: 'AlumniConnect helped me land my dream job through the mentorship program. The guidance I received was invaluable!',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager at Microsoft',
      year: 'Class of 2019',
      quote: 'The networking events organized through the platform connected me with industry leaders who helped shape my career.',
      avatar: 'MC'
    },
    {
      name: 'Emily Davis',
      role: 'Data Scientist at Amazon',
      year: 'Class of 2018',
      quote: 'I love giving back by mentoring current students. It\'s rewarding to see the next generation succeed!',
      avatar: 'ED'
    }
  ];

  const stats = [
    { label: 'Active Alumni', value: '10,000+' },
    { label: 'Companies Hiring', value: '500+' },
    { label: 'Success Stories', value: '1,000+' },
    { label: 'Mentorship Matches', value: '2,500+' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
        {/* Futuristic background elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-900/20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight">
              Discover the Power of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mt-2">
                Alumni Connections
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-slate-200 max-w-4xl mx-auto leading-relaxed font-light">
              Join a thriving community where graduates support each other's growth, share opportunities, and build lasting professional relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <AuthModal>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Join the Network
                </Button>
              </AuthModal>
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 hover:text-white px-8 py-4 text-lg rounded-full font-medium transition-all duration-300" onClick={() => router.push('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools and features designed to help you build meaningful connections and advance your career.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How AlumniConnect Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Getting started is easy. Join thousands of alumni who are already building meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Create Your Profile</h3>
              <p className="text-slate-600">Sign up and build your professional profile with your education, experience, and career goals.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Connect & Network</h3>
              <p className="text-slate-600">Browse the alumni directory, join events, and connect with fellow graduates in your field.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Grow Together</h3>
              <p className="text-slate-600">Access job opportunities, mentorship, and resources to advance your career and help others succeed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Success Stories from Our Community
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Hear from alumni who have transformed their careers through AlumniConnect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                      <Badge variant="secondary" className="text-xs">{testimonial.year}</Badge>
                    </div>
                  </div>
                  <p className="text-slate-600 italic">"{testimonial.quote}"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Your Privacy and Security Matter
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                We take the protection of your personal information seriously. Our platform is built with industry-leading security measures to ensure your data is safe and secure.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-slate-600">End-to-end encryption for all communications</span>
                </li>
                <li className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-slate-600">Strict verification process for all alumni profiles</span>
                </li>
                <li className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-slate-600">GDPR compliant data handling practices</span>
                </li>
                <li className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-slate-600">24/7 monitoring and security updates</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-100 rounded-lg p-8">
              <div className="text-center">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Enterprise-Grade Security</h3>
                <p className="text-slate-600">
                  Trust and security are at the core of everything we do. Your information is protected with the highest standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of alumni who are already building meaningful connections and growing their careers through AlumniConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AuthModal>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
                Get Started Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </AuthModal>
            <Button size="lg" variant="outline" className="border-white text-blue-600 bg-white hover:bg-slate-100 hover:border-slate-300">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}