#!/usr/bin/env node

// Production Server Jira Test - Run this on the production server with VPN access
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

// Your Jira credentials - Use environment variables for security
const JIRA_CONFIG = {
  baseUrl: 'https://sd.sic.sitco.sa',
  username: process.env.JIRA_USERNAME || 'your-working-username',
  password: process.env.JIRA_PASSWORD || 'your-password'
};

async function testJiraFromProductionServer() {
  console.log('🏭 Testing Jira from Production Server Environment');
  console.log('🔓 SSL Certificate Verification: DISABLED');
  console.log('🔐 Using SIMPLE Basic Authentication (Username + Password ONLY)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🌐 Jira Server: ${JIRA_CONFIG.baseUrl}`);
  console.log(`👤 Username: ${JIRA_CONFIG.username}`);
  console.log(`🔑 Password: ${JIRA_CONFIG.password.substring(0, 5)}...\n`);

  // Create Simple Basic Auth header
  const credentials = Buffer.from(`${JIRA_CONFIG.username}:${JIRA_CONFIG.password}`).toString('base64');
  console.log(`🔐 Basic Auth: ${credentials.substring(0, 20)}...\n`);

  // Test critical endpoints for MSSP integration
  const criticalEndpoints = [
    { 
      name: 'Server Info', 
      url: '/rest/api/2/serverInfo',
      critical: true,
      description: 'Basic server information'
    },
    { 
      name: 'Current User Info', 
      url: '/rest/api/2/myself',
      critical: true,
      description: 'Verify user authentication and permissions'
    },
    { 
      name: 'Specific Issue DEP-9', 
      url: '/rest/api/2/issue/DEP-9',
      critical: true,
      description: 'Test fetching real issue data from DEP project'
    },
    { 
      name: 'DEP Project Search', 
      url: '/rest/api/2/search?jql=project=DEP&maxResults=5',
      critical: true,
      description: 'Test JQL search in DEP project'
    },
    { 
      name: 'Issue Search', 
      url: '/rest/api/2/search?jql=order by created DESC&maxResults=5',
      critical: true,
      description: 'Test general JQL search capability'
    },
    { 
      name: 'Projects List', 
      url: '/rest/api/2/project',
      critical: false,
      description: 'List accessible projects'
    },
    {
      name: 'Issue Types',
      url: '/rest/api/2/issuetype',
      critical: false,
      description: 'Available issue types'
    }
  ];

  let successCount = 0;
  let criticalSuccessCount = 0;
  let totalCritical = criticalEndpoints.filter(e => e.critical).length;

  for (const endpoint of criticalEndpoints) {
    const isCritical = endpoint.critical ? '🔴 CRITICAL' : '🟡 Optional';
    console.log(`${isCritical} Testing: ${endpoint.name}`);
    console.log(`📍 URL: ${JIRA_CONFIG.baseUrl}${endpoint.url}`);
    console.log(`📄 ${endpoint.description}`);

    try {
      const startTime = Date.now();

      // Minimal headers for maximum compatibility
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'User-Agent': 'MSSP-Client-Manager/1.0'
      };

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

      if (response.ok) {
        console.log(`   ✅ SUCCESS! Authentication and API access working!`);
        successCount++;
        if (endpoint.critical) criticalSuccessCount++;
        
        try {
          const data = await response.json();
          
          if (endpoint.name === 'Server Info') {
            console.log(`   📋 Server: ${data.serverTitle || 'Unknown'}`);
            console.log(`   🔢 Version: ${data.version || 'Unknown'}`);
            console.log(`   🌐 Base URL: ${data.baseUrl || 'Unknown'}`);
          } else if (endpoint.name === 'Current User Info') {
            console.log(`   👤 User: ${data.displayName || data.name || 'Unknown'}`);
            console.log(`   📧 Email: ${data.emailAddress || 'No email'}`);
            console.log(`   🏢 Account ID: ${data.accountId || 'Unknown'}`);
            console.log(`   🔑 Active: ${data.active !== false ? 'Yes' : 'No'}`);
          } else if (endpoint.name === 'Specific Issue DEP-9') {
            console.log(`   ✅ SUCCESS! Issue DEP-9 fetched successfully`);
            console.log(`   🎫 Issue Key: ${data.key || 'Unknown'}`);
            console.log(`   📝 Summary: ${data.fields?.summary || 'No summary'}`);
            console.log(`   📊 Status: ${data.fields?.status?.name || 'Unknown status'}`);
            console.log(`   👤 Assignee: ${data.fields?.assignee?.displayName || 'Unassigned'}`);
            console.log(`   🏷️  Issue Type: ${data.fields?.issuetype?.name || 'Unknown type'}`);
            console.log(`   ⚡ Priority: ${data.fields?.priority?.name || 'Unknown priority'}`);
            console.log(`   📅 Created: ${data.fields?.created ? new Date(data.fields.created).toLocaleDateString() : 'Unknown'}`);
            console.log(`   🔄 Updated: ${data.fields?.updated ? new Date(data.fields.updated).toLocaleDateString() : 'Unknown'}`);
            console.log(`   🌐 Web URL: ${JIRA_CONFIG.baseUrl}/browse/${data.key}`);
          } else if (endpoint.name === 'DEP Project Search') {
            console.log(`   📊 Total DEP Issues: ${data.total || 0}`);
            console.log(`   📄 Issues Returned: ${data.issues?.length || 0}`);
            if (data.issues && data.issues.length > 0) {
              console.log(`   🎯 DEP Project Issues:`);
              data.issues.slice(0, 3).forEach((issue, index) => {
                console.log(`     ${index + 1}. ${issue.key} - ${issue.fields?.summary?.substring(0, 40) || 'No summary'}...`);
              });
            }
          } else if (endpoint.name === 'Issue Search') {
            console.log(`   📊 Total Issues: ${data.total || 0}`);
            console.log(`   📄 Issues Returned: ${data.issues?.length || 0}`);
            if (data.issues && data.issues.length > 0) {
              const issue = data.issues[0];
              console.log(`   🎫 Latest Issue: ${issue.key} - ${issue.fields?.summary?.substring(0, 50) || 'No summary'}...`);
            }
          } else if (endpoint.name === 'Projects List') {
            console.log(`   📁 Total Projects: ${Array.isArray(data) ? data.length : 0}`);
            if (Array.isArray(data) && data.length > 0) {
              console.log(`   🎯 First Project: ${data[0].key} - ${data[0].name}`);
            }
          } else if (endpoint.name === 'Issue Types') {
            console.log(`   🏷️  Issue Types: ${Array.isArray(data) ? data.length : 0}`);
            if (Array.isArray(data) && data.length > 0) {
              console.log(`   📝 Sample Type: ${data[0].name} (${data[0].id})`);
            }
          }

        } catch (parseError) {
          console.log(`   ✅ SUCCESS (Non-JSON response)`);
        }

      } else {
        console.log(`   ❌ FAILED`);
        
        if (response.status === 401) {
          console.log(`   🔐 UNAUTHORIZED - Credentials rejected`);
          console.log(`   💡 Check username/password: ${JIRA_CONFIG.username}`);
        } else if (response.status === 403) {
          console.log(`   ❌ FORBIDDEN - User authenticated but lacks API permissions`);
          console.log(`   💡 Contact Jira admin to enable REST API access for this user`);
        } else if (response.status === 404) {
          console.log(`   ❌ NOT FOUND - API endpoint doesn't exist`);
        } else if (response.status === 302) {
          const location = response.headers.get('location');
          console.log(`   🔄 REDIRECTED to: ${location}`);
        }

        try {
          const errorText = await response.text();
          if (errorText.includes('<title>')) {
            const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);
            if (titleMatch) {
              console.log(`   📰 Error Page: ${titleMatch[1]}`);
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

    } catch (fetchError) {
      console.log(`   ❌ NETWORK ERROR: ${fetchError.message}`);
      
      if (fetchError.code === 'ENOTFOUND') {
        console.log(`   💡 DNS resolution failed - check VPN connection to SITCO network`);
      } else if (fetchError.code === 'ECONNREFUSED') {
        console.log(`   💡 Connection refused - Jira server may be down`);
      } else if (fetchError.code === 'ETIMEDOUT') {
        console.log(`   💡 Request timeout - server overloaded or network issues`);
      }
    }

    console.log('\n' + '─'.repeat(60) + '\n');
  }

  // Summary
  console.log('🎯 PRODUCTION SERVER TEST SUMMARY');
  console.log('━'.repeat(60));
  console.log(`✅ Successful Endpoints: ${successCount}/${criticalEndpoints.length}`);
  console.log(`🔴 Critical Endpoints: ${criticalSuccessCount}/${totalCritical}`);
  
  if (criticalSuccessCount === totalCritical) {
    console.log('🎉 ALL CRITICAL ENDPOINTS WORKING!');
    console.log('✅ Jira integration is ready for production use');
    console.log('📋 Next steps:');
    console.log('   - Update External Systems configuration with isActive: true');
    console.log('   - Test client mappings and JQL queries');
    console.log('   - Verify dashboard integration');
  } else if (successCount > 0) {
    console.log('⚠️  PARTIAL SUCCESS - Some endpoints working');
    console.log('🔧 Required actions:');
    console.log('   - Contact Jira admin for full API access');
    console.log('   - Verify user permissions for failed endpoints');
  } else {
    console.log('❌ NO ENDPOINTS WORKING');
    console.log('🚨 Critical issues to resolve:');
    console.log('   - Verify VPN connection to SITCO network');
    console.log('   - Check username/password credentials');
    console.log('   - Contact Jira admin to enable API access');
    console.log('   - Verify user account is active and not locked');
  }

  console.log('\n📧 Email Template for Jira Admin (if needed):');
  console.log('━'.repeat(60));
  console.log('Subject: Enable REST API Access for MSSP Integration');
  console.log('');
  console.log(`We need REST API access enabled for user: ${JIRA_CONFIG.username}`);
  console.log(`Current test results: ${successCount}/${criticalEndpoints.length} endpoints working`);
  console.log('Required permissions: Browse projects, View issues, REST API access');
  console.log('Server: https://sd.sic.sitco.sa (Jira 9.4.24)');
  console.log('Use case: MSSP Client Management external integration');
}

console.log('🚀 Starting Production Server Jira Test...\n');
testJiraFromProductionServer()
  .then(() => {
    console.log('\n✅ Production server test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Production test failed:', error);
    process.exit(1);
  }); 