import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('Login request received');
    
    const { email, password, universalAccess } = await request.json();
    console.log('Login data:', { email, passwordLength: password?.length, universalAccess });

    // UNIVERSAL ACCESS FOR TESTING
    if (universalAccess === 'demo123') {
      console.log('Universal access granted');
      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: 'universal-user-id',
          email: 'demo@alumniconnect.com',
          name: 'Demo User',
          role: 'ADMIN',
          verified: true
        }
      });
    }

    // Validate required fields
    if (!email || !password) {
      console.log('Missing required fields:', { email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Finding user by email...');
    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User found, comparing passwords...');
    // Compare passwords with error handling
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password comparison completed');
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      return NextResponse.json(
        { error: 'Failed to validate credentials. Please try again.' },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Password validated successfully for user:', email);
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    console.log('Login completed successfully');
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { error: 'Login failed. Please check your credentials and try again.' },
      { status: 500 }
    );
  }
}