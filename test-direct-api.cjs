#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testDirectAPI() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
      email: 'admin@mssp.local',
      password: 'testpassword123'
    });
    
    const cookies = loginResponse.headers['set-cookie'];
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='));
    console.log('✅ Login successful');
    
    // Test team assignments with full error details
    console.log('\n📡 Testing team assignments endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/api/clients/2/team-assignments`, {
        headers: { 'Cookie': sessionCookie }
      });
      console.log('✅ Team assignments success:', response.data);
    } catch (error) {
      console.log('❌ Team assignments error status:', error.response?.status);
      console.log('❌ Team assignments error data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test service scopes with full error details
    console.log('\n📡 Testing service scopes endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/api/contracts/2/service-scopes`, {
        headers: { 'Cookie': sessionCookie }
      });
      console.log('✅ Service scopes success:', response.data);
    } catch (error) {
      console.log('❌ Service scopes error status:', error.response?.status);
      console.log('❌ Service scopes error data:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testDirectAPI(); 