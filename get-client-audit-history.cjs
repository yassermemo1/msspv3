const http = require('http');

async function makeRequest(path, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.statusCode === 200 ? JSON.parse(data) : data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function login() {
  console.log('🔐 Logging in...');
  
  const loginData = JSON.stringify({
    email: 'admin@mssp.local',
    password: 'admin123'
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] ? 
          res.headers['set-cookie'].join('; ') : '';
        resolve({
          statusCode: res.statusCode,
          cookies: cookies,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
}

async function getClientAuditHistory() {
  console.log('📊 Retrieving Client Audit History...\n');

  try {
    // Login first
    const loginResponse = await login();
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed:', loginResponse.body);
      return;
    }

    const cookies = loginResponse.cookies;
    console.log('✅ Login successful\n');

    // 1. Get all change history for clients
    console.log('🔍 1. CHANGE HISTORY - All Client Activities:');
    console.log('=' .repeat(60));
    
    const changeHistoryResponse = await makeRequest('/api/audit/change-history?entityType=client', cookies);
    if (changeHistoryResponse.statusCode === 200 && Array.isArray(changeHistoryResponse.body)) {
      const clientChanges = changeHistoryResponse.body;
      
      if (clientChanges.length === 0) {
        console.log('   No client change history found');
      } else {
        console.log(`   Found ${clientChanges.length} client change records:\n`);
        
        // Group by action type
        const groupedChanges = clientChanges.reduce((acc, change) => {
          if (!acc[change.action]) acc[change.action] = [];
          acc[change.action].push(change);
          return acc;
        }, {});

        Object.entries(groupedChanges).forEach(([action, changes]) => {
          console.log(`   📝 ${action.toUpperCase()} Actions (${changes.length}):`);
          changes.forEach(change => {
            const timestamp = new Date(change.timestamp).toLocaleString();
            console.log(`      • ${change.entity_name || `Client ID ${change.entity_id}`} by ${change.user_name || 'Unknown'} at ${timestamp}`);
            if (change.field_name) {
              console.log(`        Field: ${change.field_name} | Old: "${change.old_value}" → New: "${change.new_value}"`);
            }
          });
          console.log('');
        });
      }
    } else {
      console.log(`   ❌ Failed to fetch change history: ${changeHistoryResponse.statusCode}`);
      console.log(`   Response: ${JSON.stringify(changeHistoryResponse.body, null, 2)}`);
    }

    // 2. Get all audit logs for clients
    console.log('\n🔍 2. AUDIT LOGS - All Client Activities:');
    console.log('=' .repeat(60));
    
    const auditLogsResponse = await makeRequest('/api/audit/logs?entityType=client', cookies);
    if (auditLogsResponse.statusCode === 200 && Array.isArray(auditLogsResponse.body)) {
      const clientAudits = auditLogsResponse.body;
      
      if (clientAudits.length === 0) {
        console.log('   No client audit logs found');
      } else {
        console.log(`   Found ${clientAudits.length} client audit records:\n`);
        
        clientAudits.forEach(audit => {
          const timestamp = new Date(audit.timestamp).toLocaleString();
          const severity = audit.severity.toUpperCase();
          console.log(`   📋 [${severity}] ${audit.action} - ${audit.entity_name || `Client ID ${audit.entity_id}`}`);
          console.log(`      Description: ${audit.description}`);
          console.log(`      User: ${audit.user_name || 'Unknown'} | Time: ${timestamp}`);
          if (audit.ip_address) {
            console.log(`      IP: ${audit.ip_address}`);
          }
          console.log('');
        });
      }
    } else {
      console.log(`   ❌ Failed to fetch audit logs: ${auditLogsResponse.statusCode}`);
      console.log(`   Response: ${JSON.stringify(auditLogsResponse.body, null, 2)}`);
    }

    // 3. Get all clients to show current state
    console.log('\n🔍 3. CURRENT CLIENTS - All Active Clients:');
    console.log('=' .repeat(60));
    
    const clientsResponse = await makeRequest('/api/clients', cookies);
    if (clientsResponse.statusCode === 200 && Array.isArray(clientsResponse.body)) {
      const clients = clientsResponse.body;
      
      if (clients.length === 0) {
        console.log('   No clients found');
      } else {
        console.log(`   Found ${clients.length} clients:\n`);
        
        clients.forEach(client => {
          const createdAt = new Date(client.createdAt).toLocaleString();
          console.log(`   👤 ${client.name} (ID: ${client.id})`);
          console.log(`      Status: ${client.status} | Industry: ${client.industry || 'Not specified'}`);
          console.log(`      Created: ${createdAt}`);
          if (client.notes) {
            console.log(`      Notes: ${client.notes}`);
          }
          console.log('');
        });
      }
    } else {
      console.log(`   ❌ Failed to fetch clients: ${clientsResponse.statusCode}`);
    }

    // 4. Get general change history (all entities)
    console.log('\n🔍 4. ALL CHANGE HISTORY - Recent Activity:');
    console.log('=' .repeat(60));
    
    const allChangesResponse = await makeRequest('/api/change-history?dateRange=30d', cookies);
    if (allChangesResponse.statusCode === 200 && Array.isArray(allChangesResponse.body)) {
      const allChanges = allChangesResponse.body;
      
      if (allChanges.length === 0) {
        console.log('   No recent change history found');
      } else {
        console.log(`   Found ${allChanges.length} recent changes:\n`);
        
        // Filter for client-related activities
        const clientRelatedChanges = allChanges.filter(change => 
          change.resourceType === 'client' || 
          change.resourceType === 'contract' ||
          change.resourceType === 'service'
        );

        if (clientRelatedChanges.length > 0) {
          console.log(`   Client-related changes (${clientRelatedChanges.length}):`);
          clientRelatedChanges.slice(0, 10).forEach(change => {
            const timestamp = new Date(change.timestamp).toLocaleString();
            console.log(`   📝 ${change.action} ${change.resourceType} (ID: ${change.resourceId}) by ${change.username || 'Unknown'} at ${timestamp}`);
          });
        }
      }
    } else {
      console.log(`   ❌ Failed to fetch all changes: ${allChangesResponse.statusCode}`);
    }

    console.log('\n✅ Audit history retrieval completed!');
    console.log('\n💡 Tips:');
    console.log('   • If you see no records, try creating a new client to generate audit entries');
    console.log('   • Check the Admin → Audit Management page in the web interface');
    console.log('   • Audit logs are automatically created when clients are added/modified/deleted');

  } catch (error) {
    console.error('❌ Error retrieving audit history:', error.message);
  }
}

// Run the audit history retrieval
getClientAuditHistory(); 