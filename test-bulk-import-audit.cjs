const http = require('http');

async function makeRequest(method, path, data, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.statusCode === 200 || res.statusCode === 201 ? JSON.parse(responseData) : responseData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        }
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

async function testBulkImportAudit() {
  console.log('🔍 Testing Bulk Import Audit Logging\n');
  
  try {
    // Step 1: Login
    console.log('🔐 Logging in...');
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: 'admin@mssp.local',
      password: 'SecureAdminPassword123!'
    });

    if (loginResponse.statusCode !== 200) {
      throw new Error(`Login failed: ${loginResponse.statusCode} - ${loginResponse.body}`);
    }

    const cookies = loginResponse.headers['set-cookie']?.join('; ') || '';
    console.log('✅ Login successful\n');

    // Step 2: Get audit count BEFORE bulk import
    console.log('📊 Getting audit logs BEFORE bulk import...');
    const beforeAuditResponse = await makeRequest('GET', '/api/audit/logs', null, cookies);
    const beforeCount = beforeAuditResponse.body?.length || 0;
    console.log(`📋 Found ${beforeCount} audit log entries before bulk import\n`);

    // Step 3: Perform bulk import
    console.log('📦 Performing test bulk import...');
    const bulkImportData = {
      headers: ['name', 'industry', 'domain'],
      rows: [
        [`Audit Test Company ${Date.now()}`, 'Technology', 'testaudit.com']
      ],
      mappings: [
        { sourceColumn: 'name', targetField: 'name', entityType: 'clients', required: true, dataType: 'text' },
        { sourceColumn: 'industry', targetField: 'industry', entityType: 'clients', required: false, dataType: 'text' },
        { sourceColumn: 'domain', targetField: 'domain', entityType: 'clients', required: false, dataType: 'text' }
      ],
      duplicateHandling: 'create_new',
      clientMatchStrategy: 'name_only'
    };
    
    const bulkResponse = await makeRequest('POST', '/api/bulk-import/comprehensive-paste', bulkImportData, cookies);
    
    if (bulkResponse.statusCode === 200) {
      console.log(`✅ Bulk import completed successfully!`);
      console.log(`   - Records processed: ${bulkResponse.body.recordsProcessed}`);
      console.log(`   - Records successful: ${bulkResponse.body.recordsSuccessful}`);
      console.log(`   - Records failed: ${bulkResponse.body.recordsFailed}\n`);
    } else {
      console.log(`❌ Bulk import failed: ${bulkResponse.statusCode} - ${bulkResponse.body}\n`);
      return;
    }

    // Step 4: Wait a moment for audit logs to be written
    console.log('⏳ Waiting 2 seconds for audit logs to be written...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 5: Get audit count AFTER bulk import
    console.log('📊 Getting audit logs AFTER bulk import...');
    const afterAuditResponse = await makeRequest('GET', '/api/audit/logs', null, cookies);
    const afterCount = afterAuditResponse.body?.length || 0;
    console.log(`📋 Found ${afterCount} audit log entries after bulk import`);
    
    const newAuditEntries = afterCount - beforeCount;
    console.log(`🆕 NEW audit entries created: ${newAuditEntries}\n`);

    // Step 6: Show the latest audit entries
    if (newAuditEntries > 0) {
      console.log('🎉 SUCCESS! Bulk import audit logging IS WORKING!');
      console.log('📋 Latest audit entries:');
      const recentEntries = afterAuditResponse.body.slice(0, Math.min(5, newAuditEntries));
      recentEntries.forEach((entry, index) => {
        const timestamp = new Date(entry.timestamp).toLocaleString();
        console.log(`   ${index + 1}. [${timestamp}] ${entry.action} on ${entry.entity_type} - ${entry.description}`);
      });
    } else {
      console.log('❌ PROBLEM! No new audit entries were created during bulk import!');
      console.log('📋 This indicates the audit logging code may not be working properly.');
    }

    // Step 7: Test license pool assignment audit
    console.log('\n🔧 Testing License Pool Assignment Audit...');
    const clientsResponse = await makeRequest('GET', '/api/clients', null, cookies);
    
    if (clientsResponse.body && clientsResponse.body.length > 0) {
      const testClient = clientsResponse.body[0];
      console.log(`📋 Testing license assignment for client: ${testClient.name} (ID: ${testClient.id})`);
      
      // Get license pools
      const poolsResponse = await makeRequest('GET', '/api/license-pools', null, cookies);
      
      if (poolsResponse.body && poolsResponse.body.length > 0) {
        const testPool = poolsResponse.body[0];
        console.log(`🎯 Assigning licenses from pool: ${testPool.name} (ID: ${testPool.id})`);
        
        const licenseAssignmentData = {
          licensePoolId: testPool.id,
          assignedLicenses: 5,
          notes: 'Test license assignment for audit verification'
        };
        
        const assignResponse = await makeRequest('POST', `/api/clients/${testClient.id}/licenses`, licenseAssignmentData, cookies);
        
        if (assignResponse.statusCode === 201 || assignResponse.statusCode === 200) {
          console.log('✅ License assignment completed successfully!');
          
          // Wait and check for audit logs
          await new Promise(resolve => setTimeout(resolve, 1000));
          const finalAuditResponse = await makeRequest('GET', '/api/audit/logs', null, cookies);
          const finalCount = finalAuditResponse.body?.length || 0;
          const licenseAuditEntries = finalCount - afterCount;
          
          console.log(`🆕 License assignment audit entries created: ${licenseAuditEntries}`);
          
          if (licenseAuditEntries > 0) {
            console.log('🎉 License assignment audit logging IS WORKING!');
          } else {
            console.log('❌ License assignment audit logging NOT working!');
          }
        } else {
          console.log(`❌ License assignment failed: ${assignResponse.statusCode} - ${assignResponse.body}`);
        }
      } else {
        console.log('⚠️ No license pools found for testing');
      }
    } else {
      console.log('⚠️ No clients found for license assignment testing');
    }

    console.log('\n✅ Bulk import and license assignment audit testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testBulkImportAudit().catch(console.error); 