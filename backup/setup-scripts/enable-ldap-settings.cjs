const { Pool } = require('pg');

async function enableLdapSettings() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:password@localhost:5432/mssp_client_management'
  });

  try {
    console.log('🔧 Configuring LDAP settings in database...');
    
    // First check if company_settings table exists and has LDAP columns
    const tableCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'company_settings' AND column_name = 'ldap_enabled'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ LDAP columns not found in company_settings table');
      console.log('Please run the LDAP migration first:');
      console.log('psql -d mssp_client_management -f migrations/add-ldap-settings.sql');
      return;
    }

    // Check if any company settings exist
    const existingSettings = await pool.query('SELECT * FROM company_settings LIMIT 1');
    
    if (existingSettings.rows.length === 0) {
      // Create new company settings with LDAP enabled
      console.log('Creating new company settings with LDAP enabled...');
      const result = await pool.query(`
        INSERT INTO company_settings (
          company_name,
          ldap_enabled,
          ldap_url,
          ldap_bind_dn,
          ldap_bind_password,
          ldap_search_base,
          ldap_search_filter,
          ldap_username_attribute,
          ldap_email_attribute,
          ldap_first_name_attribute,
          ldap_last_name_attribute,
          ldap_default_role,
          ldap_connection_timeout,
          ldap_search_timeout,
          ldap_certificate_verification
        ) VALUES (
          'MSSP Client Manager',
          true,
          'ldap://ldap.forumsys.com:389',
          'cn=read-only-admin,dc=example,dc=com',
          'password',
          'dc=example,dc=com',
          '(uid={{username}})',
          'uid',
          'mail',
          'givenName',
          'sn',
          'user',
          5000,
          10000,
          false
        ) RETURNING id
      `);
      
      console.log('✅ Company settings created with LDAP enabled!');
      console.log(`Settings ID: ${result.rows[0].id}`);
    } else {
      // Update existing company settings to enable LDAP
      console.log('Updating existing company settings to enable LDAP...');
      const result = await pool.query(`
        UPDATE company_settings SET
          ldap_enabled = true,
          ldap_url = 'ldap://ldap.forumsys.com:389',
          ldap_bind_dn = 'cn=read-only-admin,dc=example,dc=com',
          ldap_bind_password = 'password',
          ldap_search_base = 'dc=example,dc=com',
          ldap_search_filter = '(uid={{username}})',
          ldap_username_attribute = 'uid',
          ldap_email_attribute = 'mail',
          ldap_first_name_attribute = 'givenName',
          ldap_last_name_attribute = 'sn',
          ldap_default_role = 'user',
          ldap_connection_timeout = 5000,
          ldap_search_timeout = 10000,
          ldap_certificate_verification = false,
          updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `, [existingSettings.rows[0].id]);
      
      console.log('✅ Company settings updated with LDAP enabled!');
      console.log(`Settings ID: ${result.rows[0].id}`);
    }

    // Display test users for verification
    console.log('\n🧪 Test LDAP Users (Forumsys):');
    console.log('Username: tesla     | Password: password');
    console.log('Username: einstein  | Password: password');
    console.log('Username: newton    | Password: password');
    console.log('\n📋 LDAP Configuration:');
    console.log('Server: ldap://ldap.forumsys.com:389');
    console.log('Search Base: dc=example,dc=com');
    console.log('Search Filter: (uid={{username}})');
    console.log('\n⚠️  Note: Restart the server to load the new LDAP configuration');
    
  } catch (error) {
    console.error('❌ Failed to enable LDAP settings:', error.message);
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('\n💡 Solution: Run the LDAP migration first:');
      console.log('psql -d mssp_client_management -f migrations/add-ldap-settings.sql');
    }
  } finally {
    await pool.end();
  }
}

enableLdapSettings(); 