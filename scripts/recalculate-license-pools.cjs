#!/usr/bin/env node

/**
 * Recalculate Available Licenses Script
 * 
 * This script recalculates the available licenses for all license pools
 * based on the new auto-calculation logic:
 * Available Licenses = Total Licenses - Sum of Assigned Licenses
 */

const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://mssp_user:devpass123@localhost:5432/mssp_production'
});

async function recalculateAvailableLicenses() {
  console.log('🔄 Starting license pool availability recalculation...');
  
  try {
    // Get all license pools
    const licensePools = await pool.query('SELECT id, name, total_licenses FROM license_pools WHERE is_active = true');
    
    console.log(`Found ${licensePools.rows.length} active license pools to process`);
    
    for (const licensePool of licensePools.rows) {
      const { id, name, total_licenses } = licensePool;
      
      // Calculate total assigned licenses for this pool
      const assignedResult = await pool.query(`
        SELECT COALESCE(SUM(assigned_licenses), 0) as total_assigned
        FROM client_licenses 
        WHERE license_pool_id = $1
      `, [id]);
      
      const totalAssigned = parseInt(assignedResult.rows[0].total_assigned);
      const availableLicenses = Math.max(0, total_licenses - totalAssigned);
      
      // Update the license pool
      await pool.query(`
        UPDATE license_pools 
        SET available_licenses = $1 
        WHERE id = $2
      `, [availableLicenses, id]);
      
      console.log(`✓ ${name}: Total: ${total_licenses}, Assigned: ${totalAssigned}, Available: ${availableLicenses}`);
    }
    
    console.log('✅ License pool availability recalculation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error recalculating license pool availability:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
recalculateAvailableLicenses(); 