const http = require('http');

async function testApiAuthorization() {
  console.log('🔍 Testing API Authorization for admin@mssp.local...\n');
  
  const hostname = 'localhost';
  const port = 5001;
  let cookies = '';

  // Helper function to make HTTP requests
  function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          // Capture cookies from Set-Cookie header
          if (res.headers['set-cookie']) {
            cookies = res.headers['set-cookie'].join('; ');
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
            cookies
          });
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

  try {
    // Step 1: Login as admin@mssp.local
    console.log('1. 🔑 Logging in as admin@mssp.local...');
    const loginResponse = await makeRequest('POST', '/api/login', {
      email: 'admin@mssp.local',
      password: 'testpassword123'
    });
    
    console.log(`   Status: ${loginResponse.statusCode}`);
    if (loginResponse.statusCode === 200) {
      console.log('   ✅ Login successful');
      console.log(`   🍪 Cookies: ${loginResponse.cookies}`);
    } else {
      console.log('   ❌ Login failed');
      console.log(`   Response: ${loginResponse.body}`);
      return;
    }

    // Step 2: Check user info
    console.log('\n2. 👤 Checking user info...');
    const userResponse = await makeRequest('GET', '/api/user');
    console.log(`   Status: ${userResponse.statusCode}`);
    if (userResponse.statusCode === 200) {
      const user = JSON.parse(userResponse.body);
      console.log('   ✅ User info retrieved');
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👑 Role: ${user.role}`);
      console.log(`   🔓 Active: ${user.isActive}`);
    } else {
      console.log('   ❌ Failed to get user info');
      console.log(`   Response: ${userResponse.body}`);
    }

    // Step 3: Test basic authenticated endpoint
    console.log('\n3. 🏢 Testing clients endpoint (requireAuth)...');
    const clientsResponse = await makeRequest('GET', '/api/clients');
    console.log(`   Status: ${clientsResponse.statusCode}`);
    if (clientsResponse.statusCode === 200) {
      const clients = JSON.parse(clientsResponse.body);
      console.log(`   ✅ Clients retrieved (${clients.length} clients)`);
    } else {
      console.log('   ❌ Failed to get clients');
      console.log(`   Response: ${clientsResponse.body.substring(0, 200)}`);
    }

    // Step 4: Test admin-only endpoint
    console.log('\n4. 👑 Testing users endpoint (requireAdmin)...');
    const usersResponse = await makeRequest('GET', '/api/users');
    console.log(`   Status: ${usersResponse.statusCode}`);
    if (usersResponse.statusCode === 200) {
      const users = JSON.parse(usersResponse.body);
      console.log(`   ✅ Users retrieved (${users.length} users)`);
    } else {
      console.log('   ❌ Failed to get users');
      console.log(`   Response: ${usersResponse.body.substring(0, 200)}`);
    }

    // Step 5: Test specific problematic endpoint
    console.log('\n5. 📊 Testing dashboard endpoint...');
    const dashboardResponse = await makeRequest('GET', '/api/dashboard');
    console.log(`   Status: ${dashboardResponse.statusCode}`);
    if (dashboardResponse.statusCode === 200) {
      console.log('   ✅ Dashboard data retrieved');
    } else {
      console.log('   ❌ Failed to get dashboard');
      console.log(`   Response: ${dashboardResponse.body.substring(0, 200)}`);
    }

    // Step 6: Test audit logs (admin only)
    console.log('\n6. 🔍 Testing audit logs endpoint (requireAdmin)...');
    const auditResponse = await makeRequest('GET', '/api/audit-logs');
    console.log(`   Status: ${auditResponse.statusCode}`);
    if (auditResponse.statusCode === 200) {
      const auditLogs = JSON.parse(auditResponse.body);
      console.log(`   ✅ Audit logs retrieved (${auditLogs.length} entries)`);
    } else {
      console.log('   ❌ Failed to get audit logs');
      console.log(`   Response: ${auditResponse.body.substring(0, 200)}`);
    }

    console.log('\n📊 Summary:');
    console.log('- Login appears to be working correctly');
    console.log('- Check which specific endpoints are returning unauthorized');
    console.log('- Verify session persistence across requests');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApiAuthorization(); 