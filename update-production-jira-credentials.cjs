#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { externalSystems } = require('./shared/schema.ts');
const { eq } = require('drizzle-orm');

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mssp_production',
  username: process.env.DB_USER || 'mssp_user',
  password: process.env.DB_PASSWORD || '12345678'
};

async function updateProductionJiraCredentials() {
  // Ensure credentials are provided via environment variables
  if (!process.env.JIRA_USERNAME || !process.env.JIRA_PASSWORD) {
    console.error('❌ Error: JIRA_USERNAME and JIRA_PASSWORD environment variables are required');
    console.log('💡 Usage:');
    console.log('   JIRA_USERNAME=your-username JIRA_PASSWORD=your-password node update-production-jira-credentials.cjs');
    process.exit(1);
  }

  const sql = postgres({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: DB_CONFIG.database,
    username: DB_CONFIG.username,
    password: DB_CONFIG.password,
  });
  
  const db = drizzle(sql);

  console.log('🔧 Updating Production Jira credentials...\n');
  console.log(`📊 Database: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
  console.log(`👤 Jira Username: ${process.env.JIRA_USERNAME}`);
  console.log(`🔑 Jira Password: ${process.env.JIRA_PASSWORD.substring(0, 4)}...\n`);

  // Production-ready credentials using environment variables
  const productionCredentials = {
    authConfig: {
      username: process.env.JIRA_USERNAME,
      password: process.env.JIRA_PASSWORD,
      apiKey: process.env.JIRA_API_KEY || '',
      sslConfig: {
        rejectUnauthorized: false,
        allowSelfSigned: true,
        verifyHostname: false
      }
    },
    isActive: true, // Enable the system
    updatedAt: new Date(),
    metadata: {
      serverVersion: 'Jira 9.4.24',
      sslBypass: true,
      connectivityStatus: 'credentials_updated',
      apiAccessStatus: 'ready_for_testing',
      lastUpdatedAt: new Date().toISOString(),
      authMethod: 'basic_auth',
      environment: 'production',
      notes: `Production credentials updated via script. Username: ${process.env.JIRA_USERNAME}`
    }
  };

  try {
    // Check if Jira system exists
    const existingSystems = await db.select().from(externalSystems).where(eq(externalSystems.systemName, 'jira'));
    
    if (existingSystems.length === 0) {
      console.log('❌ No Jira system found in database');
      console.log('💡 Run setup-default-jira-system.cjs first to create the system');
      process.exit(1);
    }

    // Update Jira system with production credentials
    const result = await db.update(externalSystems)
      .set(productionCredentials)
      .where(eq(externalSystems.systemName, 'jira'))
      .returning();

    if (result.length > 0) {
      console.log('✅ Production Jira credentials updated successfully!');
      console.log(`   - System ID: ${result[0].id}`);
      console.log(`   - Username: ${productionCredentials.authConfig.username}`);
      console.log(`   - Active: ${productionCredentials.isActive}`);
      console.log(`   - Updated: ${productionCredentials.updatedAt}`);
      
      console.log('\n🎯 Next Steps:');
      console.log('   1. Restart your production server');
      console.log('   2. Test Jira connection in admin panel');
      console.log('   3. Verify external system integration');
      
      console.log('\n🔄 Restart Production Server:');
      console.log('   pkill -f "tsx server/index.ts"');
      console.log('   npm start');
      
    } else {
      console.log('❌ Failed to update Jira system');
    }
    
  } catch (error) {
    console.error('❌ Error updating production Jira credentials:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the update
updateProductionJiraCredentials()
  .then(() => {
    console.log('\n🎉 Production Jira credentials update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Update failed:', error);
    process.exit(1);
  }); 