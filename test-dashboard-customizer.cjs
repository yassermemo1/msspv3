// Test script for Dashboard Customizer functionality
// Run with: node test-dashboard-customizer.js

const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5001';
const TEST_SESSION = 's%3A-DBMAyxoT97GAVs4S5ogyAcU4j7q4E7q.ZUqW%2F5Sz%2FRk1nYOx%2Fyx0hKNf80N8CgF0J%2FDLYkqm5YA';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${TEST_SESSION}`,
        'User-Agent': 'Dashboard-Test/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testDashboardEndpoints() {
  console.log('🧪 Testing Dashboard Customizer Functionality...\n');

  try {
    // Test 1: Get user dashboard settings
    console.log('📊 Test 1: Get User Dashboard Settings');
    const dashboardResponse = await makeRequest('/api/user-dashboard-settings');
    console.log(`Status: ${dashboardResponse.statusCode}`);
    if (dashboardResponse.statusCode === 200) {
      console.log('✅ Dashboard settings retrieved successfully');
      console.log(`   Cards found: ${Array.isArray(dashboardResponse.data) ? dashboardResponse.data.length : 'N/A'}`);
    } else {
      console.log('❌ Failed to get dashboard settings');
      console.log(`   Response: ${JSON.stringify(dashboardResponse.data, null, 2)}`);
    }
    console.log('');

    // Test 2: Test external systems endpoint
    console.log('🔌 Test 2: External Systems Endpoint');
    const externalResponse = await makeRequest('/api/external-systems');
    console.log(`Status: ${externalResponse.statusCode}`);
    if (externalResponse.statusCode === 200) {
      console.log('✅ External systems endpoint working');
      console.log(`   Systems found: ${Array.isArray(externalResponse.data) ? externalResponse.data.length : 'N/A'}`);
    } else {
      console.log('❌ External systems endpoint failed');
      console.log(`   Response: ${JSON.stringify(externalResponse.data, null, 2)}`);
    }
    console.log('');

    // Test 3: Test data sources endpoint
    console.log('📡 Test 3: Data Sources Endpoint');
    const dataSourcesResponse = await makeRequest('/api/data-sources');
    console.log(`Status: ${dataSourcesResponse.statusCode}`);
    if (dataSourcesResponse.statusCode === 200) {
      console.log('✅ Data sources endpoint working');
      console.log(`   Sources found: ${Array.isArray(dataSourcesResponse.data) ? dataSourcesResponse.data.length : 'N/A'}`);
    } else {
      console.log('❌ Data sources endpoint failed');
      console.log(`   Response: ${JSON.stringify(dataSourcesResponse.data, null, 2)}`);
    }
    console.log('');

    // Test 4: Test external data integration endpoint
    console.log('🔗 Test 4: External Data Integration');
    const externalDataResponse = await makeRequest('/api/integration-engine/external-data?action=list-sources');
    console.log(`Status: ${externalDataResponse.statusCode}`);
    if (externalDataResponse.statusCode === 200) {
      console.log('✅ External data integration working');
    } else {
      console.log('❌ External data integration failed');
      console.log(`   Response: ${JSON.stringify(externalDataResponse.data, null, 2)}`);
    }
    console.log('');

    // Test 5: Test saving dashboard settings (POST)
    console.log('💾 Test 5: Save Dashboard Settings');
    const testCards = [
      {
        id: 'test-card-1',
        title: 'Test Card',
        type: 'metric',
        category: 'dashboard',
        dataSource: 'clients',
        size: 'small',
        visible: true,
        position: 0,
        config: {
          icon: 'Building',
          color: 'blue',
          format: 'number',
          aggregation: 'count'
        },
        isBuiltIn: false,
        isRemovable: true
      }
    ];

    const saveResponse = await makeRequest('/api/user-dashboard-settings', 'POST', { cards: testCards });
    console.log(`Status: ${saveResponse.statusCode}`);
    if (saveResponse.statusCode === 200) {
      console.log('✅ Dashboard settings saved successfully');
    } else {
      console.log('❌ Failed to save dashboard settings');
      console.log(`   Response: ${JSON.stringify(saveResponse.data, null, 2)}`);
    }
    console.log('');

    console.log('🏁 Dashboard Customizer Tests Complete!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run tests
testDashboardEndpoints(); 