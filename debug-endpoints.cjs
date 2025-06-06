#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function loginAndGetSession() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
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

async function testBasicEndpoints(sessionCookie) {
  try {
    console.log('\n🔍 Testing basic database connectivity...');
    
    // Test clients endpoint
    console.log('📡 Testing /api/clients...');
    const clientsResponse = await axios.get(`${BASE_URL}/api/clients`, {
      headers: { 'Cookie': sessionCookie }
    });
    console.log(`✅ Clients: ${clientsResponse.data.length} clients found`);
    
    // Test contracts endpoint
    console.log('📡 Testing /api/contracts...');
    const contractsResponse = await axios.get(`${BASE_URL}/api/contracts`, {
      headers: { 'Cookie': sessionCookie }
    });
    console.log(`✅ Contracts: ${contractsResponse.data.length} contracts found`);
    
    // Test services endpoint  
    console.log('📡 Testing /api/services...');
    const servicesResponse = await axios.get(`${BASE_URL}/api/services`, {
      headers: { 'Cookie': sessionCookie }
    });
    console.log(`✅ Services: ${servicesResponse.data.length} services found`);
    
    return {
      clients: clientsResponse.data,
      contracts: contractsResponse.data,
      services: servicesResponse.data
    };
    
  } catch (error) {
    console.error('❌ Basic connectivity test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testProblematicEndpoints(sessionCookie, data) {
  console.log('\n🔍 Testing problematic endpoints...');
  
  if (data.clients.length > 0) {
    const firstClientId = data.clients[0].id;
    console.log(`📡 Testing team assignments for client ${firstClientId}...`);
    
    try {
      const response = await axios.get(`${BASE_URL}/api/clients/${firstClientId}/team-assignments`, {
        headers: { 'Cookie': sessionCookie }
      });
      console.log(`✅ Team assignments: ${response.data.length} assignments found`);
    } catch (error) {
      console.error(`❌ Team assignments failed:`, error.response?.data || error.message);
      if (error.response?.status === 500 && error.response?.data?.details) {
        console.error('📝 Stack trace:', error.response.data.details);
      }
    }
  }
  
  if (data.contracts.length > 0) {
    const firstContractId = data.contracts[0].id;
    console.log(`📡 Testing service scopes for contract ${firstContractId}...`);
    
    try {
      const response = await axios.get(`${BASE_URL}/api/contracts/${firstContractId}/service-scopes`, {
        headers: { 'Cookie': sessionCookie }
      });
      console.log(`✅ Service scopes: ${response.data.length} scopes found`);
    } catch (error) {
      console.error(`❌ Service scopes failed:`, error.response?.data || error.message);
      if (error.response?.status === 500 && error.response?.data?.details) {
        console.error('📝 Stack trace:', error.response.data.details);
      }
    }
  }
}

async function main() {
  try {
    const sessionCookie = await loginAndGetSession();
    const data = await testBasicEndpoints(sessionCookie);
    await testProblematicEndpoints(sessionCookie, data);
    
    console.log('\n🎉 Debug session completed!');
  } catch (error) {
    console.error('💥 Debug session failed:', error.message);
  }
}

main(); 