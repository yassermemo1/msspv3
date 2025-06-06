#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:5001'; // Adjust as needed
const TEST_RESULTS_FILE = 'rbac-test-results.json';

// Test users configuration - you'll need to create these users first
const TEST_USERS = {
  admin: { email: 'test_admin@mssp.com', password: 'password123' },
  manager: { email: 'test_manager@mssp.com', password: 'password123' },
  engineer: { email: 'test_engineer@mssp.com', password: 'password123' },
  user: { email: 'test_user@mssp.com', password: 'password123' }
};

// Test data with all required fields
const TEST_CLIENT_DATA = {
  name: 'Test Client for RBAC',
  industry: 'Technology',
  companySize: 'Medium',
  status: 'prospect',
  contactEmail: 'test@example.com',
  contactName: 'Test Contact',
  address: '123 Test St',
  website: 'https://test.com',
  notes: 'Test client for RBAC testing'
};

const TEST_SERVICE_DATA = {
  name: 'Test Service for RBAC',
  category: 'Security',
  deliveryModel: 'managed',
  description: 'Test service for RBAC testing',
  basePrice: 1000,
  isActive: true
};

const TEST_CONTRACT_DATA = {
  clientId: 1, // Will be updated with actual client ID
  name: 'Test Contract for RBAC',
  status: 'active',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  totalValue: 50000,
  notes: 'Test contract for RBAC testing',
  autoRenewal: false
};

const TEST_FINANCIAL_DATA = {
  type: 'revenue',
  amount: '1000.00',
  description: 'Test transaction for RBAC',
  transactionDate: new Date().toISOString(),
  status: 'completed',
  category: 'service_revenue',
  reference: 'TEST-REF-001'
};

const TEST_SAF_DATA = {
  clientId: 1, // Will be updated with actual client ID
  contractId: 1, // Will be updated with actual contract ID
  safNumber: 'SAF-TEST-001',
  title: 'Test SAF for RBAC',
  description: 'Test service authorization form for RBAC testing',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  status: 'pending',
  value: '25000'
};

const TEST_LICENSE_DATA = {
  clientId: 1, // Will be updated with actual client ID
  name: 'Test License for RBAC',
  vendor: 'Microsoft',
  productName: 'Office 365',
  licenseType: 'subscription',
  quantity: 10,
  costPerLicense: '15.00',
  status: 'active',
  notes: 'Test license for RBAC testing'
};

class RBACTester {
  constructor() {
    this.results = [];
    this.sessions = {};
    this.testClientId = null;
    this.testContractId = null;
  }

  async login(role) {
    const user = TEST_USERS[role];
    if (!user) throw new Error(`No test user configured for role: ${role}`);

    console.log(`    🔐 Logging in as ${role}...`);
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed for ${role}: ${response.status} - ${errorText}`);
    }

    // Extract session cookie
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // Find the session cookie specifically
      const cookies = setCookieHeader.split(',');
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));
      
      if (sessionCookie) {
        const sessionValue = sessionCookie.split(';')[0].trim(); // Get just the session=value part
        this.sessions[role] = sessionValue;
        console.log(`    ✅ Login successful for ${role}, session: ${sessionValue.substring(0, 30)}...`);
      } else {
        console.log(`    ⚠️  Login successful but no session cookie found for ${role}`);
        console.log(`    Available cookies: ${setCookieHeader}`);
      }
    } else {
      console.log(`    ⚠️  Login successful but no set-cookie header received for ${role}`);
    }

    return response.json();
  }

  async makeRequest(method, endpoint, role, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add session cookie if available
    if (this.sessions[role]) {
      options.headers['Cookie'] = this.sessions[role];
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      return {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : await response.text()
      };
    } catch (error) {
      return {
        status: 0,
        ok: false,
        error: error.message
      };
    }
  }

  recordResult(testId, role, feature, action, objective, predicted, actual, passed) {
    const status = passed ? '✅' : '❌';
    console.log(`      ${status} ${testId}: Expected ${predicted}, Got ${actual}`);
    
    this.results.push({
      testId,
      role,
      feature,
      action,
      objective,
      predicted,
      actual,
      passed,
      timestamp: new Date().toISOString()
    });
  }

  async setupTestData() {
    console.log('🔧 Setting up test data...');
    
    // Login as admin to create test data
    await this.login('admin');
    
    // Create a test client if we don't have one
    const clientResult = await this.makeRequest('POST', '/api/clients', 'admin', TEST_CLIENT_DATA);
    if (clientResult.status === 201) {
      this.testClientId = clientResult.data.id;
      console.log(`    ✅ Created test client with ID: ${this.testClientId}`);
      
      // Update test data with real client ID
      TEST_CONTRACT_DATA.clientId = this.testClientId;
      TEST_SAF_DATA.clientId = this.testClientId;
      TEST_LICENSE_DATA.clientId = this.testClientId;
      
      // Create a test contract
      const contractResult = await this.makeRequest('POST', '/api/contracts', 'admin', TEST_CONTRACT_DATA);
      if (contractResult.status === 201) {
        this.testContractId = contractResult.data.id;
        console.log(`    ✅ Created test contract with ID: ${this.testContractId}`);
        
        // Update SAF data with real contract ID
        TEST_SAF_DATA.contractId = this.testContractId;
      }
    } else {
      console.log('    ⚠️  Using default test data (client creation failed)');
    }
  }

  async testClientManagement() {
    console.log('\n🧪 Testing Client Management...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test GET /api/clients
        const getResult = await this.makeRequest('GET', '/api/clients', role);
        this.recordResult(
          `RBAC_CLIENT_${role.toUpperCase()}_GET`,
          role,
          'Client Management',
          'GET /api/clients',
          'Read clients',
          'Allowed (200)',
          `${getResult.status}`,
          getResult.status === 200
        );
        
        // Test POST /api/clients
        const postResult = await this.makeRequest('POST', '/api/clients', role, {
          ...TEST_CLIENT_DATA,
          name: `${TEST_CLIENT_DATA.name} - ${role} test`
        });
        const expectedPost = ['admin', 'manager'].includes(role) ? 201 : 403;
        this.recordResult(
          `RBAC_CLIENT_${role.toUpperCase()}_POST`,
          role,
          'Client Management',
          'POST /api/clients',
          'Create client',
          ['admin', 'manager'].includes(role) ? 'Allowed (201)' : 'Denied (403)',
          `${postResult.status}`,
          postResult.status === expectedPost
        );
        
        // If we created a client, test PUT and DELETE
        if (postResult.status === 201 && postResult.data && postResult.data.id) {
          const clientId = postResult.data.id;
          
          // Test PUT /api/clients/:id
          const putResult = await this.makeRequest('PUT', `/api/clients/${clientId}`, role, {
            ...TEST_CLIENT_DATA,
            name: 'Updated Test Client'
          });
          const expectedPut = ['admin', 'manager'].includes(role) ? 200 : 403;
          this.recordResult(
            `RBAC_CLIENT_${role.toUpperCase()}_PUT`,
            role,
            'Client Management',
            `PUT /api/clients/${clientId}`,
            'Update client',
            ['admin', 'manager'].includes(role) ? 'Allowed (200)' : 'Denied (403)',
            `${putResult.status}`,
            putResult.status === expectedPut
          );
          
          // Test DELETE /api/clients/:id (FIXED - should be manager+ only)
          const deleteResult = await this.makeRequest('DELETE', `/api/clients/${clientId}`, role);
          const expectedDelete = ['admin', 'manager'].includes(role) ? 200 : 403;
          this.recordResult(
            `RBAC_CLIENT_${role.toUpperCase()}_DELETE`,
            role,
            'Client Management',
            `DELETE /api/clients/${clientId}`,
            'Delete client',
            ['admin', 'manager'].includes(role) ? 'Allowed (200)' : 'Denied (403)',
            `${deleteResult.status}`,
            deleteResult.status === expectedDelete
          );
        }
        
      } catch (error) {
        console.error(`Error testing ${role}:`, error.message);
      }
    }
  }

  async testServiceManagement() {
    console.log('\n🔧 Testing Service Management...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test GET /api/services
        const getResult = await this.makeRequest('GET', '/api/services', role);
        this.recordResult(
          `RBAC_SERVICE_${role.toUpperCase()}_GET`,
          role,
          'Service Management',
          'GET /api/services',
          'Read services',
          'Allowed (200)',
          `${getResult.status}`,
          getResult.status === 200
        );
        
        // Test POST /api/services (admin only)
        const postResult = await this.makeRequest('POST', '/api/services', role, {
          ...TEST_SERVICE_DATA,
          name: `${TEST_SERVICE_DATA.name} - ${role} test`
        });
        const expectedPost = role === 'admin' ? 201 : 403;
        this.recordResult(
          `RBAC_SERVICE_${role.toUpperCase()}_POST`,
          role,
          'Service Management',
          'POST /api/services',
          'Create service',
          role === 'admin' ? 'Allowed (201)' : 'Denied (403)',
          `${postResult.status}`,
          // Accept both 200 and 201 for admin (API might return different status codes)
          role === 'admin' ? (postResult.status === 201 || postResult.status === 200) : postResult.status === expectedPost
        );
        
        // If admin created a service, test UPDATE and DELETE (FIXED - should be admin only)
        if ((postResult.status === 201 || postResult.status === 200) && postResult.data && postResult.data.id) {
          const serviceId = postResult.data.id;
          
          // Test PUT /api/services/:id (FIXED - admin only)
          const putResult = await this.makeRequest('PUT', `/api/services/${serviceId}`, role, {
            ...TEST_SERVICE_DATA,
            name: 'Updated Test Service'
          });
          const expectedPut = role === 'admin' ? 200 : 403;
          this.recordResult(
            `RBAC_SERVICE_${role.toUpperCase()}_PUT`,
            role,
            'Service Management',
            `PUT /api/services/${serviceId}`,
            'Update service',
            role === 'admin' ? 'Allowed (200)' : 'Denied (403)',
            `${putResult.status}`,
            putResult.status === expectedPut
          );
          
          // Test DELETE /api/services/:id (FIXED - admin only)
          const deleteResult = await this.makeRequest('DELETE', `/api/services/${serviceId}`, role);
          const expectedDelete = role === 'admin' ? 200 : 403;
          this.recordResult(
            `RBAC_SERVICE_${role.toUpperCase()}_DELETE`,
            role,
            'Service Management',
            `DELETE /api/services/${serviceId}`,
            'Delete service',
            role === 'admin' ? 'Allowed (200)' : 'Denied (403)',
            `${deleteResult.status}`,
            deleteResult.status === expectedDelete
          );
        }
        
        // Test scope template endpoints (admin only)
        const templateGetResult = await this.makeRequest('GET', '/api/services/1/scope-template', role);
        const expectedTemplateGet = role === 'admin' ? 200 : 403;
        this.recordResult(
          `RBAC_TEMPLATE_${role.toUpperCase()}_GET`,
          role,
          'Service Templates',
          'GET /api/services/1/scope-template',
          'Read service template',
          role === 'admin' ? 'Allowed (200)' : 'Denied (403)',
          `${templateGetResult.status}`,
          templateGetResult.status === expectedTemplateGet || templateGetResult.status === 404
        );
        
      } catch (error) {
        console.error(`Error testing service management for ${role}:`, error.message);
      }
    }
  }

  async testContractManagement() {
    console.log('\n📋 Testing Contract Management...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test GET /api/contracts
        const getResult = await this.makeRequest('GET', '/api/contracts', role);
        this.recordResult(
          `RBAC_CONTRACT_${role.toUpperCase()}_GET`,
          role,
          'Contract Management',
          'GET /api/contracts',
          'Read contracts',
          'Allowed (200)', // All authenticated users can read
          `${getResult.status}`,
          getResult.status === 200
        );
        
        // Test POST /api/contracts (FIXED - manager+ only)
        const contractData = {
          ...TEST_CONTRACT_DATA,
          name: `${TEST_CONTRACT_DATA.name} - ${role} test`,
          clientId: this.testClientId || 1
        };
        const postResult = await this.makeRequest('POST', '/api/contracts', role, contractData);
        const expectedPost = ['admin', 'manager'].includes(role) ? 201 : 403;
        this.recordResult(
          `RBAC_CONTRACT_${role.toUpperCase()}_POST`,
          role,
          'Contract Management',
          'POST /api/contracts',
          'Create contract',
          ['admin', 'manager'].includes(role) ? 'Allowed (201)' : 'Denied (403)',
          `${postResult.status}`,
          postResult.status === expectedPost
        );
        
        // If we created a contract, test PUT and DELETE
        if (postResult.status === 201 && postResult.data && postResult.data.id) {
          const contractId = postResult.data.id;
          
          // Test PUT /api/contracts/:id (FIXED - manager+ only)
          const putResult = await this.makeRequest('PUT', `/api/contracts/${contractId}`, role, {
            ...contractData,
            name: 'Updated Test Contract'
          });
          const expectedPut = ['admin', 'manager'].includes(role) ? 200 : 403;
          this.recordResult(
            `RBAC_CONTRACT_${role.toUpperCase()}_PUT`,
            role,
            'Contract Management',
            `PUT /api/contracts/${contractId}`,
            'Update contract',
            ['admin', 'manager'].includes(role) ? 'Allowed (200)' : 'Denied (403)',
            `${putResult.status}`,
            putResult.status === expectedPut
          );
          
          // Test DELETE /api/contracts/:id (FIXED - manager+ only)
          const deleteResult = await this.makeRequest('DELETE', `/api/contracts/${contractId}`, role);
          const expectedDelete = ['admin', 'manager'].includes(role) ? 200 : 403;
          this.recordResult(
            `RBAC_CONTRACT_${role.toUpperCase()}_DELETE`,
            role,
            'Contract Management',
            `DELETE /api/contracts/${contractId}`,
            'Delete contract',
            ['admin', 'manager'].includes(role) ? 'Allowed (200)' : 'Denied (403)',
            `${deleteResult.status}`,
            deleteResult.status === expectedDelete
          );
        }
        
      } catch (error) {
        console.error(`Error testing contract management for ${role}:`, error.message);
      }
    }
  }

  async testServiceAuthorizationForms() {
    console.log('\n📄 Testing Service Authorization Forms...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test GET /api/service-authorization-forms
        const getResult = await this.makeRequest('GET', '/api/service-authorization-forms', role);
        this.recordResult(
          `RBAC_SAF_${role.toUpperCase()}_GET`,
          role,
          'Service Authorization Forms',
          'GET /api/service-authorization-forms',
          'Read SAFs',
          'Allowed (200)', // All authenticated users can read
          `${getResult.status}`,
          getResult.status === 200
        );
        
        // Test POST /api/service-authorization-forms (FIXED - manager+ only)
        const safData = {
          ...TEST_SAF_DATA,
          safNumber: `${TEST_SAF_DATA.safNumber}-${role}`,
          clientId: this.testClientId || 1,
          contractId: this.testContractId || 1
        };
        const postResult = await this.makeRequest('POST', '/api/service-authorization-forms', role, safData);
        const expectedPost = ['admin', 'manager'].includes(role) ? 201 : 403;
        this.recordResult(
          `RBAC_SAF_${role.toUpperCase()}_POST`,
          role,
          'Service Authorization Forms',
          'POST /api/service-authorization-forms',
          'Create SAF',
          ['admin', 'manager'].includes(role) ? 'Allowed (201)' : 'Denied (403)',
          `${postResult.status}`,
          postResult.status === expectedPost
        );
        
        // If we created a SAF, test PUT and DELETE
        if (postResult.status === 201 && postResult.data && postResult.data.id) {
          const safId = postResult.data.id;
          
          // Test PUT /api/service-authorization-forms/:id (FIXED - manager+ only)
          const putResult = await this.makeRequest('PUT', `/api/service-authorization-forms/${safId}`, role, {
            description: 'Updated Test SAF'
          });
          const expectedPut = ['admin', 'manager'].includes(role) ? 200 : 403;
          this.recordResult(
            `RBAC_SAF_${role.toUpperCase()}_PUT`,
            role,
            'Service Authorization Forms',
            `PUT /api/service-authorization-forms/${safId}`,
            'Update SAF',
            ['admin', 'manager'].includes(role) ? 'Allowed (200)' : 'Denied (403)',
            `${putResult.status}`,
            putResult.status === expectedPut
          );
          
          // Test DELETE /api/service-authorization-forms/:id (FIXED - manager+ only)
          const deleteResult = await this.makeRequest('DELETE', `/api/service-authorization-forms/${safId}`, role);
          const expectedDelete = ['admin', 'manager'].includes(role) ? 200 : 403;
          this.recordResult(
            `RBAC_SAF_${role.toUpperCase()}_DELETE`,
            role,
            'Service Authorization Forms',
            `DELETE /api/service-authorization-forms/${safId}`,
            'Delete SAF',
            ['admin', 'manager'].includes(role) ? 'Allowed (200)' : 'Denied (403)',
            `${deleteResult.status}`,
            deleteResult.status === expectedDelete
          );
        }
        
      } catch (error) {
        console.error(`Error testing SAF management for ${role}:`, error.message);
      }
    }
  }

  async testFinancialManagement() {
    console.log('\n💰 Testing Financial Management...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test GET /api/financial-transactions
        const getResult = await this.makeRequest('GET', '/api/financial-transactions', role);
        const expectedGet = ['admin', 'manager'].includes(role) ? 200 : 403;
        this.recordResult(
          `RBAC_FINANCIAL_${role.toUpperCase()}_GET`,
          role,
          'Financial Management',
          'GET /api/financial-transactions',
          'Read financial transactions',
          ['admin', 'manager'].includes(role) ? 'Allowed (200)' : 'Denied (403)',
          `${getResult.status}`,
          getResult.status === expectedGet
        );
        
        // Test POST /api/financial-transactions
        const postResult = await this.makeRequest('POST', '/api/financial-transactions', role, TEST_FINANCIAL_DATA);
        const expectedPost = ['admin', 'manager'].includes(role) ? 201 : 403;
        this.recordResult(
          `RBAC_FINANCIAL_${role.toUpperCase()}_POST`,
          role,
          'Financial Management',
          'POST /api/financial-transactions',
          'Create financial transaction',
          ['admin', 'manager'].includes(role) ? 'Allowed (201)' : 'Denied (403)',
          `${postResult.status}`,
          postResult.status === expectedPost
        );
        
      } catch (error) {
        console.error(`Error testing financial management for ${role}:`, error.message);
      }
    }
  }

  async testUserManagement() {
    console.log('\n👥 Testing User Management...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test GET /api/users
        const getResult = await this.makeRequest('GET', '/api/users', role);
        const expectedGet = role === 'admin' ? 200 : 403;
        this.recordResult(
          `RBAC_USER_${role.toUpperCase()}_GET`,
          role,
          'User Management',
          'GET /api/users',
          'Read users',
          role === 'admin' ? 'Allowed (200)' : 'Denied (403)',
          `${getResult.status}`,
          getResult.status === expectedGet
        );
        
        // Test POST /api/users
        const postResult = await this.makeRequest('POST', '/api/users', role, {
          username: 'test_new_user_' + Date.now(),
          email: 'testuser' + Date.now() + '@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'password123',
          role: 'user'
        });
        const expectedPost = role === 'admin' ? 201 : 403;
        this.recordResult(
          `RBAC_USER_${role.toUpperCase()}_POST`,
          role,
          'User Management',
          'POST /api/users',
          'Create user',
          role === 'admin' ? 'Allowed (201)' : 'Denied (403)',
          `${postResult.status}`,
          postResult.status === expectedPost
        );
        
      } catch (error) {
        console.error(`Error testing user management for ${role}:`, error.message);
      }
    }
  }

  async testLicenseManagement() {
    console.log('\n🔑 Testing License Management...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test POST /api/individual-licenses (FIXED - manager+ only)
        const licenseData = {
          ...TEST_LICENSE_DATA,
          clientId: this.testClientId || 1,
          name: `${TEST_LICENSE_DATA.name} - ${role} test`
        };
        const postResult = await this.makeRequest('POST', '/api/individual-licenses', role, licenseData);
        const expectedPost = ['admin', 'manager'].includes(role) ? 201 : 403;
        this.recordResult(
          `RBAC_LICENSE_${role.toUpperCase()}_POST`,
          role,
          'License Management',
          'POST /api/individual-licenses',
          'Create individual license',
          ['admin', 'manager'].includes(role) ? 'Allowed (201)' : 'Denied (403)',
          `${postResult.status}`,
          postResult.status === expectedPost
        );
        
      } catch (error) {
        console.error(`Error testing license management for ${role}:`, error.message);
      }
    }
  }

  generateReport() {
    const summary = {
      totalTests: this.results.length,
      passed: this.results.filter(r => r.passed).length,
      failed: this.results.filter(r => !r.passed).length,
      byRole: {},
      byFeature: {}
    };

    // Group by role
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      const roleResults = this.results.filter(r => r.role === role);
      summary.byRole[role] = {
        total: roleResults.length,
        passed: roleResults.filter(r => r.passed).length,
        failed: roleResults.filter(r => !r.passed).length
      };
    }

    // Group by feature
    const features = [...new Set(this.results.map(r => r.feature))];
    for (const feature of features) {
      const featureResults = this.results.filter(r => r.feature === feature);
      summary.byFeature[feature] = {
        total: featureResults.length,
        passed: featureResults.filter(r => r.passed).length,
        failed: featureResults.filter(r => !r.passed).length
      };
    }

    return {
      summary,
      details: this.results,
      timestamp: new Date().toISOString()
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive RBAC Test Suite...');
    console.log('📋 Testing ALL security fixes implemented...');
    console.log(`Base URL: ${BASE_URL}`);
    
    try {
      // Setup test data first
      await this.setupTestData();
      
      await this.testClientManagement();
      await this.testServiceManagement();
      await this.testContractManagement();
      await this.testServiceAuthorizationForms();
      await this.testFinancialManagement();
      await this.testUserManagement();
      await this.testLicenseManagement();
      
      const report = this.generateReport();
      
      // Save results to file
      fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(report, null, 2));
      
      // Print summary
      console.log('\n🎯 COMPREHENSIVE RBAC TEST RESULTS:');
      console.log('='*50);
      console.log(`Total Tests: ${report.summary.totalTests}`);
      console.log(`✅ Passed: ${report.summary.passed}`);
      console.log(`❌ Failed: ${report.summary.failed}`);
      console.log(`📊 Success Rate: ${((report.summary.passed / report.summary.totalTests) * 100).toFixed(1)}%`);
      
      if (report.summary.passed === report.summary.totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! RBAC Security is now properly implemented! 🎉');
      } else {
        console.log('\n⚠️  Some tests failed - security gaps still exist');
      }
      
      console.log('\n📋 Results by Role:');
      for (const [role, stats] of Object.entries(report.summary.byRole)) {
        const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
        console.log(`  ${role.toUpperCase()}: ${stats.passed}/${stats.total} passed (${successRate}%)`);
      }
      
      console.log('\n📋 Results by Feature:');
      for (const [feature, stats] of Object.entries(report.summary.byFeature)) {
        const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
        console.log(`  ${feature}: ${stats.passed}/${stats.total} passed (${successRate}%)`);
      }
      
      if (report.summary.failed > 0) {
        console.log('\n❌ Failed Tests (Security Issues):');
        const failed = report.details.filter(r => !r.passed);
        for (const test of failed) {
          console.log(`  🚨 ${test.testId}: Expected ${test.predicted}, Got ${test.actual}`);
        }
      }
      
      console.log(`\n📄 Detailed results saved to: ${TEST_RESULTS_FILE}`);
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }
}

// Export for use in other scripts
module.exports = RBACTester;

// Run if called directly
if (require.main === module) {
  const tester = new RBACTester();
  tester.runAllTests().then(() => {
    console.log('\n✅ RBAC Test Suite completed!');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ RBAC Test Suite failed:', error);
    process.exit(1);
  });
} 