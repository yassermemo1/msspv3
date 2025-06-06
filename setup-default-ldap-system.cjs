#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { companySettings } = require('./shared/schema.ts');
const ldap = require('ldapjs');

// Database configuration
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'mssp_production',
  username: 'mssp_user',
  password: '12345678'
};

// LDAP Configuration for SITCO
const LDAP_CONFIG = {
  ldapEnabled: true,
  ldapUrl: 'ldap://ry1-lab-dc2.lab.sic.sitco.sa:389',
  ldapBindDn: 'svc-MSSPPlatform@lab.sic.sitco.sa',
  ldapBindPassword: 'dKdc531RPJc£K*K',
  ldapSearchBase: 'DC=lab,DC=sic,DC=sitco,DC=sa',
  ldapSearchFilter: '(sAMAccountName={{username}})', // Active Directory format
  ldapUsernameAttribute: 'sAMAccountName',
  ldapEmailAttribute: 'mail',
  ldapFirstNameAttribute: 'givenName',
  ldapLastNameAttribute: 'sn',
  ldapDefaultRole: 'user',
  ldapGroupSearchBase: 'DC=lab,DC=sic,DC=sitco,DC=sa',
  ldapGroupSearchFilter: '(&(objectClass=group)(member={{dn}}))',
  ldapAdminGroup: 'CN=Domain Admins,CN=Users,DC=lab,DC=sic,DC=sitco,DC=sa',
  ldapManagerGroup: 'CN=Managers,CN=Users,DC=lab,DC=sic,DC=sitco,DC=sa',
  ldapEngineerGroup: 'CN=Engineers,CN=Users,DC=lab,DC=sic,DC=sitco,DC=sa',
  ldapConnectionTimeout: 10000,
  ldapSearchTimeout: 15000,
  ldapCertificateVerification: false // Often needed for internal AD
};

async function setupDefaultLdapSystem() {
  const sql = postgres({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: DB_CONFIG.database,
    username: DB_CONFIG.username,
    password: DB_CONFIG.password,
  });
  
  const db = drizzle(sql);

  console.log('🔧 Setting up default LDAP configuration...\n');

  console.log('📋 SITCO LDAP Configuration:');
  console.log(`   Domain Controller: ry1-lab-dc2.lab.sic.sitco.sa`);
  console.log(`   Service Account: ${LDAP_CONFIG.ldapBindDn}`);
  console.log(`   Search Base: ${LDAP_CONFIG.ldapSearchBase}`);
  console.log(`   Search Filter: ${LDAP_CONFIG.ldapSearchFilter}\n`);

  try {
    // Check if company settings exist
    console.log('📋 Checking for existing company settings...');
    const existingSettings = await db.select().from(companySettings).limit(1);
    
    if (existingSettings.length > 0) {
      console.log('✅ Found existing company settings, updating LDAP configuration...');
      await db.update(companySettings)
        .set({
          ...LDAP_CONFIG,
          updatedAt: new Date(),
          updatedBy: 1 // Admin user
        });
      console.log('✅ LDAP configuration updated');
    } else {
      console.log('➕ Creating new company settings with LDAP configuration...');
      await db.insert(companySettings).values({
        companyName: 'MSSP Client Manager (SITCO)',
        ...LDAP_CONFIG,
        updatedBy: 1
      });
      console.log('✅ Company settings created with LDAP configuration');
    }

    // Test the LDAP connection
    console.log('\n🧪 Testing LDAP connection...\n');
    await testLdapConnection(LDAP_CONFIG);

    console.log('\n✅ Default LDAP system setup completed!');
    console.log('\n📋 Summary:');
    console.log(`   - LDAP Enabled: ${LDAP_CONFIG.ldapEnabled}`);
    console.log(`   - Domain Controller: ry1-lab-dc2.lab.sic.sitco.sa`);
    console.log(`   - Service Account: ${LDAP_CONFIG.ldapBindDn}`);
    console.log(`   - Search Base: ${LDAP_CONFIG.ldapSearchBase}`);
    console.log(`   - Default Role: ${LDAP_CONFIG.ldapDefaultRole}`);
    
  } catch (error) {
    console.error('❌ Error setting up LDAP system:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

async function testLdapConnection(config) {
  console.log('🔍 Testing LDAP Connection...');
  
  return new Promise((resolve) => {
    const client = ldap.createClient({
      url: config.ldapUrl,
      timeout: config.ldapConnectionTimeout,
      connectTimeout: config.ldapConnectionTimeout,
      reconnect: false,
      tlsOptions: {
        rejectUnauthorized: config.ldapCertificateVerification
      }
    });

    // Set up event handlers
    client.on('error', (error) => {
      console.log(`   ❌ Connection failed: ${error.message}`);
      
      if (error.code === 'ENOTFOUND') {
        console.log('   💡 DNS resolution failed - check domain controller name');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('   💡 Connection refused - check if LDAP service is running');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   💡 Connection timed out - check network connectivity');
      } else {
        console.log(`   💡 Error type: ${error.code || 'Unknown'}`);
      }
      
      client.destroy();
      resolve();
    });

    client.on('connect', () => {
      console.log('   ✅ Successfully connected to LDAP server');
      
      // Test bind operation
      console.log('   🔐 Testing bind operation...');
      client.bind(config.ldapBindDn, config.ldapBindPassword, (bindError) => {
        if (bindError) {
          console.log(`   ❌ Bind failed: ${bindError.message}`);
          
          if (bindError.name === 'InvalidCredentialsError') {
            console.log('   💡 Invalid credentials - check service account username/password');
          } else if (bindError.name === 'InsufficientAccessRightsError') {
            console.log('   💡 Insufficient access rights - check service account permissions');
          } else {
            console.log(`   💡 Bind error type: ${bindError.name || 'Unknown'}`);
          }
          
          client.destroy();
          resolve();
          return;
        }
        
        console.log('   ✅ Bind operation successful');
        
        // Test search operation
        console.log('   🔍 Testing search operation...');
        const searchFilter = '(objectClass=user)';
        const searchOptions = {
          filter: searchFilter,
          scope: 'sub',
          attributes: ['sAMAccountName', 'mail', 'givenName', 'sn', 'cn'],
          sizeLimit: 5,
          timeLimit: 10
        };
        
        client.search(config.ldapSearchBase, searchOptions, (searchError, searchResult) => {
          if (searchError) {
            console.log(`   ❌ Search failed: ${searchError.message}`);
            client.destroy();
            resolve();
            return;
          }
          
          let userCount = 0;
          const users = [];
          
          searchResult.on('searchEntry', (entry) => {
            userCount++;
            const user = {
              username: entry.object.sAMAccountName,
              email: entry.object.mail,
              firstName: entry.object.givenName,
              lastName: entry.object.sn,
              fullName: entry.object.cn
            };
            users.push(user);
          });
          
          searchResult.on('error', (err) => {
            console.log(`   ❌ Search error: ${err.message}`);
            client.destroy();
            resolve();
          });
          
          searchResult.on('end', (result) => {
            console.log(`   ✅ Search operation successful`);
            console.log(`   📊 Found ${userCount} users in directory`);
            
            if (users.length > 0) {
              console.log('   👥 Sample users:');
              users.slice(0, 3).forEach(user => {
                console.log(`      - ${user.username} (${user.fullName || 'No full name'}) - ${user.email || 'No email'}`);
              });
            }
            
            console.log(`   📊 Search status: ${result.status}`);
            client.destroy();
            resolve();
          });
        });
      });
    });

    // Start connection
    console.log(`   🌐 Connecting to: ${config.ldapUrl}`);
    console.log(`   👤 Service Account: ${config.ldapBindDn}`);
    console.log(`   🔑 Password: ${config.ldapBindPassword.substring(0, 5)}...`);
    
    // The connection will be established automatically when creating the client
    // If no 'connect' event is fired within timeout, we'll get an error
    setTimeout(() => {
      console.log('   ⏰ Connection timeout - no response from server');
      client.destroy();
      resolve();
    }, config.ldapConnectionTimeout + 2000);
  });
}

if (require.main === module) {
  setupDefaultLdapSystem()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Restart the application to apply LDAP configuration');
      console.log('2. Go to Settings page to verify LDAP configuration');
      console.log('3. Test LDAP login with domain users');
      console.log('4. Configure group mappings for role assignment');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDefaultLdapSystem }; 