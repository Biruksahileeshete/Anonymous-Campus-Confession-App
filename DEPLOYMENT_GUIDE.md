# 🚀 Deployment Guide

This guide covers deploying the Anonymous Campus Confession App to various platforms.

## 📋 Pre-deployment Checklist

### 1. Environment Variables
Ensure you have all required environment variables:

```env
# Database
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-key-minimum-32-characters
NEXTAUTH_URL=https://your-domain.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Database Setup
1. Create a Neon PostgreSQL database
2. Run the migration script: `node scripts/migrate.js`
3. Create an admin user (see Admin Setup section)

### 3. Build Test
```bash
npm run build
npm start
```

## 🌐 Vercel Deployment (Recommended)

### Step 1: Prepare Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/anonymous-campus-confession-app.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard
5. Deploy!

### Step 3: Post-deployment
1. Update `NEXTAUTH_URL` to your Vercel domain
2. Update Google OAuth redirect URIs if using Google login
3. Test all functionality

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: confessions
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## ☁️ Railway Deployment

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway new`
4. Add PostgreSQL: `railway add postgresql`
5. Set environment variables: `railway variables set KEY=value`
6. Deploy: `railway up`

## 🔧 Environment Configuration

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/confessions_dev
JWT_SECRET=dev-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
```

### Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod-host/confessions_prod?sslmode=require
JWT_SECRET=super-secure-production-key-minimum-32-characters
NEXTAUTH_URL=https://your-domain.com
```

## 👨‍💼 Admin User Setup

After deployment, create an admin user:

### Method 1: Database Query
```sql
-- First, register a user through the app, then update their role
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Method 2: Direct Database Insert
```sql
INSERT INTO users (email, password_hash, full_name, student_id, role) 
VALUES (
  'admin@example.com',
  '$2b$10$hashedpassword', -- Use bcrypt to hash your password
  'Admin User',
  'ADMIN001',
  'admin'
);
```

## 🔍 Health Checks

### API Health Check
Create `/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { simpleDb } from '@/lib/neon-db';

export async function GET() {
  try {
    // Test database connection
    await simpleDb.getStats();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 });
  }
}
```

### Monitoring URLs
- Health: `https://your-domain.com/api/health`
- Stats: `https://your-domain.com/api/admin/stats` (admin only)

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Ensure SSL mode is correct
   - Verify network access to database

2. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Verify all environment variables are set
   - Clear cache: `rm -rf .next node_modules && npm install`

3. **Authentication Issues**
   - Verify JWT_SECRET is at least 32 characters
   - Check NEXTAUTH_URL matches your domain
   - Ensure Google OAuth URLs are correct

4. **Performance Issues**
   - Enable caching headers
   - Optimize images
   - Use CDN for static assets

### Debug Mode
Set `NODE_ENV=development` and check browser console and server logs for detailed error messages.

## 📊 Performance Optimization

### Build Optimization
- Uses SWC compiler for faster builds
- Turbo mode enabled for development
- Optimized TypeScript configuration
- Webpack build workers for parallel processing

### Runtime Optimization
- Image optimization with Next.js
- Automatic code splitting
- Static generation where possible
- Database connection pooling

## 🔐 Security Considerations

### Production Security
- Use strong JWT secrets (32+ characters)
- Enable HTTPS only
- Set secure cookie flags
- Implement rate limiting
- Regular security updates

### Database Security
- Use connection pooling
- Enable SSL connections
- Regular backups
- Monitor for suspicious activity

## 📈 Monitoring & Analytics

### Recommended Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: User session recording
- **Uptime Robot**: Uptime monitoring

### Custom Metrics
The app includes built-in admin statistics:
- Total confessions and comments
- User activity metrics
- Report statistics
- Performance data

## 🔄 Updates & Maintenance

### Regular Tasks
1. Update dependencies: `npm update`
2. Security patches: `npm audit fix`
3. Database maintenance: Monitor query performance
4. Log rotation: Clear old logs
5. Backup verification: Test restore procedures

### Version Updates
1. Test in staging environment
2. Run migration scripts if needed
3. Update environment variables if required
4. Deploy during low-traffic periods
5. Monitor for issues post-deployment