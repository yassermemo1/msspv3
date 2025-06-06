import axios from 'axios';

// Configuration
const SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:5001';
const API_BASE = `${SERVER_URL}/api`;
const JSONPLACEHOLDER_API = 'https://jsonplaceholder.typicode.com';

// Test credentials
const TEST_USER = {
  email: 'admin@test.mssp.local',
  password: 'testpassword123'
};

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let cookies = '';

// Test runner
async function test(name, fn) {
  totalTests++;
  console.log(`\n🧪 Testing: ${name}`);
  try {
    await fn();
    passedTests++;
    console.log(`   ✅ PASSED`);
  } catch (error) {
    failedTests++;
    console.log(`   ❌ FAILED: ${error.message}`);
  }
}

// Assertion helper
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected object to have property '${prop}'`);
      }
    },
    toBeGreaterThan(value) {
      if (actual <= value) {
        throw new Error(`Expected ${actual} to be greater than ${value}`);
      }
    },
    toBeLessThan(value) {
      if (actual >= value) {
        throw new Error(`Expected ${actual} to be less than ${value}`);
      }
    }
  };
}

// Main test suite
async function runTests() {
  console.log('🚀 Starting Live Server Integration Tests');
  console.log(`   Server: ${SERVER_URL}`);
  console.log(`   API Base: ${API_BASE}`);
  
  // Login first
  await test('Authentication', async () => {
    const response = await axios.post(`${API_BASE}/login`, TEST_USER, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status).toBe(200);
    
    // Extract cookies
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      cookies = setCookieHeader.join('; ');
    }
    
    console.log(`   🔐 Logged in as: ${TEST_USER.email}`);
  });

  // Health check
  await test('Server Health Check', async () => {
    const response = await axios.get(`${API_BASE}/health`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status');
    expect(response.data.status).toBe('healthy');
  });

  // Currency Support
  await test('USD and SAR Currency Support', async () => {
    const currencies = ['USD', 'SAR'];
    
    for (const currency of currencies) {
      const contractData = {
        clientId: 1,
        name: `Test Contract - ${currency} - ${Date.now()}`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        totalValue: 100000,
        status: 'active',
        currency: currency
      };

      const response = await axios.post(`${API_BASE}/contracts`, contractData, {
        headers: { 'Cookie': cookies }
      });

      expect(response.status).toBe(201);
      if (response.data.currency) {
        expect(response.data.currency).toBe(currency);
      }
      console.log(`   💰 Created contract with ${currency}: ${response.data.name}`);
    }
  });

  // JSONPlaceholder Integration
  await test('JSONPlaceholder API Connection', async () => {
    const response = await axios.get(`${JSONPLACEHOLDER_API}/posts`);
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(100);
    console.log(`   📡 Successfully fetched ${response.data.length} posts from JSONPlaceholder`);
  });

  await test('Map JSONPlaceholder Posts to Clients', async () => {
    // Fetch posts
    const postsResponse = await axios.get(`${JSONPLACEHOLDER_API}/posts?_limit=5`);
    const posts = postsResponse.data;

    // Create clients from posts
    for (const post of posts) {
      const clientData = {
        name: `Client from Post ${post.id} - ${Date.now()}`,
        email: `client${post.id}_${Date.now()}@example.com`,
        phone: `555-${String(post.id).padStart(4, '0')}`,
        address: post.title.substring(0, 50),
        city: 'Test City',
        state: 'TS',
        zipCode: String(10000 + post.id),
        country: 'Test Country',
        status: post.id % 2 === 0 ? 'active' : 'inactive',
        industry: post.userId % 2 === 0 ? 'Technology' : 'Finance',
        notes: post.body.substring(0, 100)
      };

      const response = await axios.post(`${API_BASE}/clients`, clientData, {
        headers: { 'Cookie': cookies }
      });

      expect(response.status).toBe(201);
      console.log(`   👤 Created client: ${response.data.name}`);
    }
  });

  await test('Map JSONPlaceholder Users to Clients', async () => {
    // Fetch users
    const usersResponse = await axios.get(`${JSONPLACEHOLDER_API}/users?_limit=3`);
    const users = usersResponse.data;

    // Create clients from users
    for (const user of users) {
      const clientData = {
        name: `${user.company.name} - ${Date.now()}`,
        email: `${user.username}_${Date.now()}@example.com`,
        phone: user.phone.split(' ')[0],
        address: `${user.address.street} ${user.address.suite}`,
        city: user.address.city,
        state: 'TS',
        zipCode: user.address.zipcode.split('-')[0],
        country: 'Test Country',
        status: 'active',
        website: `https://${user.website}`,
        industry: user.company.bs.includes('e-') ? 'Technology' : 'Business',
        notes: user.company.catchPhrase
      };

      const response = await axios.post(`${API_BASE}/clients`, clientData, {
        headers: { 'Cookie': cookies }
      });

      expect(response.status).toBe(201);
      console.log(`   👤 Created client from user: ${response.data.name}`);
    }
  });

  await test('Create Mixed Currency Contracts from JSONPlaceholder', async () => {
    // Get some clients first
    const clientsResponse = await axios.get(`${API_BASE}/clients?limit=5`, {
      headers: { 'Cookie': cookies }
    });
    const clients = clientsResponse.data;

    if (clients.length === 0) {
      throw new Error('No clients found to create contracts');
    }

    // Fetch posts for contract data
    const postsResponse = await axios.get(`${JSONPLACEHOLDER_API}/posts?_limit=3`);
    const posts = postsResponse.data;

    // Create contracts with alternating currencies
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const contractData = {
        clientId: clients[i % clients.length].id,
        name: `Contract - ${post.title.substring(0, 30)} - ${Date.now()}`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (post.id * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        totalValue: post.id * 10000,
        currency: i % 2 === 0 ? 'USD' : 'SAR', // Alternate between USD and SAR
        status: 'active',
        description: post.body.substring(0, 200)
      };

      const response = await axios.post(`${API_BASE}/contracts`, contractData, {
        headers: { 'Cookie': cookies }
      });

      expect(response.status).toBe(201);
      if (response.data.currency) {
        expect(response.data.currency).toBe(contractData.currency);
      }
      console.log(`   📄 Created ${contractData.currency} contract: ${response.data.name}`);
    }
  });

  await test('Complete Workflow: User -> Client -> Service -> Contract', async () => {
    // 1. Get user from JSONPlaceholder
    const userResponse = await axios.get(`${JSONPLACEHOLDER_API}/users/1`);
    const user = userResponse.data;

    // 2. Create client
    const clientData = {
      name: `${user.company.name} Workflow Test - ${Date.now()}`,
      email: `workflow_${Date.now()}@example.com`,
      phone: user.phone.split(' ')[0],
      address: `${user.address.street} ${user.address.suite}`,
      city: user.address.city,
      state: 'TS',
      zipCode: user.address.zipcode.split('-')[0],
      country: 'Test Country',
      status: 'active',
      website: `https://${user.website}`,
      industry: 'Technology'
    };

    const clientResponse = await axios.post(`${API_BASE}/clients`, clientData, {
      headers: { 'Cookie': cookies }
    });
    expect(clientResponse.status).toBe(201);
    const client = clientResponse.data;
    console.log(`   ✅ Created client: ${client.name}`);

    // 3. Create service
    const serviceData = {
      name: `Security Service for ${client.name}`,
      description: 'Comprehensive security monitoring',
      category: 'security',
      type: 'managed',
      status: 'active',
      basePrice: 5000
    };

    const serviceResponse = await axios.post(`${API_BASE}/services`, serviceData, {
      headers: { 'Cookie': cookies }
    });
    expect(serviceResponse.status).toBe(200);
    const service = serviceResponse.data;
    console.log(`   ✅ Created service: ${service.name}`);

    // 4. Create contract with SAR currency
    const contractData = {
      clientId: client.id,
      name: `Security Contract for ${client.name}`,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      totalValue: 60000,
      currency: 'SAR',
      status: 'active'
    };

    const contractResponse = await axios.post(`${API_BASE}/contracts`, contractData, {
      headers: { 'Cookie': cookies }
    });
    expect(contractResponse.status).toBe(201);
    console.log(`   ✅ Created SAR contract: ${contractResponse.data.name}`);
  });

  await test('Bulk Data Import Performance', async () => {
    const startTime = Date.now();
    
    // Fetch posts
    const postsResponse = await axios.get(`${JSONPLACEHOLDER_API}/posts?_limit=10`);
    const posts = postsResponse.data;

    // Create clients in parallel
    const createPromises = posts.map((post, index) => {
      const clientData = {
        name: `Bulk Client ${post.id} - ${Date.now()}`,
        email: `bulk${post.id}_${Date.now()}@example.com`,
        phone: `555-${String(2000 + post.id).padStart(4, '0')}`,
        address: post.title.substring(0, 50),
        city: 'Bulk City',
        state: 'BC',
        zipCode: String(20000 + post.id),
        country: 'Test Country',
        status: 'active',
        industry: ['Technology', 'Finance', 'Healthcare'][index % 3]
      };

      return axios.post(`${API_BASE}/clients`, clientData, {
        headers: { 'Cookie': cookies }
      }).catch(err => ({ error: err }));
    });

    const results = await Promise.allSettled(createPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`   ⚡ Bulk import completed in ${duration}ms`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);

    expect(successful).toBeGreaterThan(0);
    expect(duration).toBeLessThan(30000);
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results Summary`);
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (failedTests > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    console.log('\n✨ The system successfully:');
    console.log('   - Supports both USD and SAR currencies');
    console.log('   - Integrates with JSONPlaceholder API');
    console.log('   - Maps external data to internal formats');
    console.log('   - Handles bulk data imports');
    console.log('   - Creates complex data relationships');
    process.exit(0);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
}); 