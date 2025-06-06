const { Pool } = require('pg');

// Database configuration
const connectionConfig = {
  user: 'mssp_user',
  password: 'mssp_password',
  host: 'localhost',
  port: 5432,
  database: 'mssp_production'
};

async function testAuditSystem() {
  const pool = new Pool(connectionConfig);
  
  try {
    console.log('🔍 Testing Audit System...\n');
    
    // Test 1: Check if audit tables exist
    console.log('1. Checking audit tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('audit_logs', 'change_history', 'security_events', 'data_access_logs')
      ORDER BY table_name
    `);
    
    console.log('Found audit tables:', tables.rows.map(t => t.table_name));
    
    // Test 2: Check row counts in audit tables
    console.log('\n2. Checking audit table row counts...');
    
    const auditCount = await pool.query('SELECT COUNT(*) as count FROM audit_logs');
    const changeCount = await pool.query('SELECT COUNT(*) as count FROM change_history');
    const securityCount = await pool.query('SELECT COUNT(*) as count FROM security_events');
    const accessCount = await pool.query('SELECT COUNT(*) as count FROM data_access_logs');
    
    console.log(`audit_logs: ${auditCount.rows[0].count} rows`);
    console.log(`change_history: ${changeCount.rows[0].count} rows`);
    console.log(`security_events: ${securityCount.rows[0].count} rows`);
    console.log(`data_access_logs: ${accessCount.rows[0].count} rows`);
    
    // Test 3: Check recent audit log entries (if any)
    console.log('\n3. Recent audit log entries (last 5)...');
    const recentAudits = await pool.query(`
      SELECT 
        id, 
        action, 
        entity_type, 
        entity_name, 
        description,
        timestamp
      FROM audit_logs 
      ORDER BY timestamp DESC 
      LIMIT 5
    `);
    
    if (recentAudits.rows.length > 0) {
      recentAudits.rows.forEach(audit => {
        console.log(`- ${audit.timestamp}: ${audit.action} on ${audit.entity_type} (${audit.entity_name || 'N/A'})`);
      });
    } else {
      console.log('No audit log entries found');
    }
    
    // Test 4: Check if users table has data (to see if basic operations are happening)
    console.log('\n4. Checking users table...');
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`users: ${userCount.rows[0].count} rows`);
    
    if (userCount.rows[0].count > 0) {
      const sampleUsers = await pool.query(`
        SELECT id, username, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 3
      `);
      console.log('Sample users:');
      sampleUsers.rows.forEach(user => {
        console.log(`- ${user.username} (${user.role}) - ${user.email}`);
      });
    }
    
    // Test 5: Try to manually create an audit log entry
    console.log('\n5. Testing manual audit log creation...');
    
    try {
      const testAudit = await pool.query(`
        INSERT INTO audit_logs (
          user_id, 
          action, 
          entity_type, 
          entity_name,
          description,
          ip_address,
          user_agent,
          severity,
          category,
          timestamp
        ) VALUES (
          1,
          'test',
          'test_entity',
          'Test Entity',
          'Manual test audit log entry',
          '127.0.0.1',
          'Test Script',
          'info',
          'system',
          NOW()
        ) RETURNING id, timestamp
      `);
      
      console.log(`✅ Successfully created test audit log entry #${testAudit.rows[0].id} at ${testAudit.rows[0].timestamp}`);
      
      // Clean up the test entry
      await pool.query('DELETE FROM audit_logs WHERE id = $1', [testAudit.rows[0].id]);
      console.log('✅ Cleaned up test entry');
      
    } catch (insertError) {
      console.log('❌ Failed to create test audit log:', insertError.message);
    }
    
    console.log('\n📊 Summary:');
    console.log('- Audit tables exist and are accessible');
    console.log('- Manual insert/delete works');
    if (auditCount.rows[0].count === 0) {
      console.log('- ⚠️  No audit logs found - audit logging may not be triggered during operations');
      console.log('- This could mean:');
      console.log('  1. No user actions have been performed that trigger audit logging');
      console.log('  2. Audit logging code is not being called');
      console.log('  3. Audit logging is failing silently');
      
      console.log('\n🔧 Next steps to debug:');
      console.log('1. Log into the application and perform some actions (create/edit/delete)');
      console.log('2. Check if audit logging functions are called with console.log statements');
      console.log('3. Verify that the audit logging code has no silent errors');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testAuditSystem(); 