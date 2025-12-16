# Anonymous Campus Confession App

[![Repository Status](https://img.shields.io/badge/Status-Live%20on%20GitHub-success)](https://github.com/Biruksahileeshete/Anonymous-Campus-Confession-App)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

A modern, secure platform for anonymous campus confessions built with Next.js 14, TypeScript, and Neon PostgreSQL. Features a beautiful glass-morphism UI, real-time interactions, and comprehensive admin tools.

> **🎉 Repository Status**: Successfully deployed to GitHub at [Biruksahileeshete/Anonymous-Campus-Confession-App](https://github.com/Biruksahileeshete/Anonymous-Campus-Confession-App)

## ✨ Key Features

### 🎭 User Experience
- **Anonymous Confessions**: Share thoughts without revealing identity
- **Emoji Reactions**: React with any emoji (👍, ❤️, 😂, 😢, etc.)
- **Anonymous Comments**: Engage with confessions anonymously  
- **Real-time Updates**: Live comment counts and reactions
- **Content Reporting**: Report inappropriate content with reasons
- **Profile Management**: Update username and password
- **Google OAuth Integration**: Sign in with Google account
- **Notification System**: Get notified of likes, comments, and warnings
- **Responsive Design**: Beautiful UI that works on all devices

### 👨‍💼 Admin Dashboard
- **Real-time Statistics**: Live platform metrics and user activity
- **Content Moderation**: Hide, unhide, or delete confessions
- **User Management**: View, warn, ban, or delete users with role management
- **Reports System**: Review flagged content with user details
- **Admin Actions**: Comprehensive moderation tools with audit trail
- **Role-based Access**: Secure admin-only features

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with glass-morphism effects
- **Database**: Neon PostgreSQL with timezone-aware timestamps
- **Authentication**: JWT-based auth + NextAuth.js for Google OAuth
- **Performance**: Optimized build with SWC and Turbo mode
- **Rate Limiting**: Built-in protection against spam
- **Validation**: Input sanitization and content moderation

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Neon PostgreSQL account

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd Anonymous-Campus-Confession-App
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret-key
```

4. **Run database migration**
```bash
node scripts/migrate.js
```

5. **Start development server**
```bash
npm run dev
```

6. **Open the app**
Visit [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts with roles and ban status
- `confessions` - Anonymous posts (no categories)
- `comments` - Anonymous comments on confessions
- `reactions` - User reactions (like, laugh, sad)
- `reports` - Content reports with reasons
- `user_warnings` - Warning system for users

## 👨‍💼 Admin Panel

### Access Admin Panel
1. Create an admin user by updating the role in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

2. Login and you'll be automatically redirected to admin dashboard

### Admin Capabilities
- **Dashboard**: View statistics and recent activity
- **Reports**: Review flagged content and take actions
- **Confessions**: Manage all confessions (hide/delete)
- **Users**: Warn or ban users
- **Actions Available**:
  - Hide/Unhide confessions
  - Delete confessions permanently
  - Warn users
  - Ban users with reason
  - Dismiss reports

## 🔐 Google OAuth Setup

Follow the detailed guide in `GOOGLE_OAUTH_SETUP.md` to enable Google sign-in:

1. Create Google Cloud Project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Install NextAuth.js
5. Configure environment variables
6. Update auth callbacks

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### Environment Variables for Production
```env
DATABASE_URL=your-neon-postgres-url
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🧪 Testing

Run the test script to verify all features:
```bash
node test-features.js
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Features  
- `GET /api/confessions` - Get confessions feed
- `POST /api/confessions` - Create confession
- `POST /api/comments` - Add comment
- `POST /api/reactions` - Add/update reaction
- `POST /api/reports` - Report content
- `PUT /api/user/profile` - Update profile

### Admin Features
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/confessions` - All confessions
- `GET /api/admin/users` - All users
- `POST /api/admin/actions` - Admin actions

## 🔒 Security Features

- Input validation and sanitization
- Rate limiting for posts and reports
- Content moderation filters
- Secure JWT authentication
- SQL injection prevention
- Role-based access control

## 🎨 UI Features

- Glass-morphism design
- Dark theme with gradients
- Responsive mobile design
- Smooth animations
- Loading states
- Error handling

## 📋 Usage Instructions

### For Users
1. Sign up/login at `/auth`
2. Create confessions on dashboard
3. React and comment on posts
4. Report inappropriate content
5. Manage profile via header

### For Admins
1. Login with admin account
2. Access admin panel automatically
3. Review reports and take actions
4. Manage users and content
5. Monitor platform statistics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the setup guides
3. Create an issue on GitHub