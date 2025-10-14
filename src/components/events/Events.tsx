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
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink,
  Share2,
  CheckCircle,
  Video,
  MapPin as MapPinIcon,
  User,
  Tag
} from 'lucide-react';

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
  };
  tags: string[];
  isRegistered: boolean;
  price?: number;
  image?: string;
  agenda?: {
    time: string;
    title: string;
    description: string;
  }[];
}

interface EventsProps {
  events?: Event[];
}

export default function Events({ events = [] }: EventsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('upcoming');
  const [activeTab, setActiveTab] = useState('upcoming');

  // Sample event data
  const sampleEvents: Event[] = [
    {
      id: '1',
      title: 'Annual Alumni Reunion 2024',
      description: 'Join us for the biggest alumni gathering of the year! Reconnect with old friends, make new connections, and celebrate our shared legacy.',
      date: '2024-12-15',
      time: '6:00 PM',
      endDate: '11:00 PM',
      location: 'Grand Hotel Ballroom, New York',
      isVirtual: false,
      maxAttendees: 500,
      currentAttendees: 342,
      category: 'Reunion',
      organizer: {
        name: 'Alumni Association',
        role: 'Event Organizer',
        isAlumni: true
      },
      tags: ['Networking', 'Dinner', 'Awards'],
      isRegistered: true,
      price: 75,
      image: '/api/placeholder/600/300',
      agenda: [
        { time: '6:00 PM', title: 'Registration & Welcome Reception', description: 'Check-in and mingle with fellow alumni' },
        { time: '7:00 PM', title: 'Dinner Program', description: 'Annual dinner and awards ceremony' },
        { time: '9:00 PM', title: 'Networking & Dancing', description: 'Social time with music and entertainment' }
      ]
    },
    {
      id: '2',
      title: 'Tech Industry Networking Night',
      description: 'Connect with alumni working in the tech industry. Share experiences, learn about new opportunities, and expand your professional network.',
      date: '2024-11-28',
      time: '6:30 PM',
      endDate: '9:00 PM',
      location: 'Tech Hub, San Francisco',
      isVirtual: false,
      maxAttendees: 100,
      currentAttendees: 78,
      category: 'Networking',
      organizer: {
        name: 'Sarah Johnson',
        role: 'Engineering Manager at Google',
        isAlumni: true
      },
      tags: ['Technology', 'Career', 'Networking'],
      isRegistered: false,
      price: 25
    },
    {
      id: '3',
      title: 'Career Fair 2025',
      description: 'Annual career fair featuring top companies looking to hire our talented alumni and current students.',
      date: '2025-01-10',
      time: '10:00 AM',
      endDate: '4:00 PM',
      location: 'University Campus Center',
      isVirtual: false,
      maxAttendees: 300,
      currentAttendees: 156,
      category: 'Career',
      organizer: {
        name: 'Career Services',
        role: 'Career Services Office',
        isAlumni: false
      },
      tags: ['Job Fair', 'Career', 'Recruitment'],
      isRegistered: false,
      price: 0
    },
    {
      id: '4',
      title: 'Alumni Webinar: AI in Business',
      description: 'Join industry experts as they discuss the impact of artificial intelligence on modern business practices.',
      date: '2024-11-20',
      time: '12:00 PM',
      endDate: '1:30 PM',
      location: 'Online via Zoom',
      isVirtual: true,
      maxAttendees: 1000,
      currentAttendees: 423,
      category: 'Webinar',
      organizer: {
        name: 'Michael Chen',
        role: 'Product Manager at Microsoft',
        isAlumni: true
      },
      tags: ['Webinar', 'AI', 'Technology', 'Business'],
      isRegistered: true,
      price: 0
    },
    {
      id: '5',
      title: 'Young Alumni Mixer',
      description: 'Special event for graduates from the past 10 years. Meet fellow young professionals and build lasting connections.',
      date: '2024-12-05',
      time: '7:00 PM',
      endDate: '10:00 PM',
      location: 'Rooftop Lounge, Chicago',
      isVirtual: false,
      maxAttendees: 80,
      currentAttendees: 45,
      category: 'Social',
      organizer: {
        name: 'Young Alumni Committee',
        role: 'Event Coordinator',
        isAlumni: true
      },
      tags: ['Young Alumni', 'Networking', 'Social'],
      isRegistered: false,
      price: 35
    },
    {
      id: '6',
      title: 'Entrepreneurship Panel Discussion',
      description: 'Hear from successful alumni entrepreneurs as they share their journeys and insights into building successful businesses.',
      date: '2024-11-15',
      time: '6:00 PM',
      endDate: '8:00 PM',
      location: 'Business School Auditorium',
      isVirtual: false,
      maxAttendees: 150,
      currentAttendees: 89,
      category: 'Professional Development',
      organizer: {
        name: 'Entrepreneurship Club',
        role: 'Student Organization',
        isAlumni: false
      },
      tags: ['Entrepreneurship', 'Panel', 'Business'],
      isRegistered: true,
      price: 15
    }
  ];

  const eventData = events.length > 0 ? events : sampleEvents;

  // Get unique values for filters
  const categories = useMemo(() => {
    const unique = [...new Set(eventData.map(e => e.category))];
    return unique.sort();
  }, [eventData]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = eventData.filter(event => {
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesType = selectedType === 'all' || 
        (selectedType === 'virtual' && event.isVirtual) ||
        (selectedType === 'in-person' && !event.isVirtual);

      return matchesSearch && matchesCategory && matchesType;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'upcoming':
          return new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime();
        case 'popular':
          return b.currentAttendees - a.currentAttendees;
        default:
          return 0;
      }
    });

    return filtered;
  }, [eventData, searchQuery, selectedCategory, selectedType, sortBy]);

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = filteredEvents.filter(event => new Date(event.date + ' ' + event.time) > now);
  const pastEvents = filteredEvents.filter(event => new Date(event.date + ' ' + event.time) <= now);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isEventFull = (event: Event) => {
    return event.maxAttendees && event.currentAttendees >= event.maxAttendees;
  };

  const getRegistrationStatus = (event: Event) => {
    if (event.isRegistered) return 'registered';
    if (isEventFull(event)) return 'full';
    return 'available';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Events & Meetups</h1>
        <p className="text-slate-600">Stay updated with reunions, networking events, and webinars</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{eventData.length}</div>
            <div className="text-sm text-slate-600">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{upcomingEvents.length}</div>
            <div className="text-sm text-slate-600">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{eventData.filter(e => e.isVirtual).length}</div>
            <div className="text-sm text-slate-600">Virtual Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {eventData.reduce((sum, event) => sum + event.currentAttendees, 0)}
            </div>
            <div className="text-sm text-slate-600">Total Attendees</div>
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
              placeholder="Search events by title, description, or tags..."
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

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="virtual">Virtual Only</SelectItem>
                <SelectItem value="in-person">In-Person Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Date (Upcoming First)</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">
              Showing {filteredEvents.length} of {eventData.length} events
            </p>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Event Image */}
                    {event.image && (
                      <div className="lg:w-1/3">
                        <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-slate-400" />
                        </div>
                      </div>
                    )}
                    
                    {/* Event Details */}
                    <div className="flex-1 space-y-4">
                      {/* Event Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(event.date)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {event.time} {event.endDate && `- ${event.endDate}`}
                            </span>
                            <span className="flex items-center">
                              {event.isVirtual ? (
                                <>
                                  <Video className="h-4 w-4 mr-1" />
                                  Virtual Event
                                </>
                              ) : (
                                <>
                                  <MapPinIcon className="h-4 w-4 mr-1" />
                                  {event.location}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-700">{event.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Attendees and Organizer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-600">
                              {event.currentAttendees} attending
                              {event.maxAttendees && ` (max ${event.maxAttendees})`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                              <AvatarFallback className="text-xs">
                                {event.organizer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium text-slate-900">{event.organizer.name}</p>
                              <p className="text-xs text-slate-600">{event.organizer.role}</p>
                            </div>
                            {event.organizer.isAlumni && (
                              <Badge variant="secondary" className="text-xs">Alumni</Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Registration */}
                        <div className="flex items-center space-x-3">
                          {event.price !== undefined && (
                            <span className="text-sm font-medium text-slate-900">
                              {event.price === 0 ? 'Free' : `$${event.price}`}
                            </span>
                          )}
                          {getRegistrationStatus(event) === 'registered' && (
                            <Button size="sm" variant="outline" disabled>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Registered
                            </Button>
                          )}
                          {getRegistrationStatus(event) === 'full' && (
                            <Button size="sm" variant="outline" disabled>
                              Event Full
                            </Button>
                          )}
                          {getRegistrationStatus(event) === 'available' && (
                            <Button size="sm">
                              Register Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No upcoming events</h3>
                <p className="text-slate-600 mb-4">Check back later for new events</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length > 0 ? (
            pastEvents.map(event => (
              <Card key={event.id} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.currentAttendees} attended
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">Past Event</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No past events</h3>
                <p className="text-slate-600">Events you've attended will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Host an Event CTA */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Want to host an event?</h3>
          <p className="text-slate-600 mb-4">Organize meetups, webinars, or networking events for fellow alumni</p>
          <Button className="bg-green-600 hover:bg-green-700">
            Host an Event
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}