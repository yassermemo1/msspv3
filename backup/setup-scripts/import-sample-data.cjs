const fs = require('fs');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mssp_client_management';

const client = new Client({
  connectionString: DATABASE_URL,
});

// Helper function to parse CSV
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (nextChar === '"') {
          current += '"';
          i++; // Skip the next quote
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

// Helper function to convert string boolean
function parseBoolean(value) {
  return value.toLowerCase() === 'true';
}

// Helper function to convert empty strings to null
function emptyToNull(value) {
  return value === '' ? null : value;
}

// Maps to store IDs for relationships
const clientMap = new Map();
const userMap = new Map();
const contractMap = new Map();
const serviceMap = new Map();
const licensePoolMap = new Map();
const hardwareAssetMap = new Map();
const safMap = new Map();

async function importUsers() {
  console.log('Importing users...');
  const content = fs.readFileSync('./sample-data/01-users.csv', 'utf8');
  const users = parseCSV(content);
  
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const query = `
      INSERT INTO users (username, email, first_name, last_name, role, is_active, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active
      RETURNING id
    `;
    
    try {
      const result = await client.query(query, [
        user.username,
        user.email,
        user.firstName,
        user.lastName,
        user.role,
        parseBoolean(user.isActive),
        hashedPassword
      ]);
      userMap.set(user.email, result.rows[0].id);
      console.log(`  ✓ User: ${user.email}`);
    } catch (error) {
      console.error(`  ✗ Failed to import user ${user.email}:`, error.message);
    }
  }
}

async function importClients() {
  console.log('Importing clients...');
  const content = fs.readFileSync('./sample-data/02-clients.csv', 'utf8');
  const clients = parseCSV(content);
  
  for (const clientData of clients) {
    const query = `
      INSERT INTO clients (name, short_name, domain, industry, company_size, status, source, address, website, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    
    try {
      const result = await client.query(query, [
        clientData.name,
        clientData.name.substring(0, 10), // Generate short_name from name
        `${clientData.name.toLowerCase().replace(/\s+/g, '')}.com`, // Generate domain from name
        emptyToNull(clientData.industry),
        emptyToNull(clientData.companySize),
        clientData.status,
        emptyToNull(clientData.source),
        emptyToNull(clientData.address),
        emptyToNull(clientData.website),
        emptyToNull(clientData.notes)
      ]);
      
      const clientId = result.rows[0].id;
      clientMap.set(clientData.name, clientId);
      
      // Insert primary contact
      if (clientData.contactName && clientData.contactEmail) {
        const contactQuery = `
          INSERT INTO client_contacts (client_id, name, email, phone, title, is_primary)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        await client.query(contactQuery, [
          clientId,
          clientData.contactName,
          clientData.contactEmail,
          emptyToNull(clientData.contactPhone),
          emptyToNull(clientData.contactTitle),
          true
        ]);
      }
      
      console.log(`  ✓ Client: ${clientData.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to import client ${clientData.name}:`, error.message);
    }
  }
}

async function importServices() {
  console.log('Importing services...');
  const content = fs.readFileSync('./sample-data/03-services.csv', 'utf8');
  const services = parseCSV(content);
  
  for (const service of services) {
    const query = `
      INSERT INTO services (name, category, description, delivery_model, base_price, pricing_unit, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    
    try {
      const result = await client.query(query, [
        service.name,
        emptyToNull(service.category),
        emptyToNull(service.description),
        emptyToNull(service.deliveryModel),
        parseFloat(service.basePrice),
        emptyToNull(service.pricingUnit),
        parseBoolean(service.isActive)
      ]);
      serviceMap.set(service.name, result.rows[0].id);
      console.log(`  ✓ Service: ${service.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to import service ${service.name}:`, error.message);
    }
  }
}

async function importContracts() {
  console.log('Importing contracts...');
  const content = fs.readFileSync('./sample-data/04-contracts.csv', 'utf8');
  const contracts = parseCSV(content);
  
  for (const contract of contracts) {
    const clientId = clientMap.get(contract.clientName);
    
    if (!clientId) {
      console.error(`  ✗ Client not found: ${contract.clientName}`);
      continue;
    }
    
    const query = `
      INSERT INTO contracts (client_id, name, start_date, end_date, status, notes, auto_renewal, renewal_terms, total_value, document_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    
    try {
      const result = await client.query(query, [
        clientId,
        contract.name,
        contract.startDate,
        contract.endDate,
        contract.status,
        emptyToNull(contract.notes),
        parseBoolean(contract.autoRenewal),
        emptyToNull(contract.renewalTerms),
        parseFloat(contract.totalValue),
        emptyToNull(contract.documentUrl)
      ]);
      contractMap.set(`${contract.clientName}|${contract.name}`, result.rows[0].id);
      console.log(`  ✓ Contract: ${contract.name} for ${contract.clientName}`);
    } catch (error) {
      console.error(`  ✗ Failed to import contract ${contract.name}:`, error.message);
    }
  }
}

async function importLicensePools() {
  console.log('Importing license pools...');
  const content = fs.readFileSync('./sample-data/05-license-pools.csv', 'utf8');
  const licensePools = parseCSV(content);
  
  for (const pool of licensePools) {
    const query = `
      INSERT INTO license_pools (name, vendor, product_name, license_type, total_licenses, available_licenses, ordered_licenses, cost_per_license, renewal_date, purchase_request_number, purchase_order_number, notes, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;
    
    try {
      const result = await client.query(query, [
        pool.name,
        pool.vendor,
        pool.productName,
        pool.licenseType,
        parseInt(pool.totalLicenses),
        parseInt(pool.availableLicenses),
        parseInt(pool.orderedLicenses),
        parseFloat(pool.costPerLicense),
        pool.renewalDate,
        emptyToNull(pool.purchaseRequestNumber),
        emptyToNull(pool.purchaseOrderNumber),
        emptyToNull(pool.notes),
        parseBoolean(pool.isActive)
      ]);
      licensePoolMap.set(pool.name, result.rows[0].id);
      console.log(`  ✓ License Pool: ${pool.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to import license pool ${pool.name}:`, error.message);
    }
  }
}

async function importHardwareAssets() {
  console.log('Importing hardware assets...');
  const content = fs.readFileSync('./sample-data/06-hardware-assets.csv', 'utf8');
  const assets = parseCSV(content);
  
  for (const asset of assets) {
    const query = `
      INSERT INTO hardware_assets (name, category, manufacturer, model, serial_number, purchase_date, purchase_cost, warranty_expiry, status, location, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (serial_number) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        manufacturer = EXCLUDED.manufacturer,
        model = EXCLUDED.model,
        purchase_date = EXCLUDED.purchase_date,
        purchase_cost = EXCLUDED.purchase_cost,
        warranty_expiry = EXCLUDED.warranty_expiry,
        status = EXCLUDED.status,
        location = EXCLUDED.location,
        notes = EXCLUDED.notes
      RETURNING id
    `;
    
    try {
      const result = await client.query(query, [
        asset.name,
        emptyToNull(asset.category),
        emptyToNull(asset.manufacturer),
        emptyToNull(asset.model),
        asset.serialNumber,
        asset.purchaseDate,
        parseFloat(asset.purchaseCost),
        asset.warrantyExpiry,
        asset.status,
        emptyToNull(asset.location),
        emptyToNull(asset.notes)
      ]);
      hardwareAssetMap.set(asset.name, result.rows[0].id);
      console.log(`  ✓ Hardware Asset: ${asset.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to import hardware asset ${asset.name}:`, error.message);
    }
  }
}

async function importIndividualLicenses() {
  console.log('Importing individual licenses...');
  const content = fs.readFileSync('./sample-data/07-individual-licenses.csv', 'utf8');
  const licenses = parseCSV(content);
  
  for (const license of licenses) {
    const clientId = clientMap.get(license.clientName);
    
    if (!clientId) {
      console.error(`  ✗ Client not found: ${license.clientName}`);
      continue;
    }
    
    const query = `
      INSERT INTO individual_licenses (client_id, name, vendor, product_name, license_key, license_type, quantity, cost_per_license, purchase_date, expiry_date, renewal_date, purchase_request_number, purchase_order_number, document_url, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `;
    
    try {
      await client.query(query, [
        clientId,
        license.name,
        license.vendor,
        license.productName,
        license.licenseKey,
        license.licenseType,
        parseInt(license.quantity),
        parseFloat(license.costPerLicense),
        license.purchaseDate,
        license.expiryDate,
        license.renewalDate,
        emptyToNull(license.purchaseRequestNumber),
        emptyToNull(license.purchaseOrderNumber),
        emptyToNull(license.documentUrl),
        license.status,
        emptyToNull(license.notes)
      ]);
      console.log(`  ✓ Individual License: ${license.name} for ${license.clientName}`);
    } catch (error) {
      console.error(`  ✗ Failed to import individual license ${license.name}:`, error.message);
    }
  }
}

async function importSAFs() {
  console.log('Importing Service Authorization Forms...');
  const content = fs.readFileSync('./sample-data/08-service-authorization-forms.csv', 'utf8');
  const safs = parseCSV(content);
  
  for (const saf of safs) {
    const clientId = clientMap.get(saf.clientName);
    const contractId = contractMap.get(`${saf.clientName}|${saf.contractName}`);
    const approvedBy = saf.approvedBy ? userMap.get(saf.approvedBy) : null;
    
    if (!clientId) {
      console.error(`  ✗ Client not found: ${saf.clientName}`);
      continue;
    }
    
    if (!contractId) {
      console.error(`  ✗ Contract not found: ${saf.contractName} for ${saf.clientName}`);
      continue;
    }
    
    const query = `
      INSERT INTO service_authorization_forms (client_id, contract_id, saf_number, title, description, start_date, end_date, status, document_url, approved_by, approved_date, value, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (saf_number) DO UPDATE SET
        client_id = EXCLUDED.client_id,
        contract_id = EXCLUDED.contract_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        status = EXCLUDED.status,
        document_url = EXCLUDED.document_url,
        approved_by = EXCLUDED.approved_by,
        approved_date = EXCLUDED.approved_date,
        value = EXCLUDED.value,
        notes = EXCLUDED.notes
      RETURNING id
    `;
    
    try {
      const result = await client.query(query, [
        clientId,
        contractId,
        saf.safNumber,
        saf.title,
        emptyToNull(saf.description),
        saf.startDate,
        saf.endDate,
        saf.status,
        emptyToNull(saf.documentUrl),
        approvedBy,
        saf.approvedDate,
        parseFloat(saf.value),
        emptyToNull(saf.notes)
      ]);
      safMap.set(saf.safNumber, result.rows[0].id);
      console.log(`  ✓ SAF: ${saf.safNumber} - ${saf.title}`);
    } catch (error) {
      console.error(`  ✗ Failed to import SAF ${saf.safNumber}:`, error.message);
    }
  }
}

async function importCOCs() {
  console.log('Importing Certificates of Compliance...');
  const content = fs.readFileSync('./sample-data/09-certificates-of-compliance.csv', 'utf8');
  const cocs = parseCSV(content);
  
  for (const coc of cocs) {
    const clientId = clientMap.get(coc.clientName);
    const contractId = contractMap.get(`${coc.clientName}|${coc.contractName}`);
    const safId = safMap.get(coc.safNumber);
    const issuedBy = userMap.get(coc.issuedBy);
    
    if (!clientId) {
      console.error(`  ✗ Client not found: ${coc.clientName}`);
      continue;
    }
    
    const query = `
      INSERT INTO certificates_of_compliance (client_id, contract_id, saf_id, coc_number, title, description, compliance_type, issue_date, expiry_date, status, document_url, issued_by, audit_date, next_audit_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (coc_number) DO UPDATE SET
        client_id = EXCLUDED.client_id,
        contract_id = EXCLUDED.contract_id,
        saf_id = EXCLUDED.saf_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        compliance_type = EXCLUDED.compliance_type,
        issue_date = EXCLUDED.issue_date,
        expiry_date = EXCLUDED.expiry_date,
        status = EXCLUDED.status,
        document_url = EXCLUDED.document_url,
        issued_by = EXCLUDED.issued_by,
        audit_date = EXCLUDED.audit_date,
        next_audit_date = EXCLUDED.next_audit_date,
        notes = EXCLUDED.notes
      RETURNING id
    `;
    
    try {
      await client.query(query, [
        clientId,
        contractId,
        safId,
        coc.cocNumber,
        coc.title,
        emptyToNull(coc.description),
        emptyToNull(coc.complianceType),
        coc.issueDate,
        coc.expiryDate,
        coc.status,
        emptyToNull(coc.documentUrl),
        issuedBy,
        coc.auditDate,
        coc.nextAuditDate,
        emptyToNull(coc.notes)
      ]);
      console.log(`  ✓ COC: ${coc.cocNumber} - ${coc.title}`);
    } catch (error) {
      console.error(`  ✗ Failed to import COC ${coc.cocNumber}:`, error.message);
    }
  }
}

async function importDocuments() {
  console.log('Importing documents...');
  const content = fs.readFileSync('./sample-data/10-documents.csv', 'utf8');
  const documents = parseCSV(content);
  
  for (const doc of documents) {
    const clientId = clientMap.get(doc.clientName);
    const contractId = contractMap.get(`${doc.clientName}|${doc.contractName}`);
    const uploadedBy = userMap.get(doc.uploadedBy);
    
    if (!clientId) {
      console.error(`  ✗ Client not found: ${doc.clientName}`);
      continue;
    }
    
    // Convert comma-separated tags to JSON array
    let tagsArray = null;
    if (doc.tags && doc.tags.trim()) {
      tagsArray = doc.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    const query = `
      INSERT INTO documents (name, description, file_name, file_path, file_size, mime_type, document_type, client_id, contract_id, uploaded_by, tags, expiration_date, compliance_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;
    
    try {
      await client.query(query, [
        doc.name,
        emptyToNull(doc.description),
        doc.fileName,
        `/documents/${doc.fileName}`,
        Math.floor(Math.random() * 1000000) + 10000, // Random file size
        'application/pdf',
        doc.documentType,
        clientId,
        contractId,
        uploadedBy,
        tagsArray ? JSON.stringify(tagsArray) : null,
        doc.expirationDate,
        emptyToNull(doc.complianceType)
      ]);
      console.log(`  ✓ Document: ${doc.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to import document ${doc.name}:`, error.message);
    }
  }
}

async function importFinancialTransactions() {
  console.log('Importing financial transactions...');
  const content = fs.readFileSync('./sample-data/11-financial-transactions.csv', 'utf8');
  const transactions = parseCSV(content);
  
  for (const txn of transactions) {
    const clientId = txn.clientName ? clientMap.get(txn.clientName) : null;
    const contractId = txn.contractName ? contractMap.get(`${txn.clientName}|${txn.contractName}`) : null;
    
    const query = `
      INSERT INTO financial_transactions (type, amount, description, status, client_id, contract_id, transaction_date, category, reference, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    
    try {
      await client.query(query, [
        txn.type,
        parseFloat(txn.amount),
        txn.description,
        txn.status,
        clientId,
        contractId,
        txn.transactionDate,
        txn.category,
        txn.reference,
        emptyToNull(txn.notes)
      ]);
      console.log(`  ✓ Transaction: ${txn.reference} - ${txn.description}`);
    } catch (error) {
      console.error(`  ✗ Failed to import transaction ${txn.reference}:`, error.message);
    }
  }
}

async function main() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Create sample-data directory if it doesn't exist
    if (!fs.existsSync('./sample-data')) {
      fs.mkdirSync('./sample-data');
    }
    
    // Import data in order of dependencies
    await importUsers();
    await importClients();
    await importServices();
    await importContracts();
    await importLicensePools();
    await importHardwareAssets();
    await importIndividualLicenses();
    await importSAFs();
    await importCOCs();
    await importDocuments();
    await importFinancialTransactions();
    
    console.log('\n✅ All sample data imported successfully!');
    console.log('\nSummary:');
    console.log(`- Users: ${userMap.size}`);
    console.log(`- Clients: ${clientMap.size}`);
    console.log(`- Services: ${serviceMap.size}`);
    console.log(`- Contracts: ${contractMap.size}`);
    console.log(`- License Pools: ${licensePoolMap.size}`);
    console.log(`- Hardware Assets: ${hardwareAssetMap.size}`);
    console.log(`- Service Authorization Forms: ${safMap.size}`);
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await client.end();
  }
}

main(); 