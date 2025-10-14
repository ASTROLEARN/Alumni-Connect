import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get the database URL
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL;
}

// Only create PrismaClient on server side
const createPrismaClient = () => {
  if (typeof window !== 'undefined') {
    // Return a dummy client for browser environment
    return {
      $connect: async () => console.log('Database client not available in browser'),
      $disconnect: async () => console.log('Database client not available in browser'),
      // Add other dummy methods as needed
    } as any;
  }

  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: getDatabaseUrl() || 'file:./dev.db'
      }
    }
  });
}

export const db =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  globalForPrisma.prisma = db
}

// Test database connection (server side only)
export async function testConnection() {
  if (typeof window !== 'undefined') {
    console.log('Database connection test skipped in browser environment');
    return false;
  }

  try {
    console.log('Attempting to connect to database...');
    console.log('Database URL:', getDatabaseUrl());
    
    await db.$connect();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Database URL:', getDatabaseUrl());
    return false;
  }
}

// Initialize connection on startup (server side only)
if (typeof window === 'undefined') {
  testConnection();
}