import { NextRequest, NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Health check request received');
    
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed',
          timestamp: new Date().toISOString(),
          env: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
        },
        { status: 500 }
      );
    }
    
    // Test basic database query
    try {
      const userCount = await db.user.count();
      console.log('User count query successful:', userCount);
      
      return NextResponse.json({
        status: 'healthy',
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        database: {
          connected: true,
          userCount: userCount
        }
      });
    } catch (queryError) {
      console.error('Database query error:', queryError);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database query failed',
          error: queryError instanceof Error ? queryError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}