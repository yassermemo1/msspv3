#!/usr/bin/env node

// Focused test for DEP-9 issue - Run this on production server with VPN access
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

async function testDEP9Issue() {
  console.log('🎫 Testing Specific Jira Issue: DEP-9');
  console.log('🔓 SSL Certificate Verification: DISABLED');
  console.log('📍 Target: https://sd.sic.sitco.sa/browse/DEP-9');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🌐 Jira Server: ${JIRA_CONFIG.baseUrl}`);
  console.log(`👤 Username: ${JIRA_CONFIG.username}`);
  console.log(`🔑 Password: ${JIRA_CONFIG.password.substring(0, 5)}...\n`);

  // Create Simple Basic Auth header
  const credentials = Buffer.from(`${JIRA_CONFIG.username}:${JIRA_CONFIG.password}`).toString('base64');

  // Test endpoints related to DEP-9 and DEP project
  const depTests = [
    {
      name: '🎫 Get DEP-9 Issue Details',
      url: '/rest/api/2/issue/DEP-9',
      description: 'Fetch complete details for issue DEP-9'
    },
    {
      name: '🎫 Get DEP-9 with Specific Fields',
      url: '/rest/api/2/issue/DEP-9?fields=key,summary,status,assignee,issuetype,priority,created,updated,description',
      description: 'Fetch DEP-9 with specific fields for MSSP integration'
    },
    {
      name: '🔍 Search DEP Project',
      url: '/rest/api/2/search?jql=project=DEP&maxResults=10&fields=key,summary,status,assignee,priority',
      description: 'Search all issues in DEP project'
    },
    {
      name: '📊 DEP Project Info',
      url: '/rest/api/2/project/DEP',
      description: 'Get DEP project information'
    },
    {
      name: '🔍 Recent DEP Issues',
      url: '/rest/api/2/search?jql=project=DEP order by updated DESC&maxResults=5',
      description: 'Get recently updated issues in DEP project'
    }
  ];

  let successCount = 0;
  let dep9Found = false;

  for (const test of depTests) {
    console.log(`${test.name}`);
    console.log(`📍 URL: ${JIRA_CONFIG.baseUrl}${test.url}`);
    console.log(`📄 ${test.description}`);

    try {
      const startTime = Date.now();

      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'User-Agent': 'MSSP-Client-Manager/1.0'
      };

      const response = await fetch(`${JIRA_CONFIG.baseUrl}${test.url}`, {
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
        console.log(`   ✅ SUCCESS!`);
        successCount++;
        
        try {
          const data = await response.json();
          
          if (test.name.includes('DEP-9 Issue Details') || test.name.includes('DEP-9 with Specific Fields')) {
            dep9Found = true;
            console.log(`   🎫 Issue Key: ${data.key}`);
            console.log(`   📝 Summary: ${data.fields?.summary || 'No summary'}`);
            console.log(`   📊 Status: ${data.fields?.status?.name || 'Unknown'} (${data.fields?.status?.statusCategory?.name || 'Unknown category'})`);
            console.log(`   👤 Assignee: ${data.fields?.assignee?.displayName || 'Unassigned'}`);
            console.log(`   🏷️  Type: ${data.fields?.issuetype?.name || 'Unknown'}`);
            console.log(`   ⚡ Priority: ${data.fields?.priority?.name || 'Unknown'}`);
            console.log(`   📅 Created: ${data.fields?.created ? new Date(data.fields.created).toLocaleString() : 'Unknown'}`);
            console.log(`   🔄 Updated: ${data.fields?.updated ? new Date(data.fields.updated).toLocaleString() : 'Unknown'}`);
            console.log(`   🌐 Browse URL: ${JIRA_CONFIG.baseUrl}/browse/${data.key}`);
            
            if (data.fields?.description) {
              const desc = data.fields.description;
              const descText = typeof desc === 'string' ? desc : desc.content?.[0]?.content?.[0]?.text || 'Description unavailable';
              console.log(`   📋 Description: ${descText.substring(0, 100)}${descText.length > 100 ? '...' : ''}`);
            }
            
          } else if (test.name.includes('Search DEP Project') || test.name.includes('Recent DEP Issues')) {
            console.log(`   📊 Total Issues Found: ${data.total || 0}`);
            console.log(`   📄 Issues Returned: ${data.issues?.length || 0}`);
            
            if (data.issues && data.issues.length > 0) {
              console.log(`   🎯 Issues in DEP Project:`);
              data.issues.forEach((issue, index) => {
                const status = issue.fields?.status?.name || 'Unknown';
                const assignee = issue.fields?.assignee?.displayName || 'Unassigned';
                console.log(`     ${index + 1}. ${issue.key} - ${issue.fields?.summary?.substring(0, 50) || 'No summary'}... [${status}] (${assignee})`);
              });
              
              // Check if DEP-9 is in the results
              const dep9InResults = data.issues.find(issue => issue.key === 'DEP-9');
              if (dep9InResults) {
                console.log(`   🎉 DEP-9 found in project search results!`);
              }
            }
            
          } else if (test.name.includes('DEP Project Info')) {
            console.log(`   📁 Project Key: ${data.key || 'Unknown'}`);
            console.log(`   📛 Project Name: ${data.name || 'Unknown'}`);
            console.log(`   📝 Description: ${data.description?.substring(0, 100) || 'No description'}${data.description && data.description.length > 100 ? '...' : ''}`);
            console.log(`   👤 Lead: ${data.lead?.displayName || 'Unknown'}`);
            console.log(`   🌐 Project URL: ${data.self || 'Unknown'}`);
          }

        } catch (parseError) {
          console.log(`   ✅ SUCCESS (Non-JSON response)`);
          console.log(`   ⚠️  Parse Error: ${parseError.message}`);
        }

      } else {
        console.log(`   ❌ FAILED`);
        
        if (response.status === 401) {
          console.log(`   🔐 UNAUTHORIZED - Invalid credentials`);
        } else if (response.status === 403) {
          console.log(`   ❌ FORBIDDEN - User lacks permissions for this resource`);
        } else if (response.status === 404) {
          console.log(`   ❌ NOT FOUND - Issue DEP-9 or DEP project may not exist or user has no access`);
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
        console.log(`   💡 DNS resolution failed - run from production server with SITCO network access`);
      }
    }

    console.log('\n' + '─'.repeat(60) + '\n');
  }

  // Summary
  console.log('🎯 DEP-9 ISSUE TEST SUMMARY');
  console.log('━'.repeat(60));
  console.log(`✅ Successful API Calls: ${successCount}/${depTests.length}`);
  console.log(`🎫 DEP-9 Issue Found: ${dep9Found ? 'YES' : 'NO'}`);
  
  if (dep9Found) {
    console.log('🎉 EXCELLENT! DEP-9 issue successfully accessed!');
    console.log('✅ Jira integration is working with real project data');
    console.log('📋 This confirms:');
    console.log('   - Authentication is working');
    console.log('   - User has access to DEP project');
    console.log('   - Issue-level permissions are correct');
    console.log('   - API endpoints are functional');
    console.log('\n🚀 Ready for MSSP integration deployment!');
  } else if (successCount > 0) {
    console.log('⚠️  PARTIAL SUCCESS - Some API calls working but DEP-9 not accessible');
    console.log('🔧 Possible issues:');
    console.log('   - User may not have access to DEP project');
    console.log('   - DEP-9 issue may not exist');
    console.log('   - Issue-level permissions may be restricted');
  } else {
    console.log('❌ NO API CALLS SUCCESSFUL');
    console.log('🚨 Check:');
    console.log('   - VPN connection to SITCO network');
    console.log('   - Username/password credentials');
    console.log('   - Jira admin needs to enable API access');
  }

  console.log('\n🌐 Direct Links:');
  console.log(`   Issue: ${JIRA_CONFIG.baseUrl}/browse/DEP-9`);
  console.log(`   Project: ${JIRA_CONFIG.baseUrl}/browse/DEP`);
}

console.log('🚀 Starting DEP-9 Issue Test...\n');
testDEP9Issue()
  .then(() => {
    console.log('\n✅ DEP-9 issue test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 DEP-9 test failed:', error);
    process.exit(1);
  }); 