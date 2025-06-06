#!/usr/bin/env node

const ldap = require('ldapjs');
const dns = require('dns');
const net = require('net');

// Your SITCO LDAP credentials
const LDAP_CONFIG = {
  url: 'ldap://ry1-lab-dc2.lab.sic.sitco.sa:389',
  bindDn: 'svc-MSSPPlatform@lab.sic.sitco.sa',
  password: 'dKdc531RPJc£K*K',
  searchBase: 'DC=lab,DC=sic,DC=sitco,DC=sa',
  searchFilter: '(sAMAccountName={{username}})',
  domainController: 'ry1-lab-dc2.lab.sic.sitco.sa',
  port: 389
};

async function testLdapConnection() {
  console.log('🔍 Testing SITCO LDAP Connection');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🌐 Domain Controller: ${LDAP_CONFIG.domainController}`);
  console.log(`🚪 Port: ${LDAP_CONFIG.port}`);
  console.log(`👤 Service Account: ${LDAP_CONFIG.bindDn}`);
  console.log(`🔑 Password: ${LDAP_CONFIG.password.substring(0, 5)}...`);
  console.log(`🔍 Search Base: ${LDAP_CONFIG.searchBase}\n`);

  // Step 1: DNS Resolution Test
  console.log('📡 Step 1: DNS Resolution Test');
  await testDnsResolution();

  // Step 2: Network Connectivity Test
  console.log('\n🌐 Step 2: Network Connectivity Test');
  await testNetworkConnectivity();

  // Step 3: LDAP Protocol Test
  console.log('\n🔐 Step 3: LDAP Protocol Test');
  await testLdapProtocol();

  // Step 4: Authentication Test
  console.log('\n🛡️  Step 4: Service Account Authentication Test');
  await testAuthentication();

  // Step 5: Search Capability Test
  console.log('\n🔍 Step 5: Directory Search Test');
  await testDirectorySearch();

  console.log('\n✅ LDAP Connection Testing Complete!');
}

async function testDnsResolution() {
  console.log(`   🔍 Resolving: ${LDAP_CONFIG.domainController}`);
  
  return new Promise((resolve) => {
    dns.lookup(LDAP_CONFIG.domainController, (err, address, family) => {
      if (err) {
        console.log(`   ❌ DNS Resolution Failed: ${err.message}`);
        console.log('   💡 Possible solutions:');
        console.log('      - Check if you\'re connected to the corporate VPN');
        console.log('      - Verify the domain controller name is correct');
        console.log('      - Check DNS server configuration');
        console.log('      - Try using IP address instead of hostname');
      } else {
        console.log(`   ✅ DNS Resolution Successful`);
        console.log(`   📍 IP Address: ${address} (IPv${family})`);
      }
      resolve();
    });
  });
}

async function testNetworkConnectivity() {
  console.log(`   🔗 Testing TCP connection to ${LDAP_CONFIG.domainController}:${LDAP_CONFIG.port}`);
  
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;
    
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.log('   ❌ Connection Timeout (10 seconds)');
        console.log('   💡 Possible solutions:');
        console.log('      - Check firewall rules (port 389 should be open)');
        console.log('      - Verify you\'re on the correct network/VPN');
        console.log('      - Try different port (636 for LDAPS)');
        socket.destroy();
        resolve();
      }
    }, 10000);

    socket.on('connect', () => {
      if (!isResolved) {
        isResolved = true;
        console.log('   ✅ TCP Connection Successful');
        console.log(`   🌐 Connected to ${socket.remoteAddress}:${socket.remotePort}`);
        clearTimeout(timeout);
        socket.destroy();
        resolve();
      }
    });

    socket.on('error', (err) => {
      if (!isResolved) {
        isResolved = true;
        console.log(`   ❌ TCP Connection Failed: ${err.message}`);
        
        if (err.code === 'ENOTFOUND') {
          console.log('   💡 Domain controller not found - check DNS/hostname');
        } else if (err.code === 'ECONNREFUSED') {
          console.log('   💡 Connection refused - LDAP service may not be running');
        } else if (err.code === 'ETIMEDOUT') {
          console.log('   💡 Connection timed out - check network/firewall');
        }
        
        clearTimeout(timeout);
        resolve();
      }
    });

    socket.connect(LDAP_CONFIG.port, LDAP_CONFIG.domainController);
  });
}

async function testLdapProtocol() {
  console.log(`   🔌 Creating LDAP client connection`);
  
  return new Promise((resolve) => {
    const client = ldap.createClient({
      url: LDAP_CONFIG.url,
      timeout: 15000,
      connectTimeout: 10000,
      reconnect: false,
      tlsOptions: {
        rejectUnauthorized: false // Often needed for internal AD
      }
    });

    let isResolved = false;

    const resolveOnce = (message, success = true) => {
      if (!isResolved) {
        isResolved = true;
        console.log(message);
        client.destroy();
        resolve();
      }
    };

    client.on('connect', () => {
      resolveOnce('   ✅ LDAP Protocol Connection Successful');
    });

    client.on('error', (err) => {
      console.log(`   ❌ LDAP Protocol Failed: ${err.message}`);
      
      if (err.message.includes('ENOTFOUND')) {
        console.log('   💡 Domain controller not reachable');
      } else if (err.message.includes('ECONNREFUSED')) {
        console.log('   💡 LDAP service not running on target port');
      } else if (err.message.includes('timeout')) {
        console.log('   💡 LDAP server not responding - check service status');
      }
      
      resolveOnce('', false);
    });

    // Fallback timeout
    setTimeout(() => {
      resolveOnce('   ⏰ LDAP connection timeout - no response from server');
    }, 12000);
  });
}

async function testAuthentication() {
  console.log(`   🔐 Testing service account authentication`);
  console.log(`   👤 Account: ${LDAP_CONFIG.bindDn}`);
  
  return new Promise((resolve) => {
    const client = ldap.createClient({
      url: LDAP_CONFIG.url,
      timeout: 15000,
      connectTimeout: 10000,
      reconnect: false,
      tlsOptions: {
        rejectUnauthorized: false
      }
    });

    let isResolved = false;

    client.on('error', (err) => {
      if (!isResolved) {
        isResolved = true;
        console.log(`   ❌ Authentication Connection Failed: ${err.message}`);
        client.destroy();
        resolve();
      }
    });

    client.on('connect', () => {
      console.log('   🔗 Connected, attempting bind...');
      
      client.bind(LDAP_CONFIG.bindDn, LDAP_CONFIG.password, (bindErr) => {
        if (!isResolved) {
          isResolved = true;
          
          if (bindErr) {
            console.log(`   ❌ Authentication Failed: ${bindErr.message}`);
            
            if (bindErr.name === 'InvalidCredentialsError') {
              console.log('   💡 Invalid credentials:');
              console.log('      - Check service account username format');
              console.log('      - Verify password is correct');
              console.log('      - Ensure account is not locked/disabled');
            } else if (bindErr.name === 'InsufficientAccessRightsError') {
              console.log('   💡 Insufficient access rights:');
              console.log('      - Service account needs read permissions');
              console.log('      - Check domain security policies');
            } else {
              console.log(`   💡 Authentication error type: ${bindErr.name || 'Unknown'}`);
            }
          } else {
            console.log('   ✅ Authentication Successful!');
            console.log('   🎉 Service account can bind to Active Directory');
          }
          
          client.destroy();
          resolve();
        }
      });
    });

    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.log('   ⏰ Authentication timeout');
        client.destroy();
        resolve();
      }
    }, 15000);
  });
}

async function testDirectorySearch() {
  console.log(`   🔍 Testing directory search capabilities`);
  console.log(`   📂 Search Base: ${LDAP_CONFIG.searchBase}`);
  
  return new Promise((resolve) => {
    const client = ldap.createClient({
      url: LDAP_CONFIG.url,
      timeout: 20000,
      connectTimeout: 10000,
      reconnect: false,
      tlsOptions: {
        rejectUnauthorized: false
      }
    });

    let isResolved = false;

    client.on('error', (err) => {
      if (!isResolved) {
        isResolved = true;
        console.log(`   ❌ Search Connection Failed: ${err.message}`);
        client.destroy();
        resolve();
      }
    });

    client.on('connect', () => {
      client.bind(LDAP_CONFIG.bindDn, LDAP_CONFIG.password, (bindErr) => {
        if (bindErr) {
          if (!isResolved) {
            isResolved = true;
            console.log(`   ❌ Search Bind Failed: ${bindErr.message}`);
            client.destroy();
            resolve();
          }
          return;
        }
        
        console.log('   🔍 Executing search query...');
        
        const searchOptions = {
          filter: '(objectClass=user)',
          scope: 'sub',
          attributes: ['sAMAccountName', 'mail', 'givenName', 'sn', 'cn', 'department', 'title'],
          sizeLimit: 10,
          timeLimit: 15
        };
        
        client.search(LDAP_CONFIG.searchBase, searchOptions, (searchErr, searchResult) => {
          if (searchErr) {
            if (!isResolved) {
              isResolved = true;
              console.log(`   ❌ Search Failed: ${searchErr.message}`);
              
              if (searchErr.message.includes('timeout')) {
                console.log('   💡 Search timeout - try smaller search scope');
              } else if (searchErr.message.includes('permission')) {
                console.log('   💡 Permission denied - check service account rights');
              }
              
              client.destroy();
              resolve();
            }
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
              fullName: entry.object.cn,
              department: entry.object.department,
              title: entry.object.title
            };
            users.push(user);
          });
          
          searchResult.on('error', (err) => {
            if (!isResolved) {
              isResolved = true;
              console.log(`   ❌ Search Stream Error: ${err.message}`);
              client.destroy();
              resolve();
            }
          });
          
          searchResult.on('end', (result) => {
            if (!isResolved) {
              isResolved = true;
              console.log(`   ✅ Search Successful!`);
              console.log(`   📊 Found ${userCount} user accounts`);
              
              if (users.length > 0) {
                console.log('   👥 Sample users from directory:');
                users.slice(0, 5).forEach((user, index) => {
                  console.log(`      ${index + 1}. ${user.username}`);
                  if (user.fullName) console.log(`         Name: ${user.fullName}`);
                  if (user.email) console.log(`         Email: ${user.email}`);
                  if (user.department) console.log(`         Department: ${user.department}`);
                  if (user.title) console.log(`         Title: ${user.title}`);
                  console.log('');
                });
              }
              
              console.log(`   📈 Search Result Status: ${result.status}`);
              console.log('   🎯 Directory search capabilities verified!');
              
              client.destroy();
              resolve();
            }
          });
        });
      });
    });

    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.log('   ⏰ Search operation timeout');
        client.destroy();
        resolve();
      }
    }, 20000);
  });
}

if (require.main === module) {
  testLdapConnection()
    .then(() => {
      console.log('\n📋 Testing Summary:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎯 Run this script from production environment where:');
      console.log('   ✓ Corporate VPN is connected');
      console.log('   ✓ Domain controller is accessible');
      console.log('   ✓ Firewall allows LDAP traffic (port 389)');
      console.log('   ✓ Service account credentials are correct');
      console.log('\n💡 If all tests pass, LDAP authentication should work!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error);
      process.exit(1);
    });
} 