#!/usr/bin/env node

const { Client } = require('pg');

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

async function quickSchemaCheck() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    await client.connect();
    log('🔗 Connected to database', 'green');

    // Get table count
    const tableCountResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tableCountResult.rows[0].count);

    // Get total rows across all tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    let totalRows = 0;
    const tableStats = [];

    for (const table of tablesResult.rows) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
        const rowCount = parseInt(countResult.rows[0].count);
        totalRows += rowCount;
        
        if (rowCount > 0) {
          tableStats.push({ name: table.table_name, rows: rowCount });
        }
      } catch (error) {
        log(`⚠️  Could not count rows in ${table.table_name}: ${error.message}`, 'yellow');
      }
    }

    // Get foreign key count
    const fkResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' 
      AND table_schema = 'public'
    `);
    const foreignKeyCount = parseInt(fkResult.rows[0].count);

    // Get index count
    const indexResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    const indexCount = parseInt(indexResult.rows[0].count);

    // Display results
    log('\n📊 DATABASE SCHEMA QUICK CHECK', 'cyan');
    log('═'.repeat(40), 'cyan');
    log(`📋 Total Tables: ${tableCount}`, 'bright');
    log(`📊 Total Rows: ${totalRows.toLocaleString()}`, 'bright');
    log(`🔗 Foreign Keys: ${foreignKeyCount}`, 'bright');
    log(`📑 Indexes: ${indexCount}`, 'bright');

    if (tableStats.length > 0) {
      log('\n📈 Tables with Data:', 'green');
      tableStats
        .sort((a, b) => b.rows - a.rows)
        .slice(0, 10)
        .forEach(table => {
          log(`  • ${table.name}: ${table.rows.toLocaleString()} rows`, 'green');
        });
      
      if (tableStats.length > 10) {
        log(`  ... and ${tableStats.length - 10} more tables with data`, 'cyan');
      }
    } else {
      log('\n📝 All tables are empty (fresh database)', 'yellow');
    }

    // Check if this is a 46 or 51 table schema
    if (tableCount === 46) {
      log('\n✅ You have the 46-table schema (current development version)', 'green');
    } else if (tableCount === 51) {
      log('\n✅ You have the 51-table schema (extended version)', 'green');
    } else {
      log(`\n⚠️  You have ${tableCount} tables (non-standard count)`, 'yellow');
    }

    log('\n🔧 Quick Commands:', 'blue');
    log('  • Full schema analysis: node check-schema-changes.cjs', 'cyan');
    log('  • Database verification: ./verify-database-schema.sh', 'cyan');
    log('  • View in browser: npm run db:studio', 'cyan');

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
if (require.main === module) {
  quickSchemaCheck().catch(console.error);
}

module.exports = { quickSchemaCheck }; 