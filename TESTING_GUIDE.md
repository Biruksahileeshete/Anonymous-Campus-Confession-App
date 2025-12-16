# 🧪 Testing Guide: Google OAuth Setup

This guide will help you test your Google OAuth configuration step by step.

## 📋 Prerequisites

Before testing, ensure you have:
- ✅ Created NEW OAuth 2.0 credentials in Google Cloud Console
- ✅ Added them to your `.env.local` file
- ✅ Enabled Google+ API and People API
- ✅ Configured redirect URIs correctly

## 🔧 Step-by-Step Testing Process

### Step 1: Verify Environment Variables

```bash
# Run the configuration checker
node scripts/verify-new-api-key.js
```

**Expected Output:**
- ✅ All environment variables should be "SET"
- ✅ Credential formats should be "Valid"
- ✅ Should show "Ready for testing"

### Step 2: Test OAuth Configuration

```bash
# Run the OAuth-specific test
node test-google-oauth-setup.js
```

**Expected Output:**
- ✅ All required variables present
- ✅ Valid Client ID format (ends with .apps.googleusercontent.com)
- ✅ Valid Client Secret format (starts with GOCSPX-)
- ✅ Valid NextAuth URL

### Step 3: Start Development Server

```bash
# Install dependencies (if not done)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
> next dev
Ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 4: Test Google Sign-In Flow

1. **Open your browser** and go to: `http://localhost:3000`

2. **You should see**: The authentication page with Google sign-in option

3. **Click "Sign in with Google"**

4. **Expected Flow**:
   - Redirects to Google OAuth consent screen
   - Shows your app name and requested permissions
   - After consent, redirects back to your app
   - User should be signed in and redirected to dashboard

### Step 5: Verify Database Integration

After successful Google sign-in:

1. **Check the console logs** for any database errors
2. **Verify user creation** - New users should be automatically created
3. **Test app functionality** - Try creating a confession, adding reactions, etc.

## 🚨 Common Issues and Solutions

### Issue 1: "Error 400: redirect_uri_mismatch"
**Solution**: 
- Go to Google Cloud Console → Credentials
- Add these redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://your-domain.vercel.app/api/auth/callback/google`

### Issue 2: "Error 403: access_denied"
**Solution**:
- Enable Google+ API in Google Cloud Console
- Enable People API (recommended)
- Check API quotas and limits

### Issue 3: "Internal Server Error"
**Solution**:
- Check console logs for specific error
- Verify database connection (DATABASE_URL)
- Ensure all environment variables are set

### Issue 4: Environment variables not loading
**Solution**:
- Restart the development server: `Ctrl+C` then `npm run dev`
- Check `.env.local` file exists and has correct format
- Ensure no spaces around the `=` sign

## 🔍 Debugging Commands

### Check Environment Variables
```bash
# Windows (PowerShell)
echo $env:GOOGLE_CLIENT_ID

# Windows (CMD)
echo %GOOGLE_CLIENT_ID%

# Linux/Mac
echo $GOOGLE_CLIENT_ID
```

### Check Next.js Configuration
```bash
# Build the app to check for errors
npm run build

# Type check
npm run type-check
```

### Database Connection Test
```bash
# Test database connection
node scripts/test-db.js
```

## 📊 Success Indicators

### ✅ Configuration Test Success
- All environment variables detected
- Valid credential formats
- No configuration warnings

### ✅ OAuth Flow Success
- Google consent screen appears
- User can grant permissions
- Successful redirect back to app
- User appears as signed in

### ✅ Database Integration Success
- No database connection errors
- New user created in database
- User can perform app actions (confessions, reactions, etc.)

### ✅ Production Readiness
- Local testing successful
- Environment variables configured for production
- OAuth redirect URIs include production domain

## 🚀 Production Testing

After local testing works:

1. **Deploy to production** (Vercel, Railway, etc.)
2. **Add production environment variables**
3. **Update OAuth redirect URIs** to include production domain
4. **Test Google sign-in on production URL**

## 📚 Additional Resources

- **Google OAuth Documentation**: [developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- **NextAuth.js Google Provider**: [next-auth.js.org/providers/google](https://next-auth.js.org/providers/google)
- **Security Guide**: `SECURITY_GUIDE.md`
- **Environment Setup**: `README.md`

## 🆘 Getting Help

If you encounter issues:

1. **Check the console logs** for specific error messages
2. **Run the diagnostic scripts** provided
3. **Verify Google Cloud Console configuration**
4. **Check environment variable formatting**
5. **Ensure database is accessible**

Remember: Never share your actual credentials in public forums or chat!