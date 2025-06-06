#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'mssp_user'}:${process.env.DB_PASSWORD || '12345678'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'mssp_production'}`;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`${message}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

async function createSchemaVersionsTable() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    await client.connect();
    logHeader('CREATING SCHEMA VERSIONS TABLE');
    
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schema_versions'
      );
    `);

    if (tableExists.rows[0].exists) {
      log('✅ schema_versions table already exists', 'green');
      
      // Check existing records
      const existingRecords = await client.query('SELECT * FROM schema_versions ORDER BY applied_at DESC LIMIT 5;');
      log(`📋 Found ${existingRecords.rows.length} existing version records`, 'blue');
      
      for (const record of existingRecords.rows) {
        log(`   • ${record.schema_version || record.version || 'unknown'} - ${new Date(record.applied_at || record.created_at).toLocaleString()}`, 'cyan');
      }
    } else {
      log('📝 Creating schema_versions table...', 'yellow');
      
      // Create the table
      await client.query(`
        CREATE TABLE schema_versions (
          id SERIAL PRIMARY KEY,
          script_version VARCHAR(20),
          app_version VARCHAR(20),
          schema_version VARCHAR(20) NOT NULL,
          version VARCHAR(20), -- For compatibility
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          environment VARCHAR(20) DEFAULT 'production',
          notes TEXT,
          migration_file VARCHAR(255),
          description TEXT
        );
      `);
      
      log('✅ schema_versions table created successfully', 'green');
      
      // Get current app version from package.json
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const currentVersion = packageJson.version;
      
      // Insert initial version record
      await client.query(`
        INSERT INTO schema_versions (
          script_version, 
          app_version, 
          schema_version, 
          version,
          environment, 
          notes,
          description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        currentVersion,
        currentVersion,
        currentVersion,
        currentVersion,
        'production',
        'Initial schema version created by setup script',
        `Database initialized with version ${currentVersion}`
      ]);
      
      log(`✅ Initial version record created: ${currentVersion}`, 'green');
    }

    // Get current database state for comparison
    const tablesCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    log(`\n📊 Current Database Status:`, 'blue');
    log(`   • Tables: ${tablesCount.rows[0].count}`, 'cyan');
    log(`   • Schema versions table: ✅ Ready`, 'green');
    
    // Show latest version
    const latestVersion = await client.query(`
      SELECT schema_version, version, applied_at, created_at, notes 
      FROM schema_versions 
      ORDER BY COALESCE(applied_at, created_at) DESC 
      LIMIT 1
    `);

    if (latestVersion.rows.length > 0) {
      const latest = latestVersion.rows[0];
      log(`   • Latest version: ${latest.schema_version || latest.version}`, 'green');
      log(`   • Applied: ${new Date(latest.applied_at || latest.created_at).toLocaleString()}`, 'cyan');
    }

  } catch (error) {
    log('❌ Error creating schema_versions table:', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
createSchemaVersionsTable().then(() => {
  log('\n🎉 Schema versions table setup completed!', 'green');
  log('\n💡 Next steps:', 'blue');
  log('   • Run: npm run sync:production', 'cyan');
  log('   • Or run: npm run db:compare', 'cyan');
}).catch(console.error); 