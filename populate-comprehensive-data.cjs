const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mssp_database',
  user: 'mssp_user',
  password: 'mssp_password'
});

async function populateComprehensiveData() {
  console.log('🚀 Starting comprehensive data population...\n');

  try {
    // Get existing clients
    const clientsResult = await pool.query('SELECT id, name FROM clients ORDER BY id');
    const clients = clientsResult.rows;
    console.log(`Found ${clients.length} existing clients`);

    // Get existing services
    const servicesResult = await pool.query('SELECT id, name, base_price FROM services WHERE is_active = true ORDER BY id');
    const services = servicesResult.rows;
    console.log(`Found ${services.length} existing services`);

    // Create contracts for each client
    console.log('\n📁 Creating Contracts...');
    const contracts = [];
    for (const client of clients) {
      const contract = await pool.query(`
        INSERT INTO contracts ("clientId", name, "startDate", "endDate", status, "totalValue", "autoRenewal", "renewalTerms", notes)
        VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'active', $3, true, '12 months auto-renewal', $4)
        RETURNING *
      `, [
        client.id,
        `${client.name} - Annual Security Services Agreement`,
        250000.00,
        `Comprehensive security services agreement for ${client.name}`
      ]);
      contracts.push(contract.rows[0]);
      console.log(`✅ Created contract for ${client.name}`);
    }

    // Create service scopes for each contract
    console.log('\n📁 Creating Service Scopes...');
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      const client = clients[i];
      
      // Add 2 services to each contract
      for (let j = 0; j < Math.min(2, services.length); j++) {
        const service = services[j];
        await pool.query(`
          INSERT INTO service_scopes (contract_id, service_id, description, start_date, end_date, status, deliverables, timeline, notes)
          VALUES ($1, $2, $3, $4, $5, 'active', $6, '12 months', $7)
        `, [
          contract.id,
          service.id,
          `${service.name} implementation for ${client.name}`,
          contract.start_date,
          contract.end_date,
          'Monthly reports|24/7 support|Quarterly reviews',
          `Customized ${service.name} service`
        ]);
        console.log(`✅ Created service scope: ${service.name} for ${client.name}`);
      }
    }

    // Create license pools
    console.log('\n📁 Creating License Pools...');
    const licensePools = [
      { name: 'Microsoft E5 Security', vendor: 'Microsoft', product: 'Microsoft 365 E5', total: 500, available: 350, cost: '57.00' },
      { name: 'CrowdStrike Falcon', vendor: 'CrowdStrike', product: 'Falcon Complete', total: 1000, available: 750, cost: '15.00' },
      { name: 'Splunk Enterprise', vendor: 'Splunk', product: 'Enterprise Security', total: 100, available: 60, cost: '150.00' }
    ];

         for (const licensePool of licensePools) {
      await pool.query(`
        INSERT INTO license_pools (name, vendor, product_name, license_type, total_licenses, available_licenses, cost_per_license, renewal_date, notes)
        VALUES ($1, $2, $3, 'Subscription', $4, $5, $6, CURRENT_DATE + INTERVAL '1 year', $7)
      `, [licensePool.name, licensePool.vendor, licensePool.product, licensePool.total, licensePool.available, licensePool.cost, `${licensePool.vendor} license pool`]);
      console.log(`✅ Created license pool: ${licensePool.name}`);
    }

    // Create hardware assets
    console.log('\n📁 Creating Hardware Assets...');
    const hardwareAssets = [
      { name: 'Dell PowerEdge R750', category: 'Server', manufacturer: 'Dell', model: 'R750', serial: 'DLL-001', cost: '15000.00' },
      { name: 'Cisco ASA 5555-X', category: 'Firewall', manufacturer: 'Cisco', model: 'ASA 5555-X', serial: 'CSC-001', cost: '8000.00' },
      { name: 'NetApp FAS8200', category: 'Storage', manufacturer: 'NetApp', model: 'FAS8200', serial: 'NTP-001', cost: '50000.00' }
    ];

    for (const asset of hardwareAssets) {
      await pool.query(`
        INSERT INTO hardware_assets (name, category, manufacturer, model, serial_number, purchase_date, purchase_cost, warranty_expiry, status, location, notes)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE - INTERVAL '6 months', $6, CURRENT_DATE + INTERVAL '2.5 years', 'active', 'Data Center', $7)
      `, [asset.name, asset.category, asset.manufacturer, asset.model, asset.serial, asset.cost, `${asset.category} in production`]);
      console.log(`✅ Created hardware asset: ${asset.name}`);
    }

    // Create SAFs for each contract
    console.log('\n📁 Creating Service Authorization Forms...');
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      const client = clients[i];
      
      const saf = await pool.query(`
        INSERT INTO service_authorization_forms (client_id, contract_id, saf_number, title, description, start_date, end_date, status, value, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, 'Approved by client management')
        RETURNING *
      `, [
        client.id,
        contract.id,
        `SAF-2024-${String(i + 1).padStart(3, '0')}`,
        `${client.name} - Security Services Authorization`,
        `Authorization for security services delivery`,
        contract.start_date,
        contract.end_date,
        50000.00
      ]);
      console.log(`✅ Created SAF: ${saf.rows[0].saf_number} for ${client.name}`);
    }

    // Create COCs for each client
    console.log('\n📁 Creating Certificates of Compliance...');
    const complianceTypes = ['SOC2', 'ISO27001', 'HIPAA'];
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      const contract = contracts[i];
      
      const coc = await pool.query(`
        INSERT INTO certificates_of_compliance (client_id, contract_id, coc_number, title, description, compliance_type, issue_date, expiry_date, status, audit_date, next_audit_date, notes)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', 'Annual compliance audit completed')
        RETURNING *
      `, [
        client.id,
        contract.id,
        `COC-2024-${String(i + 1).padStart(3, '0')}`,
        `${complianceTypes[i % complianceTypes.length]} Compliance Certificate`,
        `Compliance certification for ${client.name}`,
        complianceTypes[i % complianceTypes.length]
      ]);
      console.log(`✅ Created COC: ${coc.rows[0].coc_number} for ${client.name}`);
    }

    // Create financial transactions
    console.log('\n📁 Creating Financial Transactions...');
    for (const client of clients) {
      // Create invoice
      await pool.query(`
        INSERT INTO financial_transactions (type, client_id, amount, currency, description, transaction_date, status)
        VALUES ('invoice', $1, 25000.00, 'USD', 'Monthly security services invoice', CURRENT_DATE, 'pending')
      `, [client.id]);
      
      // Create payment
      await pool.query(`
        INSERT INTO financial_transactions (type, client_id, amount, currency, description, transaction_date, status)
        VALUES ('payment', $1, 25000.00, 'USD', 'Payment received', CURRENT_DATE, 'completed')
      `, [client.id]);
      
      console.log(`✅ Created financial transactions for ${client.name}`);
    }

    // Create team assignments
    console.log('\n📁 Creating Team Assignments...');
    const users = await pool.query('SELECT id, username, role FROM users WHERE is_active = true');
    
    for (const client of clients) {
      // Assign admin user
      const adminUser = users.rows.find(u => u.role === 'admin');
      if (adminUser) {
        await pool.query(`
          INSERT INTO client_team_assignments (client_id, user_id, role, assigned_by, notes)
          VALUES ($1, $2, 'Account Manager', $3, 'Primary account manager')
        `, [client.id, adminUser.id, adminUser.id]);
      }
      console.log(`✅ Created team assignment for ${client.name}`);
    }

    // Create some documents
    console.log('\n📁 Creating Documents...');
    for (const contract of contracts.slice(0, 2)) {
      await pool.query(`
        INSERT INTO documents (name, type, entity_type, entity_id, file_path, file_size, mime_type, uploaded_by, description)
        VALUES ($1, 'contract', 'contract', $2, '/uploads/contracts/sample.pdf', 1024000, 'application/pdf', 1, 'Contract document')
      `, [`${contract.name}.pdf`, contract.id]);
      console.log(`✅ Created document for contract: ${contract.name}`);
    }

    // Create external system mappings
    console.log('\n📁 Creating External System Mappings...');
    const externalSystems = await pool.query('SELECT id, name FROM external_systems');
    
    if (externalSystems.rows.length > 0) {
      for (const client of clients) {
        await pool.query(`
          INSERT INTO client_external_mappings (client_id, system_name, external_identifier, metadata)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (client_id, system_name) DO NOTHING
        `, [
          client.id,
          externalSystems.rows[0].name,
          `EXT-${client.id}`,
          JSON.stringify({ projectKey: `PROJ-${client.id}` })
        ]);
        console.log(`✅ Created external mapping for ${client.name}`);
      }
    }

    // Create dashboard widgets
    console.log('\n📁 Creating Dashboard Widgets...');
    const widgetTypes = ['metric', 'chart', 'table', 'list'];
    const widgetNames = ['Client Overview', 'Revenue Trends', 'Service Status', 'Recent Activity'];
    
    for (let i = 0; i < widgetNames.length; i++) {
      await pool.query(`
        INSERT INTO dashboard_widgets (name, type, config, default_size, is_active, description)
        VALUES ($1, $2, $3, $4, true, $5)
        ON CONFLICT (name) DO NOTHING
      `, [
        widgetNames[i],
        widgetTypes[i % widgetTypes.length],
        JSON.stringify({ refreshInterval: 300, dataSource: 'api' }),
        JSON.stringify({ width: 4, height: 2 }),
        `${widgetNames[i]} widget`
      ]);
    }
    console.log(`✅ Created dashboard widgets`);

    console.log('\n✅ Comprehensive data population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating data:', error);
  } finally {
    await pool.end();
  }
}

// Run the population
populateComprehensiveData(); 