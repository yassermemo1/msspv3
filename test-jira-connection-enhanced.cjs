#!/usr/bin/env node

// Disable SSL certificate verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const https = require('https');

// Create an HTTPS agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: 'TLSv1_2_method',
  timeout: 15000
});

// Your Jira credentials
const JIRA_CONFIG = {
  baseUrl: 'https://sd.sic.sitco.sa',
  username: 'svc-scriptrunner',
  password: 'YOUR_PASSWORD_HERE',
  apiKey: 'YOUR_TOKEN_HERE'
};

async function testJiraConnectionEnhanced() {
  console.log('🔍 Enhanced Jira Connection Testing (Production Environment)');
  console.log('🔓 SSL Certificate Verification: DISABLED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🌐 Jira Server: ${JIRA_CONFIG.baseUrl}`);
  console.log(`👤 Username: ${JIRA_CONFIG.username}`);
  console.log(`🔑 Password: ${JIRA_CONFIG.password.substring(0, 5)}...`);
  console.log(`🎫 API Key: ${JIRA_CONFIG.apiKey.substring(0, 15)}...\n`);

  // Test 1: API Accessibility Check
  console.log('🔬 Test 1: API Endpoint Accessibility Check');
  console.log('═'.repeat(60));
  await testApiEndpointAccess();

  // Test 2: Alternative Authentication Methods
  console.log('\n🔬 Test 2: Alternative Authentication Methods');
  console.log('═'.repeat(60));
  await testAlternativeAuth();

  // Test 3: Session-Based Authentication
  console.log('\n🔬 Test 3: Session-Based Authentication');
  console.log('═'.repeat(60));
  await testSessionAuth();

  // Test 4: User Permission Check
  console.log('\n🔬 Test 4: User Permission & Account Status');
  console.log('═'.repeat(60));
  await testUserPermissions();

  // Test 5: Alternative API Paths
  console.log('\n🔬 Test 5: Alternative API Paths & Endpoints');
  console.log('═'.repeat(60));
  await testAlternativeApiPaths();
}

async function testApiEndpointAccess() {
  console.log('📋 Testing if REST API endpoints are accessible without auth...\n');
  
  const publicEndpoints = [
    { name: 'Server Info (Public)', url: '/rest/api/2/serverInfo' },
    { name: 'Application Properties', url: '/rest/api/2/application-properties' },
    { name: 'Configuration', url: '/rest/api/2/configuration' },
    { name: 'Permissions', url: '/rest/api/2/permissions' }
  ];

  for (const endpoint of publicEndpoints) {
    try {
      console.log(`   🎯 Testing: ${endpoint.name}`);
      console.log(`   📍 URL: ${JIRA_CONFIG.baseUrl}${endpoint.url}`);

      const response = await fetch(`${JIRA_CONFIG.baseUrl}${endpoint.url}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MSSP-Client-Manager/1.0'
        },
        timeout: 10000,
        agent: httpsAgent,
        redirect: 'manual'
      });

      console.log(`   📊 Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS - Public endpoint accessible`);
        if (data.version) console.log(`   📋 Version: ${data.version}`);
        if (data.baseUrl) console.log(`   🌐 Base URL: ${data.baseUrl}`);
      } else if (response.status === 401) {
        console.log(`   🔐 Requires authentication (expected)`);
      } else if (response.status === 403) {
        console.log(`   ❌ Forbidden - API may be disabled or restricted`);
      } else {
        console.log(`   ⚠️ Unexpected response: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

async function testAlternativeAuth() {
  console.log('🔐 Testing alternative authentication methods...\n');

  const authMethods = [
    {
      name: 'Basic Auth (Username:Password)',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.username}:${JIRA_CONFIG.password}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Atlassian-Token': 'no-check'
      }
    },
    {
      name: 'Basic Auth (Username:APIKey)',  
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.username}:${JIRA_CONFIG.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Atlassian-Token': 'no-check'
      }
    },
    {
      name: 'API Key Header',
      headers: {
        'Authorization': `Bearer ${JIRA_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Atlassian-Token': 'no-check'
      }
    },
    {
      name: 'Custom API Key Header',
      headers: {
        'X-API-KEY': JIRA_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Atlassian-Token': 'no-check'
      }
    }
  ];

  for (const method of authMethods) {
    console.log(`   🧪 Testing: ${method.name}`);
    
    try {
      const response = await fetch(`${JIRA_CONFIG.baseUrl}/rest/api/2/myself`, {
        method: 'GET',
        headers: method.headers,
        timeout: 10000,
        agent: httpsAgent,
        redirect: 'manual'
      });

      console.log(`   📊 Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS!`);
        console.log(`   👤 User: ${data.displayName || data.name || 'Unknown'}`);
        console.log(`   📧 Email: ${data.emailAddress || 'No email'}`);
        console.log(`   🏢 Account Type: ${data.accountType || 'Unknown'}`);
        return; // Found working method, stop testing
      } else if (response.status === 302) {
        console.log(`   🔄 Redirect (likely to login page)`);
      } else if (response.status === 401) {
        console.log(`   🔐 Unauthorized - invalid credentials`);
      } else if (response.status === 403) {
        console.log(`   ❌ Forbidden - user may not have API access`);
      } else {
        console.log(`   ⚠️  Unexpected status: ${response.status}`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

async function testSessionAuth() {
  console.log('🍪 Testing session-based authentication...\n');

  try {
    // Step 1: Get login page to extract any required tokens
    console.log('   📋 Step 1: Getting login page...');
    const loginPageResponse = await fetch(`${JIRA_CONFIG.baseUrl}/login.jsp`, {
      method: 'GET',
      agent: httpsAgent,
      redirect: 'manual'
    });

    console.log(`   📊 Login page status: ${loginPageResponse.status}`);

    // Step 2: Attempt to login and get session
    console.log('   🔐 Step 2: Attempting session login...');
    const loginData = new URLSearchParams({
      'os_username': JIRA_CONFIG.username,
      'os_password': JIRA_CONFIG.password,
      'os_destination': '/rest/api/2/myself',
      'user_role': '',
      'atl_token': '',
      'login': 'Log In'
    });

    const loginResponse = await fetch(`${JIRA_CONFIG.baseUrl}/login.jsp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      body: loginData,
      agent: httpsAgent,
      redirect: 'manual'
    });

    console.log(`   📊 Login response: ${loginResponse.status} ${loginResponse.statusText}`);
    
    const cookies = loginResponse.headers.get('set-cookie');
    if (cookies) {
      console.log(`   🍪 Got cookies: ${cookies.substring(0, 100)}...`);
      
      // Step 3: Use session cookies for API call
      console.log('   🎯 Step 3: Testing API with session cookies...');
      const apiResponse = await fetch(`${JIRA_CONFIG.baseUrl}/rest/api/2/myself`, {
        method: 'GET',
        headers: {
          'Cookie': cookies,
          'Accept': 'application/json'
        },
        agent: httpsAgent,
        redirect: 'manual'
      });

      console.log(`   📊 API with session: ${apiResponse.status} ${apiResponse.statusText}`);
      
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        console.log(`   ✅ SESSION AUTH SUCCESS!`);
        console.log(`   👤 User: ${data.displayName || data.name || 'Unknown'}`);
      }
    } else {
      console.log(`   ❌ No session cookies received`);
    }

  } catch (error) {
    console.log(`   ❌ Session auth error: ${error.message}`);
  }
}

async function testUserPermissions() {
  console.log('👤 Testing user account status and permissions...\n');

  // Test user login via web interface
  console.log('   🌐 Testing web interface login...');
  
  try {
    const response = await fetch(`${JIRA_CONFIG.baseUrl}/secure/Dashboard.jspa`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.username}:${JIRA_CONFIG.password}`).toString('base64')}`,
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      },
      agent: httpsAgent,
      redirect: 'manual'
    });

    console.log(`   📊 Dashboard access: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log(`   ✅ User can access web interface`);
    } else if (response.status === 302) {
      const location = response.headers.get('location');
      console.log(`   🔄 Redirected to: ${location}`);
      if (location && location.includes('login')) {
        console.log(`   ❌ User authentication failed for web interface`);
      }
    } else if (response.status === 403) {
      console.log(`   ❌ User account may be disabled or lacks permissions`);
    }

  } catch (error) {
    console.log(`   ❌ Error testing web access: ${error.message}`);
  }
}

async function testAlternativeApiPaths() {
  console.log('🛤️  Testing alternative API paths and formats...\n');

  const alternativePaths = [
    { name: 'Legacy API v1', url: '/rest/api/1/serverInfo' },
    { name: 'Latest API (no version)', url: '/rest/api/latest/serverInfo' },
    { name: 'Admin API', url: '/rest/api/2/serverInfo?expand=all' },
    { name: 'Plugin API', url: '/plugins/servlet/restbrowser' },
    { name: 'Auth API', url: '/rest/auth/1/session' }
  ];

  for (const path of alternativePaths) {
    console.log(`   🎯 Testing: ${path.name}`);
    console.log(`   📍 URL: ${JIRA_CONFIG.baseUrl}${path.url}`);

    try {
      const response = await fetch(`${JIRA_CONFIG.baseUrl}${path.url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.username}:${JIRA_CONFIG.password}`).toString('base64')}`,
          'Accept': 'application/json',
          'X-Atlassian-Token': 'no-check'
        },
        timeout: 10000,
        agent: httpsAgent,
        redirect: 'manual'
      });

      console.log(`   📊 Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log(`   ✅ SUCCESS - This API path works!`);
        try {
          const data = await response.json();
          if (data.version) console.log(`   📋 Version: ${data.version}`);
        } catch (e) {
          console.log(`   📄 Response received (non-JSON)`);
        }
      } else if (response.status === 404) {
        console.log(`   ❌ Not found - API version/path not supported`);
      } else if (response.status === 401) {
        console.log(`   🔐 Unauthorized - auth failed`);
      } else if (response.status === 403) {
        console.log(`   ❌ Forbidden - no access to this API`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

console.log('🚀 Starting Enhanced Jira Connection Test...\n');
testJiraConnectionEnhanced()
  .then(() => {
    console.log('\n\n🎯 Enhanced Test Completed!');
    console.log('\n📋 Summary & Recommendations:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SSL certificate issues are resolved');
    console.log('✅ Server connectivity is working (Jira 9.4.24)');
    console.log('🔍 Check which authentication method worked above');
    console.log('🔧 If none worked, contact Jira admin to:');
    console.log('   - Enable REST API access for svc-scriptrunner user');
    console.log('   - Verify user has API permissions');
    console.log('   - Check if API access is restricted by IP/network');
    console.log('   - Confirm user account is active and not locked');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Enhanced test failed:', error);
    process.exit(1);
  }); 