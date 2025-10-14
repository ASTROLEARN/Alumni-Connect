import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            return null;
          }

          // In a real app, you would hash and compare passwords
          // For demo purposes, we'll just check if password exists
          if (!user.password) {
            return null;
          }

          // Return user object for NextAuth
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            verified: user.verified,
            graduationYear: user.graduationYear,
            major: user.major,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.verified = user.verified;
        token.graduationYear = user.graduationYear;
        token.major = user.major;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.verified = token.verified as boolean;
        session.user.graduationYear = token.graduationYear as string;
        session.user.major = token.major as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};

export default NextAuth(authOptions);