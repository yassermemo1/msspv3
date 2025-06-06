#!/usr/bin/env node

const { Client } = require('pg');
const { execSync } = require('child_process');
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

// Get current app version from package.json
function getCurrentAppVersion() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    log('⚠️  Could not read package.json version, using default', 'yellow');
    return '1.0.0';
  }
}

// Get current database schema version
async function getCurrentDatabaseVersion(client) {
  try {
    const result = await client.query(`
      SELECT COALESCE(schema_version, version, 'unknown') as version,
             COALESCE(applied_at, created_at) as applied_at
      FROM schema_versions 
      ORDER BY COALESCE(applied_at, created_at) DESC 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      return {
        version: result.rows[0].version,
        appliedAt: result.rows[0].applied_at
      };
    }
    
    return { version: 'none', appliedAt: null };
  } catch (error) {
    log('⚠️  Could not query schema_versions table', 'yellow');
    return { version: 'none', appliedAt: null };
  }
}

// Check if Drizzle schema is in sync with database
async function checkDrizzleSync() {
  try {
    log('🔍 Checking Drizzle schema synchronization...', 'blue');
    
    const result = execSync('npx drizzle-kit check', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL }
    }).toString();
    
    if (result.includes("Everything's fine")) {
      return { inSync: true, message: 'Schema is synchronized' };
    } else {
      return { inSync: false, message: result.trim() };
    }
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.message;
    return { inSync: false, message: output, error: true };
  }
}

// Apply schema changes using Drizzle
async function applySchemaChanges(dryRun = false) {
  try {
    const command = dryRun ? 'npx drizzle-kit check' : 'npx drizzle-kit push --force';
    log(`${dryRun ? '🔍 Checking' : '🔧 Applying'} schema changes...`, 'yellow');
    
    const result = execSync(command, {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL }
    }).toString();
    
    return { success: true, output: result };
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.message;
    return { success: false, output, error: error.message };
  }
}

// Update schema version in database
async function updateSchemaVersion(client, version) {
  try {
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
      version,
      version,
      version,
      version,
      'production',
      `Schema synced from Drizzle - ${new Date().toISOString()}`,
      `Database schema synchronized to version ${version} using Drizzle-kit`
    ]);
    
    log(`✅ Schema version updated to ${version}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to update schema version: ${error.message}`, 'red');
    return false;
  }
}

// Get database statistics
async function getDatabaseStats(client) {
  try {
    const stats = {};
    
    // Table count
    const tableCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    stats.tableCount = parseInt(tableCount.rows[0].count);
    
    // Total rows across all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    let totalRows = 0;
    for (const table of tables.rows) {
      try {
        const rowCount = await client.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
        totalRows += parseInt(rowCount.rows[0].count);
      } catch (error) {
        // Skip tables we can't access
      }
    }
    stats.totalRows = totalRows;
    
    // Foreign key count
    const fkCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' 
      AND table_schema = 'public'
    `);
    stats.foreignKeyCount = parseInt(fkCount.rows[0].count);
    
    // Index count  
    const indexCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    stats.indexCount = parseInt(indexCount.rows[0].count);
    
    return stats;
  } catch (error) {
    log(`⚠️  Could not get database stats: ${error.message}`, 'yellow');
    return {};
  }
}

// Main sync function
async function syncSchemaFromDrizzle() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    await client.connect();
    logHeader('DRIZZLE SCHEMA SYNCHRONIZATION');
    
    // Get versions
    const appVersion = getCurrentAppVersion();
    const dbVersion = await getCurrentDatabaseVersion(client);
    
    log(`📱 App Version: ${appVersion}`, 'cyan');
    log(`🗄️  Database Version: ${dbVersion.version}`, 'cyan');
    if (dbVersion.appliedAt) {
      log(`📅 Last Updated: ${new Date(dbVersion.appliedAt).toLocaleString()}`, 'cyan');
    }
    
    // Check if versions match
    if (dbVersion.version === appVersion) {
      log('\n✅ Database version matches app version', 'green');
    } else {
      log('\n⚠️  Database version does not match app version', 'yellow');
      log(`   Expected: ${appVersion}`, 'yellow');
      log(`   Current: ${dbVersion.version}`, 'yellow');
    }
    
    // Check Drizzle synchronization
    log('\n🔍 Checking Drizzle schema synchronization...', 'blue');
    const syncCheck = await checkDrizzleSync();
    
    if (syncCheck.inSync) {
      log('✅ Database schema is synchronized with Drizzle definitions', 'green');
      
      // Update version if needed
      if (dbVersion.version !== appVersion) {
        log('\n🔄 Updating database version to match app version...', 'yellow');
        await updateSchemaVersion(client, appVersion);
      }
    } else {
      log('⚠️  Database schema is NOT synchronized with Drizzle definitions', 'yellow');
      log(`Details: ${syncCheck.message}`, 'cyan');
      
      if (!syncCheck.error) {
        // Prompt for confirmation
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise((resolve) => {
          rl.question('\n🤔 Apply schema changes to database? (y/N): ', resolve);
        });
        rl.close();
        
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          log('\n🔧 Applying schema changes...', 'yellow');
          const applyResult = await applySchemaChanges(false);
          
          if (applyResult.success) {
            log('✅ Schema changes applied successfully', 'green');
            await updateSchemaVersion(client, appVersion);
          } else {
            log('❌ Failed to apply schema changes', 'red');
            log(applyResult.output, 'red');
            process.exit(1);
          }
        } else {
          log('⏭️  Schema synchronization skipped', 'yellow');
        }
      } else {
        log('❌ Error checking schema synchronization', 'red');
        log(syncCheck.message, 'red');
      }
    }
    
    // Display database statistics
    log('\n📊 Database Statistics:', 'blue');
    const stats = await getDatabaseStats(client);
    
    if (stats.tableCount !== undefined) {
      log(`   • Tables: ${stats.tableCount}`, 'cyan');
    }
    if (stats.totalRows !== undefined) {
      log(`   • Total Rows: ${stats.totalRows}`, 'cyan');
    }
    if (stats.foreignKeyCount !== undefined) {
      log(`   • Foreign Keys: ${stats.foreignKeyCount}`, 'cyan');
    }
    if (stats.indexCount !== undefined) {
      log(`   • Indexes: ${stats.indexCount}`, 'cyan');
    }
    
    // Final status
    const finalCheck = await checkDrizzleSync();
    if (finalCheck.inSync) {
      logHeader('✅ SCHEMA SYNCHRONIZATION COMPLETED');
      log('✅ Database schema is fully synchronized', 'green');
      log(`🎯 Current version: ${appVersion}`, 'green');
      log('🚀 Ready for production deployment', 'green');
    } else {
      logHeader('⚠️  SCHEMA SYNCHRONIZATION INCOMPLETE');
      log('⚠️  Database schema still has differences', 'yellow');
      log('💡 Consider running the sync process again', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
if (require.main === module) {
  syncSchemaFromDrizzle().catch(console.error);
}

module.exports = { syncSchemaFromDrizzle }; 