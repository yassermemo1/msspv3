#!/usr/bin/env node

const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'mssp_user'}:${process.env.DB_PASSWORD || '12345678'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'mssp_production'}`
});

// Client data to insert
const clientsData = [
  { domain: 'C003', shortName: 'Customer Apps', name: 'Customer Apps' },
  { domain: 'C004', shortName: 'SITE', name: 'Saudi Information Technology Company' },
  { domain: 'C005', shortName: 'Red Sea', name: 'The Red Sea Development Company' },
  { domain: 'C006', shortName: 'SITE', name: 'Shared Services' },
  { domain: 'C010', shortName: 'HRDF', name: 'Human Resources Development Fund' },
  { domain: 'C011', shortName: 'Sehati', name: 'Sehati' },
  { domain: 'C012', shortName: 'RC', name: 'Royal Court' },
  { domain: 'C016', shortName: 'SVTS (Tashir)', name: 'The Saudi Company for Visa and Travel Solutions' },
  { domain: 'C017', shortName: 'SAVC', name: 'Saudi Civil Aviation Company' },
  { domain: 'C018', shortName: 'MOI', name: 'Ministry of Interior' },
  { domain: 'C019', shortName: 'PIF', name: 'Public Investment Fund' },
  { domain: 'C020', shortName: 'Hevolution Foundation', name: 'Hevolution Foundation' },
  { domain: 'C021', shortName: 'DACO', name: 'Dammam Airports Company' },
  { domain: 'C022', shortName: 'NEOM', name: 'Neom' },
  { domain: 'C024', shortName: 'SANS', name: 'Saudi Air Navigation Services' },
  { domain: 'C025', shortName: 'GASTAT', name: 'General Authority for Statistics' },
  { domain: 'C026', shortName: 'Altanfeethi', name: 'Altanfeethi' },
  { domain: 'C027', shortName: 'SPL', name: 'Saudi Post' },
  { domain: 'C028', shortName: 'Dragos', name: 'Dragos' },
  { domain: 'C030', shortName: 'SEEC', name: 'Saudi Energy Efficiency Center' },
  { domain: 'C032', shortName: 'NRERSC', name: 'National Real Estate Registration Services Company' },
  { domain: 'C033', shortName: 'OSP', name: 'Oil Sustainability Program' },
  { domain: 'C034', shortName: 'NCP', name: 'National Center for Privatization' },
  { domain: 'C035', shortName: 'ECZA', name: 'Economic Cities and Special Zones Authority' },
  { domain: 'C036', shortName: 'GCAM', name: 'General Commission for Audiovisual Media' },
  { domain: 'C037', shortName: 'Infinity METRAS', name: 'Infinity METRAS' },
  { domain: 'C038', shortName: 'EsayDmarc', name: 'EsayDmarc' },
  { domain: 'C039', shortName: 'Tahakom', name: 'Tahakom' },
  { domain: 'C040', shortName: 'SMSC', name: 'Saudi Amining Services Company' },
  { domain: 'C052', shortName: 'SWCC', name: 'Saudi Water Authority' },
  { domain: 'C054', shortName: 'Hasanah', name: 'Hasanah' },
  { domain: 'C055', shortName: 'Mahd Academy', name: 'Mahd Academy' },
  { domain: 'C057', shortName: 'SRSA', name: 'Saudi Red Sea Authority' },
  { domain: 'C059', shortName: 'GAFT', name: 'General Authority for Foreign Trade' },
  { domain: 'C060', shortName: 'NMDC', name: 'New Murabba' },
  { domain: 'C109', shortName: 'NSC', name: 'National Security Center' },
  { domain: 'C118', shortName: 'DSC', name: 'Decision Support Center' },
  { domain: 'C120', shortName: 'MOFA', name: 'Saudi Ministry of Foreign Affairs' },
  { domain: 'S001', shortName: 'DGA', name: 'Digital Government Authority' },
  { domain: 'T128', shortName: 'SITE', name: 'Saudi Information Technology Company' },
  { domain: 'T137', shortName: 'PIF', name: 'Public Investment Fund' },
  { domain: 'T138', shortName: 'ZATCA', name: 'Zakat, Tax and Customs Authority' },
  { domain: 'T139', shortName: 'Awqaf', name: 'Awqaf' },
  { domain: 'T146', shortName: 'SWCC', name: 'Saline Water Conversion Corporation' },
  { domain: 'T152', shortName: 'MOH', name: 'Ministry Of Health' },
  { domain: 'T161', shortName: 'GACA', name: 'General Authority of Civil Aviation' },
  { domain: 'T162', shortName: 'GEA', name: 'General Entertainment Authority' },
  { domain: 'T165', shortName: 'SRA', name: 'Saudi Royal Aviation' },
  { domain: 'T166', shortName: 'RCMC', name: 'Royal Commission for Makkah city and Holy Sites' },
  { domain: 'T168', shortName: 'KAFD', name: 'King Abdullah Financial district' },
  { domain: 'T174', shortName: 'ARO', name: 'Saudi Aramco Rowan Offshore Drilling Company' },
  { domain: 'T175', shortName: 'DSC', name: 'Decision Support Center' },
  { domain: 'T176', shortName: 'RCRC', name: 'Royal commission for Riyadh City' },
  { domain: 'T177', shortName: 'SERA', name: 'Saudi Electricity Regularity Authority' },
  { domain: 'T179', shortName: 'Mozn', name: 'MOZN' },
  { domain: 'T181', shortName: 'NRRC', name: 'Nuclear and Radiological Regulatory Commission' },
  { domain: 'T183', shortName: 'NRU', name: 'National Risk Unit' },
  { domain: 'T184', shortName: 'CMA', name: 'Capital Market Authority (CMA)' },
  { domain: 'T185', shortName: 'SANGTELS', name: 'Saudi Arabian National Guard' },
  { domain: 'T186', shortName: 'NAJM', name: 'Najm' },
  { domain: 'T188', shortName: 'PHA', name: 'Public Health Authority' },
  { domain: 'T190', shortName: 'ROSHN', name: 'ROSHN' },
  { domain: 'T192', shortName: 'NCP', name: 'National Center Privatization' },
  { domain: 'T193', shortName: 'ECZA', name: 'Economic Cities and Special Zones Authority' },
  { domain: 'T201', shortName: 'NHC', name: 'National Housing Company' },
  { domain: 'T204', shortName: 'DGDA', name: 'Diriyah Gate' },
  { domain: 'T210', shortName: 'FC', name: 'Finance Committee at Royal Court' },
  { domain: 'T211', shortName: 'KACARE', name: 'King Abdullah City for Atomic and Renewable Energy' },
  { domain: 'T213', shortName: 'NTIS', name: 'National Company of Telecom & Information Security' },
  { domain: 'T214', shortName: 'The Rig', name: 'OIL PARK DEVLOPMENT COMPANY' }
];

async function insertClients() {
  console.log('🚀 Starting bulk client insertion...');
  console.log(`📊 Total clients to insert: ${clientsData.length}`);
  
  try {
    await client.connect();
    console.log('🔗 Connected to database');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const insertedClients = [];

    for (const clientData of clientsData) {
      try {
        // Check if client already exists (by domain or name)
        const existingClient = await client.query(
          'SELECT id, name, domain FROM clients WHERE domain = $1 OR name = $2',
          [clientData.domain, clientData.name]
        );

        if (existingClient.rows.length > 0) {
          console.log(`⏭️  Skipping existing client: ${clientData.domain} - ${clientData.name}`);
          continue;
        }

        // Insert the client using SQL
        const insertQuery = `
          INSERT INTO clients (
            name, 
            short_name,
            domain,
            industry, 
            status, 
            notes,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING id, name, domain
        `;

        const values = [
          clientData.name,
          clientData.shortName,
          clientData.domain,
          'Government', // Default industry for Saudi government entities
          'active',
          `Imported via bulk insert - Domain: ${clientData.domain}`
        ];

        const result = await client.query(insertQuery, values);
        const insertedClient = result.rows[0];
        
        console.log(`✅ Inserted: ${clientData.domain} - ${clientData.name} (ID: ${insertedClient.id})`);
        insertedClients.push(insertedClient);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error inserting ${clientData.domain}: ${error.message}`);
        errors.push({
          client: clientData,
          error: error.message
        });
        errorCount++;
      }
    }

    console.log('\n📈 Bulk Insert Summary:');
    console.log(`✅ Successfully inserted: ${successCount} clients`);
    console.log(`❌ Errors: ${errorCount} clients`);
    console.log(`⏭️  Skipped: ${clientsData.length - successCount - errorCount} existing clients`);
    
    if (errors.length > 0) {
      console.log('\n🔍 Error Details:');
      errors.forEach(({ client, error }) => {
        console.log(`   ${client.domain} (${client.name}): ${error}`);
      });
    }

    if (insertedClients.length > 0) {
      console.log('\n🎯 Successfully Inserted Clients:');
      insertedClients.forEach(client => {
        console.log(`   ID ${client.id}: ${client.domain} - ${client.name}`);
      });
    }

  } catch (error) {
    console.error('💥 Fatal error during bulk insertion:', error);
  } finally {
    await client.end();
    console.log('\n🏁 Database connection closed');
  }
}

// Run the insertion
insertClients()
  .then(() => {
    console.log('🎉 Bulk client insertion completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 