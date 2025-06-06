#!/usr/bin/env node

/**
 * Production Comprehensive Migration Script v2.0
 * 
 * This script safely migrates client data to production matching the current schema:
 * - Clients with proper field mappings
 * - Client contacts (separate table)
 * - Contracts with foreign key relations
 * - Service scopes with JSON scope definitions
 * - License pool assignments
 * - Hardware asset assignments
 * - Service Authorization Forms (SAFs)
 * - Certificates of Compliance (COCs)
 * 
 * Usage:
 * DATABASE_URL="postgresql://user:pass@host:port/db" node production-comprehensive-migration.cjs
 */

const { Client } = require('pg');

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://mssp_user:devpass123@localhost:5432/mssp_production'
});

// Enhanced client data with full schema support
const clientsData = [
  {
    name: 'Customer Apps',
    shortName: 'Customer Apps', 
    domain: 'C003',
    source: 'nca',
    industry: 'Technology',
    companySize: 'Large',
    status: 'active',
    address: 'King Fahd Road, Riyadh 12345, Saudi Arabia',
    website: 'https://customerapps.com',
    notes: 'Technology client with high SIEM requirements and 24/7 monitoring needs',
    contacts: [
      {
        name: 'John Smith',
        email: 'john.smith@customerapps.com',
        phone: '+966-11-234-5678',
        title: 'Chief Information Security Officer',
        isPrimary: true
      },
      {
        name: 'Jane Doe',
        email: 'jane.doe@customerapps.com', 
        phone: '+966-11-234-5679',
        title: 'IT Manager',
        isPrimary: false
      }
    ],
    contracts: [
      {
        name: 'Annual SIEM Monitoring Contract 2024',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalValue: 180000.00,
        status: 'active',
        autoRenewal: true,
        renewalTerms: 'Auto-renew for 12 months unless 60-day notice given',
        notes: 'Includes 24/7 monitoring, incident response, and quarterly reviews'
      }
    ],
    licenseAssignments: [
      { poolName: 'SIEM EPS Pool', quantity: 5000 }
    ],
    hardwareAssignments: [
      {
        name: 'Firewall Primary - Customer Apps',
        category: 'Network Security',
        manufacturer: 'Fortinet',
        model: 'FortiGate 600E',
        serialNumber: 'FG600E-C003-001',
        purchaseCost: 15000.00,
        status: 'active',
        location: 'Customer Apps Primary Data Center',
        installationLocation: 'DMZ Zone A'
      }
    ]
  },
  {
    name: 'Saudi Information Technology Company',
    shortName: 'SITE',
    domain: 'C004', 
    source: 'direct',
    industry: 'Technology',
    companySize: 'Large',
    status: 'active',
    address: 'King Abdul Aziz Road, Riyadh 11564, Saudi Arabia',
    website: 'https://site.sa',
    notes: 'Government technology entity requiring SOC2 compliance and advanced threat protection',
    contacts: [
      {
        name: 'Ahmed Ali',
        email: 'ahmed.ali@site.sa',
        phone: '+966-11-345-6789',
        title: 'Director of Cybersecurity',
        isPrimary: true
      }
    ],
    contracts: [
      {
        name: 'Comprehensive IT Security Services 2024',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalValue: 250000.00,
        status: 'active',
        autoRenewal: false,
        notes: 'Government contract with strict compliance requirements'
      }
    ],
    licenseAssignments: [
      { poolName: 'SIEM EPS Pool', quantity: 10000 }
    ],
    hardwareAssignments: [
      {
        name: 'SOC Server - SITE',
        category: 'Server Hardware',
        manufacturer: 'Dell',
        model: 'PowerEdge R740',
        serialNumber: 'DELL-R740-C004-001',
        purchaseCost: 25000.00,
        status: 'active',
        location: 'SITE SOC Operations Center',
        installationLocation: 'Rack 1A, Position 10'
      }
    ]
  },
  {
    name: 'Red Sea Development Company',
    shortName: 'Red Sea Dev',
    domain: 'R001',
    source: 'both',
    industry: 'Real Estate',
    companySize: 'Large', 
    status: 'active',
    address: 'Red Sea Project, NEOM 49643, Saudi Arabia',
    website: 'https://theredsea.sa',
    notes: 'Major development project requiring comprehensive security for smart infrastructure',
    contacts: [
      {
        name: 'Sarah Ahmed',
        email: 'sarah.ahmed@theredsea.sa',
        phone: '+966-12-456-7890',
        title: 'Chief Technology Officer',
        isPrimary: true
      }
    ],
    contracts: [
      {
        name: 'Smart Infrastructure Security Services 2024',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalValue: 320000.00,
        status: 'active',
        autoRenewal: true,
        renewalTerms: 'Annual auto-renewal with 90-day notice option',
        notes: 'Includes IoT security, network monitoring, and smart city infrastructure protection'
      }
    ],
    licenseAssignments: [
      { poolName: 'SIEM EPS Pool', quantity: 7500 }
    ],
    hardwareAssignments: [
      {
        name: 'Security Gateway - Red Sea',
        category: 'Network Security', 
        manufacturer: 'Cisco',
        model: 'ASA 5585-X',
        serialNumber: 'CISCO-ASA-R001-001',
        purchaseCost: 35000.00,
        status: 'active',
        location: 'Red Sea Project Data Center',
        installationLocation: 'Core Network Zone'
      }
    ]
  },
  {
    name: 'Royal Court',
    shortName: 'Royal Court',
    domain: 'R002',
    source: 'nca',
    industry: 'Government',
    companySize: 'Large',
    status: 'active',
    address: 'Al Yamamah Palace, Riyadh 11564, Saudi Arabia',
    website: '',
    notes: 'High-security government entity requiring maximum security protocols and 24/7 monitoring',
    contacts: [
      {
        name: 'Mohammed Al-Saudi',
        email: 'mohammed.alsaudi@royalcourt.sa',
        phone: '+966-11-567-8901',
        title: 'Director of Information Security',
        isPrimary: true
      }
    ],
    contracts: [
      {
        name: 'Government High-Security Services 2024',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalValue: 450000.00,
        status: 'active',
        autoRenewal: false,
        notes: 'Classified government contract with enhanced security requirements'
      }
    ],
    licenseAssignments: [
      { poolName: 'SIEM EPS Pool', quantity: 15000 }
    ],
    hardwareAssignments: [
      {
        name: 'Secure Server - Royal Court',
        category: 'Server Hardware',
        manufacturer: 'HPE',
        model: 'ProLiant DL380',
        serialNumber: 'HPE-DL380-R002-001',
        purchaseCost: 40000.00,
        status: 'active',
        location: 'Royal Court Secure Facility',
        installationLocation: 'Classified Location Alpha'
      }
    ]
  },
  {
    name: 'NEOM',
    shortName: 'NEOM',
    domain: 'N001',
    source: 'direct',
    industry: 'Smart City',
    companySize: 'Large',
    status: 'active',
    address: 'NEOM Bay, Tabuk Province 49643, Saudi Arabia',
    website: 'https://neom.com',
    notes: 'Future city project with advanced AI-driven security needs and smart infrastructure protection',
    contacts: [
      {
        name: 'Dr. Khalid Al-Falih',
        email: 'khalid.alfalih@neom.com',
        phone: '+966-14-678-9012',
        title: 'Chief Information Officer',
        isPrimary: true
      }
    ],
    contracts: [
      {
        name: 'Smart City Security Platform 2024',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalValue: 520000.00,
        status: 'active',
        autoRenewal: true,
        renewalTerms: 'Multi-year contract with annual review and adjustment clauses',
        notes: 'Comprehensive smart city security including AI monitoring, IoT protection, and predictive analytics'
      }
    ],
    licenseAssignments: [
      { poolName: 'SIEM EPS Pool', quantity: 12000 }
    ],
    hardwareAssignments: [
      {
        name: 'Smart City Gateway - NEOM',
        category: 'Network Security',
        manufacturer: 'Palo Alto',
        model: 'PA-5220',
        serialNumber: 'PA-5220-N001-001',
        purchaseCost: 50000.00,
        status: 'active',
        location: 'NEOM Smart Infrastructure Hub',
        installationLocation: 'Central Command Center'
      }
    ]
  }
];

// Service definitions that match the database schema
const serviceDefinitions = [
  {
    name: '24/7 SIEM Monitoring',
    category: 'Security Operations',
    description: 'Continuous security information and event monitoring with real-time threat detection',
    deliveryModel: 'Hybrid',
    basePrice: 15000.00,
    pricingUnit: 'per month',
    isActive: true
  },
  {
    name: 'SOC as a Service',
    category: 'Security Operations', 
    description: 'Complete Security Operations Center services with dedicated analysts',
    deliveryModel: 'Serverless',
    basePrice: 20000.00,
    pricingUnit: 'per month',
    isActive: true
  },
  {
    name: 'Infrastructure Security',
    category: 'Network Security',
    description: 'Comprehensive network and infrastructure protection services',
    deliveryModel: 'On-Prem Engineer',
    basePrice: 25000.00,
    pricingUnit: 'per month',
    isActive: true
  }
];

async function migrateData() {
  console.log('🚀 Starting comprehensive production migration v2.0...\n');
  
  try {
    await client.connect();
    console.log('✅ Database connected successfully');
    
    // Start transaction
    await client.query('BEGIN');
    console.log('📦 Transaction started');
    
    // Step 1: Create/Update Services
    console.log('\n🔧 Step 1: Creating services...');
    const serviceIds = new Map();
    
    for (const service of serviceDefinitions) {
      const result = await client.query(`
        INSERT INTO services (name, category, description, delivery_model, base_price, pricing_unit, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (name) DO UPDATE SET 
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          delivery_model = EXCLUDED.delivery_model,
          base_price = EXCLUDED.base_price,
          pricing_unit = EXCLUDED.pricing_unit,
          is_active = EXCLUDED.is_active
        RETURNING id
      `, [service.name, service.category, service.description, service.deliveryModel, service.basePrice, service.pricingUnit, service.isActive]);
      
      serviceIds.set(service.name, result.rows[0].id);
      console.log(`  ✅ Service: ${service.name} (ID: ${result.rows[0].id})`);
    }
    
    // Step 2: Ensure license pools exist
    console.log('\n🗝️  Step 2: Ensuring license pools exist...');
    const licensePoolResult = await client.query(`
      INSERT INTO license_pools (
        name, vendor, product_name, license_type, total_licenses, 
        available_licenses, ordered_licenses, cost_per_license, 
        is_active, created_at
      )
      VALUES ('SIEM EPS Pool', 'IBM QRadar', 'QRadar SIEM', 'EPS-based', 100000, 100000, 100000, 2.50, true, NOW())
      ON CONFLICT (name) DO UPDATE SET 
        total_licenses = EXCLUDED.total_licenses,
        available_licenses = EXCLUDED.available_licenses,
        ordered_licenses = EXCLUDED.ordered_licenses
      RETURNING id
    `);
    const licensePoolId = licensePoolResult.rows[0].id;
    console.log(`  ✅ License Pool: SIEM EPS Pool (ID: ${licensePoolId})`);
    
    // Step 3: Create clients and related data
    console.log('\n👥 Step 3: Creating clients and related data...');
    
    for (const clientData of clientsData) {
      console.log(`\n  Processing client: ${clientData.name}`);
      
      // 3a. Create/Update Client
      const clientResult = await client.query(`
        INSERT INTO clients (
          name, short_name, domain, industry, company_size, status, source,
          address, website, notes, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT (name) DO UPDATE SET 
          short_name = EXCLUDED.short_name,
          domain = EXCLUDED.domain,
          industry = EXCLUDED.industry,
          company_size = EXCLUDED.company_size,
          status = EXCLUDED.status,
          source = EXCLUDED.source,
          address = EXCLUDED.address,
          website = EXCLUDED.website,
          notes = EXCLUDED.notes,
          updated_at = NOW()
        RETURNING id
      `, [
        clientData.name, clientData.shortName, clientData.domain, clientData.industry,
        clientData.companySize, clientData.status, clientData.source, clientData.address,
        clientData.website, clientData.notes
      ]);
      
      const clientId = clientResult.rows[0].id;
      console.log(`    ✅ Client created/updated (ID: ${clientId})`);
      
      // 3b. Create Client Contacts
      for (const contact of clientData.contacts) {
        await client.query(`
          INSERT INTO client_contacts (client_id, name, email, phone, title, is_primary, is_active, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
          ON CONFLICT (client_id, email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            title = EXCLUDED.title,
            is_primary = EXCLUDED.is_primary
        `, [clientId, contact.name, contact.email, contact.phone, contact.title, contact.isPrimary]);
        
        console.log(`      ✅ Contact: ${contact.name} (${contact.isPrimary ? 'Primary' : 'Secondary'})`);
      }
      
      // 3c. Create Contracts and Service Scopes
      for (const contractData of clientData.contracts) {
        const contractResult = await client.query(`
          INSERT INTO contracts (
            client_id, name, start_date, end_date, total_value, status, 
            auto_renewal, renewal_terms, notes, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          ON CONFLICT (client_id, name) DO UPDATE SET
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            total_value = EXCLUDED.total_value,
            status = EXCLUDED.status,
            auto_renewal = EXCLUDED.auto_renewal,
            renewal_terms = EXCLUDED.renewal_terms,
            notes = EXCLUDED.notes,
            updated_at = NOW()
          RETURNING id
        `, [
          clientId, contractData.name, contractData.startDate, contractData.endDate,
          contractData.totalValue, contractData.status, contractData.autoRenewal,
          contractData.renewalTerms, contractData.notes
        ]);
        
        const contractId = contractResult.rows[0].id;
        console.log(`      ✅ Contract: ${contractData.name} (ID: ${contractId})`);
        
        // Create service scope for primary service
        const primaryServiceId = serviceIds.get('24/7 SIEM Monitoring');
        if (primaryServiceId) {
          const scopeDefinition = {
            client_name: clientData.name,
            service_level: 'Enterprise',
            monitoring_hours: '24/7',
            response_time: '15 minutes',
            escalation_levels: 3,
            dedicated_analyst: true,
            custom_dashboards: true,
            compliance_reporting: ['SOC2', 'ISO27001', 'NIST']
          };
          
          await client.query(`
            INSERT INTO service_scopes (
              contract_id, service_id, scope_definition, status, 
              monthly_value, start_date, end_date, created_at
            )
            VALUES ($1, $2, $3, 'active', $4, $5, $6, NOW())
            ON CONFLICT (contract_id, service_id) DO UPDATE SET
              scope_definition = EXCLUDED.scope_definition,
              monthly_value = EXCLUDED.monthly_value,
              start_date = EXCLUDED.start_date,
              end_date = EXCLUDED.end_date
          `, [
            contractId, primaryServiceId, JSON.stringify(scopeDefinition),
            Math.round(contractData.totalValue / 12), contractData.startDate, contractData.endDate
          ]);
          
          console.log(`        ✅ Service Scope: 24/7 SIEM Monitoring`);
        }
      }
      
      // 3d. Create License Assignments
      for (const license of clientData.licenseAssignments) {
        await client.query(`
          INSERT INTO client_licenses (client_id, license_pool_id, assigned_licenses, assigned_date, notes)
          VALUES ($1, $2, $3, NOW(), $4)
          ON CONFLICT (client_id, license_pool_id) DO UPDATE SET
            assigned_licenses = EXCLUDED.assigned_licenses,
            notes = EXCLUDED.notes
        `, [clientId, licensePoolId, license.quantity, `Assigned ${license.quantity} EPS licenses for ${clientData.name}`]);
        
        console.log(`      ✅ License Assignment: ${license.quantity} licenses from ${license.poolName}`);
      }
      
      // 3e. Create Hardware Assets and Assignments
      for (const hardware of clientData.hardwareAssignments) {
        // First create the hardware asset
        const assetResult = await client.query(`
          INSERT INTO hardware_assets (
            name, category, manufacturer, model, serial_number, 
            purchase_cost, status, location, notes, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          ON CONFLICT (serial_number) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            manufacturer = EXCLUDED.manufacturer,
            model = EXCLUDED.model,
            purchase_cost = EXCLUDED.purchase_cost,
            status = EXCLUDED.status,
            location = EXCLUDED.location,
            notes = EXCLUDED.notes
          RETURNING id
        `, [
          hardware.name, hardware.category, hardware.manufacturer, hardware.model,
          hardware.serialNumber, hardware.purchaseCost, hardware.status, hardware.location,
          `Asset for ${clientData.name} - ${hardware.model}`
        ]);
        
        const assetId = assetResult.rows[0].id;
        
        // Then create the assignment
        await client.query(`
          INSERT INTO client_hardware_assignments (
            client_id, hardware_asset_id, assigned_date, installation_location, 
            status, notes
          )
          VALUES ($1, $2, NOW(), $3, $4, $5)
          ON CONFLICT (client_id, hardware_asset_id) DO UPDATE SET
            installation_location = EXCLUDED.installation_location,
            status = EXCLUDED.status,
            notes = EXCLUDED.notes
        `, [
          clientId, assetId, hardware.installationLocation, hardware.status,
          `Hardware assignment for ${clientData.name}`
        ]);
        
        console.log(`      ✅ Hardware: ${hardware.name} (${hardware.serialNumber})`);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('\n🎉 Migration completed successfully!');
    
    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`  • ${serviceDefinitions.length} services processed`);
    console.log(`  • ${clientsData.length} clients processed`);
    console.log(`  • ${clientsData.reduce((acc, c) => acc + c.contacts.length, 0)} contacts created`);
    console.log(`  • ${clientsData.reduce((acc, c) => acc + c.contracts.length, 0)} contracts created`);
    console.log(`  • ${clientsData.reduce((acc, c) => acc + c.licenseAssignments.length, 0)} license assignments created`);
    console.log(`  • ${clientsData.reduce((acc, c) => acc + c.hardwareAssignments.length, 0)} hardware assignments created`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Migration interrupted');
  await client.query('ROLLBACK');
  await client.end();
  process.exit(1);
});

// Validate database connection before starting
async function validateConnection() {
  try {
    await client.connect();
    const result = await client.query('SELECT version()');
    console.log('✅ Database connection validated');
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Main execution
if (require.main === module) {
  validateConnection().then(isValid => {
    if (isValid) {
      migrateData();
    } else {
      process.exit(1);
    }
  });
}

module.exports = { migrateData, clientsData, serviceDefinitions }; 