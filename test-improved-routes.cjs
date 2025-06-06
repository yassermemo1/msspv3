#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function loginAndGetSession() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@mssp.local',
      password: 'testpassword123'
    });
    
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      throw new Error('No session cookie received');
    }
    
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='));
    console.log('✅ Login successful');
    return sessionCookie;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testEndpoint(sessionCookie, endpoint, description) {
  try {
    console.log(`\n📡 Testing ${description}: ${endpoint}`);
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    console.log(`✅ ${description} - Success: ${response.status}`);
    console.log(`   📊 Response data length: ${JSON.stringify(response.data).length} characters`);
    
    if (Array.isArray(response.data)) {
      console.log(`   📋 Array with ${response.data.length} items`);
    }
    
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.response?.status || 'No response'}`);
    if (error.response?.data) {
      console.log(`   📝 Error details:`, error.response.data);
    } else {
      console.log(`   📝 Error message:`, error.message);
    }
  }
}

async function runTests() {
  try {
    const sessionCookie = await loginAndGetSession();
    
    // Test the improved endpoints
    await testEndpoint(sessionCookie, '/api/clients/1/team-assignments', 'Client Team Assignments');
    await testEndpoint(sessionCookie, '/api/clients/2/team-assignments', 'Client Team Assignments (ID: 2)');
    await testEndpoint(sessionCookie, '/api/clients/999/team-assignments', 'Client Team Assignments (Non-existent client)');
    await testEndpoint(sessionCookie, '/api/clients/invalid/team-assignments', 'Client Team Assignments (Invalid ID)');
    
    await testEndpoint(sessionCookie, '/api/contracts/1/service-scopes', 'Contract Service Scopes');
    await testEndpoint(sessionCookie, '/api/contracts/2/service-scopes', 'Contract Service Scopes (ID: 2)');
    await testEndpoint(sessionCookie, '/api/contracts/999/service-scopes', 'Contract Service Scopes (Non-existent contract)');
    await testEndpoint(sessionCookie, '/api/contracts/invalid/service-scopes', 'Contract Service Scopes (Invalid ID)');
    
    await testEndpoint(sessionCookie, '/api/clients/1/hardware', 'Client Hardware Assignments');
    await testEndpoint(sessionCookie, '/api/clients/2/hardware', 'Client Hardware Assignments (ID: 2)');
    await testEndpoint(sessionCookie, '/api/clients/999/hardware', 'Client Hardware Assignments (Non-existent client)');
    await testEndpoint(sessionCookie, '/api/clients/invalid/hardware', 'Client Hardware Assignments (Invalid ID)');
    
    console.log('\n🎉 Testing completed!');
    
  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
  }
}

runTests(); 