#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { externalSystems } = require('./shared/schema.ts');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Database configuration
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'mssp_production',
  username: 'mssp_user',
  password: '12345678'
};

async function setupDefaultJiraSystem() {
  const sql = postgres({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: DB_CONFIG.database,
    username: DB_CONFIG.username,
    password: DB_CONFIG.password,
  });
  
  const db = drizzle(sql);

  console.log('🔧 Setting up default Jira external system...\n');

  const jiraSystem = {
    systemName: 'jira',
    displayName: 'Production Jira (SITCO)',
    baseUrl: 'https://sd.sic.sitco.sa',
    authType: 'basic',
    authConfig: {
      username: process.env.JIRA_USERNAME || '',
      password: process.env.JIRA_PASSWORD || '',
      apiKey: process.env.JIRA_API_KEY || '',
      sslConfig: {
        rejectUnauthorized: false,
        allowSelfSigned: true,
        verifyHostname: false
      }
    },
    apiEndpoints: {
      search: '/rest/api/2/search',
      serverInfo: '/rest/api/2/serverInfo',
      projects: '/rest/api/2/project',
      webUrl: '/browse/{identifier}'
    },
    isActive: !!process.env.JIRA_USERNAME, // Active only if credentials are provided
    createdBy: 1,
    metadata: {
      serverVersion: 'Jira 9.4.24',
      sslBypass: true,
      connectivityStatus: 'requires_credentials',
      notes: 'Production-ready configuration. Set JIRA_USERNAME and JIRA_PASSWORD environment variables.'
    }
  };

  try {
    // Check if Jira system already exists
    console.log('📋 Checking for existing Jira configuration...');
    const existingSystems = await db.select().from(externalSystems).where(eq(externalSystems.systemName, 'jira'));
    
    let systemId;
    if (existingSystems.length > 0) {
      console.log('✅ Found existing Jira system, updating...');
      await db.update(externalSystems)
        .set({
          displayName: jiraSystem.displayName,
          baseUrl: jiraSystem.baseUrl,
          authType: jiraSystem.authType,
          authConfig: jiraSystem.authConfig,
          apiEndpoints: jiraSystem.apiEndpoints,
          isActive: jiraSystem.isActive,
          updatedAt: new Date()
        })
        .where(eq(externalSystems.systemName, 'jira'));
      systemId = existingSystems[0].id;
    } else {
      console.log('➕ Creating new Jira system...');
      const newSystem = await db.insert(externalSystems)
        .values(jiraSystem)
        .returning();
      systemId = newSystem[0].id;
    }

    console.log(`✅ Jira system configured with ID: ${systemId}\n`);

    // Test the connection
    console.log('🧪 Testing Jira connection...\n');
    await testJiraConnection(jiraSystem);

    // Test with different authentication methods
    console.log('\n🔄 Testing alternative authentication methods...\n');
    
    // Test with Bearer token using API key
    const bearerConfig = {
      ...jiraSystem,
      authType: 'bearer',
      authConfig: {
        token: jiraSystem.authConfig.apiKey
      }
    };
    await testJiraConnection(bearerConfig, 'Bearer Token');

    // Test with API Key header
    const apiKeyConfig = {
      ...jiraSystem,
      authType: 'api_key',
      authConfig: {
        header: 'Authorization',
        key: `Bearer ${jiraSystem.authConfig.apiKey}`
      }
    };
    await testJiraConnection(apiKeyConfig, 'API Key Header');

    console.log('\n✅ Default Jira system setup completed!');
    console.log('\n📋 Summary:');
    console.log(`   - System Name: ${jiraSystem.systemName}`);
    console.log(`   - Display Name: ${jiraSystem.displayName}`);
    console.log(`   - Base URL: ${jiraSystem.baseUrl}`);
    console.log(`   - Auth Type: ${jiraSystem.authType}`);
    console.log(`   - System ID: ${systemId}`);
    
  } catch (error) {
    console.error('❌ Error setting up Jira system:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

async function testJiraConnection(config, authMethodName = 'Basic Auth') {
  console.log(`🔍 Testing ${authMethodName}...`);
  
  try {
    const headers = getAuthHeaders(config);
    console.log('   Headers:', {
      'Content-Type': headers['Content-Type'],
      'User-Agent': headers['User-Agent'],
      'Authorization': headers['Authorization'] ? `${headers['Authorization'].substring(0, 20)}...` : 'None',
      ...Object.fromEntries(Object.entries(headers).filter(([k]) => !['Content-Type', 'User-Agent', 'Authorization'].includes(k)))
    });

    // Test 1: Server Info
    const serverInfoUrl = `${config.baseUrl}/rest/api/2/serverInfo`;
    console.log(`   Testing server info: ${serverInfoUrl}`);
    
    const serverResponse = await fetch(serverInfoUrl, {
      method: 'GET',
      headers,
      timeout: 15000
    });

    console.log(`   Response status: ${serverResponse.status} ${serverResponse.statusText}`);
    
    if (serverResponse.ok) {
      const serverInfo = await serverResponse.json();
      console.log(`   ✅ Server connection successful!`);
      console.log(`      Server: ${serverInfo.serverTitle}`);
      console.log(`      Version: ${serverInfo.version}`);
      console.log(`      Base URL: ${serverInfo.baseUrl}`);
      
      // Test 2: Search API with simple JQL
      console.log(`   Testing search API...`);
      const searchUrl = `${config.baseUrl}/rest/api/2/search?jql=order by created DESC&maxResults=1`;
      
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers,
        timeout: 15000
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log(`   ✅ Search API successful!`);
        console.log(`      Total issues accessible: ${searchData.total || 0}`);
        console.log(`      Sample issues returned: ${searchData.issues?.length || 0}`);
      } else {
        const errorText = await searchResponse.text();
        console.log(`   ⚠️  Search API failed: ${searchResponse.status} - ${errorText.substring(0, 200)}`);
      }
      
    } else {
      const errorText = await serverResponse.text();
      console.log(`   ❌ Server connection failed: ${errorText.substring(0, 200)}`);
      
      // Check if it's an authentication issue
      if (serverResponse.status === 401) {
        console.log('   💡 This appears to be an authentication issue.');
      } else if (serverResponse.status === 403) {
        console.log('   💡 This appears to be a permissions issue.');
      } else if (serverResponse.status >= 500) {
        console.log('   💡 This appears to be a server error.');
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Connection test failed: ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('   💡 DNS resolution failed - check the URL');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Connection refused - check if server is running and accessible');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   💡 Connection timed out - server may be slow or unreachable');
    } else {
      console.log(`   💡 Error type: ${error.code || 'Unknown'}`);
    }
  }
}

function getAuthHeaders(config) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'MSSP-Client-Manager/1.0'
  };

  const authConfig = config.authConfig;
  
  switch (config.authType) {
    case 'basic':
      if (authConfig?.username && authConfig?.password) {
        const credentials = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }
      break;
      
    case 'bearer':
      if (authConfig?.token) {
        headers['Authorization'] = `Bearer ${authConfig.token}`;
      }
      break;
      
    case 'api_key':
      if (authConfig?.key && authConfig?.header) {
        headers[authConfig.header] = authConfig.key;
      }
      break;
  }

  return headers;
}

// Add missing import
const { eq } = require('drizzle-orm');

if (require.main === module) {
  setupDefaultJiraSystem()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDefaultJiraSystem }; 