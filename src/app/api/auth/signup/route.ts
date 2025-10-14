import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('Signup request received');
    
    const { email, password, name, role, universalAccess, phone } = await request.json();
    console.log('Signup data:', { email, name, role, phone, passwordLength: password?.length, universalAccess });

    // UNIVERSAL ACCESS FOR TESTING - Create demo user
    if (universalAccess === 'demo123') {
      console.log('Universal access signup granted');
      return NextResponse.json({
        message: 'User created successfully',
        user: {
          id: 'universal-user-id',
          email: email || 'demo@alumniconnect.com',
          name: name || 'Demo User',
          role: role || 'ADMIN',
          verified: true
        }
      }, { status: 201 });
    }

    // Validate required fields
    if (!email || !password || !name || !role) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name, role: !!role });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['STUDENT', 'ALUMNI', 'ADMIN'];
    if (!validRoles.includes(role)) {
      console.log('Invalid role:', role);
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    console.log('Checking for existing user...');
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    console.log('Hashing password...');
    // Hash password with error handling
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
      console.log('Password hashed successfully');
    } catch (bcryptError) {
      console.error('Bcrypt hashing error:', bcryptError);
      return NextResponse.json(
        { error: 'Failed to process password. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Creating user...');
    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone, // Added phone number field
        role,
        verified: role === 'ADMIN' // Auto-verify admin users
      }
    });
    console.log('User created successfully:', user.id);

    console.log('Creating profile for role:', role);
    // Create profile based on role
    if (role === 'STUDENT') {
      await db.student.create({
        data: {
          userId: user.id,
          studentId: `STU${Date.now()}` // Generate a simple student ID
        }
      });
      console.log('Student profile created');
    } else if (role === 'ALUMNI') {
      await db.alumni.create({
        data: {
          userId: user.id,
          graduationYear: new Date().getFullYear(),
          major: 'Not specified'
        }
      });
      console.log('Alumni profile created');
    } else if (role === 'ADMIN') {
      await db.admin.create({
        data: {
          userId: user.id
        }
      });
      console.log('Admin profile created');
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    console.log('Signup completed successfully');
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { error: 'Signup failed. Please check your information and try again.' },
      { status: 500 }
    );
  }
}