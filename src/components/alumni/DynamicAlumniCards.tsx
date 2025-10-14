'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Building, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AlumniData {
  id: string;
  name: string;
  email: string;
  graduationYear: string;
  company: string;
  position: string;
  location: string;
  verified: boolean;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  alumni: AlumniData[];
  count: number;
  error?: string;
}

export default function DynamicAlumniCards() {
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await fetch('/api/alumni/recent');
        const data: ApiResponse = await response.json();
        
        if (data.success && data.alumni.length > 0) {
          setAlumni(data.alumni);
        } else {
          // If no real alumni data, show fallback data
          setAlumni(getFallbackAlumni());
        }
      } catch (err) {
        console.error('Error fetching alumni:', err);
        setError('Failed to load alumni data');
        // Show fallback data on error
        setAlumni(getFallbackAlumni());
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  // Fallback data in case no alumni exist yet
  const getFallbackAlumni = (): AlumniData[] => [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      graduationYear: '2020',
      company: 'Google',
      position: 'Software Engineer',
      location: 'San Francisco, CA',
      verified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      graduationYear: '2019',
      company: 'Microsoft',
      position: 'Product Manager',
      location: 'Seattle, WA',
      verified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      graduationYear: '2018',
      company: 'Amazon',
      position: 'Data Scientist',
      location: 'Austin, TX',
      verified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      graduationYear: '2021',
      company: 'Tesla',
      position: 'Mechanical Engineer',
      location: 'Palo Alto, CA',
      verified: true,
      createdAt: new Date().toISOString()
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 mb-4">Unable to load alumni data at the moment.</p>
        <p className="text-sm text-slate-500">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {alumni.map((alumnus) => (
        <Card key={alumnus.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {alumnus.name}
                  </h3>
                  {alumnus.verified && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-2 truncate">
                  {alumnus.position} at {alumnus.company}
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Class of {alumnus.graduationYear}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{alumnus.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-2 text-xs text-blue-600">
                  <Building className="h-3 w-3" />
                  <span>View Profile</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}