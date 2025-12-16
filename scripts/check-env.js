// Environment Variables Checker
// Run with: node scripts/check-env.js

console.log('🔍 Checking Environment Variables...\n');

// Required environment variables
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET', 
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

// Optional environment variables (for Google OAuth)
const optionalVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'ADMIN_EMAIL'
];

let allGood = true;
let warnings = [];

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values for display
    const maskedValue = varName.includes('SECRET') || varName.includes('URL') 
      ? `${value.substring(0, 10)}...` 
      : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allGood = false;
  }
});

console.log('\n🔧 Optional Variables (for Google OAuth):');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const maskedValue = varName.includes('SECRET') || varName.includes('CLIENT_ID')
      ? `${value.substring(0, 15)}...`
      : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (Google OAuth will not work)`);
    warnings.push(`${varName} is not set - Google OAuth will be disabled`);
  }
});

// Security checks
console.log('\n🔒 Security Checks:');

// Check JWT_SECRET length
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length >= 32) {
    console.log('✅ JWT_SECRET: Sufficient length (32+ characters)');
  } else {
    console.log('⚠️  JWT_SECRET: Too short (should be 32+ characters)');
    warnings.push('JWT_SECRET should be at least 32 characters long');
  }
} else {
  console.log('❌ JWT_SECRET: Not set');
}

// Check NEXTAUTH_SECRET length
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (nextAuthSecret) {
  if (nextAuthSecret.length >= 32) {
    console.log('✅ NEXTAUTH_SECRET: Sufficient length (32+ characters)');
  } else {
    console.log('⚠️  NEXTAUTH_SECRET: Too short (should be 32+ characters)');
    warnings.push('NEXTAUTH_SECRET should be at least 32 characters long');
  }
} else {
  console.log('❌ NEXTAUTH_SECRET: Not set');
}

// Check DATABASE_URL format
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  if (dbUrl.startsWith('postgresql://') && dbUrl.includes('sslmode=require')) {
    console.log('✅ DATABASE_URL: Proper PostgreSQL format with SSL');
  } else if (dbUrl.startsWith('postgresql://')) {
    console.log('⚠️  DATABASE_URL: PostgreSQL format but missing SSL mode');
    warnings.push('DATABASE_URL should include sslmode=require for security');
  } else {
    console.log('⚠️  DATABASE_URL: Unexpected format');
    warnings.push('DATABASE_URL should be a PostgreSQL connection string');
  }
}

// Check NEXTAUTH_URL format
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  if (nextAuthUrl.startsWith('http://localhost') || nextAuthUrl.startsWith('https://')) {
    console.log('✅ NEXTAUTH_URL: Valid URL format');
  } else {
    console.log('⚠️  NEXTAUTH_URL: Invalid URL format');
    warnings.push('NEXTAUTH_URL should start with http:// or https://');
  }
}

// Summary
console.log('\n📊 Summary:');
if (allGood && warnings.length === 0) {
  console.log('🎉 All environment variables are properly configured!');
} else if (allGood) {
  console.log('✅ Required variables are set, but there are some warnings:');
  warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('\n📝 Next Steps:');
  console.log('1. Copy .env.example to .env.local: cp .env.example .env.local');
  console.log('2. Edit .env.local with your actual values');
  console.log('3. Run this script again to verify: node scripts/check-env.js');
}

console.log('\n📚 For detailed setup instructions, see:');
console.log('   - SECURITY_GUIDE.md (API key security)');
console.log('   - GOOGLE_OAUTH_SETUP.md (Google OAuth setup)');
console.log('   - README.md (general setup)');

// Environment-specific advice
if (process.env.NODE_ENV === 'production') {
  console.log('\n🚀 Production Environment Detected');
  console.log('   Make sure all variables are set in your deployment platform');
  console.log('   (Vercel, Railway, Heroku, etc.)');
} else {
  console.log('\n🛠️  Development Environment');
  console.log('   Make sure .env.local exists and contains your development values');
}