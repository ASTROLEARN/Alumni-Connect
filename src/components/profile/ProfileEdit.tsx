'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Save, X, Camera, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditProps {
  user: any;
  onUpdate: (updatedData: any) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProfileEdit({ user, onUpdate, isOpen, onOpenChange }: ProfileEditProps) {
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const [isInternalOpen, setIsInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use external control if provided, otherwise use internal state
  const dialogOpen = isOpen !== undefined ? isOpen : isInternalOpen;
  const setDialogOpen = onOpenChange || setIsInternalOpen;
  
  // Form state
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '', // Added phone number field
    profileImage: user.profileImage || '',
    // Student-specific fields
    studentId: user.studentId || '',
    graduationYear: user.graduationYear || '',
    major: user.major || '',
    skills: user.skills || '',
    careerGoals: user.careerGoals || '',
    // Alumni-specific fields
    company: user.company || '',
    position: user.position || '',
    industry: user.industry || '',
    location: user.location || '',
    linkedin: user.linkedin || '',
    bio: user.bio || ''
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare update data based on user's current role
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone, // Added phone number
        profileImage: formData.profileImage
      };

      if (user.role === 'STUDENT') {
        updateData.studentId = formData.studentId;
        updateData.graduationYear = formData.graduationYear;
        updateData.major = formData.major;
        updateData.skills = formData.skills;
        updateData.careerGoals = formData.careerGoals;
      } else if (user.role === 'ALUMNI') {
        updateData.company = formData.company;
        updateData.position = formData.position;
        updateData.industry = formData.industry;
        updateData.location = formData.location;
        updateData.linkedin = formData.linkedin;
        updateData.bio = formData.bio;
      }

      // Update user context
      updateUser(updateData);
      
      // Call parent callback
      onUpdate(updateData);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '', // Added phone number
      profileImage: user.profileImage || '',
      studentId: user.studentId || '',
      graduationYear: user.graduationYear || '',
      major: user.major || '',
      skills: user.skills || '',
      careerGoals: user.careerGoals || '',
      company: user.company || '',
      position: user.position || '',
      industry: user.industry || '',
      location: user.location || '',
      linkedin: user.linkedin || '',
      bio: user.bio || ''
    });
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="text-lg">Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.profileImage} alt={formData.name} />
                    <AvatarFallback className="text-lg">
                      {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                    onClick={triggerFileInput}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max size of 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-Specific Fields */}
          {user.role === 'STUDENT' && (
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-lg">Student Information</CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      placeholder="e.g., S12345"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Expected Graduation</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      value={formData.graduationYear}
                      onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                      placeholder="2025"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="major">Major/Field of Study</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => handleInputChange('major', e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="careerGoals">Career Goals</Label>
                  <Textarea
                    id="careerGoals"
                    value={formData.careerGoals}
                    onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                    placeholder="Describe your career aspirations..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {user.role === 'ALUMNI' && (
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-lg">Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="e.g., Google Inc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="e.g., Technology"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about your professional journey..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}