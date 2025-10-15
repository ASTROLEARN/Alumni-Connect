# Alumni Connect - Platform Overview

## Overview

Alumni Connect is a comprehensive alumni networking platform built with Next.js 15, designed to facilitate meaningful connections between students, alumni, and administrators. The platform provides features for networking, job opportunities, mentorship, events, donations, and success story sharing.

**Core Purpose:** Enable alumni to stay connected with their institution and fellow graduates while providing current students with mentorship, career opportunities, and networking resources.

**Key Features:**
- Alumni directory with advanced search and filtering
- Job board with posting and application management
- Event management and registration system
- Mentorship request and management system
- Success stories and testimonials
- Donation campaigns and tracking
- Real-time notifications via WebSocket
- Role-based access control (Student, Alumni, Admin)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** Next.js 15 with App Router
- Server-side rendering and static generation for optimal performance
- TypeScript for type safety across the application
- Client-side components marked with 'use client' directive for interactive features

**UI Component System:**
- **shadcn/ui** - Pre-built, accessible components built on Radix UI primitives
- **Tailwind CSS 4** - Utility-first styling with custom theme configuration
- **Framer Motion** - Animations and transitions for enhanced UX
- Component architecture follows atomic design with reusable UI elements in `src/components/ui/`

**State Management:**
- **Context API** - AuthContext for global authentication state management
- **Local State** - React hooks (useState, useEffect) for component-level state
- **Session Management** - NextAuth.js for authentication sessions

**Form Handling:**
- **React Hook Form** - Performant forms with minimal re-renders
- **Zod** - Schema validation for form inputs and API payloads

### Backend Architecture

**Custom Server Implementation:**
- Custom Node.js server (`server.ts`) wrapping Next.js
- Integrates HTTP server with Socket.IO for real-time features
- Runs on port 5000 with hostname 0.0.0.0 for network accessibility

**API Routes:**
- Next.js API routes pattern (`/api/*` endpoints)
- RESTful design for CRUD operations
- Authentication middleware via `auth-utils.ts`
- Token-based authentication using user IDs

**Real-time Communication:**
- **Socket.IO** server integrated with Next.js custom server
- WebSocket path: `/api/socketio`
- Event-driven architecture for notifications, mentorship requests, and job postings
- Room-based messaging for role-specific broadcasts (admin, student, alumni)

### Authentication & Authorization

**Authentication Strategy:**
- NextAuth.js with Credentials provider
- Universal Access ID system for demo/admin access
- Password-based authentication (bcryptjs for hashing)
- Session persistence via localStorage and NextAuth sessions

**Role-Based Access Control:**
- Three user roles: STUDENT, ALUMNI, ADMIN
- Role-specific dashboards and features
- Verification system for alumni accounts
- Admin approval workflow for content and accounts

**Authorization Flow:**
1. User authenticates via AuthModal component
2. Session stored in AuthContext and localStorage
3. API requests include Authorization header with user ID
4. Middleware validates user and role permissions

### Database Design

**ORM:** Prisma Client
- Type-safe database queries
- Schema-first approach with migrations
- Development database: SQLite (file-based)
- Production-ready for PostgreSQL migration

**Key Models (Inferred from codebase):**
- **User** - Core user account (id, email, name, role, verified, password)
- **Student** - Extended profile for students (studentId, graduationYear, major, skills, careerGoals)
- **Alumni** - Extended profile for alumni (company, position, industry, location, linkedin, bio, verified)
- **Job** - Job postings with applications tracking
- **Event** - Event management with registrations
- **MentorshipRequest** - Student-alumni mentorship connections
- **Donation** - Alumni donation tracking and campaigns
- **SuccessStory** - Alumni achievements and testimonials

**Database Connection:**
- Environment-based DATABASE_URL configuration
- Global Prisma client instance to prevent connection exhaustion
- Client-side safety checks to prevent browser-side database access

### Component Architecture

**Page Structure:**
- `src/app/page.tsx` - Main application shell with section routing
- `src/app/layout.tsx` - Root layout with providers and metadata
- Section-based navigation without traditional routing

**Feature Modules:**
- **Admin Dashboard** - User management, analytics, content moderation, notifications
- **Alumni Features** - Dashboard, job posting, mentorship management, donations
- **Student Features** - Directory browsing, job applications, mentorship requests
- **Shared Components** - Events, success stories, profile management

**Component Patterns:**
- Compound components for complex UI (Cards, Dialogs, Tabs)
- Controlled components for forms
- Custom hooks for reusable logic (use-mobile, use-toast)
- Provider pattern for context distribution

### Styling Architecture

**Design System:**
- CSS custom properties for theming (`--background`, `--foreground`, etc.)
- Dark mode support via class-based theming
- Responsive design with mobile-first breakpoints
- HSL color space for consistent color variations

**Typography:**
- Primary font: Roboto (body text)
- Heading font: Exo 2 (titles and headings)
- Monospace: Geist Mono (code and technical content)

**Component Styling:**
- Utility classes via Tailwind
- Component variants via class-variance-authority (cva)
- Consistent spacing using Tailwind spacing scale
- Shadow system for depth and elevation

## External Dependencies

### Third-Party Services

**Authentication:**
- NextAuth.js - Session management and OAuth potential
- bcryptjs - Password hashing and comparison

**Real-time Communication:**
- Socket.IO - WebSocket server and client libraries
- Bidirectional event-based communication
- Room and namespace support for targeted messaging

### UI Libraries

**Component Libraries:**
- Radix UI - Headless accessible component primitives (20+ components)
- Lucide React - Icon library with 1000+ icons
- Framer Motion - Animation library

**Data Visualization:**
- Recharts - Charts and data visualization (admin analytics)
- TanStack Table - Headless table component for data grids

**Form & Validation:**
- React Hook Form - Form state management
- Zod - Runtime type validation
- @hookform/resolvers - Integration between RHF and Zod

### Utilities

**State & Data:**
- TanStack Query - Server state synchronization
- Zustand - Lightweight state management
- Axios - HTTP client for API requests

**UI Utilities:**
- @dnd-kit - Drag and drop functionality
- @reactuses/core - Collection of React hooks
- date-fns - Date manipulation and formatting
- class-variance-authority - Type-safe variant styling
- tailwind-merge - Merge Tailwind classes intelligently
- clsx - Conditional className construction

**Content:**
- @mdxeditor/editor - Rich text editor component
- Sharp - Image processing (server-side)

### Development Tools

**Build & Dev:**
- TypeScript 5 - Type checking and IntelliSense
- ESLint - Code linting
- Nodemon - Development server auto-restart
- tsx - TypeScript execution for custom server

**Database:**
- Prisma - ORM with CLI tools
- Database migrations via `prisma migrate`
- Schema generation via `prisma generate`

### Configuration Notes

**Package Scripts:**
- `dev` - Development with nodemon watching server.ts and src directory
- `build` - Production build via Next.js
- `start` - Production server with logging
- `db:*` - Prisma database management commands

**Build Configuration:**
- Standalone output mode for production deployment
- TypeScript strict mode enabled
- Package optimization for lucide-react icons
- Compression enabled for reduced bundle size