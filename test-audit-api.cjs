const http = require('http');

async function testAuditAPI() {
  console.log('🔍 Testing Audit API Endpoints...\n');
  
  const endpoints = [
    '/api/audit-logs',
    '/api/security-events', 
    '/api/data-access-logs',
    '/api/change-history'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      
      const options = {
        hostname: 'localhost',
        port: 5001,
        path: endpoint,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data
            });
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.end();
      });
      
      console.log(`  Status: ${response.statusCode}`);
      
      if (response.statusCode === 401) {
        console.log('  ❌ Unauthorized - User not logged in');
      } else if (response.statusCode === 403) {
        console.log('  ❌ Forbidden - User not admin');
      } else if (response.statusCode === 200) {
        try {
          const data = JSON.parse(response.body);
          console.log(`  ✅ Success - ${Array.isArray(data) ? data.length : 'N/A'} records`);
          if (Array.isArray(data) && data.length > 0) {
            console.log(`  📄 Sample record keys: ${Object.keys(data[0]).join(', ')}`);
          }
        } catch (parseError) {
          console.log('  ⚠️  Success but invalid JSON response');
        }
      } else {
        console.log(`  ❌ Error: ${response.statusCode}`);
        console.log(`  Response: ${response.body.substring(0, 200)}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('📊 Summary:');
  console.log('- All audit endpoints require admin authentication');
  console.log('- If you see 401/403 errors, the user needs to:');
  console.log('  1. Log in to the application');
  console.log('  2. Have admin role privileges');
  console.log('- If you see 200 responses, the audit system is working correctly');
}

testAuditAPI(); 