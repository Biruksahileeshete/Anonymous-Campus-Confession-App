#!/usr/bin/env node

// Quick script to clear rate limits during development

async function clearRateLimits() {
  try {
    console.log('🧹 Clearing rate limits...');
    
    const response = await fetch('http://localhost:3002/api/dev/clear-rate-limit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅', result.message);
    } else {
      console.log('❌ Failed to clear rate limits');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('💡 Make sure the development server is running on port 3002');
  }
}

clearRateLimits();