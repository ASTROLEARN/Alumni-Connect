import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

// Custom authentication for API routes that works with the Universal ID system
export async function authenticateRequest(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid authorization header', status: 401 };
    }

    // Extract the token (in this case, it's the user ID from localStorage)
    const token = authHeader.substring(7);
    
    if (!token) {
      return { error: 'Invalid token', status: 401 };
    }

    // For Universal ID demo, accept the demo user
    if (token === 'universal-user-id') {
      return {
        user: {
          id: 'universal-user-id',
          email: 'demo@alumniconnect.com',
          name: 'Demo User',
          role: 'ADMIN',
          verified: true
        }
      };
    }

    // For regular users, validate against the database
    const user = await db.user.findUnique({
      where: { id: token },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verified: true,
        createdAt: true,
      }
    });

    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    return { user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

// Middleware to check if user is admin
export async function requireAdmin(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (auth.error) {
    return auth;
  }
  
  if (auth.user && auth.user.role !== 'ADMIN') {
    return { error: 'Unauthorized: Admin access required', status: 403 };
  }
  
  return auth;
}

// Helper function to add authorization header to fetch requests
export function createAuthorizedFetch(userId: string) {
  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${userId}`
    };

    return fetch(url, {
      ...options,
      headers
    });
  };
}