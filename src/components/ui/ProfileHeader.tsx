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
    graduationYear?: number;
    // Alumni specific
    degree?: string;
    company?: string;
    position?: string;
    industry?: string;
    linkedin?: string;
    // Student specific
    major?: string;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return null;
}