'use client';

import { useSession } from 'next-auth/react';
import MentorshipComponent from './Mentorship';

export default function Mentorship() {
  const { data: session, status } = useSession();

  // For the general mentorship page, we'll use the current user's alumni ID
  // if they're an alumni, or show a different view for students
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">Please sign in to access mentorship features.</p>
        </div>
      </div>
    );
  }

  // For alumni, show the mentorship management interface
  if (session.user.role === 'ALUMNI') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Mentorship Management</h1>
            <p className="text-slate-600">Manage mentorship requests from students and guide the next generation</p>
          </div>
          <MentorshipComponent 
            alumniId={session.user.id} 
            isOwnProfile={true} 
          />
        </div>
      </div>
    );
  }

  // For students, show mentorship opportunities
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mentorship Program</h1>
          <p className="text-slate-600">Connect with experienced alumni mentors</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Find a Mentor</h3>
            <p className="text-slate-600 mb-4">Connect with alumni who can guide your career path</p>
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
              Browse Mentors
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Career Guidance</h3>
            <p className="text-slate-600 mb-4">Get personalized advice for your career goals</p>
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
              Get Started
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Skill Development</h3>
            <p className="text-slate-600 mb-4">Learn new skills from industry professionals</p>
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
              Explore Skills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}