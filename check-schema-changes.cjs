#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mssp_user:devpass123@localhost:5432/mssp_production';

// Schema snapshot file
const SCHEMA_SNAPSHOT_FILE = path.join(__dirname, 'schema-snapshot.json');

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
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(` ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSection(message) {
  log(`\n${'─'.repeat(40)}`, 'blue');
  log(` ${message}`, 'blue');
  log(`${'─'.repeat(40)}`, 'blue');
}

async function getCurrentSchema(client) {
  log('📊 Analyzing current database schema...', 'cyan');
  
  // Get all tables
  const tablesResult = await client.query(`
    SELECT 
      table_name,
      table_type
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);

  const schema = {
    timestamp: new Date().toISOString(),
    table_count: tablesResult.rows.length,
    tables: {}
  };

  // Get detailed information for each table
  for (const table of tablesResult.rows) {
    const tableName = table.table_name;
    
    // Get columns
    const columnsResult = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    // Get indexes
    const indexesResult = await client.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename = $1
      ORDER BY indexname
    `, [tableName]);

    // Get foreign keys
    const foreignKeysResult = await client.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema='public'
        AND tc.table_name = $1
    `, [tableName]);

    // Get constraints
    const constraintsResult = await client.query(`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public' 
        AND table_name = $1
      ORDER BY constraint_name
    `, [tableName]);

    // Get row count
    const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);

    schema.tables[tableName] = {
      type: table.table_type,
      columns: columnsResult.rows,
      indexes: indexesResult.rows,
      foreign_keys: foreignKeysResult.rows,
      constraints: constraintsResult.rows,
      row_count: parseInt(countResult.rows[0].count)
    };
  }

  return schema;
}

function loadPreviousSchema() {
  if (fs.existsSync(SCHEMA_SNAPSHOT_FILE)) {
    try {
      const data = fs.readFileSync(SCHEMA_SNAPSHOT_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      log(`⚠️  Could not load previous schema: ${error.message}`, 'yellow');
      return null;
    }
  }
  return null;
}

function saveSchema(schema) {
  try {
    fs.writeFileSync(SCHEMA_SNAPSHOT_FILE, JSON.stringify(schema, null, 2));
    log(`✅ Schema snapshot saved to ${SCHEMA_SNAPSHOT_FILE}`, 'green');
  } catch (error) {
    log(`❌ Could not save schema snapshot: ${error.message}`, 'red');
  }
}

function compareSchemas(current, previous) {
  if (!previous) {
    log('📝 No previous schema found. This will be the baseline.', 'yellow');
    return {
      changes: [],
      summary: {
        new_tables: Object.keys(current.tables).length,
        dropped_tables: 0,
        modified_tables: 0,
        new_columns: 0,
        dropped_columns: 0
      }
    };
  }

  const changes = [];
  const summary = {
    new_tables: 0,
    dropped_tables: 0,
    modified_tables: 0,
    new_columns: 0,
    dropped_columns: 0
  };

  const currentTables = new Set(Object.keys(current.tables));
  const previousTables = new Set(Object.keys(previous.tables));

  // Check for new tables
  const newTables = [...currentTables].filter(table => !previousTables.has(table));
  const droppedTables = [...previousTables].filter(table => !currentTables.has(table));

  summary.new_tables = newTables.length;
  summary.dropped_tables = droppedTables.length;

  // Log new tables
  if (newTables.length > 0) {
    changes.push({
      type: 'NEW_TABLES',
      tables: newTables,
      details: newTables.map(table => ({
        name: table,
        columns: current.tables[table].columns.length,
        row_count: current.tables[table].row_count
      }))
    });
  }

  // Log dropped tables
  if (droppedTables.length > 0) {
    changes.push({
      type: 'DROPPED_TABLES',
      tables: droppedTables,
      details: droppedTables.map(table => ({
        name: table,
        columns: previous.tables[table].columns.length,
        row_count: previous.tables[table].row_count
      }))
    });
  }

  // Check for modified tables
  const commonTables = [...currentTables].filter(table => previousTables.has(table));
  
  for (const tableName of commonTables) {
    const currentTable = current.tables[tableName];
    const previousTable = previous.tables[tableName];
    
    const currentColumns = new Set(currentTable.columns.map(col => col.column_name));
    const previousColumns = new Set(previousTable.columns.map(col => col.column_name));
    
    const newColumns = [...currentColumns].filter(col => !previousColumns.has(col));
    const droppedColumns = [...previousColumns].filter(col => !currentColumns.has(col));
    
    // Check for column type changes
    const modifiedColumns = [];
    for (const col of currentTable.columns) {
      const prevCol = previousTable.columns.find(pc => pc.column_name === col.column_name);
      if (prevCol && (
        col.data_type !== prevCol.data_type ||
        col.is_nullable !== prevCol.is_nullable ||
        col.column_default !== prevCol.column_default
      )) {
        modifiedColumns.push({
          name: col.column_name,
          old: prevCol,
          new: col
        });
      }
    }

    if (newColumns.length > 0 || droppedColumns.length > 0 || modifiedColumns.length > 0) {
      summary.modified_tables++;
      summary.new_columns += newColumns.length;
      summary.dropped_columns += droppedColumns.length;

      changes.push({
        type: 'MODIFIED_TABLE',
        table: tableName,
        new_columns: newColumns,
        dropped_columns: droppedColumns,
        modified_columns: modifiedColumns,
        row_count_change: currentTable.row_count - previousTable.row_count
      });
    }
  }

  return { changes, summary };
}

function displayChanges(comparison, current, previous) {
  const { changes, summary } = comparison;
  
  logHeader('📊 DATABASE SCHEMA ANALYSIS');
  
  // Current state
  log(`📅 Current Analysis: ${new Date(current.timestamp).toLocaleString()}`, 'cyan');
  log(`📋 Total Tables: ${current.table_count}`, 'bright');
  
  if (previous) {
    log(`📅 Previous Analysis: ${new Date(previous.timestamp).toLocaleString()}`, 'cyan');
    log(`📊 Previous Tables: ${previous.table_count}`, 'bright');
    log(`📈 Table Count Change: ${current.table_count - previous.table_count > 0 ? '+' : ''}${current.table_count - previous.table_count}`, 
        current.table_count - previous.table_count > 0 ? 'green' : current.table_count - previous.table_count < 0 ? 'red' : 'bright');
  }

  // Summary
  logSection('📊 CHANGE SUMMARY');
  log(`🆕 New Tables: ${summary.new_tables}`, summary.new_tables > 0 ? 'green' : 'bright');
  log(`❌ Dropped Tables: ${summary.dropped_tables}`, summary.dropped_tables > 0 ? 'red' : 'bright');
  log(`🔄 Modified Tables: ${summary.modified_tables}`, summary.modified_tables > 0 ? 'yellow' : 'bright');
  log(`➕ New Columns: ${summary.new_columns}`, summary.new_columns > 0 ? 'green' : 'bright');
  log(`➖ Dropped Columns: ${summary.dropped_columns}`, summary.dropped_columns > 0 ? 'red' : 'bright');

  // Detailed changes
  if (changes.length === 0) {
    logSection('✅ NO SCHEMA CHANGES DETECTED');
    log('The database schema is identical to the previous snapshot.', 'green');
    return;
  }

  for (const change of changes) {
    switch (change.type) {
      case 'NEW_TABLES':
        logSection('🆕 NEW TABLES');
        for (const detail of change.details) {
          log(`  ✅ ${detail.name}`, 'green');
          log(`     Columns: ${detail.columns}, Rows: ${detail.row_count}`, 'bright');
        }
        break;

      case 'DROPPED_TABLES':
        logSection('❌ DROPPED TABLES');
        for (const detail of change.details) {
          log(`  ❌ ${detail.name}`, 'red');
          log(`     Had ${detail.columns} columns, ${detail.row_count} rows`, 'bright');
        }
        break;

      case 'MODIFIED_TABLE':
        logSection(`🔄 MODIFIED TABLE: ${change.table}`);
        
        if (change.new_columns.length > 0) {
          log(`  ➕ New columns (${change.new_columns.length}):`, 'green');
          for (const col of change.new_columns) {
            log(`     + ${col}`, 'green');
          }
        }

        if (change.dropped_columns.length > 0) {
          log(`  ➖ Dropped columns (${change.dropped_columns.length}):`, 'red');
          for (const col of change.dropped_columns) {
            log(`     - ${col}`, 'red');
          }
        }

        if (change.modified_columns.length > 0) {
          log(`  🔄 Modified columns (${change.modified_columns.length}):`, 'yellow');
          for (const col of change.modified_columns) {
            log(`     ~ ${col.name}`, 'yellow');
            if (col.old.data_type !== col.new.data_type) {
              log(`       Type: ${col.old.data_type} → ${col.new.data_type}`, 'bright');
            }
            if (col.old.is_nullable !== col.new.is_nullable) {
              log(`       Nullable: ${col.old.is_nullable} → ${col.new.is_nullable}`, 'bright');
            }
            if (col.old.column_default !== col.new.column_default) {
              log(`       Default: ${col.old.column_default || 'NULL'} → ${col.new.column_default || 'NULL'}`, 'bright');
            }
          }
        }

        if (change.row_count_change !== 0) {
          log(`  📊 Row count change: ${change.row_count_change > 0 ? '+' : ''}${change.row_count_change}`, 
              change.row_count_change > 0 ? 'green' : 'red');
        }
        break;
    }
  }
}

function displayTableList(schema) {
  logSection('📋 CURRENT TABLES');
  
  const tables = Object.entries(schema.tables).sort(([a], [b]) => a.localeCompare(b));
  
  for (const [tableName, tableInfo] of tables) {
    const columnCount = tableInfo.columns.length;
    const rowCount = tableInfo.row_count;
    const indexCount = tableInfo.indexes.length;
    const foreignKeyCount = tableInfo.foreign_keys.length;
    
    log(`  📊 ${tableName}`, 'bright');
    log(`     Columns: ${columnCount}, Rows: ${rowCount}, Indexes: ${indexCount}, FKs: ${foreignKeyCount}`, 'cyan');
  }
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    await client.connect();
    log('🔗 Connected to database', 'green');

    // Get current schema
    const currentSchema = await getCurrentSchema(client);
    
    // Load previous schema for comparison
    const previousSchema = loadPreviousSchema();
    
    // Compare schemas
    const comparison = compareSchemas(currentSchema, previousSchema);
    
    // Display results
    displayChanges(comparison, currentSchema, previousSchema);
    
    // Display current table list
    displayTableList(currentSchema);
    
    // Save current schema as snapshot
    saveSchema(currentSchema);
    
    logSection('📝 MIGRATION COMMANDS');
    log('To generate a new migration:', 'cyan');
    log('  npm run db:generate', 'bright');
    log('To push schema changes:', 'cyan');
    log('  npm run db:push', 'bright');
    log('To view schema in browser:', 'cyan');
    log('  npm run db:studio', 'bright');

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getCurrentSchema, compareSchemas }; 

async function getExpectedSchemaFromDrizzle() {
  try {
    // Try to use drizzle-kit to generate schema info
    const { execSync } = require('child_process');
    
    // Generate a temporary schema representation
    const tempFile = path.join(__dirname, 'temp-schema.json');
    
    try {
      // Use drizzle-kit to introspect expected schema
      execSync(`npx drizzle-kit introspect --out=${tempFile}`, { 
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL }
      });
      
      if (fs.existsSync(tempFile)) {
        const content = fs.readFileSync(tempFile, 'utf8');
        fs.unlinkSync(tempFile); // Clean up
        return JSON.parse(content);
      }
    } catch (error) {
      // Fallback to manual schema extraction
    }

    // Fallback: Read schema from migrations directory
    const migrationsDir = path.join(__dirname, 'migrations');
    const schemaFile = path.join(__dirname, 'shared', 'schema.ts');
    
    let expectedTables = {};

    if (fs.existsSync(schemaFile)) {
      // Parse TypeScript schema file for table definitions
      const schemaContent = fs.readFileSync(schemaFile, 'utf8');
      
      // Extract table names from schema.ts (basic regex pattern)
      const tableMatches = schemaContent.match(/export const (\w+) = pgTable\(/g);
      if (tableMatches) {
        for (const match of tableMatches) {
          const tableName = match.replace('export const ', '').replace(' = pgTable(', '');
          expectedTables[tableName] = { name: tableName, columns: {}, source: 'schema.ts' };
        }
      }
    }

    return {
      tables: expectedTables,
      source: 'fallback_analysis',
      note: 'Expected schema extracted from schema files'
    };
  } catch (error) {
    log('⚠️  Could not determine expected schema, using current as baseline', 'yellow');
    return { tables: {}, source: 'error', error: error.message };
  }
}

function compareSchemas(current, expected) {
  const currentTableNames = current.tables.map(t => t.table_name);
  const expectedTableNames = Object.keys(expected.tables);

  const newTables = expectedTableNames.filter(name => !currentTableNames.includes(name));
  const droppedTables = currentTableNames.filter(name => !expectedTableNames.includes(name));
  const commonTables = currentTableNames.filter(name => expectedTableNames.includes(name));

  const modifiedTables = [];
  // For now, we'll mark this as a placeholder for detailed column comparison
  // In a full implementation, you'd compare column definitions

  return {
    newTables,
    droppedTables,
    modifiedTables,
    commonTables,
    hasChanges: newTables.length > 0 || droppedTables.length > 0 || modifiedTables.length > 0
  };
}

function displayComparisonResults(comparison, targetVersion) {
  logHeader('SCHEMA COMPARISON RESULTS');

  if (!comparison.hasChanges) {
    log('✅ Database schema is synchronized with expected schema', 'green');
    log(`🎯 Current version: ${targetVersion}`, 'green');
    return;
  }

  log('📋 Schema changes detected:', 'yellow');

  if (comparison.newTables.length > 0) {
    log(`\n➕ NEW TABLES (${comparison.newTables.length}):`, 'green');
    comparison.newTables.forEach(table => {
      log(`   • ${table}`, 'cyan');
    });
  }

  if (comparison.droppedTables.length > 0) {
    log(`\n➖ DROPPED TABLES (${comparison.droppedTables.length}):`, 'red');
    comparison.droppedTables.forEach(table => {
      log(`   • ${table}`, 'cyan');
    });
  }

  if (comparison.modifiedTables.length > 0) {
    log(`\n🔄 MODIFIED TABLES (${comparison.modifiedTables.length}):`, 'yellow');
    comparison.modifiedTables.forEach(table => {
      log(`   • ${table}`, 'cyan');
    });
  }

  log(`\n📊 Summary:`, 'blue');
  log(`   • Tables in database: ${comparison.commonTables.length + comparison.droppedTables.length}`, 'cyan');
  log(`   • Expected tables: ${comparison.commonTables.length + comparison.newTables.length}`, 'cyan');
  log(`   • Changes needed: ${comparison.newTables.length + comparison.droppedTables.length + comparison.modifiedTables.length}`, 'yellow');

  log(`\n🔧 Recommended actions:`, 'blue');
  log(`   • Run: npm run sync:production`, 'cyan');
  log(`   • Or run: npx drizzle-kit push`, 'cyan');
  log(`   • Target version: ${targetVersion}`, 'cyan');
} 