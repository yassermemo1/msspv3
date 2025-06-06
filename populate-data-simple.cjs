const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const ADMIN_EMAIL = 'admin@mssp.local';
const ADMIN_PASSWORD = 'SecureTestPass123!';

let authCookie = '';

// Helper function to make authenticated requests
async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Cookie': authCookie,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ Error ${method} ${url}:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// Login function
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    }, {
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: (status) => status < 400
    });
    
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      authCookie = cookies.map(cookie => cookie.split(';')[0]).join('; ');
      console.log('✅ Login successful');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function populateData() {
  console.log('🚀 Starting data population...\n');

  // Login first
  if (!await login()) {
    console.log('❌ Failed to login. Aborting.');
    return;
  }

  // Get existing clients and services
  const clientsRes = await makeRequest('GET', '/api/clients');
  const servicesRes = await makeRequest('GET', '/api/services');
  
  if (!clientsRes.success || !servicesRes.success) {
    console.log('❌ Failed to get existing data');
    return;
  }

  const clients = clientsRes.data;
  const services = servicesRes.data;
  
  console.log(`Found ${clients.length} clients and ${services.length} services`);

  // Create contracts for each client
  console.log('\n📁 Creating Contracts...');
  const contracts = [];
  
  for (const client of clients) {
    const contractData = {
      clientId: client.id,
      name: `${client.name} - Security Services Agreement`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      status: 'active',
      totalValue: '250000.00',
      autoRenewal: true,
      renewalTerms: '12 months auto-renewal',
      notes: 'Comprehensive security services'
    };
    
    const result = await makeRequest('POST', '/api/contracts', contractData);
    if (result.success) {
      contracts.push(result.data);
      console.log(`✅ Created contract for ${client.name}`);
    }
  }

  // Create service scopes
  console.log('\n📁 Creating Service Scopes...');
  for (let i = 0; i < contracts.length && i < services.length; i++) {
    const contract = contracts[i];
    const service = services[i];
    
    const scopeData = {
      serviceId: service.id,
      description: `${service.name} implementation`,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: 'active',
      deliverables: 'Monthly reports|24/7 support|Quarterly reviews',
      timeline: '12 months',
      notes: 'Standard service implementation'
    };
    
    const result = await makeRequest('POST', `/api/contracts/${contract.id}/service-scopes`, scopeData);
    if (result.success) {
      console.log(`✅ Created service scope for contract ${contract.id}`);
    }
  }

  // Create license pools
  console.log('\n📁 Creating License Pools...');
  const licensePools = [
    {
      name: 'Microsoft E5 Security',
      vendor: 'Microsoft',
      productName: 'Microsoft 365 E5',
      licenseType: 'Subscription',
      totalLicenses: 500,
      availableLicenses: 350,
      costPerLicense: '57.00',
      renewalDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
    },
    {
      name: 'CrowdStrike Falcon',
      vendor: 'CrowdStrike',
      productName: 'Falcon Complete',
      licenseType: 'Subscription',
      totalLicenses: 1000,
      availableLicenses: 750,
      costPerLicense: '15.00',
      renewalDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
    }
  ];

  for (const pool of licensePools) {
    const result = await makeRequest('POST', '/api/license-pools', pool);
    if (result.success) {
      console.log(`✅ Created license pool: ${pool.name}`);
    }
  }

  // Create hardware assets
  console.log('\n📁 Creating Hardware Assets...');
  const hardwareAssets = [
    {
      name: 'Dell PowerEdge R750',
      category: 'Server',
      manufacturer: 'Dell',
      model: 'PowerEdge R750',
      serialNumber: 'DLL-R750-001',
      status: 'active',
      location: 'Data Center - Rack A1'
    },
    {
      name: 'Cisco ASA 5555-X',
      category: 'Firewall',
      manufacturer: 'Cisco',
      model: 'ASA 5555-X',
      serialNumber: 'CSC-ASA-001',
      status: 'active',
      location: 'Data Center - Network Rack'
    }
  ];

  for (const asset of hardwareAssets) {
    const result = await makeRequest('POST', '/api/hardware-assets', asset);
    if (result.success) {
      console.log(`✅ Created hardware asset: ${asset.name}`);
    }
  }

  // Create SAFs
  console.log('\n📁 Creating Service Authorization Forms...');
  for (let i = 0; i < Math.min(contracts.length, 2); i++) {
    const contract = contracts[i];
    const client = clients[i];
    
    const safData = {
      clientId: client.id,
      contractId: contract.id,
      safNumber: `SAF-2024-${String(i + 1).padStart(3, '0')}`,
      title: `${client.name} - Security Services Authorization`,
      description: 'Authorization for security services',
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: 'approved',
      value: '50000.00'
    };
    
    const result = await makeRequest('POST', '/api/service-authorization-forms', safData);
    if (result.success) {
      console.log(`✅ Created SAF: ${safData.safNumber}`);
    }
  }

  // Create COCs
  console.log('\n📁 Creating Certificates of Compliance...');
  const complianceTypes = ['SOC2', 'ISO27001', 'HIPAA'];
  
  for (let i = 0; i < Math.min(clients.length, 3); i++) {
    const client = clients[i];
    const contract = contracts[i];
    
    const cocData = {
      clientId: client.id,
      contractId: contract?.id,
      cocNumber: `COC-2024-${String(i + 1).padStart(3, '0')}`,
      title: `${complianceTypes[i]} Compliance Certificate`,
      description: `${complianceTypes[i]} compliance for ${client.name}`,
      complianceType: complianceTypes[i],
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      status: 'active'
    };
    
    const result = await makeRequest('POST', '/api/certificates-of-compliance', cocData);
    if (result.success) {
      console.log(`✅ Created COC: ${cocData.cocNumber}`);
    }
  }

  // Create financial transactions
  console.log('\n📁 Creating Financial Transactions...');
  for (const client of clients.slice(0, 3)) {
    const transactionData = {
      type: 'invoice',
      clientId: client.id,
      amount: '25000.00',
      currency: 'USD',
      description: 'Monthly security services invoice',
      transactionDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    
    const result = await makeRequest('POST', '/api/financial-transactions', transactionData);
    if (result.success) {
      console.log(`✅ Created invoice for ${client.name}`);
    }
  }

  console.log('\n✅ Data population completed!');
}

// Run the population
populateData().catch(console.error); 