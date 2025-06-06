#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { clients, externalSystems, clientExternalMappings } = require('./shared/schema.ts');
const { eq } = require('drizzle-orm');

// Database configuration
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'mssp_production',
  username: 'mssp_user',
  password: '12345678'
};

async function setupDefaultClientJiraMappings() {
  const sql = postgres({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: DB_CONFIG.database,
    username: DB_CONFIG.username,
    password: DB_CONFIG.password,
  });
  
  const db = drizzle(sql);

  console.log('🔗 Setting up default client Jira mappings...\n');

  try {
    // Get the Jira system we just created
    console.log('📋 Finding Jira external system...');
    const jiraSystems = await db.select().from(externalSystems).where(eq(externalSystems.systemName, 'jira'));
    
    if (jiraSystems.length === 0) {
      throw new Error('Jira system not found. Please run setup-default-jira-system.cjs first.');
    }
    
    const jiraSystem = jiraSystems[0];
    console.log(`✅ Found Jira system with ID: ${jiraSystem.id}`);

    // Get all clients
    console.log('👥 Getting all clients...');
    const allClients = await db.select().from(clients);
    console.log(`📊 Found ${allClients.length} clients`);

    if (allClients.length === 0) {
      console.log('⚠️  No clients found. Skipping mapping setup.');
      return;
    }

    // Create mappings for each client
    let mappingsCreated = 0;
    let mappingsUpdated = 0;

    for (const client of allClients) {
      try {
        // Check if mapping already exists
        const existingMappings = await db.select()
          .from(clientExternalMappings)
          .where(eq(clientExternalMappings.clientId, client.id))
          .where(eq(clientExternalMappings.systemName, 'jira'));

        // Create a default external identifier based on client name
        // This can be customized later by the user
        const defaultExternalId = client.shortName || client.name?.replace(/\s+/g, '').toUpperCase() || `CLIENT_${client.id}`;
        
        const mappingData = {
          clientId: client.id,
          systemName: 'jira',
          externalIdentifier: defaultExternalId,
          metadata: {
            defaultJql: `project = "${defaultExternalId}" AND status != "Done"`,
            customJql: null,
            maxResults: 100,
            fields: 'key,summary,status,assignee,priority,created,updated',
            description: `Default Jira mapping for ${client.name}`,
            autoCreated: true,
            createdAt: new Date().toISOString()
          },
          isActive: true,
          createdBy: 1 // Admin user
        };

        if (existingMappings.length > 0) {
          // Update existing mapping
          await db.update(clientExternalMappings)
            .set({
              externalIdentifier: mappingData.externalIdentifier,
              metadata: mappingData.metadata,
              isActive: mappingData.isActive,
              updatedAt: new Date()
            })
            .where(eq(clientExternalMappings.id, existingMappings[0].id));
          
          console.log(`✅ Updated mapping for client: ${client.name} → ${defaultExternalId}`);
          mappingsUpdated++;
        } else {
          // Create new mapping
          await db.insert(clientExternalMappings).values(mappingData);
          console.log(`➕ Created mapping for client: ${client.name} → ${defaultExternalId}`);
          mappingsCreated++;
        }

      } catch (clientError) {
        console.error(`❌ Error processing client ${client.name}:`, clientError.message);
      }
    }

    console.log('\n✅ Client Jira mappings setup completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total clients: ${allClients.length}`);
    console.log(`   - New mappings created: ${mappingsCreated}`);
    console.log(`   - Existing mappings updated: ${mappingsUpdated}`);
    console.log(`   - Jira system ID: ${jiraSystem.id}`);

    // Instructions for the user
    console.log('\n📋 Next Steps:');
    console.log('1. Connect to your company VPN to access the Jira server');
    console.log('2. Go to any client detail page → External Systems tab');
    console.log('3. Test the Jira connection');
    console.log('4. Customize the project keys (external identifiers) as needed');
    console.log('5. Modify JQL queries in the metadata for custom filtering');
    
    console.log('\n🔧 Troubleshooting:');
    console.log('- If connection fails: Check VPN connection and network access');
    console.log('- If authentication fails: Verify credentials in External Systems management');
    console.log('- If no data appears: Update the external identifier to match actual Jira project keys');
    
  } catch (error) {
    console.error('❌ Error setting up client mappings:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  setupDefaultClientJiraMappings()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDefaultClientJiraMappings }; 