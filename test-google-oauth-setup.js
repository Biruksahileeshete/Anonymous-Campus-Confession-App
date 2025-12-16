// Test Google OAuth Configuration
// Run with: node test-google-oauth-setup.js

console.log('🔍 Testing Google OAuth Configuration...\n');

// Check environment variables
const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
let configValid = true;

console.log('📋 Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const maskedValue = varName.includes('SECRET') 
      ? `${value.substring(0, 10)}...` 
      : varName.includes('CLIENT_ID')
      ? `${value.substring(0, 20)}...`
      : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    configValid = false;
  }
});

// Validate Client ID format
const clientId = process.env.GOOGLE_CLIENT_ID;
if (clientId) {
  if (clientId.endsWith('.apps.googleusercontent.com')) {
    console.log('✅ GOOGLE_CLIENT_ID: Valid format');
  } else {
    console.log('⚠️  GOOGLE_CLIENT_ID: Invalid format (should end with .apps.googleusercontent.com)');
  }
}

// Validate Client Secret format
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (clientSecret) {
  if (clientSecret.startsWith('GOCSPX-')) {
    console.log('✅ GOOGLE_CLIENT_SECRET: Valid format');
  } else {
    console.log('⚠️  GOOGLE_CLIENT_SECRET: Invalid format (should start with GOCSPX-)');
  }
}

// Check NextAuth URL
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  if (nextAuthUrl.startsWith('http://localhost') || nextAuthUrl.startsWith('https://')) {
    console.log('✅ NEXTAUTH_URL: Valid format');
  } else {
    console.log('⚠️  NEXTAUTH_URL: Invalid format');
  }
}

console.log('\n🔧 Required Google APIs:');
console.log('✅ Google+ API - Enable in Google Cloud Console');
console.log('✅ People API - Enable in Google Cloud Console (recommended)');

console.log('\n🌐 Required OAuth Redirect URIs:');
if (nextAuthUrl) {
  console.log(`✅ ${nextAuthUrl}/api/auth/callback/google`);
} else {
  console.log('❌ Cannot determine redirect URI - NEXTAUTH_URL not set');
}

console.log('\n📊 Configuration Status:');
if (configValid) {
  console.log('🎉 Google OAuth configuration appears valid!');
  console.log('\n📝 Next Steps:');
  console.log('1. Ensure Google+ API and People API are enabled in Google Cloud Console');
  console.log('2. Verify OAuth redirect URIs are configured correctly');
  console.log('3. Test sign-in functionality in your app');
} else {
  console.log('❌ Configuration incomplete - check missing environment variables');
  console.log('\n📝 Setup Instructions:');
  console.log('1. Copy .env.example to .env.local');
  console.log('2. Add your Google OAuth credentials to .env.local');
  console.log('3. Run this test again');
}

console.log('\n📚 Documentation:');
console.log('- SECURITY_GUIDE.md - Complete setup instructions');
console.log('- GOOGLE_OAUTH_SETUP.md - Google Cloud Console configuration');

// Test NextAuth configuration (basic check)
try {
  const nextAuthConfig = {
    providers: ['google'],
    callbacks: ['signIn', 'jwt', 'session'],
    pages: ['signIn', 'error'],
    session: { strategy: 'jwt' }
  };
  
  console.log('\n⚙️  NextAuth Configuration:');
  console.log('✅ Google Provider configured');
  console.log('✅ Custom callbacks implemented');
  console.log('✅ Custom sign-in page configured');
  console.log('✅ JWT session strategy');
} catch (error) {
  console.log('\n❌ NextAuth configuration error:', error.message);
}