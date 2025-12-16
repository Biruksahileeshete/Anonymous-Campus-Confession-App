# 🔐 Security Guide: Protecting API Keys and Secrets

This guide explains how to properly handle sensitive information like Google API keys, database URLs, and other secrets in your Anonymous Campus Confession App.

## 🚨 **Critical Security Rules**

### ❌ **NEVER DO THIS:**
```bash
# DON'T commit secrets directly in code
const GOOGLE_CLIENT_ID = "123456789-abcdef.apps.googleusercontent.com";
const DATABASE_URL = "postgresql://user:password@host/db";
```

### ✅ **ALWAYS DO THIS:**
```bash
# Use environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const DATABASE_URL = process.env.DATABASE_URL;
```

## 🛡️ **Environment Variables Setup**

### **Step 1: Local Development**

1. **Copy the example file:**
```bash
cp .env.example .env.local
```

2. **Edit `.env.local` with your real values:**
```env
# Database Configuration
DATABASE_URL=postgresql://your-real-username:your-real-password@your-real-host/your-real-db?sslmode=require

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your-super-long-random-secret-key-minimum-32-characters
NEXTAUTH_SECRET=another-super-long-random-secret-key-minimum-32-characters

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-real-google-client-secret

# NextAuth URL
NEXTAUTH_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=your-admin@email.com
```

3. **Verify `.env.local` is in `.gitignore`:**
```bash
# Check if .env.local is ignored
grep -n "\.env" .gitignore
```

### **Step 2: Production Deployment**

#### **For Vercel:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable:
   - `DATABASE_URL` → Your production database URL
   - `JWT_SECRET` → Strong random string (32+ characters)
   - `NEXTAUTH_SECRET` → Another strong random string
   - `GOOGLE_CLIENT_ID` → Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` → Your Google OAuth client secret
   - `NEXTAUTH_URL` → Your production domain (e.g., https://yourapp.vercel.app)

#### **For Other Platforms:**
- **Railway**: `railway variables set KEY=value`
- **Heroku**: `heroku config:set KEY=value`
- **Netlify**: Site settings → Environment variables

## 🔑 **Getting Google OAuth Credentials**

### **Step 1: Google Cloud Console Setup**

1. **Go to Google Cloud Console:**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create or Select Project:**
   - Click "Select a project" → "New Project"
   - Name: "Campus Confession App"
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Campus Confession App"

5. **Configure OAuth:**
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for development)
     - `https://your-domain.vercel.app` (for production)
   
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-domain.vercel.app/api/auth/callback/google` (for production)

6. **Copy Credentials:**
   - Copy "Client ID" and "Client Secret"
   - Add them to your `.env.local` file

### **Step 2: Update Your Environment Variables**

```env
# Add these to your .env.local
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret
```

## 🔒 **Security Best Practices**

### **1. Strong Secrets Generation**

Generate strong random secrets:

```bash
# Generate JWT_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NEXTAUTH_SECRET (32+ characters)  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **2. Environment Variable Validation**

Your app already includes validation. Here's how it works:

```typescript
// In your API routes, always validate environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not configured');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured');
}
```

### **3. Different Environments**

Use different credentials for different environments:

```env
# Development (.env.local)
DATABASE_URL=postgresql://localhost:5432/confessions_dev
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=dev-client-id.apps.googleusercontent.com

# Production (Vercel Environment Variables)
DATABASE_URL=postgresql://prod-host/confessions_prod
NEXTAUTH_URL=https://yourapp.vercel.app
GOOGLE_CLIENT_ID=prod-client-id.apps.googleusercontent.com
```

## 🚫 **What NOT to Commit**

### **Files to NEVER commit:**
- `.env.local` - Local environment variables
- `.env` - Environment variables
- `.env.production` - Production environment variables
- Any file containing real API keys or passwords

### **Your `.gitignore` already protects:**
```gitignore
# Environment variables
.env*.local
.env
.env.production
.env.development

# Firebase (if used)
firebase-service-account.json
firebase-key.json
firebase-config.json
```

## 🔍 **How to Check for Exposed Secrets**

### **1. Check Git History:**
```bash
# Search for potential secrets in git history
git log --all --full-history -- .env*
git log -p | grep -i "client_secret\|api_key\|password"
```

### **2. Use GitHub Secret Scanning:**
- GitHub automatically scans for exposed secrets
- You'll get alerts if secrets are detected
- Follow the remediation steps provided

### **3. Manual Code Review:**
```bash
# Search for hardcoded secrets in your code
grep -r "client_secret" --exclude-dir=node_modules .
grep -r "api_key" --exclude-dir=node_modules .
grep -r "password" --exclude-dir=node_modules .
```

## 🛠️ **Emergency: If You Accidentally Commit Secrets**

### **If you committed secrets to Git:**

1. **Immediately revoke the compromised credentials:**
   - Go to Google Cloud Console
   - Delete the compromised OAuth client
   - Create new credentials

2. **Remove from Git history:**
```bash
# Remove file from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to update remote
git push origin --force --all
```

3. **Update all environments with new credentials**

## ✅ **Verification Checklist**

Before deploying, verify:

- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] All environment variables set in production
- [ ] Different credentials for dev/prod environments
- [ ] Strong random secrets generated (32+ characters)
- [ ] Google OAuth URLs configured correctly
- [ ] Database connection string uses SSL
- [ ] No secrets in Git history

## 🔗 **Additional Security Resources**

### **Tools for Secret Management:**
- **GitHub Secrets**: For GitHub Actions
- **Vercel Environment Variables**: For Vercel deployments
- **HashiCorp Vault**: For enterprise secret management
- **AWS Secrets Manager**: For AWS deployments

### **Security Scanning Tools:**
- **GitLeaks**: Scan for secrets in Git repos
- **TruffleHog**: Find secrets in Git history
- **GitHub Advanced Security**: Automated secret scanning

## 📋 **Quick Reference**

### **Environment Variables You Need:**
```env
# Required for basic functionality
DATABASE_URL=postgresql://...
JWT_SECRET=32-character-random-string
NEXTAUTH_SECRET=32-character-random-string
NEXTAUTH_URL=your-domain-url

# Required for Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret

# Optional
ADMIN_EMAIL=admin@example.com
```

### **File Security Status:**
- ✅ `.env.example` - Safe to commit (no real values)
- ❌ `.env.local` - NEVER commit (contains real secrets)
- ❌ `.env` - NEVER commit (contains real secrets)
- ✅ Source code - Safe (uses process.env variables)

Remember: **When in doubt, don't commit it!** It's better to be safe than sorry with sensitive information.