'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, Home, Users, Briefcase, Calendar, Award, MessageSquare, LogOut, Target, Bell, FileText, Activity, BarChart3, Heart, Edit, Camera, Save, User, MapPin, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HamburgerMenuProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  userRole?: 'STUDENT' | 'ALUMNI' | 'ADMIN';
}

export default function HamburgerMenu({ currentSection, onSectionChange, userRole }: HamburgerMenuProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    graduationYear: user?.graduationYear || '',
    degree: user?.degree || '',
    company: user?.company || '',
    position: user?.position || '',
    industry: user?.industry || '',
    linkedin: user?.linkedin || '',
    major: user?.major || '',
    avatar: user?.avatar || ''
  });

  const handleNavigation = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleSave = () => {
    // Here you would typically save the data to your backend
    // For now, we'll just close the dialog
    setShowEditDialog(false);
    setIsOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getNavItems = () => {
    if (!user) {
      return [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'directory', label: 'Alumni Directory', icon: Users },
        { id: 'jobs', label: 'Job Opportunities', icon: Briefcase },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'stories', label: 'Success Stories', icon: Award },
        { id: 'mentorship', label: 'Mentorship', icon: MessageSquare },
      ];
    }

    switch (user.role) {
      case 'STUDENT':
        return [
          { id: 'home', label: 'Dashboard', icon: Home },
          { id: 'jobs', label: 'Jobs & Internships', icon: Briefcase },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'mentorship', label: 'Mentorship', icon: MessageSquare },
          { id: 'skills', label: 'Career Skills', icon: Target },
          { id: 'stories', label: 'Success Stories', icon: Award },
        ];
      case 'ALUMNI':
        return [
          { id: 'home', label: 'Dashboard', icon: Home },
          { id: 'mentorship', label: 'Mentorship', icon: MessageSquare },
          { id: 'jobs', label: 'Jobs', icon: Briefcase },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'stories', label: 'Success Stories', icon: Award },
          { id: 'donations', label: 'Donations', icon: Heart },
        ];
      case 'ADMIN':
        return [
          { id: 'home', label: 'Dashboard', icon: Home },
          { id: 'alumni', label: 'Alumni Directory', icon: Users },
          { id: 'pending', label: 'Pending Verification', icon: Award },
          { id: 'users', label: 'All Users', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: Award },
          { id: 'notifications', label: 'Notification Center', icon: Bell },
          { id: 'content', label: 'Content Management', icon: FileText },
          { id: 'activity', label: 'Activity Monitor', icon: Activity },
          { id: 'communication', label: 'Communication Hub', icon: MessageSquare },
          { id: 'reporting', label: 'Advanced Reporting', icon: BarChart3 },
          { id: 'workflows', label: 'Workflow Management', icon: Activity },
        ];
      default:
        return [
          { id: 'home', label: 'Home', icon: Home },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex items-center space-x-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[350px]">
          <SheetHeader>
            <SheetTitle className="flex flex-col items-start space-y-2">
              {user && (
                <div className="flex flex-col space-y-3 w-full">
                  <div className="flex items-center space-x-3">
                    {editData.avatar ? (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={editData.avatar} alt={user.name} />
                        <AvatarFallback className="text-lg font-semibold">
                          {user.name ? user.name.split(' ').map(n => n[0]).join('') : user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="text-lg font-semibold">Welcome, {user.name}</div>
                      <div className="text-sm text-muted-foreground">({user.role})</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start space-x-2 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                </div>
              )}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentSection === item.id ? "default" : "ghost"}
                className="w-full justify-start space-x-3 h-12"
                onClick={() => handleNavigation(item.id)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          {user && (
            <div className="absolute bottom-6 left-6 right-6">
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full justify-start space-x-3"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Update your profile picture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={editData.avatar} alt={user?.name} />
                    <AvatarFallback className="text-xl font-semibold">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('') : user?.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <Label htmlFor="profile-image-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          Upload New Picture
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG, PNG or GIF. Max size of 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      placeholder="City, State/Country"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Role Specific Information */}
            {user?.role === 'ALUMNI' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        value={editData.graduationYear}
                        onChange={(e) => setEditData({...editData, graduationYear: parseInt(e.target.value)})}
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        value={editData.degree}
                        onChange={(e) => setEditData({...editData, degree: e.target.value})}
                        placeholder="Bachelor of Science in Computer Science"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={editData.company}
                        onChange={(e) => setEditData({...editData, company: e.target.value})}
                        placeholder="Google Inc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={editData.position}
                        onChange={(e) => setEditData({...editData, position: e.target.value})}
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={editData.industry} onValueChange={(value) => setEditData({...editData, industry: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <Input
                        id="linkedin"
                        value={editData.linkedin}
                        onChange={(e) => setEditData({...editData, linkedin: e.target.value})}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {user?.role === 'STUDENT' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="major">Major/Field of Study</Label>
                      <Input
                        id="major"
                        value={editData.major}
                        onChange={(e) => setEditData({...editData, major: e.target.value})}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="graduationYear">Expected Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        value={editData.graduationYear}
                        onChange={(e) => setEditData({...editData, graduationYear: parseInt(e.target.value)})}
                        placeholder="2025"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}