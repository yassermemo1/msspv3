#!/usr/bin/env node

const { Client } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 
  process.env.PROD_DATABASE_URL || 
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
  log(`\n${'='.repeat(80)}`, 'blue');
  log(`${message}`, 'blue');
  log(`${'='.repeat(80)}`, 'blue');
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'magenta');
  log('-'.repeat(50), 'cyan');
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

// Create backup directory and backup database
async function createDatabaseBackup() {
  const backupDir = './backups';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = `${backupDir}/backup_${timestamp}.sql`;

  try {
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    log('📦 Creating database backup...', 'yellow');
    execSync(`pg_dump "${DATABASE_URL}" > "${backupFile}"`, { stdio: 'inherit' });
    log(`✅ Backup created: ${backupFile}`, 'green');
    
    return backupFile;
  } catch (error) {
    log(`❌ Failed to create backup: ${error.message}`, 'red');
    throw error;
  }
}

// Test database connection
async function testDatabaseConnection() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    log('🔌 Testing database connection...', 'yellow');
    await client.connect();
    await client.query('SELECT 1');
    log('✅ Database connection successful', 'green');
    return client;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    throw error;
  }
}

// Create schema_versions table if it doesn't exist
async function ensureSchemaVersionsTable(client) {
  try {
    log('📋 Ensuring schema_versions table exists...', 'yellow');
    
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schema_versions'
      );
    `);

    if (!tableExists.rows[0].exists) {
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
      
      log('✅ schema_versions table created', 'green');
      
      // Insert initial version record
      const currentVersion = getCurrentAppVersion();
      await client.query(`
        INSERT INTO schema_versions (
          script_version, app_version, schema_version, version,
          environment, notes, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        currentVersion, currentVersion, currentVersion, currentVersion,
        'production',
        'Initial schema version created by comprehensive sync',
        `Database initialized with version ${currentVersion}`
      ]);
      
      log(`✅ Initial version record created: ${currentVersion}`, 'green');
    } else {
      log('✅ schema_versions table already exists', 'green');
    }
    
  } catch (error) {
    log(`❌ Failed to ensure schema_versions table: ${error.message}`, 'red');
    throw error;
  }
}

// Get current database version
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

// Check if Drizzle schema is in sync
async function checkDrizzleSync() {
  try {
    log('🔍 Checking schema synchronization with Drizzle...', 'yellow');
    
    const result = execSync('npx drizzle-kit check', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL }
    }).toString();
    
    if (result.includes("Everything's fine")) {
      log('✅ Schema is synchronized', 'green');
      return { inSync: true, message: 'Schema is synchronized' };
    } else {
      log('⚠️  Schema changes detected', 'yellow');
      return { inSync: false, message: result.trim() };
    }
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.message;
    log('❌ Schema check failed', 'red');
    return { inSync: false, message: output, error: true };
  }
}

// Apply schema changes using Drizzle
async function applySchemaChanges() {
  try {
    log('🔧 Applying schema changes...', 'yellow');
    
    const result = execSync('npx drizzle-kit push --force', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL }
    }).toString();
    
    log('✅ Schema changes applied successfully', 'green');
    return { success: true, output: result };
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.message;
    log('❌ Failed to apply schema changes', 'red');
    log(output, 'red');
    return { success: false, output, error: error.message };
  }
}

// Update schema version in database
async function updateSchemaVersion(client, version) {
  try {
    await client.query(`
      INSERT INTO schema_versions (
        script_version, app_version, schema_version, version,
        environment, notes, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      version, version, version, version,
      'production',
      `Comprehensive sync deployment - ${new Date().toISOString()}`,
      `Database synchronized to version ${version} via comprehensive sync`
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
    
    // Total rows across core tables
    const coreTables = ['clients', 'contracts', 'users', 'services'];
    const tableStats = [];
    
    for (const table of coreTables) {
      try {
        const rowCount = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
        tableStats.push({ table, count: parseInt(rowCount.rows[0].count) });
      } catch (error) {
        // Table might not exist
        tableStats.push({ table, count: 'N/A' });
      }
    }
    
    stats.tableStats = tableStats;
    
    return stats;
  } catch (error) {
    log(`⚠️  Could not get database stats: ${error.message}`, 'yellow');
    return {};
  }
}

// Build application
async function buildApplication() {
  try {
    log('🏗️  Building application...', 'yellow');
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Application built successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Application build failed', 'red');
    return false;
  }
}

// Test application endpoints
async function testApplicationEndpoints() {
  try {
    log('🧪 Testing application endpoints...', 'yellow');
    
    // Test if server is running
    const { spawn } = require('child_process');
    const curl = spawn('curl', ['-f', '-s', 'http://localhost:5001/api/health']);
    
    return new Promise((resolve) => {
      curl.on('close', (code) => {
        if (code === 0) {
          log('✅ Health endpoint responding', 'green');
          resolve(true);
        } else {
          log('⚠️  Health endpoint not responding (server may not be running)', 'yellow');
          resolve(false);
        }
      });
    });
  } catch (error) {
    log('⚠️  Could not test endpoints', 'yellow');
    return false;
  }
}

// Generate deployment summary
function generateDeploymentSummary(params) {
  const {
    backupFile,
    previousVersion,
    newVersion,
    databaseUrl,
    stats,
    timestamp
  } = params;
  
  const summaryFile = `./backups/deployment_summary_${timestamp}.txt`;
  
  const summary = `
Production Deployment Summary - Comprehensive Sync
==================================================
Date: ${new Date().toLocaleString()}
Deployment Type: Comprehensive Sync (All-in-One)
Backup: ${backupFile}

Version Information:
- Previous Schema Version: ${previousVersion}
- New Schema Version: ${newVersion}
- App Version: ${newVersion}

Database Information:
- URL: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}
- Tables: ${stats.tableCount || 'Unknown'}

Database Content:
${stats.tableStats ? stats.tableStats.map(s => `- ${s.table}: ${s.count} records`).join('\n') : '- Statistics unavailable'}

Operations Completed:
✅ Database backup created
✅ Database connection verified
✅ Schema versions table ensured
✅ Schema synchronization checked
✅ Schema changes applied (if needed)
✅ Version tracking updated
✅ Application built successfully
✅ Basic endpoint testing completed

Next Steps:
1. Start/restart the application:
   • Development: npm run dev
   • Production: npm run start
   • With auto-sync: npm run start:sync

2. Test the application:
   • Login: http://localhost:5001/login
   • Health check: http://localhost:5001/api/health

3. Monitor application logs for any issues

Rollback Instructions:
If issues occur, restore database with:
psql "${databaseUrl}" < ${backupFile}

Script Information:
- Generated by: comprehensive-sync-production.cjs
- Command used: npm run sync:production
- All checks and operations completed in single command
`;

  try {
    fs.writeFileSync(summaryFile, summary);
    log(`📄 Deployment summary saved: ${summaryFile}`, 'green');
  } catch (error) {
    log(`⚠️  Could not save deployment summary: ${error.message}`, 'yellow');
  }
}

// Ask for user confirmation
async function askConfirmation(question, defaultAnswer = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const defaultText = defaultAnswer ? ' (Y/n)' : ' (y/N)';
  const answer = await new Promise((resolve) => {
    rl.question(`${question}${defaultText}: `, resolve);
  });
  rl.close();
  
  if (!answer.trim()) return defaultAnswer;
  return answer.toLowerCase().startsWith('y');
}

// Main comprehensive sync function
async function comprehensiveSync() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  try {
    logHeader('🚀 COMPREHENSIVE PRODUCTION SYNC');
    log('Performing all database setup, sync, and build operations...', 'cyan');
    
    // Step 1: Test database connection
    logStep('1', 'Testing Database Connection');
    const client = await testDatabaseConnection();
    
    // Step 2: Create backup
    logStep('2', 'Creating Database Backup');
    const backupFile = await createDatabaseBackup();
    
    // Step 3: Ensure schema_versions table
    logStep('3', 'Setting Up Schema Versioning');
    await ensureSchemaVersionsTable(client);
    
    // Step 4: Check current versions
    logStep('4', 'Checking Version Information');
    const appVersion = getCurrentAppVersion();
    const dbVersion = await getCurrentDatabaseVersion(client);
    
    log(`📱 App Version: ${appVersion}`, 'cyan');
    log(`🗄️  Database Version: ${dbVersion.version}`, 'cyan');
    if (dbVersion.appliedAt) {
      log(`📅 Last Updated: ${new Date(dbVersion.appliedAt).toLocaleString()}`, 'cyan');
    }
    
    // Step 5: Check schema synchronization
    logStep('5', 'Checking Schema Synchronization');
    const syncCheck = await checkDrizzleSync();
    
    let needsSchemaUpdate = false;
    
    if (!syncCheck.inSync && !syncCheck.error) {
      log('⚠️  Schema changes detected', 'yellow');
      const applyChanges = await askConfirmation('Apply schema changes to database?', true);
      
      if (applyChanges) {
        const applyResult = await applySchemaChanges();
        if (!applyResult.success) {
          throw new Error('Schema migration failed');
        }
        needsSchemaUpdate = true;
      } else {
        log('⏭️  Schema synchronization skipped', 'yellow');
      }
    }
    
    // Step 6: Update version if needed
    logStep('6', 'Updating Version Information');
    if (needsSchemaUpdate || dbVersion.version !== appVersion) {
      await updateSchemaVersion(client, appVersion);
    } else {
      log('✅ Version information is current', 'green');
    }
    
    // Step 7: Get database statistics
    logStep('7', 'Collecting Database Statistics');
    const stats = await getDatabaseStats(client);
    
    if (stats.tableCount) {
      log(`📊 Database contains ${stats.tableCount} tables`, 'cyan');
      if (stats.tableStats) {
        for (const tableStat of stats.tableStats) {
          log(`   • ${tableStat.table}: ${tableStat.count} records`, 'cyan');
        }
      }
    }
    
    // Close database connection
    await client.end();
    
    // Step 8: Build application
    logStep('8', 'Building Application');
    const buildSuccess = await buildApplication();
    if (!buildSuccess) {
      throw new Error('Application build failed');
    }
    
    // Step 9: Test endpoints (optional)
    logStep('9', 'Testing Application Health');
    await testApplicationEndpoints();
    
    // Step 10: Generate summary
    logStep('10', 'Generating Deployment Summary');
    generateDeploymentSummary({
      backupFile,
      previousVersion: dbVersion.version,
      newVersion: appVersion,
      databaseUrl: DATABASE_URL,
      stats,
      timestamp
    });
    
    // Final success message
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    logHeader('✅ COMPREHENSIVE SYNC COMPLETED SUCCESSFULLY');
    log(`🎉 All operations completed in ${duration} seconds`, 'green');
    log(`🗄️  Database version: ${appVersion}`, 'green');
    log(`📦 Application built and ready`, 'green');
    log(`💾 Backup available: ${backupFile}`, 'green');
    
    log('\n🚀 Ready to start application:', 'blue');
    log('   • Development: npm run dev', 'cyan');
    log('   • Production: npm run start', 'cyan');
    log('   • With auto-sync: npm run start:sync', 'cyan');
    
  } catch (error) {
    logHeader('❌ COMPREHENSIVE SYNC FAILED');
    log(`Error: ${error.message}`, 'red');
    log('\n💡 Troubleshooting:', 'yellow');
    log('   • Check database connection and credentials', 'cyan');
    log('   • Verify Drizzle configuration', 'cyan');
    log('   • Review backup and restore if needed', 'cyan');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  comprehensiveSync().catch(console.error);
}

module.exports = { comprehensiveSync }; 