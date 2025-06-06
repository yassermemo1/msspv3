const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function debugErrors() {
  // First login
  const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
    email: 'admin@mssp.local',
    password: 'SecureTestPass123!'
  }, { validateStatus: null });
  
  const cookies = loginResponse.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
  
  console.log('🔍 Debugging specific endpoint errors:\n');
  
  // Test each failing endpoint
  const failingEndpoints = [
    '/api/user/2fa/status',
    '/api/dashboard/widgets',
    '/api/company-settings',
    '/api/service-authorization-forms',
    '/api/team-assignments'
  ];
  
  for (const endpoint of failingEndpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { Cookie: cookies },
        validateStatus: null
      });
      
      console.log(`\n📍 ${endpoint}`);
      console.log(`   Status: ${response.status}`);
      if (response.status !== 200) {
        console.log(`   Error: ${JSON.stringify(response.data, null, 2)}`);
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (error) {
      console.log(`\n📍 ${endpoint}`);
      console.log(`   ❌ Request failed: ${error.message}`);
    }
  }
}

debugErrors().catch(console.error); 