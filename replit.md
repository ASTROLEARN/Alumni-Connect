# Alumni Connect - Platform Overview

## Overview

Alumni Connect is a comprehensive web platform built with Next.js 15 that facilitates connections between students, alumni, and administrators. The application serves as a networking hub where students can access mentorship opportunities, job postings, events, and success stories from alumni. Alumni can give back through mentorship, job postings, and donations, while administrators manage the entire ecosystem through powerful admin tools.

The platform emphasizes verified connections, real-time communication, and comprehensive user engagement tracking to create meaningful relationships within the alumni network.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Core Technologies**
- Next.js 15 with App Router for server-side rendering and routing
- TypeScript 5 for type safety across the application
- Tailwind CSS 4 for utility-first styling with custom theme variables
- shadcn/ui components built on Radix UI primitives for accessible UI

**State Management**
- Zustand for lightweight client-side state management
- TanStack Query for server state synchronization and caching
- React Context API (AuthContext) for global authentication state

**UI Components & Interactions**
- Framer Motion for animations and transitions
- DND Kit for drag-and-drop functionality in admin workflows
- TanStack Table for data grids in admin panels
- Recharts for analytics visualizations
- MDX Editor for rich text content creation

### Backend Architecture

**Custom Server Implementation**
- Custom Node.js/Express-like server (`server.ts`) integrating Next.js with Socket.IO
- Runs on port 5000, handles both HTTP requests and WebSocket connections
- Socket.IO for real-time features (notifications, chat, live updates)

**Database & ORM**
- Prisma as the primary ORM for database operations
- Database schema supports three user roles: STUDENT, ALUMNI, ADMIN
- Verification system for alumni accounts (admin approval required)
- Relational data model linking users, jobs, events, mentorship requests, donations, and success stories

**Authentication & Authorization**
- Custom authentication system via AuthContext
- NextAuth.js integration for session management
- Universal Access system allowing role-based access
- Token-based authorization for API routes using Bearer tokens
- User data persisted in localStorage for client-side state

### API Architecture

**API Route Structure**
- RESTful API endpoints under `/api` directory
- Authentication middleware (`auth-utils.ts`) for protected routes
- Socket.IO endpoint at `/api/socketio` for WebSocket connections
- Authorized fetch wrapper for making authenticated requests from client

**Real-time Communication**
- Socket.IO rooms for role-based broadcasting (admin, alumni, student)
- User-specific rooms for targeted notifications
- Event types: alumni verification, mentorship requests, job notifications, system alerts
- Bi-directional communication for instant updates

### User Roles & Workflows

**Students**
- Browse alumni directory and connect with graduates
- Apply for jobs and internships posted by alumni
- Request mentorship from alumni
- Register for events
- View success stories for inspiration
- Dashboard showing personalized recommendations and activities

**Alumni**
- Complete profile with company, position, industry details
- Requires admin verification before full platform access
- Post job opportunities for students
- Accept/reject mentorship requests
- Make donations to campaigns
- Share success stories
- Dashboard for managing all alumni activities

**Administrators**
- Full platform oversight and management capabilities
- Verify pending alumni accounts
- Content moderation (jobs, events, stories)
- User activity monitoring and analytics
- Communication hub for announcements
- Workflow management for approval processes
- Advanced reporting and cross-page analytics

### Key Features & Components

**Alumni Directory**
- Searchable and filterable alumni database
- Industry, location, and graduation year filters
- Detailed profile views with achievements and experience
- Direct connection and messaging capabilities

**Job Board**
- Alumni can post full-time, part-time, internship, and contract positions
- Application tracking and management
- Category-based filtering and search
- Real-time application notifications

**Events System**
- Virtual and in-person event creation
- Registration management with capacity limits
- Calendar integration
- Event categories (networking, career, reunions)

**Mentorship Platform**
- Student-initiated mentorship requests
- Alumni acceptance/rejection workflow
- Session scheduling and tracking
- Real-time notifications for both parties

**Donations & Campaigns**
- Campaign creation and management
- One-time and recurring donation support
- Progress tracking toward funding goals
- Anonymous donation options

**Success Stories Hub**
- Rich media support (text, video, images)
- Category-based organization
- Engagement metrics (views, likes, bookmarks)
- Featured stories for prominent alumni

**Admin Dashboard**
- Quick stats overview across all metrics
- Pending verification queue
- Content management for all platform content
- Notification center for system-wide announcements
- User activity monitor with engagement tracking
- Workflow automation for repetitive tasks
- Advanced reporting with cross-page analytics

### Design Patterns

**Component Architecture**
- Atomic design principles with reusable UI components
- Compound component pattern for complex interactions
- Controlled and uncontrolled component patterns
- Custom hooks for shared logic (use-mobile, use-toast)

**Data Fetching Strategy**
- Server-side data fetching where possible
- Client-side fetching with TanStack Query for dynamic data
- Optimistic updates for improved UX
- Error boundaries for graceful error handling

**Responsive Design**
- Mobile-first approach with Tailwind breakpoints
- Hamburger menu for mobile navigation
- Sheet/Drawer components for mobile interactions
- Adaptive layouts using CSS Grid and Flexbox

## External Dependencies

**Database**
- Prisma ORM with support for PostgreSQL, MySQL, or SQLite
- Connection string configured via DATABASE_URL environment variable
- Migration system for schema changes

**Third-Party Services & APIs**
- NextAuth.js for authentication flows
- Socket.IO Server for WebSocket communication
- Axios for HTTP client requests
- bcryptjs for password hashing

**UI & Styling Libraries**
- Radix UI primitives for accessible components
- Lucide React for icon library
- Tailwind CSS with custom theme configuration
- class-variance-authority for component variants

**Development Tools**
- TypeScript for type checking
- ESLint for code linting
- Nodemon for development server auto-reload
- tsx for TypeScript execution

**Optional Integrations**
- Google OAuth (Chrome icon suggests OAuth support)
- LinkedIn integration for professional networking
- Sharp for image processing and optimization
- date-fns for date manipulation

**Environment Configuration**
- NEXTAUTH_SECRET for session encryption
- DATABASE_URL for database connection
- NODE_ENV for environment detection
- NEXT_PUBLIC_SOCKET_URL for WebSocket endpoint