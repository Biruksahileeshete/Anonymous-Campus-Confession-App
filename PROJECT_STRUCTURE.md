# 📁 Project Structure

This document explains the organization and architecture of the Anonymous Campus Confession App.

## 🏗️ Directory Structure

```
Anonymous-Campus-Confession-App/
├── 📁 app/                          # Next.js 14 App Router
│   ├── 📁 admin/                    # Admin panel pages
│   │   ├── 📁 confessions/          # Admin confession management
│   │   ├── 📁 dashboard/            # Admin dashboard
│   │   ├── 📁 reports/              # Admin reports management
│   │   └── 📁 users/                # Admin user management
│   ├── 📁 api/                      # API routes
│   │   ├── 📁 admin/                # Admin API endpoints
│   │   ├── 📁 auth/                 # Authentication endpoints
│   │   ├── 📁 comments/             # Comment management
│   │   ├── 📁 confessions/          # Confession CRUD
│   │   ├── 📁 notifications/        # Notification system
│   │   ├── 📁 reactions/            # Reaction system
│   │   ├── 📁 reports/              # Content reporting
│   │   └── 📁 user/                 # User profile management
│   ├── 📁 auth/                     # Authentication pages
│   ├── 📁 confessions/              # Individual confession pages
│   ├── 📁 dashboard/                # User dashboard
│   ├── 📁 notifications/            # Notification pages
│   ├── 📁 profile/                  # User profile pages
│   ├── 📄 globals.css               # Global styles
│   ├── 📄 layout.tsx                # Root layout component
│   └── 📄 page.tsx                  # Home page (redirects to auth)
├── 📁 components/                   # Reusable React components
│   ├── 📄 AdminSidebar.tsx          # Admin navigation sidebar
│   ├── 📄 CommentCount.tsx          # Comment counter component
│   ├── 📄 CommentSection.tsx        # Comment display and creation
│   ├── 📄 ConfessionCard.tsx        # Main confession display component
│   ├── 📄 CreateConfession.tsx      # Confession creation form
│   ├── 📄 Header.tsx                # Main navigation header
│   ├── 📄 ReactionButtons.tsx       # Emoji reaction system
│   ├── 📄 ReportModal.tsx           # Content reporting modal
│   ├── 📄 SessionProvider.tsx       # NextAuth session provider
│   └── 📄 Toast.tsx                 # Notification toast component
├── 📁 lib/                          # Utility libraries and configurations
│   ├── 📄 auth.ts                   # Legacy auth utilities
│   ├── 📄 auth-middleware.ts        # JWT authentication middleware
│   ├── 📄 database.ts               # Legacy database utilities
│   ├── 📄 db.ts                     # Legacy database connection
│   ├── 📄 firebase.ts               # Firebase configuration (legacy)
│   ├── 📄 neon-db.ts                # Main Neon PostgreSQL database layer
│   ├── 📄 rate-limit.ts             # Rate limiting implementation
│   ├── 📄 simple-auth.ts            # Simple authentication utilities
│   ├── 📄 types.ts                  # TypeScript type definitions
│   └── 📄 validation.ts             # Input validation and sanitization
├── 📁 scripts/                      # Database and utility scripts
│   ├── 📄 migrate.js                # Database migration script
│   ├── 📄 test-db.js                # Database connection test
│   └── 📄 test-simple-db.js         # Simple database test
├── 📁 types/                        # TypeScript type declarations
├── 📄 .env.example                  # Environment variables template
├── 📄 .env.local                    # Local environment variables (gitignored)
├── 📄 .gitignore                    # Git ignore rules
├── 📄 middleware.ts                 # Next.js middleware for auth
├── 📄 next.config.js                # Next.js configuration
├── 📄 package.json                  # Dependencies and scripts
├── 📄 postcss.config.js             # PostCSS configuration
├── 📄 tailwind.config.js            # Tailwind CSS configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 vercel.json                   # Vercel deployment configuration
└── 📄 README.md                     # Project documentation
```

## 🎯 Core Architecture

### 1. **App Router Structure** (`/app`)
- Uses Next.js 14 App Router for file-based routing
- Server and client components for optimal performance
- API routes co-located with pages for better organization

### 2. **Database Layer** (`/lib/neon-db.ts`)
- Centralized database operations using Neon PostgreSQL
- Type-safe database queries with proper error handling
- Connection pooling and timezone-aware timestamps

### 3. **Authentication System**
- JWT-based authentication with middleware protection
- NextAuth.js integration for Google OAuth
- Role-based access control (user/admin)

### 4. **Component Architecture**
- Reusable, type-safe React components
- Client-side state management with React hooks
- Server-side rendering where appropriate

## 📊 Data Flow

### User Authentication Flow
```
1. User visits /auth
2. Submits login/register form
3. API validates credentials
4. JWT token generated and stored
5. Middleware protects subsequent requests
6. User redirected to appropriate dashboard
```

### Confession Creation Flow
```
1. User creates confession on dashboard
2. Content validated and sanitized
3. Rate limiting checked
4. Stored in database with timestamp
5. Real-time updates to feed
6. Notifications sent to relevant users
```

### Admin Action Flow
```
1. Admin performs action (hide/ban/warn)
2. Action validated against admin role
3. Database updated with audit trail
4. Notifications sent to affected users
5. Real-time updates to admin dashboard
```

## 🔧 Key Components

### Core Components

#### `ConfessionCard.tsx`
- Main confession display component
- Handles reactions, comments, and reporting
- Real-time timestamp formatting
- Responsive design with glass-morphism effects

#### `CommentSection.tsx`
- Comment display and creation
- Anonymous commenting system
- Real-time comment count updates
- Nested comment threading support

#### `ReactionButtons.tsx`
- Emoji reaction system
- Support for any Unicode emoji
- Real-time reaction count updates
- User reaction state management

#### `Header.tsx`
- Main navigation component
- User authentication status
- Notification badge with count
- Responsive mobile menu

### Admin Components

#### `AdminSidebar.tsx`
- Admin panel navigation
- Role-based menu items
- Active page highlighting
- Responsive sidebar collapse

### Utility Components

#### `CreateConfession.tsx`
- Confession creation form
- Input validation and character limits
- Rate limiting feedback
- Success/error handling

## 🗄️ Database Schema

### Core Tables

#### `users`
```sql
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- student_id (VARCHAR)
- role (ENUM: 'user', 'admin')
- is_banned (BOOLEAN)
- created_at (TIMESTAMP WITH TIME ZONE)
```

#### `confessions`
```sql
- id (UUID, Primary Key)
- content (TEXT)
- author_id (UUID, Foreign Key)
- is_hidden (BOOLEAN)
- reaction_counts (JSONB)
- created_at (TIMESTAMP WITH TIME ZONE)
```

#### `comments`
```sql
- id (UUID, Primary Key)
- confession_id (UUID, Foreign Key)
- content (TEXT)
- author_id (UUID, Foreign Key)
- created_at (TIMESTAMP WITH TIME ZONE)
```

#### `reactions`
```sql
- id (UUID, Primary Key)
- confession_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- type (TEXT) -- Emoji character
- created_at (TIMESTAMP WITH TIME ZONE)
```

#### `reports`
```sql
- id (UUID, Primary Key)
- confession_id (UUID, Foreign Key)
- reported_by (UUID, Foreign Key)
- reason (ENUM)
- explanation (TEXT)
- status (ENUM: 'pending', 'reviewed', 'dismissed')
- created_at (TIMESTAMP WITH TIME ZONE)
```

#### `notifications`
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- type (ENUM: 'warning', 'like', 'comment', 'report_resolved')
- title (VARCHAR)
- message (TEXT)
- confession_id (UUID, Foreign Key, Optional)
- is_read (BOOLEAN)
- created_at (TIMESTAMP WITH TIME ZONE)
```

## 🔐 Security Architecture

### Authentication & Authorization
- JWT tokens with secure secrets
- Middleware-based route protection
- Role-based access control
- Session management with NextAuth.js

### Input Validation
- Server-side validation for all inputs
- Content sanitization to prevent XSS
- Rate limiting to prevent spam
- SQL injection prevention with parameterized queries

### Data Protection
- Password hashing with bcrypt
- Secure cookie configuration
- HTTPS enforcement in production
- Environment variable protection

## 🚀 Performance Optimizations

### Build Optimizations
- SWC compiler for faster builds
- Turbo mode for development
- Webpack optimization with workers
- TypeScript incremental compilation

### Runtime Optimizations
- Server-side rendering where appropriate
- Client-side caching with React Query patterns
- Image optimization with Next.js
- Database connection pooling

### Code Splitting
- Automatic code splitting by Next.js
- Dynamic imports for heavy components
- Lazy loading for non-critical features
- Bundle analysis and optimization

## 🧪 Testing Strategy

### Test Files
- `test-features.js` - End-to-end feature testing
- `test-admin-features.js` - Admin functionality testing
- `test-complete-system.js` - Full system integration testing
- `scripts/test-db.js` - Database connection testing

### Testing Approach
- Unit tests for utility functions
- Integration tests for API endpoints
- Component testing for React components
- End-to-end testing for user workflows

## 📱 Responsive Design

### Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

### Design System
- Glass-morphism effects with Tailwind CSS
- Consistent color palette with CSS variables
- Responsive typography scaling
- Mobile-first design approach

## 🔄 State Management

### Client State
- React hooks for local component state
- Context API for global user state
- Local storage for authentication tokens
- Session storage for temporary data

### Server State
- Database as single source of truth
- Real-time updates through API polling
- Optimistic updates for better UX
- Error boundaries for graceful failures

## 📈 Monitoring & Analytics

### Built-in Analytics
- Admin dashboard with real-time statistics
- User activity tracking
- Content moderation metrics
- Performance monitoring

### Error Handling
- Comprehensive error boundaries
- Graceful degradation for failed requests
- User-friendly error messages
- Server-side error logging

This architecture provides a scalable, maintainable, and secure foundation for the Anonymous Campus Confession App.