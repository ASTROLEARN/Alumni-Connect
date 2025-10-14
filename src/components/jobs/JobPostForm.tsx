'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { Plus, X } from 'lucide-react';

interface JobPostFormProps {
  onJobPosted: () => void;
  children: React.ReactNode;
}

interface JobData {
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  salary: string;
  description: string;
  requirements: string[];
  industry: string;
  experience: string;
  deadline?: string;
}

export default function JobPostForm({ onJobPosted, children }: JobPostFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newRequirement, setNewRequirement] = useState('');

  const [jobData, setJobData] = useState<JobData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: [],
    industry: '',
    experience: '',
    deadline: ''
  });

  const industries = ['Technology', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Consulting', 'Other'];
  const experiences = ['Entry-level', 'Mid-level', 'Senior', 'Executive'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

  React.useEffect(() => {
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

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  const handleInputChange = (field: keyof JobData, value: string) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setJobData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setJobData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        const newJob = await response.json();
        
        // Emit socket event for real-time updates
        if (socket && session?.user) {
          socket.emit('new_job_posted', {
            job: newJob,
            postedBy: {
              name: session.user.name,
              role: session.user.role,
              id: session.user.id
            }
          });
        }

        toast({
          title: "Job posted successfully",
          description: "Your job has been posted and students will be notified.",
        });

        // Reset form
        setJobData({
          title: '',
          company: '',
          location: '',
          type: 'Full-time',
          salary: '',
          description: '',
          requirements: [],
          industry: '',
          experience: '',
          deadline: ''
        });

        setIsOpen(false);
        onJobPosted();
      } else {
        const error = await response.json();
        toast({
          title: "Failed to post job",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error posting job",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post New Job</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={jobData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={jobData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., TechCorp"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={jobData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., San Francisco, CA or Remote"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Select value={jobData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary *</Label>
              <Input
                id="salary"
                value={jobData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="e.g., $80,000 - $100,000"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={jobData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level *</Label>
              <Select value={jobData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {experiences.map((exp) => (
                    <SelectItem key={exp} value={exp}>
                      {exp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Application Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={jobData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={jobData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Requirements *</Label>
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {jobData.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {jobData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {req}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeRequirement(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !jobData.title || !jobData.company || !jobData.requirements.length}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Posting...
                </div>
              ) : (
                'Post Job'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}