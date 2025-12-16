// New API Key Verification Script
// Run with: node scripts/verify-new-api-key.js

console.log('🔐 Verifying New Google API Key Setup...\n');

// Check if environment variables are set
const requiredVars = {
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET
};

let allConfigured = true;

console.log('📋 Environment Variables Check:');
Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    const maskedValue = key.includes('SECRET') 
      ? `${value.substring(0, 10)}...` 
      : key.includes('CLIENT_ID')
      ? `${value.substring(0, 20)}...`
      : value;
    console.log(`✅ ${key}: ${maskedValue}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allConfigured = false;
  }
});

// Validate new credentials format
console.log('\n🔍 Credential Format Validation:');

const clientId = process.env.GOOGLE_CLIENT_ID;
if (clientId) {
  if (clientId.endsWith('.apps.googleusercontent.com')) {
    console.log('✅ GOOGLE_CLIENT_ID: Valid format');
    
    // Check if it's different from the exposed one
    if (clientId.includes('695407510178-0lm226ahteuc1o20t9m54tpbtbcfi22c')) {
      console.log('🚨 WARNING: This appears to be the OLD exposed Client ID!');
      console.log('   You MUST generate a NEW Client ID in Google Cloud Console');
      allConfigured = false;
    } else {
      console.log('✅ GOOGLE_CLIENT_ID: Appears to be new (different from exposed one)');
    }
  } else {
    console.log('❌ GOOGLE_CLIENT_ID: Invalid format');
    allConfigured = false;
  }
}

const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (clientSecret) {
  if (clientSecret.startsWith('GOCSPX-')) {
    console.log('✅ GOOGLE_CLIENT_SECRET: Valid format');
  } else {
    console.log('❌ GOOGLE_CLIENT_SECRET: Invalid format (should start with GOCSPX-)');
    allConfigured = false;
  }
}

// Check NextAuth URL configuration
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  console.log(`✅ NEXTAUTH_URL: ${nextAuthUrl}`);
  
  console.log('\n🌐 Required OAuth Redirect URIs:');
  console.log(`   ${nextAuthUrl}/api/auth/callback/google`);
  console.log('   ⚠️  Make sure this is configured in Google Cloud Console!');
}

// Security checklist
console.log('\n🔒 Security Checklist:');
console.log('□ Old OAuth client DELETED from Google Cloud Console');
console.log('□ New OAuth client created with API restrictions');
console.log('□ Only Google+ API and People API enabled');
console.log('□ Redirect URIs configured correctly');
console.log('□ New credentials added to .env.local');
console.log('□ New credentials added to production environment');
console.log('□ Google sign-in tested and working');

// API restrictions check
console.log('\n🎯 Required API Restrictions:');
console.log('✅ Google+ API - ENABLED');
console.log('✅ People API - ENABLED (recommended)');
console.log('❌ All other APIs - DISABLED');

// Environment-specific instructions
console.log('\n📋 Next Steps:');

if (!allConfigured) {
  console.log('❌ Configuration incomplete! Please:');
  console.log('1. Generate NEW OAuth credentials in Google Cloud Console');
  console.log('2. Add them to your .env.local file');
  console.log('3. Update production environment variables');
  console.log('4. DELETE the old OAuth client from Google Cloud Console');
} else {
  console.log('✅ Configuration looks good! Now:');
  console.log('1. Test Google sign-in locally: npm run dev');
  console.log('2. Test Google sign-in in production');
  console.log('3. DELETE the old OAuth client from Google Cloud Console');
  console.log('4. Monitor for any issues');
}

// Production deployment check
if (process.env.NODE_ENV === 'production') {
  console.log('\n🚀 Production Environment Detected');
  console.log('✅ Make sure these are set in your deployment platform:');
  console.log('   - Vercel: Project Settings → Environment Variables');
  console.log('   - Railway: railway variables set KEY=value');
  console.log('   - Heroku: heroku config:set KEY=value');
}

// Final security reminder
console.log('\n🚨 CRITICAL SECURITY REMINDER:');
console.log('After verifying everything works:');
console.log('1. DELETE the old OAuth client from Google Cloud Console');
console.log('2. The old client ID was: 695407510178-0lm226ahteuc1o20t9m54tpbtbcfi22c');
console.log('3. This permanently revokes the compromised credentials');
console.log('4. Monitor GitHub security alerts for resolution');

console.log('\n📚 Documentation:');
console.log('- SECURITY_GUIDE.md - Complete security procedures');
console.log('- SECURITY_INCIDENT_RESOLVED.md - Incident details and resolution');

// Test connection (basic check)
console.log('\n🧪 Basic Configuration Test:');
if (allConfigured) {
  console.log('✅ All required environment variables are set');
  console.log('✅ Credential formats appear valid');
  console.log('🎯 Ready for testing Google OAuth functionality');
} else {
  console.log('❌ Configuration issues detected - see above for details');
}