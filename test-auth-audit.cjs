const http = require('http');

async function testWithAuth() {
  console.log('🔍 Testing Audit API with Authentication...\n');
  
  // Step 1: Login to get session cookies
  console.log('Step 1: Logging in...');
  const loginData = JSON.stringify({
    email: 'admin@test.mssp.local',
    password: 'testpassword123'
  });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  const loginResponse = await new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: data
      }));
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
  
  console.log(`Login Status: ${loginResponse.statusCode}`);
  if (loginResponse.statusCode !== 200) {
    console.log('Login failed:', loginResponse.body);
    return;
  }
  
  // Extract cookies
  const cookies = loginResponse.headers['set-cookie'] ? 
    loginResponse.headers['set-cookie'].join('; ') : '';
  console.log('Got cookies:', cookies ? 'Yes' : 'No');
  
  // Step 2: Test audit endpoints with session
  const endpoints = [
    '/api/audit/change-history?entityType=client&entityId=1',
    '/api/audit/logs?entityType=client&entityId=1',
    '/api/entities/client/1/relationships'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\nTesting ${endpoint}...`);
    
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({
          statusCode: res.statusCode,
          body: data
        }));
      });
      req.on('error', reject);
      req.end();
    });
    
    console.log(`  Status: ${response.statusCode}`);
    try {
      const jsonData = JSON.parse(response.body);
      console.log(`  Response: ${Array.isArray(jsonData) ? jsonData.length + ' items' : typeof jsonData}`);
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        console.log(`  Sample: ${JSON.stringify(jsonData[0], null, 2).substring(0, 200)}...`);
      } else if (jsonData.message) {
        console.log(`  Message: ${jsonData.message}`);
      }
    } catch (e) {
      console.log(`  Response (text): ${response.body.substring(0, 100)}...`);
    }
  }
}

testWithAuth().catch(console.error); 