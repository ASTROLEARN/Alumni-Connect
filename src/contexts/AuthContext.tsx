'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  profileImage?: string;
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  phone?: string; // Added phone number field
  // Student-specific fields
  studentId?: string;
  graduationYear?: number;
  major?: string;
  skills?: string;
  careerGoals?: string;
  // Alumni-specific fields
  degree?: string;
  company?: string;
  position?: string;
  industry?: string;
  location?: string;
  linkedin?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, universalAccess?: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: 'STUDENT' | 'ALUMNI' | 'ADMIN', universalAccess?: string, additionalData?: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updateData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('alumniConnectUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('alumniConnectUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, universalAccess?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, universalAccess }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('alumniConnectUser', JSON.stringify(data.user));
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: 'STUDENT' | 'ALUMNI' | 'ADMIN',
    universalAccess?: string,
    additionalData?: any
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const requestBody: any = { email, password, name, role, universalAccess };
      if (additionalData) {
        Object.assign(requestBody, additionalData);
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('alumniConnectUser', JSON.stringify(data.user));
        return { success: true };
      } else {
        console.error('Signup failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('alumniConnectUser');
  };

  const updateUser = (updateData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updateData, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('alumniConnectUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}