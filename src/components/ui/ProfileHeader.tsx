'use client';

interface ProfileHeaderProps {
  user: {
    id: string;
    name?: string;
    email: string;
    role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
    avatar?: string;
    phone?: string;
    location?: string;
    bio?: string;
    // Alumni specific
    graduationYear?: number;
    degree?: string;
    company?: string;
    position?: string;
    industry?: string;
    linkedin?: string;
    // Student specific
    major?: string;
    graduationYear?: number;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return null;
}