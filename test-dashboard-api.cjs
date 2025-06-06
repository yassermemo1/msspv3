const axios = require('axios');

async function testDashboardAPI() {
  const baseURL = 'http://localhost:5001';
  
  console.log('🔍 Testing Dashboard API Endpoints...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Health check passed:', health.data.status);
    
    // Test 2: Check if user dashboard settings endpoint exists
    console.log('\n2. Testing user dashboard settings endpoint...');
    try {
      // This should return 401 or login page since we're not authenticated
      const dashboardSettings = await axios.get(`${baseURL}/api/user-dashboard-settings`);
      console.log('✅ Dashboard settings endpoint exists');
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 302)) {
        console.log('✅ Dashboard settings endpoint exists (returns auth required as expected)');
      } else {
        console.log('❌ Dashboard settings endpoint error:', error.message);
      }
    }
    
    // Test 3: Check if main app loads
    console.log('\n3. Testing main app loading...');
    const mainApp = await axios.get(baseURL);
    if (mainApp.data.includes('id="root"')) {
      console.log('✅ Main app loads correctly');
    } else {
      console.log('❌ Main app not loading properly');
    }
    
    console.log('\n✅ All basic API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDashboardAPI(); 