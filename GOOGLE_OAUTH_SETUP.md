# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Campus Confession App"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and click on it
3. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "Campus Confession App"
   - Add your email as developer contact
   - Add scopes: email, profile, openid
4. For Application type, select "Web application"
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Click "Create"
7. Copy the Client ID and Client Secret

## Step 4: Install NextAuth.js

```bash
npm install next-auth
npm install @next-auth/prisma-adapter  # if using Prisma
```

## Step 5: Environment Variables

Add to your `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 6: Create NextAuth Configuration

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { simpleDb } from '@/lib/neon-db'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          let existingUser = await simpleDb.getUserByEmail(user.email!)
          
          if (!existingUser) {
            // Create new user
            existingUser = await simpleDb.createUser({
              email: user.email!,
              password_hash: '', // No password for OAuth users
              full_name: user.name!,
              student_id: `GOOGLE_${Date.now()}`, // Generate unique student ID
              role: 'user'
            })
          }
          
          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await simpleDb.getUserByEmail(user.email!)
        token.id = dbUser.id
        token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    }
  },
  pages: {
    signIn: '/auth',
  }
})

export { handler as GET, handler as POST }
```

## Step 7: Update Auth Page

Replace the placeholder Google sign-in with:

```typescript
import { signIn } from 'next-auth/react'

const handleGoogleSignIn = async () => {
  setLoading(true)
  try {
    await signIn('google', { callbackUrl: '/dashboard' })
  } catch (error) {
    setError('Google sign-in failed')
  } finally {
    setLoading(false)
  }
}
```

## Step 8: Session Provider

Wrap your app with SessionProvider in `app/layout.tsx`:

```typescript
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

## Step 9: Update Database Schema

Add Google ID field to users table:

```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
```

## Step 10: Testing

1. Start your development server: `npm run dev`
2. Go to `/auth` page
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Check if user is created in database

## Production Deployment

1. Update `NEXTAUTH_URL` to your production domain
2. Add production redirect URI to Google Console
3. Update environment variables in your hosting platform

## Security Notes

- Keep your Client Secret secure
- Use HTTPS in production
- Regularly rotate your NEXTAUTH_SECRET
- Review OAuth scopes regularly

## Troubleshooting

**Error: redirect_uri_mismatch**
- Check that your redirect URI in Google Console matches exactly
- Include both http (dev) and https (prod) versions

**Error: invalid_client**
- Verify Client ID and Secret are correct
- Check environment variables are loaded

**User not created in database**
- Check database connection
- Verify user creation logic in signIn callback