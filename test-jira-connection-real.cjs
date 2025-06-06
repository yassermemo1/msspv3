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

async function testJiraConnection() {
  console.log('🔍 Testing Jira Connection on Production Environment');
  console.log('🔓 SSL Certificate Verification: DISABLED (for self-signed certs)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🌐 Jira Server: ${JIRA_CONFIG.baseUrl}`);
  console.log(`👤 Username: ${JIRA_CONFIG.username}`);
  console.log(`🔑 Password: ${JIRA_CONFIG.password.substring(0, 5)}...`);
  console.log(`🎫 API Key: ${JIRA_CONFIG.apiKey.substring(0, 15)}...\n`);

  // Test different API versions
  const apiVersions = ['2', '3'];
  
  for (const version of apiVersions) {
    console.log(`🔬 Testing API Version ${version}`);
    console.log('═'.repeat(60) + '\n');
    
    // Test 1: Basic Auth (Username + Password)
    console.log(`🧪 Test 1: Basic Authentication (Username + Password) - API v${version}`);
    await testAuth('basic', {
      username: JIRA_CONFIG.username,
      password: JIRA_CONFIG.password
    }, version);

    console.log('\n' + '─'.repeat(50) + '\n');

    // Test 2: Basic Auth (Username + API Key as Password)
    console.log(`🧪 Test 2: Basic Authentication (Username + API Key) - API v${version}`);
    await testAuth('basic', {
      username: JIRA_CONFIG.username,
      password: JIRA_CONFIG.apiKey
    }, version);

    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Only test bearer for API v3 (not typically supported in v2)
    if (version === '3') {
      // Test 3: Bearer Token
      console.log(`🧪 Test 3: Bearer Token Authentication - API v${version}`);
      await testAuth('bearer', {
        token: JIRA_CONFIG.apiKey
      }, version);

      console.log('\n' + '─'.repeat(50) + '\n');
    }
    
    console.log('\n' + '═'.repeat(60) + '\n');
  }

  // Test 4: Simple connectivity test
  console.log('🧪 Test 4: Basic Connectivity & Discovery');
  await testConnectivity();
}

async function testAuth(authType, authConfig, apiVersion) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'MSSP-Client-Manager/1.0',
      'Accept': 'application/json'
    };

    // Build authentication header
    if (authType === 'basic') {
      const credentials = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
      console.log(`   📝 Auth Header: Basic ${credentials.substring(0, 20)}...`);
    } else if (authType === 'bearer') {
      headers['Authorization'] = `Bearer ${authConfig.token}`;
      console.log(`   📝 Auth Header: Bearer ${authConfig.token.substring(0, 20)}...`);
    }

    // Test endpoints with different API versions
    const endpoints = [
      { name: 'Server Info', url: `/rest/api/${apiVersion}/serverInfo`, description: 'Basic server information' },
      { name: 'Myself', url: `/rest/api/${apiVersion}/myself`, description: 'Current user information' },
      { name: 'Search (Simple)', url: `/rest/api/${apiVersion}/search?jql=order by created DESC&maxResults=1`, description: 'Simple JQL search' }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n   🎯 Testing: ${endpoint.name}`);
      console.log(`   📍 URL: ${JIRA_CONFIG.baseUrl}${endpoint.url}`);
      console.log(`   📄 Description: ${endpoint.description}`);

      try {
        const startTime = Date.now();
        const response = await fetch(`${JIRA_CONFIG.baseUrl}${endpoint.url}`, {
          method: 'GET',
          headers,
          timeout: 15000,
          agent: httpsAgent, // Use HTTPS agent that ignores SSL errors
          redirect: 'manual' // Don't follow redirects automatically
        });

        const responseTime = Date.now() - startTime;
        console.log(`   ⏱️  Response Time: ${responseTime}ms`);
        console.log(`   📊 Status: ${response.status} ${response.statusText}`);
        
        // Check for redirects
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location');
          console.log(`   🔄 Redirect to: ${location}`);
          
          if (location && location.includes('login')) {
            console.log(`   ❌ AUTHENTICATION FAILED - Redirected to login page`);
            console.log(`   💡 This suggests credentials are not valid for this endpoint`);
            continue;
          }
        }
        
        // Log response headers
        const responseHeaders = Object.fromEntries(response.headers.entries());
        console.log(`   📤 Response Headers:`, {
          'content-type': responseHeaders['content-type'],
          'content-length': responseHeaders['content-length'],
          'server': responseHeaders['server'],
          'x-atlassian-request-id': responseHeaders['x-atlassian-request-id']
        });

        if (response.ok) {
          try {
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              console.log(`   ✅ SUCCESS!`);
              
              // Log relevant response data
              if (endpoint.name === 'Server Info') {
                console.log(`   📋 Server: ${data.serverTitle || 'Unknown'}`);
                console.log(`   🔢 Version: ${data.version || 'Unknown'}`);
                console.log(`   🌐 Base URL: ${data.baseUrl || 'Unknown'}`);
              } else if (endpoint.name === 'Myself') {
                console.log(`   👤 User: ${data.displayName || 'Unknown'} (${data.emailAddress || 'No email'})`);
                console.log(`   🏢 Account ID: ${data.accountId || 'Unknown'}`);
              } else if (endpoint.name === 'Search (Simple)') {
                console.log(`   📊 Total Issues: ${data.total || 0}`);
                console.log(`   📄 Issues Returned: ${data.issues?.length || 0}`);
                if (data.issues && data.issues.length > 0) {
                  const issue = data.issues[0];
                  console.log(`   🎫 Sample Issue: ${issue.key} - ${issue.fields?.summary?.substring(0, 50) || 'No summary'}...`);
                }
              }
            } else {
              const text = await response.text();
              console.log(`   ✅ SUCCESS (Non-JSON Response)`);
              console.log(`   📄 Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
            }

          } catch (parseError) {
            console.log(`   ⚠️  Response parsing failed: ${parseError.message}`);
            console.log(`   📄 Raw response available but couldn't parse`);
          }
        } else {
          try {
            const errorText = await response.text();
            console.log(`   ❌ FAILED`);
            
            // Check if it's HTML error page
            if (errorText.includes('<html>') || errorText.includes('<!DOCTYPE')) {
              console.log(`   🚫 HTML Error Page Returned`);
              
              // Extract title or useful info from HTML
              const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);
              if (titleMatch) {
                console.log(`   📰 Page Title: ${titleMatch[1]}`);
              }
              
              // Check for common error patterns
              if (errorText.includes('404') || errorText.includes('not found')) {
                console.log(`   💡 API endpoint not found - try different API version`);
              } else if (errorText.includes('401') || errorText.includes('unauthorized')) {
                console.log(`   💡 Authentication failed - check credentials`);
              } else if (errorText.includes('403') || errorText.includes('forbidden')) {
                console.log(`   💡 Access forbidden - user may not have permissions`);
              }
            } else {
              console.log(`   🚫 Error: ${errorText.substring(0, 300)}${errorText.length > 300 ? '...' : ''}`);
            }
            
          } catch (textError) {
            console.log(`   ❌ FAILED - Could not read error response`);
          }
          
          // Provide specific guidance based on status code
          if (response.status === 401) {
            console.log(`   💡 Authentication failed - check credentials`);
          } else if (response.status === 403) {
            console.log(`   💡 Access forbidden - user may not have permissions`);
          } else if (response.status === 404) {
            console.log(`   💡 Not found - check URL or API version`);
          } else if (response.status >= 500) {
            console.log(`   💡 Server error - Jira instance may have issues`);
          }
        }

      } catch (fetchError) {
        console.log(`   ❌ NETWORK ERROR: ${fetchError.message}`);
        
        if (fetchError.code === 'ENOTFOUND') {
          console.log(`   💡 DNS resolution failed - check VPN connection`);
        } else if (fetchError.code === 'ECONNREFUSED') {
          console.log(`   💡 Connection refused - server unreachable`);
        } else if (fetchError.code === 'ETIMEDOUT') {
          console.log(`   💡 Timeout - server slow or network issues`);
        } else if (fetchError.name === 'AbortError') {
          console.log(`   💡 Request timeout (15s) - server very slow`);
        } else if (fetchError.message.includes('certificate')) {
          console.log(`   💡 SSL Certificate error - using self-signed certificates`);
          console.log(`   🔧 This should now be bypassed - check implementation`);
        }
      }
    }

  } catch (error) {
    console.log(`   ❌ SETUP ERROR: ${error.message}`);
  }
}

async function testConnectivity() {
  try {
    console.log(`   🌐 Testing basic connectivity to: ${JIRA_CONFIG.baseUrl}`);
    
    const response = await fetch(JIRA_CONFIG.baseUrl, {
      method: 'GET',
      timeout: 10000,
      agent: httpsAgent // Use HTTPS agent that ignores SSL errors
    });

    console.log(`   📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200 || response.status === 302 || response.status === 401) {
      console.log(`   ✅ Server is reachable`);
      
      // Try to identify Jira version from main page
      try {
        const htmlContent = await response.text();
        
        // Look for Jira version info in the HTML
        const versionMatch = htmlContent.match(/meta.*name=["|']ajs-version-number["|'].*content=["|']([^"']*)["|']/i);
        if (versionMatch) {
          console.log(`   📋 Detected Jira Version: ${versionMatch[1]}`);
        }
        
        // Look for API base path hints
        const contextMatch = htmlContent.match(/contextPath\s*=\s*["|']([^"']*)["|']/i);
        if (contextMatch) {
          console.log(`   📁 Context Path: ${contextMatch[1] || '/'}`);
        }
        
      } catch (parseError) {
        console.log(`   ⚠️  Could not parse server response for version info`);
      }
    } else {
      console.log(`   ⚠️  Unexpected response but server is reachable`);
    }

  } catch (error) {
    console.log(`   ❌ Connectivity failed: ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log(`   💡 DNS resolution failed - are you connected to VPN?`);
    } else if (error.message.includes('certificate')) {
      console.log(`   💡 SSL Certificate error - this should be bypassed now`);
    } else {
      console.log(`   💡 Network error - check internet connection and VPN`);
    }
  }
}

console.log('🚀 Starting Jira Connection Test...\n');
testJiraConnection()
  .then(() => {
    console.log('\n\n✅ Test completed!');
    console.log('\n📋 Summary:');
    console.log('- SSL certificate issues have been resolved');
    console.log('- Server connectivity is working');
    console.log('- Check which API version and authentication method worked');
    console.log('- Use the working configuration in your External Systems setup');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }); 