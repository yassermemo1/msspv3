const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = 'postgresql://mssp_user:12345678@localhost:5432/mssp_database';

async function createInitialData() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create admin user
    const hashedPassword = await bcrypt.hash('SecureTestPass123!', 10);
    
    const userResult = await client.query(`
      INSERT INTO users (username, password, email, first_name, last_name, role, auth_provider, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email
    `, ['admin', hashedPassword, 'admin@mssp.local', 'Admin', 'User', 'admin', 'local', true]);

    if (userResult.rows.length > 0) {
      console.log('✅ Created admin user:', userResult.rows[0].email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create some initial services
    const services = [
      { name: 'Security Operations Center', category: 'Security Operations', deliveryModel: 'Serverless', basePrice: '5000.00', pricingUnit: 'per month' },
      { name: 'Vulnerability Management', category: 'Security Assessment', deliveryModel: 'Hybrid', basePrice: '3000.00', pricingUnit: 'per month' },
      { name: 'Incident Response', category: 'Security Operations', deliveryModel: 'On-Prem Engineer', basePrice: '8000.00', pricingUnit: 'per month' },
      { name: 'Firewall Management', category: 'Network Security', deliveryModel: 'Serverless', basePrice: '2000.00', pricingUnit: 'per endpoint' }
    ];

    for (const service of services) {
      await client.query(`
        INSERT INTO services (name, category, delivery_model, base_price, pricing_unit, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT DO NOTHING
      `, [service.name, service.category, service.deliveryModel, service.basePrice, service.pricingUnit]);
    }
    console.log('✅ Created initial services');

    // Create some sample clients
    const clients = [
      { name: 'Acme Corporation', shortName: 'ACME', domain: 'acme.com', industry: 'Technology', companySize: 'Enterprise', status: 'active' },
      { name: 'Global Finance Inc', shortName: 'GFI', domain: 'globalfinance.com', industry: 'Finance', companySize: 'Large', status: 'active' },
      { name: 'HealthCare Solutions', shortName: 'HCS', domain: 'healthcare-sol.com', industry: 'Healthcare', companySize: 'Medium', status: 'active' }
    ];

    for (const clientData of clients) {
      const result = await client.query(`
        INSERT INTO clients (name, "shortName", domain, industry, "companySize", status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [clientData.name, clientData.shortName, clientData.domain, clientData.industry, clientData.companySize, clientData.status]);

      if (result.rows.length > 0) {
        // Add a primary contact for each client
        await client.query(`
          INSERT INTO client_contacts ("clientId", name, email, phone, title, "isPrimary", "isActive")
          VALUES ($1, $2, $3, $4, $5, true, true)
          ON CONFLICT DO NOTHING
        `, [result.rows[0].id, `${clientData.name} Admin`, `admin@${clientData.domain}`, '555-0100', 'IT Manager']);
      }
    }
    console.log('✅ Created sample clients with contacts');

    // Initialize company settings
    await client.query(`
      INSERT INTO company_settings (
        company_name, currency, timezone, fiscal_year_start, date_format, time_format,
        primary_color, secondary_color, session_timeout_minutes, password_expiry_days,
        max_login_attempts, audit_log_retention_days, backup_retention_days,
        api_rate_limit, webhook_retry_attempts, advanced_search_enabled,
        audit_logging_enabled, two_factor_required, data_export_enabled
      ) VALUES (
        'MSSP Client Manager', 'USD', 'America/New_York', '01-01', 'MM/DD/YYYY', '12h',
        '#3b82f6', '#64748b', 480, 90, 5, 2555, 365, 1000, 3, true, true, false, true
      )
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Initialized company settings');

    console.log('\n🎉 Initial data created successfully!');
    console.log('\nYou can now login with:');
    console.log('Email: admin@mssp.local');
    console.log('Password: SecureTestPass123!');

  } catch (error) {
    console.error('❌ Error creating initial data:', error);
  } finally {
    await client.end();
  }
}

createInitialData(); 