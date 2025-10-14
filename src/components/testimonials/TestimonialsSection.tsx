'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Building, GraduationCap, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  graduationYear: string;
  content: string;
  rating: number;
  category: 'career' | 'networking' | 'mentorship' | 'general';
  verified: boolean;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  testimonials?: Testimonial[];
  error?: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, we'll use fallback testimonials since we don't have a testimonials table in the database
    // In a real implementation, you would fetch from an API endpoint
    const fetchTestimonials = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setTestimonials(getFallbackTestimonials());
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Fallback testimonials data
  const getFallbackTestimonials = (): Testimonial[] => [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'Google',
      graduationYear: '2020',
      content: 'AlumniConnect helped me land my dream job at Google. The mentorship program connected me with senior engineers who provided invaluable guidance. I\'m now mentoring current students to give back to the community.',
      rating: 5,
      category: 'career',
      verified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Product Manager',
      company: 'Microsoft',
      graduationYear: '2019',
      content: 'The networking opportunities through AlumniConnect are incredible. I\'ve connected with alumni across different industries and even found co-founders for my startup. This platform truly bridges the gap between graduation and career success.',
      rating: 5,
      category: 'networking',
      verified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Emily Davis',
      role: 'Data Scientist',
      company: 'Amazon',
      graduationYear: '2018',
      content: 'As an international student, I was worried about building a professional network in the US. AlumniConnect made it easy to connect with alumni who understood my journey. The support I received was instrumental in my career growth.',
      rating: 5,
      category: 'mentorship',
      verified: true,
      createdAt: new Date().toISOString()
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career':
        return <Building className="h-4 w-4" />;
      case 'networking':
        return <Users className="h-4 w-4" />;
      case 'mentorship':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'career':
        return 'bg-blue-100 text-blue-800';
      case 'networking':
        return 'bg-green-100 text-green-800';
      case 'mentorship':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Success Stories</h2>
          <p className="text-lg text-slate-600 mb-8">
            Unable to load testimonials at the moment. Please check back later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-200/[0.05] bg-[length:40px_40px]" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
            <Star className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium text-sm">SUCCESS STORIES</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Hear From Our Alumni
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover how AlumniConnect has helped graduates build successful careers and meaningful connections
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="relative hover:shadow-xl transition-all duration-300 group overflow-hidden"
            >
              {/* Quote icon decoration */}
              <div className="absolute top-4 right-4 text-blue-200 opacity-50 group-hover:opacity-75 transition-opacity">
                <Quote className="h-8 w-8" />
              </div>
              
              <CardContent className="p-6">
                {/* Rating */}
                <div className="mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Testimonial content */}
                <blockquote className="mb-6">
                  <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                    "{testimonial.content}"
                  </p>
                </blockquote>

                {/* Author info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {testimonial.name}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {testimonial.role} at {testimonial.company}
                      </p>
                      <p className="text-xs text-slate-500">
                        Class of {testimonial.graduationYear}
                      </p>
                    </div>
                  </div>
                  
                  {/* Category badge */}
                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCategoryColor(testimonial.category)}`}
                    >
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(testimonial.category)}
                        <span className="capitalize">{testimonial.category}</span>
                      </div>
                    </Badge>
                    {testimonial.verified && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Ready to Write Your Success Story?
            </h3>
            <p className="text-slate-600 mb-6">
              Join thousands of alumni who have advanced their careers through meaningful connections and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground shadow-xs h-10 rounded-md px-6 has-[&gt;svg]:px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                Get Started Today
              </button>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-10 rounded-md px-6 has-[&gt;svg]:px-4 border-slate-300 text-slate-700 hover:bg-slate-50">
                View More Stories
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}