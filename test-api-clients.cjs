const https = require('https');
const http = require('http');

// Test the clients API endpoint
async function testClientsAPI() {
  console.log('🔗 Testing Clients API...');
  
  // Test basic connection first
  try {
    const response = await fetch('http://localhost:3000/api/clients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add a dummy session cookie for testing
        'Cookie': 'session=test_session'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data.length ? `Found ${data.length} clients` : 'Empty response');
      console.log('📋 First client sample:', data[0] || 'No clients');
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
  } catch (error) {
    console.error('🚨 Connection Error:', error.message);
  }
}

testClientsAPI(); 