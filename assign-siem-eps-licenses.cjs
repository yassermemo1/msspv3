#!/usr/bin/env node

const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://mssp_user:devpass123@localhost:5432/mssp_production'
});

// Client EPS assignments data (only clients with EPS values)
const clientEpsAssignments = [
  { domain: 'S001', eps: 7500 },
  { domain: 'T137', eps: 7500 },
  { domain: 'T138', eps: 10000 },
  { domain: 'T139', eps: 2500 },
  { domain: 'T146', eps: 7500 },
  { domain: 'T152', eps: 30000 },
  { domain: 'T161', eps: 10000 },
  { domain: 'T162', eps: 5000 },
  { domain: 'T165', eps: 2500 },
  { domain: 'T166', eps: 4000 },
  { domain: 'T168', eps: 7500 },
  { domain: 'T174', eps: 5000 },
  { domain: 'T175', eps: 5000 },
  { domain: 'T176', eps: 10000 },
  { domain: 'T177', eps: 5000 },
  { domain: 'T179', eps: 2500 },
  { domain: 'T181', eps: 5000 },
  { domain: 'T183', eps: 2500 },
  { domain: 'T184', eps: 5000 },
  { domain: 'T185', eps: 5000 },
  { domain: 'T186', eps: 5000 },
  { domain: 'T188', eps: 5000 },
  { domain: 'T190', eps: 10000 },
  { domain: 'T192', eps: 2500 },
  { domain: 'T193', eps: 5000 },
  { domain: 'T201', eps: 7500 },
  { domain: 'T204', eps: 5000 },
  { domain: 'T210', eps: 2500 },
  { domain: 'T211', eps: 7500 },
  { domain: 'T213', eps: 10000 },
  { domain: 'T214', eps: 5000 }
];

async function assignSiemEpsLicenses() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Get the SIEM EPS license pool ID
    const poolResult = await client.query(
      "SELECT id, available_licenses FROM license_pools WHERE name = 'SIEM EPS'"
    );

    if (poolResult.rows.length === 0) {
      console.error('SIEM EPS license pool not found');
      return;
    }

    const licensePoolId = poolResult.rows[0].id;
    let availableLicenses = parseInt(poolResult.rows[0].available_licenses);
    
    console.log(`Found SIEM EPS license pool with ID: ${licensePoolId}`);
    console.log(`Available licenses before assignment: ${availableLicenses}`);

    let totalAssigned = 0;
    let successfulAssignments = 0;

    // Process each client assignment
    for (const assignment of clientEpsAssignments) {
      try {
        // Find client by domain
        const clientResult = await client.query(
          'SELECT id, name FROM clients WHERE domain = $1',
          [assignment.domain]
        );

        if (clientResult.rows.length === 0) {
          console.warn(`Client with domain ${assignment.domain} not found, skipping...`);
          continue;
        }

        const clientId = clientResult.rows[0].id;
        const clientName = clientResult.rows[0].name;

        // Check if assignment already exists
        const existingAssignment = await client.query(
          'SELECT id, assigned_licenses FROM client_licenses WHERE client_id = $1 AND license_pool_id = $2',
          [clientId, licensePoolId]
        );

        if (existingAssignment.rows.length > 0) {
          console.log(`${assignment.domain} (${clientName}): Already has ${existingAssignment.rows[0].assigned_licenses} EPS assigned, skipping...`);
          continue;
        }

        // Check if we have enough licenses available
        if (availableLicenses < assignment.eps) {
          console.error(`${assignment.domain} (${clientName}): Not enough licenses available (need ${assignment.eps}, have ${availableLicenses})`);
          continue;
        }

        // Insert the license assignment
        await client.query(
          `INSERT INTO client_licenses (client_id, license_pool_id, assigned_licenses, notes) 
           VALUES ($1, $2, $3, $4)`,
          [clientId, licensePoolId, assignment.eps, `SIEM EPS assignment - ${assignment.eps} EPS`]
        );

        // Update available licenses in the pool
        availableLicenses -= assignment.eps;
        await client.query(
          'UPDATE license_pools SET available_licenses = $1 WHERE id = $2',
          [availableLicenses, licensePoolId]
        );

        totalAssigned += assignment.eps;
        successfulAssignments++;

        console.log(`✅ ${assignment.domain} (${clientName}): Assigned ${assignment.eps} SIEM EPS`);

      } catch (error) {
        console.error(`❌ Error assigning licenses to ${assignment.domain}:`, error.message);
      }
    }

    console.log('\n=== ASSIGNMENT SUMMARY ===');
    console.log(`Successful assignments: ${successfulAssignments}/${clientEpsAssignments.length}`);
    console.log(`Total EPS assigned: ${totalAssigned}`);
    console.log(`Remaining available licenses: ${availableLicenses}`);

  } catch (error) {
    console.error('Error in assignSiemEpsLicenses:', error);
  } finally {
    await client.end();
  }
}

// Run the script
if (require.main === module) {
  assignSiemEpsLicenses();
}

module.exports = { assignSiemEpsLicenses }; 