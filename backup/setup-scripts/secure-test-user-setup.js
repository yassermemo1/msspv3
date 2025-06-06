import { testDataGenerator } from './server/lib/test-data-generator.js';
import { environmentConfig } from './server/lib/environment-config.js';
import { storage } from './server/storage.js';

async function setupSecureTestUsers() {
  console.log('🔐 Setting up secure test users...\n');

  try {
    // Load environment configuration
    const config = environmentConfig.loadConfig();
    
    if (!config.testing.enabled) {
      console.log('❌ Testing is disabled in this environment');
      return;
    }

    // Get secure test credentials
    const credentials = testDataGenerator.getTestCredentials();
    
    console.log('📋 Test User Credentials:');
    console.log('═══════════════════════════════════');
    
    // Create test users with secure credentials
    for (const [role, cred] of Object.entries(credentials)) {
      try {
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(cred.email);
        
        if (existingUser) {
          console.log(`✅ ${role.toUpperCase()}: ${cred.email} (exists)`);
          continue;
        }

        // Create new test user
        const hashedPassword = testDataGenerator.hashPassword(cred.password);
        
        const userData = {
          username: cred.username,
          email: cred.email,
          firstName: cred.username.charAt(0).toUpperCase() + cred.username.slice(1),
          lastName: 'User',
          role: cred.role,
          isActive: true,
          password: hashedPassword,
          authProvider: 'local',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const userId = await storage.createUser(userData);
        console.log(`✅ ${role.toUpperCase()}: ${cred.email} | Password: ${cred.password} (ID: ${userId})`);
        
      } catch (error) {
        console.error(`❌ Failed to create ${role} user:`, error.message);
      }
    }

    // Test LDAP configuration
    const ldapConfig = testDataGenerator.getLdapTestConfig();
    console.log('\n🔌 LDAP Test Configuration:');
    console.log('═══════════════════════════════════');
    console.log(`URL: ${ldapConfig.url}`);
    console.log(`Search Base: ${ldapConfig.searchBase}`);
    
    if (config.ldap.enabled) {
      console.log('✅ LDAP is enabled');
      console.log('🧪 Test with these LDAP users:');
      Object.entries(ldapConfig.testUsers).forEach(([role, user]) => {
        console.log(`  ${role.toUpperCase()}: ${user.username} | ${user.password}`);
      });
    } else {
      console.log('⚠️ LDAP is disabled');
    }

    // Environment summary
    console.log('\n⚙️ Environment Summary:');
    console.log('═══════════════════════════════════');
    console.log(`Environment: ${config.server.environment}`);
    console.log(`Database: ${config.database.url.includes('localhost') ? 'Local' : 'Remote'}`);
    console.log(`Server: ${config.server.host}:${config.server.port}`);
    console.log(`Email: ${config.email.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`Currency: ${config.ui.currency.default}`);
    console.log(`Theme: ${config.ui.theme.defaultTheme}`);

    console.log('\n✅ Test user setup completed successfully!');
    console.log('\n💡 Tips:');
    console.log('- Set TEST_PASSWORD env var to use a custom password for all test accounts');
    console.log('- Set TEST_EMAIL_DOMAIN to customize email domain');
    console.log('- Use these credentials to test different user roles and permissions');
    console.log('- LDAP users will be auto-created on first login if LDAP is enabled');

  } catch (error) {
    console.error('❌ Failed to setup test users:', error);
    process.exit(1);
  }
}

async function generateSampleData() {
  console.log('\n📊 Generating sample business data...\n');

  try {
    const config = environmentConfig.loadConfig();
    
    if (!config.testing.dataGeneration) {
      console.log('⚠️ Test data generation is disabled');
      return;
    }

    // Generate sample clients
    console.log('Creating sample clients...');
    for (let i = 0; i < 5; i++) {
      const clientData = testDataGenerator.generateTestClient();
      try {
        await storage.createClient(clientData);
        console.log(`✅ Client: ${clientData.name}`);
      } catch (error) {
        console.log(`⚠️ Client creation skipped: ${error.message}`);
      }
    }

    // Generate sample services
    console.log('\nCreating sample services...');
    for (let i = 0; i < 3; i++) {
      const serviceData = testDataGenerator.generateTestService();
      try {
        await storage.createService(serviceData);
        console.log(`✅ Service: ${serviceData.name}`);
      } catch (error) {
        console.log(`⚠️ Service creation skipped: ${error.message}`);
      }
    }

    console.log('\n✅ Sample data generation completed!');

  } catch (error) {
    console.error('❌ Failed to generate sample data:', error);
  }
}

// Main execution
(async () => {
  console.log('🚀 MSSP Client Manager - Secure Setup');
  console.log('═══════════════════════════════════════\n');

  await setupSecureTestUsers();
  await generateSampleData();

  console.log('\n🎉 Setup completed! You can now start the application.');
  console.log('📱 Frontend: npm run dev (in client directory)');
  console.log('🖥️  Backend: npm start (in root directory)');
})().catch(error => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
}); 