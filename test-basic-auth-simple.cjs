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

// Your Jira credentials - SIMPLE APPROACH
const JIRA_CONFIG = {
  baseUrl: 'https://sd.sic.sitco.sa',
  username: 'svc-scriptrunner',
  password: 'YOUR_PASSWORD_HERE'
};

async function testBasicAuthSimple() {
  console.log('🔍 Testing Simple Basic Authentication (Username + Password Only)');
  console.log('🔓 SSL Certificate Verification: DISABLED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🌐 Jira Server: ${JIRA_CONFIG.baseUrl}`);
  console.log(`👤 Username: ${JIRA_CONFIG.username}`);
  console.log(`🔑 Password: ${JIRA_CONFIG.password.substring(0, 5)}...\n`);

  // Create Basic Auth header (just username:password)
  const credentials = Buffer.from(`${JIRA_CONFIG.username}:${JIRA_CONFIG.password}`).toString('base64');
  console.log(`🔐 Basic Auth String: ${credentials.substring(0, 20)}...\n`);

  // Test different endpoints with simple basic auth
  const endpoints = [
    { 
      name: 'Server Info', 
      url: '/rest/api/2/serverInfo',
      description: 'Basic server information - often public or requires minimal auth'
    },
    { 
      name: 'Current User Info', 
      url: '/rest/api/2/myself',
      description: 'Information about the authenticated user'
    },
    { 
      name: 'Simple Issue Search', 
      url: '/rest/api/2/search?maxResults=1',
      description: 'Basic issue search with minimal parameters'
    },
    { 
      name: 'Projects List', 
      url: '/rest/api/2/project',
      description: 'List of accessible projects'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`🎯 Testing: ${endpoint.name}`);
    console.log(`📍 URL: ${JIRA_CONFIG.baseUrl}${endpoint.url}`);
    console.log(`📄 Description: ${endpoint.description}`);

    try {
      const startTime = Date.now();

      // Simple headers - just basic auth and standard content types
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'MSSP-Client-Manager/1.0'
      };

      console.log(`   🔑 Using Basic Auth: ${JIRA_CONFIG.username}:[password]`);

      const response = await fetch(`${JIRA_CONFIG.baseUrl}${endpoint.url}`, {
        method: 'GET',
        headers,
        timeout: 15000,
        agent: httpsAgent,
        redirect: 'manual'
      });

      const responseTime = Date.now() - startTime;
      console.log(`   ⏱️  Response Time: ${responseTime}ms`);
      console.log(`   📊 Status: ${response.status} ${response.statusText}`);

      // Log response headers
      const responseHeaders = Object.fromEntries(response.headers.entries());
      console.log(`   📤 Response Headers:`, {
        'content-type': responseHeaders['content-type'],
        'server': responseHeaders['server'],
        'content-length': responseHeaders['content-length']
      });

      if (response.ok) {
        console.log(`   ✅ SUCCESS! Basic Auth with Username+Password WORKS!`);
        
        try {
          const data = await response.json();
          
          // Display relevant response data based on endpoint
          if (endpoint.name === 'Server Info') {
            console.log(`   📋 Server: ${data.serverTitle || 'Unknown'}`);
            console.log(`   🔢 Version: ${data.version || 'Unknown'}`);
            console.log(`   🌐 Base URL: ${data.baseUrl || 'Unknown'}`);
          } else if (endpoint.name === 'Current User Info') {
            console.log(`   👤 User: ${data.displayName || data.name || 'Unknown'}`);
            console.log(`   📧 Email: ${data.emailAddress || 'No email'}`);
            console.log(`   🏢 Account ID: ${data.accountId || 'Unknown'}`);
            console.log(`   🔑 Account Type: ${data.accountType || 'Unknown'}`);
          } else if (endpoint.name === 'Simple Issue Search') {
            console.log(`   📊 Total Issues: ${data.total || 0}`);
            console.log(`   📄 Issues Returned: ${data.issues?.length || 0}`);
            if (data.issues && data.issues.length > 0) {
              const issue = data.issues[0];
              console.log(`   🎫 Sample Issue: ${issue.key} - ${issue.fields?.summary?.substring(0, 50) || 'No summary'}...`);
            }
          } else if (endpoint.name === 'Projects List') {
            console.log(`   📁 Total Projects: ${data.length || 0}`);
            if (data.length > 0) {
              console.log(`   🎯 Sample Project: ${data[0].key} - ${data[0].name}`);
            }
          }

          console.log(`   🎉 AUTHENTICATION SUCCESSFUL!`);
          
        } catch (parseError) {
          console.log(`   ✅ SUCCESS (Response received but couldn't parse JSON)`);
          console.log(`   ⚠️  Parse Error: ${parseError.message}`);
        }

      } else {
        // Handle different error scenarios
        try {
          const errorText = await response.text();
          
          if (response.status === 401) {
            console.log(`   ❌ UNAUTHORIZED - Invalid username or password`);
            console.log(`   💡 Check credentials: ${JIRA_CONFIG.username}`);
          } else if (response.status === 403) {
            console.log(`   ❌ FORBIDDEN - User authenticated but lacks permissions`);
            console.log(`   💡 User needs API access permissions or to be added to appropriate groups`);
          } else if (response.status === 404) {
            console.log(`   ❌ NOT FOUND - API endpoint doesn't exist`);
            console.log(`   💡 Try different API version or check endpoint URL`);
          } else if (response.status === 302) {
            const location = response.headers.get('location');
            console.log(`   🔄 REDIRECT - Likely to login page`);
            console.log(`   📍 Location: ${location}`);
            if (location && location.includes('login')) {
              console.log(`   💡 Authentication failed, redirected to login`);
            }
          } else {
            console.log(`   ❌ UNEXPECTED STATUS: ${response.status}`);
          }

          // Check if it's HTML error page
          if (errorText.includes('<html>') || errorText.includes('<!DOCTYPE')) {
            console.log(`   🚫 HTML Error Page Returned`);
            
            const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);
            if (titleMatch) {
              console.log(`   📰 Page Title: ${titleMatch[1]}`);
            }
          } else {
            console.log(`   🚫 Error Response: ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`);
          }

        } catch (textError) {
          console.log(`   ❌ FAILED - Could not read error response`);
        }
      }

    } catch (fetchError) {
      console.log(`   ❌ NETWORK ERROR: ${fetchError.message}`);
      
      if (fetchError.code === 'ENOTFOUND') {
        console.log(`   💡 DNS resolution failed - need to run this from production server or VPN`);
        console.log(`   🌐 Domain: sd.sic.sitco.sa is likely internal-only`);
      } else if (fetchError.code === 'ECONNREFUSED') {
        console.log(`   💡 Connection refused - server unreachable`);
      } else if (fetchError.code === 'ETIMEDOUT') {
        console.log(`   💡 Timeout - server slow or network issues`);
      } else if (fetchError.message.includes('certificate')) {
        console.log(`   💡 SSL Certificate error (should be bypassed)`);
      }
    }

    console.log('\n' + '─'.repeat(60) + '\n');
  }
}

console.log('🚀 Starting Simple Basic Auth Test...\n');
testBasicAuthSimple()
  .then(() => {
    console.log('\n🎯 Simple Basic Auth Test Completed!');
    console.log('\n📋 Results Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Check above for any successful authentications');
    console.log('✅ If any endpoint returned 200 OK, basic auth works!');
    console.log('❌ If all returned 403, user needs API permissions');
    console.log('🌐 If all failed with DNS errors, run from production server');
    console.log('\n💡 Next Steps:');
    console.log('- If successful: Update external-api-service.ts to use simple basic auth');
    console.log('- If 403 errors: Contact Jira admin for API permissions');
    console.log('- If DNS errors: Run this test from production server with VPN access');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }); 