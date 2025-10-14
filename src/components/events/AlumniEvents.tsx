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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Tag,
  Plus,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

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
  isOrganizer: boolean;
  price?: number;
  image?: string;
  agenda?: {
    time: string;
    title: string;
    description: string;
  }[];
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  endDate?: string;
  location: string;
  isVirtual: boolean;
  maxAttendees?: number;
  category: string;
  tags: string[];
  price?: number;
  agenda?: {
    time: string;
    title: string;
    description: string;
  }[];
}

export default function AlumniEvents() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('upcoming');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showManageEvent, setShowManageEvent] = useState<Event | null>(null);

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
        isAlumni: true,
        id: 'alumni1'
      },
      tags: ['Networking', 'Dinner', 'Awards'],
      isRegistered: true,
      isOrganizer: false,
      price: 75,
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
        isAlumni: true,
        id: session?.user?.id || 'alumni2'
      },
      tags: ['Technology', 'Career', 'Networking'],
      isRegistered: false,
      isOrganizer: true,
      price: 25
    },
    {
      id: '3',
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
        isAlumni: true,
        id: 'alumni3'
      },
      tags: ['Webinar', 'AI', 'Technology', 'Business'],
      isRegistered: true,
      isOrganizer: false,
      price: 0
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents(sampleEvents);
      setLoading(false);
    }, 1000);

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socketio'
    });
    setSocket(socketInstance);

    // Authenticate with socket
    if (session?.user) {
      socketInstance.emit('authenticate', {
        userId: session.user.id,
        role: session.user.role,
      });
    }

    // Listen for new events
    socketInstance.on('new_event_created', (data) => {
      console.log('New event created:', data);
      setEvents(prev => [data, ...prev]);
    });

    // Listen for event updates
    socketInstance.on('event_updated', (data) => {
      console.log('Event updated:', data);
      setEvents(prev => prev.map(event => event.id === data.id ? data : event));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  // Mark user as organizer for their events
  const enhancedEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      isOrganizer: event.organizer.id === session?.user?.id
    }));
  }, [events, session]);

  // Get unique values for filters
  const categories = useMemo(() => {
    const unique = [...new Set(enhancedEvents.map(e => e.category))];
    return unique.sort();
  }, [enhancedEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = enhancedEvents.filter(event => {
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
  }, [enhancedEvents, searchQuery, selectedCategory, selectedType, sortBy]);

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = filteredEvents.filter(event => new Date(event.date + ' ' + event.time) > now);
  const pastEvents = filteredEvents.filter(event => new Date(event.date + ' ' + event.time) <= now);

  // Separate events organized by current user
  const myEvents = enhancedEvents.filter(event => event.isOrganizer);

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

  const handleRegisterEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isRegistered: true, currentAttendees: event.currentAttendees + 1 }
        : event
    ));
  };

  const handleUnregisterEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isRegistered: false, currentAttendees: event.currentAttendees - 1 }
        : event
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Alumni Events</h1>
          <p className="text-slate-600 mt-2">Create, manage, and participate in alumni events</p>
        </div>
        <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-slate-600">Event creation form coming soon! This will allow you to create and manage events.</p>
              <Button onClick={() => setShowCreateEvent(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{enhancedEvents.length}</div>
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
            <div className="text-2xl font-bold text-purple-600">{myEvents.length}</div>
            <div className="text-sm text-slate-600">My Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {enhancedEvents.reduce((sum, event) => sum + event.currentAttendees, 0)}
            </div>
            <div className="text-sm text-slate-600">Total Attendees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {enhancedEvents.filter(e => e.isVirtual).length}
            </div>
            <div className="text-sm text-slate-600">Virtual Events</div>
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
              Showing {filteredEvents.length} of {enhancedEvents.length} events
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="myevents">My Events ({myEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Event Details */}
                    <div className="flex-1 space-y-4">
                      {/* Event Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold text-slate-900">{event.title}</h3>
                            {event.isOrganizer && (
                              <Badge className="bg-blue-100 text-blue-800">Organizer</Badge>
                            )}
                          </div>
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
                          {event.isOrganizer && (
                            <Button size="sm" variant="outline" onClick={() => setShowManageEvent(event)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.currentAttendees}{event.maxAttendees && `/${event.maxAttendees}`} attendees
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Organized by {event.organizer.name}
                          </span>
                          {event.price !== undefined && (
                            <span className="flex items-center font-medium">
                              ${event.price}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {event.isRegistered ? (
                            <Button size="sm" variant="outline" onClick={() => handleUnregisterEvent(event.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Registered
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleRegisterEvent(event.id)}
                              disabled={isEventFull(event)}
                            >
                              {isEventFull(event) ? 'Event Full' : 'Register Now'}
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
                <p className="text-slate-600 mb-4">Create your own event or check back later for new opportunities.</p>
                <Button onClick={() => setShowCreateEvent(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="myevents" className="space-y-4">
          {myEvents.length > 0 ? (
            myEvents.map(event => (
              <Card key={event.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <Badge className="bg-blue-100 text-blue-800">Your Event</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-2">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.currentAttendees}{event.maxAttendees && `/${event.maxAttendees}`} attendees
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm">{event.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setShowManageEvent(event)}>
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No events created</h3>
                <p className="text-slate-600 mb-4">Start by creating your first alumni event.</p>
                <Button onClick={() => setShowCreateEvent(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.currentAttendees} attendees
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
                <p className="text-slate-600">Your event history will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}