'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Chrome, Linkedin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

interface AuthModalProps {
  children: React.ReactNode;
}

export default function AuthModal({ children }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginUniversalAccess, setLoginUniversalAccess] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState(''); // Added phone number
  const [signupRole, setSignupRole] = useState<'STUDENT' | 'ALUMNI' | 'ADMIN'>('STUDENT');
  const [signupUniversalAccess, setSignupUniversalAccess] = useState('');

  // Student-specific fields
  const [studentId, setStudentId] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState('');
  const [careerGoals, setCareerGoals] = useState('');

  // Alumni-specific fields
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [bio, setBio] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginEmail, loginPassword, loginUniversalAccess);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back to AlumniConnect!",
        });
        setIsOpen(false);
        // Reset form
        setLoginEmail('');
        setLoginPassword('');
        setLoginUniversalAccess('');
        // Force a router refresh to update the page
        router.refresh();
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare additional data based on role
      const additionalData: any = {
        phone: signupPhone // Added phone number to all roles
      };
      if (signupRole === 'STUDENT') {
        additionalData.studentId = studentId;
        additionalData.graduationYear = graduationYear;
        additionalData.major = major;
        additionalData.skills = skills;
        additionalData.careerGoals = careerGoals;
      } else if (signupRole === 'ALUMNI') {
        additionalData.company = company;
        additionalData.position = position;
        additionalData.industry = industry;
        additionalData.location = location;
        additionalData.linkedin = linkedin;
        additionalData.bio = bio;
      }

      const result = await signup(signupEmail, signupPassword, signupName, signupRole, signupUniversalAccess, additionalData);
      
      if (result.success) {
        toast({
          title: "Account created",
          description: "Welcome to AlumniConnect!",
        });
        setIsOpen(false);
        // Reset form
        setSignupEmail('');
        setSignupPassword('');
        setSignupName('');
        setSignupPhone(''); // Added phone number reset
        setSignupRole('STUDENT');
        setSignupUniversalAccess('');
        // Reset student fields
        setStudentId('');
        setGraduationYear('');
        setMajor('');
        setSkills('');
        setCareerGoals('');
        // Reset alumni fields
        setCompany('');
        setPosition('');
        setIndustry('');
        setLocation('');
        setLinkedin('');
        setBio('');
        // Force a router refresh to update the page
        router.refresh();
      } else {
        let errorMessage = "Please check your information and try again.";
        
        if (result.error === 'User already exists') {
          errorMessage = "An account with this email already exists. Please try logging in instead.";
        } else if (result.error === 'Missing required fields') {
          errorMessage = "Please fill in all required fields.";
        } else if (result.error === 'Invalid role') {
          errorMessage = "Please select a valid role.";
        }
        
        toast({
          title: "Signup failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Signup error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (isSignup: boolean = false) => {
    setIsLoading(true);
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        toast({
          title: "Authentication failed",
          description: "Could not sign in with Google. Please try again.",
          variant: "destructive",
        });
      } else if (result?.ok) {
        toast({
          title: isSignup ? "Account created with Google" : "Signed in with Google",
          description: "Welcome to AlumniConnect!",
        });
        setIsOpen(false);
        router.refresh();
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: "An error occurred with Google authentication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInAuth = async (isSignup: boolean = false) => {
    setIsLoading(true);
    try {
      const result = await signIn('linkedin', {
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        toast({
          title: "Authentication failed",
          description: "Could not sign in with LinkedIn. Please try again.",
          variant: "destructive",
        });
      } else if (result?.ok) {
        toast({
          title: isSignup ? "Account created with LinkedIn" : "Signed in with LinkedIn",
          description: "Welcome to AlumniConnect!",
        });
        setIsOpen(false);
        router.refresh();
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: "An error occurred with LinkedIn authentication. Please try again.",
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
      <DialogContent className="sm:max-w-md max-h-[60vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle>Welcome to AlumniConnect</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Join Now</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-xl">
                  Welcome Back
                </CardTitle>
                <CardDescription>
                  Sign in to your account to continue connecting with alumni
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                {/* Social Login Options */}
                <div className="space-y-3 mb-6">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => handleGoogleAuth(false)}
                    disabled={isLoading}
                  >
                    <Chrome className="h-4 w-4" />
                    Sign in with Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => handleLinkedInAuth(false)}
                    disabled={isLoading}
                  >
                    <Linkedin className="h-4 w-4" />
                    Sign in with LinkedIn
                  </Button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">
                        Email Address
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">
                        Password
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-universal">
                        Universal Access (Testing)
                      </Label>
                      <Input
                        id="login-universal"
                        type="text"
                        placeholder="Enter access code for testing"
                        value={loginUniversalAccess}
                        onChange={(e) => setLoginUniversalAccess(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">demo123</Badge>
                        Leave empty for normal login
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-xl">
                  Join AlumniConnect
                </CardTitle>
                <CardDescription>
                  Create your account and start connecting with fellow graduates
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                {/* Social Signup Options */}
                <div className="space-y-3 mb-6">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => handleGoogleAuth(true)}
                    disabled={isLoading}
                  >
                    <Chrome className="h-4 w-4" />
                    Sign up with Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => handleLinkedInAuth(true)}
                    disabled={isLoading}
                  >
                    <Linkedin className="h-4 w-4" />
                    Sign up with LinkedIn
                  </Button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="text-sm font-medium text-slate-700 border-b pb-2">Basic Information</div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">
                        Full Name
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">
                        Email Address
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">
                        Phone Number
                      </Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a strong password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-role">
                        I am a
                      </Label>
                      <Select value={signupRole} onValueChange={(value: 'STUDENT' | 'ALUMNI' | 'ADMIN') => setSignupRole(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">
                            Student
                          </SelectItem>
                          <SelectItem value="ALUMNI">
                            Alumni
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            Administrator
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Role-Specific Fields */}
                  {signupRole === 'STUDENT' && (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-slate-700 border-b pb-2">
                        Student Information
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="student-id">
                            Student ID
                          </Label>
                          <Input
                            id="student-id"
                            type="text"
                            placeholder="e.g., S12345"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="graduation-year">
                            Expected Graduation
                          </Label>
                          <Input
                            id="graduation-year"
                            type="number"
                            placeholder="2025"
                            value={graduationYear}
                            onChange={(e) => setGraduationYear(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="major">
                          Major/Field of Study
                        </Label>
                        <Input
                          id="major"
                          type="text"
                          placeholder="e.g., Computer Science"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="skills">
                          Skills (comma-separated)
                        </Label>
                        <Textarea
                          id="skills"
                          placeholder="e.g., JavaScript, Python, Leadership"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          rows={2}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="career-goals">
                          Career Goals
                        </Label>
                        <Textarea
                          id="career-goals"
                          placeholder="Describe your career aspirations"
                          value={careerGoals}
                          onChange={(e) => setCareerGoals(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {signupRole === 'ALUMNI' && (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-slate-700 border-b pb-2">
                        Professional Information
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="company">
                            Company
                          </Label>
                          <Input
                            id="company"
                            type="text"
                            placeholder="e.g., Google Inc."
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="position">
                            Position
                          </Label>
                          <Input
                            id="position"
                            type="text"
                            placeholder="e.g., Senior Software Engineer"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="industry">
                            Industry
                          </Label>
                          <Select value={industry} onValueChange={setIndustry}>
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
                        
                        <div className="space-y-2">
                          <Label htmlFor="location">
                            Location
                          </Label>
                          <Input
                            id="location"
                            type="text"
                            placeholder="e.g., San Francisco, CA"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">
                          LinkedIn Profile
                        </Label>
                        <Input
                          id="linkedin"
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">
                          Professional Bio
                        </Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about your professional journey"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}