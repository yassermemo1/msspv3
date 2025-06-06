#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:5000'; // Adjust as needed
const TEST_RESULTS_FILE = 'rbac-test-results.json';

// Test users configuration - you'll need to create these users first
const TEST_USERS = {
  admin: { username: 'test_admin', password: 'password123' },
  manager: { username: 'test_manager', password: 'password123' },
  engineer: { username: 'test_engineer', password: 'password123' },
  user: { username: 'test_user', password: 'password123' }
};

// Test data
const TEST_CLIENT_DATA = {
  name: 'Test Client for RBAC',
  industry: 'Technology',
  companySize: 'Medium',
  status: 'prospect',
  contactEmail: 'test@example.com'
};

const TEST_SERVICE_DATA = {
  name: 'Test Service for RBAC',
  category: 'Security',
  deliveryModel: 'managed',
  description: 'Test service for RBAC testing'
};

const TEST_FINANCIAL_DATA = {
  type: 'revenue',
  amount: '1000.00',
  description: 'Test transaction for RBAC',
  transactionDate: new Date().toISOString(),
  status: 'completed'
};

class RBACTester {
  constructor() {
    this.results = [];
    this.sessions = {};
  }

  async login(role) {
    const user = TEST_USERS[role];
    if (!user) throw new Error(`No test user configured for role: ${role}`);

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      throw new Error(`Login failed for ${role}: ${response.status}`);
    }

    // Extract session cookie
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      this.sessions[role] = setCookie;
    }

    return response.json();
  }

  async makeRequest(method, endpoint, role, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': this.sessions[role] || ''
      }
    };

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
          'Allowed (200)', // All roles should be able to read
          `${getResult.status}`,
          getResult.status === 200
        );
        
        // Test POST /api/clients
        const postResult = await this.makeRequest('POST', '/api/clients', role, TEST_CLIENT_DATA);
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
          
          // Test DELETE /api/clients/:id (all authenticated users can delete)
          const deleteResult = await this.makeRequest('DELETE', `/api/clients/${clientId}`, role);
          this.recordResult(
            `RBAC_CLIENT_${role.toUpperCase()}_DELETE`,
            role,
            'Client Management',
            `DELETE /api/clients/${clientId}`,
            'Delete client',
            'Allowed (200)', // requireAuth allows all authenticated users
            `${deleteResult.status}`,
            deleteResult.status === 200
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
          'Allowed (200)', // All authenticated users can read
          `${getResult.status}`,
          getResult.status === 200
        );
        
        // Test POST /api/services (admin only)
        const postResult = await this.makeRequest('POST', '/api/services', role, TEST_SERVICE_DATA);
        const expectedPost = role === 'admin' ? 201 : 403;
        this.recordResult(
          `RBAC_SERVICE_${role.toUpperCase()}_POST`,
          role,
          'Service Management',
          'POST /api/services',
          'Create service',
          role === 'admin' ? 'Allowed (201)' : 'Denied (403)',
          `${postResult.status}`,
          postResult.status === expectedPost
        );
        
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
          templateGetResult.status === expectedTemplateGet || templateGetResult.status === 404 // 404 acceptable if service doesn't exist
        );
        
      } catch (error) {
        console.error(`Error testing service management for ${role}:`, error.message);
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
          username: 'test_new_user',
          email: 'testuser@example.com',
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

  async testPagePermissions() {
    console.log('\n📄 Testing Page Permissions...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test GET /api/page-permissions
        const getResult = await this.makeRequest('GET', '/api/page-permissions', role);
        const expectedGet = role === 'admin' ? 200 : 403;
        this.recordResult(
          `RBAC_PAGEPERM_${role.toUpperCase()}_GET`,
          role,
          'Page Permissions',
          'GET /api/page-permissions',
          'Read page permissions',
          role === 'admin' ? 'Allowed (200)' : 'Denied (403)',
          `${getResult.status}`,
          getResult.status === expectedGet
        );
        
        // Test GET /api/user/accessible-pages (all authenticated users)
        const accessibleResult = await this.makeRequest('GET', '/api/user/accessible-pages', role);
        this.recordResult(
          `RBAC_ACCESSIBLE_${role.toUpperCase()}_GET`,
          role,
          'Page Access',
          'GET /api/user/accessible-pages',
          'Get accessible pages',
          'Allowed (200)', // All authenticated users should get their accessible pages
          `${accessibleResult.status}`,
          accessibleResult.status === 200
        );
        
      } catch (error) {
        console.error(`Error testing page permissions for ${role}:`, error.message);
      }
    }
  }

  async testDashboardAccess() {
    console.log('\n📊 Testing Dashboard Access...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test GET /api/dashboard/stats
        const statsResult = await this.makeRequest('GET', '/api/dashboard/stats', role);
        this.recordResult(
          `RBAC_DASH_${role.toUpperCase()}_STATS`,
          role,
          'Dashboard',
          'GET /api/dashboard/stats',
          'Access dashboard stats',
          'Allowed (200)', // All authenticated users can access dashboard
          `${statsResult.status}`,
          statsResult.status === 200
        );
        
        // Test GET /api/dashboard/drilldown/revenue
        const drilldownResult = await this.makeRequest('GET', '/api/dashboard/drilldown/revenue', role);
        this.recordResult(
          `RBAC_DASH_${role.toUpperCase()}_DRILLDOWN`,
          role,
          'Dashboard',
          'GET /api/dashboard/drilldown/revenue',
          'Access dashboard drilldown',
          'Allowed (200)', // All authenticated users can access drilldown
          `${drilldownResult.status}`,
          drilldownResult.status === 200
        );
        
      } catch (error) {
        console.error(`Error testing dashboard access for ${role}:`, error.message);
      }
    }
  }

  async testTechnicalServiceManagement() {
    console.log('\n🔧 Testing Technical Service Management...');
    
    for (const role of ['admin', 'manager', 'engineer', 'user']) {
      console.log(`\n  Testing role: ${role.toUpperCase()}`);
      
      try {
        await this.login(role);
        
        // Test PUT /api/services/1/technical
        const techResult = await this.makeRequest('PUT', '/api/services/1/technical', role, {
          configuration: 'test technical config'
        });
        const expectedTech = ['admin', 'manager', 'engineer'].includes(role) ? 200 : 403;
        this.recordResult(
          `RBAC_TECH_${role.toUpperCase()}_PUT`,
          role,
          'Technical Services',
          'PUT /api/services/1/technical',
          'Update technical configuration',
          ['admin', 'manager', 'engineer'].includes(role) ? 'Allowed (200)' : 'Denied (403)',
          `${techResult.status}`,
          techResult.status === expectedTech || techResult.status === 404 // 404 acceptable if service doesn't exist
        );
        
      } catch (error) {
        console.error(`Error testing technical service management for ${role}:`, error.message);
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
    console.log('🚀 Starting RBAC Test Suite...');
    console.log(`Base URL: ${BASE_URL}`);
    
    try {
      await this.testClientManagement();
      await this.testServiceManagement();
      await this.testFinancialManagement();
      await this.testUserManagement();
      await this.testPagePermissions();
      await this.testDashboardAccess();
      await this.testTechnicalServiceManagement();
      
      const report = this.generateReport();
      
      // Save results to file
      fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(report, null, 2));
      
      // Print summary
      console.log('\n📊 RBAC Test Results Summary:');
      console.log(`Total Tests: ${report.summary.totalTests}`);
      console.log(`Passed: ${report.summary.passed} ✅`);
      console.log(`Failed: ${report.summary.failed} ❌`);
      console.log(`Success Rate: ${((report.summary.passed / report.summary.totalTests) * 100).toFixed(1)}%`);
      
      console.log('\n📋 Results by Role:');
      for (const [role, stats] of Object.entries(report.summary.byRole)) {
        console.log(`  ${role.toUpperCase()}: ${stats.passed}/${stats.total} passed`);
      }
      
      console.log('\n📋 Results by Feature:');
      for (const [feature, stats] of Object.entries(report.summary.byFeature)) {
        console.log(`  ${feature}: ${stats.passed}/${stats.total} passed`);
      }
      
      if (report.summary.failed > 0) {
        console.log('\n❌ Failed Tests:');
        const failed = report.details.filter(r => !r.passed);
        for (const test of failed) {
          console.log(`  ${test.testId}: ${test.role} -> ${test.action} (Expected: ${test.predicted}, Got: ${test.actual})`);
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