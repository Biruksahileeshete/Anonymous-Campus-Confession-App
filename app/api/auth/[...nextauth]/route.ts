import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { simpleDb } from '@/lib/neon-db'
import bcrypt from 'bcryptjs'

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
            // Create new user with Google OAuth
            existingUser = await simpleDb.createUser({
              email: user.email!,
              password_hash: await bcrypt.hash(`google_${Date.now()}`, 12), // Random password for OAuth users
              full_name: user.name!,
              student_id: `GOOGLE_${Date.now()}`, // Generate unique student ID
              role: 'user'
            })
          }
          
          return true
        } catch (error) {
          console.error('Error during Google sign in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user) {
        try {
          const dbUser = await simpleDb.getUserByEmail(user.email!)
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.full_name = dbUser.full_name
            token.student_id = dbUser.student_id
          }
        } catch (error) {
          console.error('Error in JWT callback:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.full_name = token.full_name as string
        session.user.student_id = token.student_id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }