#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function testDatabaseTables() {
  try {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://mssp_user:devpass123@localhost:5432/mssp_production';
    console.log('🔍 Connecting to database...');
    
    const client = postgres(databaseUrl);
    const db = drizzle(client);
    
    // Test basic connectivity
    console.log('✅ Database connection established');
    
    // Check if specific tables exist
    const tables = [
      'client_team_assignments',
      'service_scopes',
      'client_hardware_assignments',
      'clients',
      'contracts'
    ];
    
    for (const tableName of tables) {
      try {
        const result = await client`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
          );
        `;
        const exists = result[0].exists;
        console.log(`📋 Table '${tableName}': ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (exists) {
          // Check column structure
          const columns = await client`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
            ORDER BY ordinal_position;
          `;
          console.log(`   📊 Columns (${columns.length}):`, columns.map(c => c.column_name).join(', '));
          
          // Check if it has data
          const count = await client`SELECT COUNT(*) as count FROM ${client(tableName)}`;
          console.log(`   📈 Records: ${count[0].count}`);
        }
      } catch (error) {
        console.error(`❌ Error checking table '${tableName}':`, error.message);
      }
    }
    
    await client.end();
    console.log('\n🎉 Database check completed!');
    
  } catch (error) {
    console.error('💥 Database connection failed:', error.message);
  }
}

testDatabaseTables(); 