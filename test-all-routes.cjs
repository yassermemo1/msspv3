const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const LOGIN_URL = `${BASE_URL}/api/login`;

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@mssp.local',
  password: 'SecureTestPass123!'
};

// All frontend routes to test
const FRONTEND_ROUTES = [
  // Main pages
  { path: '/', name: 'Home/Dashboard' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/clients', name: 'Clients List' },
  { path: '/clients/new', name: 'New Client' },
  { path: '/contracts', name: 'Contracts List' },
  { path: '/contracts/new', name: 'New Contract' },
  { path: '/services', name: 'Services List' },
  { path: '/services/new', name: 'New Service' },
  { path: '/licenses', name: 'License Pools' },
  { path: '/licenses/new', name: 'New License Pool' },
  { path: '/hardware', name: 'Hardware Assets' },
  { path: '/hardware/new', name: 'New Hardware Asset' },
  { path: '/reports', name: 'Reports' },
  { path: '/admin', name: 'Admin Panel' },
  { path: '/admin/users', name: 'User Management' },
  { path: '/admin/settings', name: 'System Settings' },
  { path: '/external-systems', name: 'External Systems' },
  { path: '/saf', name: 'Service Authorization Forms' },
  { path: '/coc', name: 'Certificates of Compliance' },
  { path: '/audit-logs', name: 'Audit Logs' },
  { path: '/settings', name: 'User Settings' },
  { path: '/profile', name: 'User Profile' }
];

// All API endpoints to test
const API_ENDPOINTS = [
  // Authentication
  { method: 'GET', path: '/api/user', name: 'Current User' },
  { method: 'GET', path: '/api/user/2fa/status', name: '2FA Status' },
  
  // Dashboard
  { method: 'GET', path: '/api/dashboard/stats', name: 'Dashboard Stats' },
  { method: 'GET', path: '/api/dashboard/widgets', name: 'Dashboard Widgets' },
  { method: 'GET', path: '/api/dashboard/recent-activity', name: 'Recent Activity' },
  
  // Clients
  { method: 'GET', path: '/api/clients', name: 'Clients List' },
  { method: 'GET', path: '/api/clients/archived', name: 'Archived Clients' },
  
  // Contracts
  { method: 'GET', path: '/api/contracts', name: 'Contracts List' },
  
  // Services
  { method: 'GET', path: '/api/services', name: 'Services List' },
  { method: 'GET', path: '/api/services/categories', name: 'Service Categories' },
  
  // License Pools
  { method: 'GET', path: '/api/license-pools', name: 'License Pools' },
  
  // Hardware Assets
  { method: 'GET', path: '/api/hardware-assets', name: 'Hardware Assets' },
  
  // Documents
  { method: 'GET', path: '/api/documents', name: 'Documents' },
  
  // User Management
  { method: 'GET', path: '/api/users', name: 'Users List' },
  { method: 'GET', path: '/api/page-permissions', name: 'Page Permissions' },
  
  // Settings
  { method: 'GET', path: '/api/user/settings', name: 'User Settings' },
  { method: 'GET', path: '/api/company-settings', name: 'Company Settings' },
  
  // External Systems
  { method: 'GET', path: '/api/external-systems', name: 'External Systems' },
  { method: 'GET', path: '/api/data-sources', name: 'Data Sources' },
  
  // SAF & COC
  { method: 'GET', path: '/api/service-authorization-forms', name: 'SAF List' },
  { method: 'GET', path: '/api/certificates-of-compliance', name: 'COC List' },
  
  // Audit & Security
  { method: 'GET', path: '/api/audit-logs', name: 'Audit Logs' },
  { method: 'GET', path: '/api/security-events', name: 'Security Events' },
  
  // Financial
  { method: 'GET', path: '/api/financial-transactions', name: 'Financial Transactions' },
  
  // Teams & Assignments
  { method: 'GET', path: '/api/team-assignments', name: 'Team Assignments' },
  
  // Proposals
  { method: 'GET', path: '/api/proposals', name: 'Proposals' },
  
  // Entity Relations
  { method: 'GET', path: '/api/entity-relations/types', name: 'Entity Types' },
  
  // Health & Version
  { method: 'GET', path: '/api/health', name: 'Health Check', requiresAuth: false },
  { method: 'GET', path: '/api/version', name: 'Version Info', requiresAuth: false }
];

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function login() {
  try {
    console.log(`${colors.blue}🔐 Logging in as admin...${colors.reset}`);
    const response = await axios.post(LOGIN_URL, ADMIN_CREDENTIALS, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Extract cookies
    const cookies = response.headers['set-cookie'];
    const cookieString = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    
    console.log(`${colors.green}✅ Login successful${colors.reset}\n`);
    return cookieString;
  } catch (error) {
    console.error(`${colors.red}❌ Login failed:${colors.reset}`, error.response?.data || error.message);
    process.exit(1);
  }
}

async function testFrontendRoute(route, cookies) {
  try {
    const response = await axios.get(`${BASE_URL}${route.path}`, {
      headers: {
        'Cookie': cookies,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      validateStatus: null // Don't throw on any status
    });
    
    return {
      route: route.path,
      name: route.name,
      status: response.status,
      success: response.status >= 200 && response.status < 400
    };
  } catch (error) {
    return {
      route: route.path,
      name: route.name,
      status: error.response?.status || 'ERROR',
      success: false,
      error: error.message
    };
  }
}

async function testApiEndpoint(endpoint, cookies) {
  try {
    const config = {
      headers: {
        'Accept': 'application/json'
      },
      validateStatus: null // Don't throw on any status
    };
    
    // Add cookies if auth is required
    if (endpoint.requiresAuth !== false) {
      config.headers['Cookie'] = cookies;
    }
    
    const response = await axios({
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      ...config
    });
    
    return {
      method: endpoint.method,
      endpoint: endpoint.path,
      name: endpoint.name,
      status: response.status,
      success: response.status >= 200 && response.status < 400
    };
  } catch (error) {
    return {
      method: endpoint.method,
      endpoint: endpoint.path,
      name: endpoint.name,
      status: error.response?.status || 'ERROR',
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log(`${colors.cyan}🚀 MSSP Client Manager - Route Testing${colors.reset}`);
  console.log(`${colors.cyan}=====================================\n${colors.reset}`);
  
  // Login first
  const cookies = await login();
  
  // Test Frontend Routes
  console.log(`${colors.blue}📄 Testing Frontend Routes...${colors.reset}\n`);
  
  const frontendResults = [];
  for (const route of FRONTEND_ROUTES) {
    const result = await testFrontendRoute(route, cookies);
    frontendResults.push(result);
    
    const statusColor = result.success ? colors.green : result.status === 404 ? colors.yellow : colors.red;
    const icon = result.success ? '✅' : result.status === 404 ? '⚠️ ' : '❌';
    
    console.log(`${icon} ${result.name.padEnd(30)} ${result.route.padEnd(25)} ${statusColor}${result.status}${colors.reset}`);
  }
  
  // Test API Endpoints
  console.log(`\n${colors.blue}🔌 Testing API Endpoints...${colors.reset}\n`);
  
  const apiResults = [];
  for (const endpoint of API_ENDPOINTS) {
    const result = await testApiEndpoint(endpoint, cookies);
    apiResults.push(result);
    
    const statusColor = result.success ? colors.green : result.status === 404 ? colors.yellow : colors.red;
    const icon = result.success ? '✅' : result.status === 404 ? '⚠️ ' : '❌';
    
    console.log(`${icon} ${result.method.padEnd(6)} ${result.name.padEnd(30)} ${result.endpoint.padEnd(40)} ${statusColor}${result.status}${colors.reset}`);
  }
  
  // Summary
  console.log(`\n${colors.cyan}📊 Summary${colors.reset}`);
  console.log(`${colors.cyan}==========\n${colors.reset}`);
  
  const frontendErrors = frontendResults.filter(r => !r.success);
  const apiErrors = apiResults.filter(r => !r.success);
  
  console.log(`Frontend Routes:`);
  console.log(`  Total: ${frontendResults.length}`);
  console.log(`  ${colors.green}Success: ${frontendResults.length - frontendErrors.length}${colors.reset}`);
  console.log(`  ${colors.yellow}404 Errors: ${frontendErrors.filter(r => r.status === 404).length}${colors.reset}`);
  console.log(`  ${colors.red}500 Errors: ${frontendErrors.filter(r => r.status >= 500).length}${colors.reset}`);
  console.log(`  ${colors.red}Other Errors: ${frontendErrors.filter(r => r.status !== 404 && r.status < 500).length}${colors.reset}`);
  
  console.log(`\nAPI Endpoints:`);
  console.log(`  Total: ${apiResults.length}`);
  console.log(`  ${colors.green}Success: ${apiResults.length - apiErrors.length}${colors.reset}`);
  console.log(`  ${colors.yellow}404 Errors: ${apiErrors.filter(r => r.status === 404).length}${colors.reset}`);
  console.log(`  ${colors.red}500 Errors: ${apiErrors.filter(r => r.status >= 500).length}${colors.reset}`);
  console.log(`  ${colors.red}Other Errors: ${apiErrors.filter(r => r.status !== 404 && r.status < 500).length}${colors.reset}`);
  
  // List all errors
  if (frontendErrors.length > 0) {
    console.log(`\n${colors.red}Frontend Route Errors:${colors.reset}`);
    frontendErrors.forEach(r => {
      console.log(`  ${r.status} - ${r.name} (${r.route})`);
    });
  }
  
  if (apiErrors.length > 0) {
    console.log(`\n${colors.red}API Endpoint Errors:${colors.reset}`);
    apiErrors.forEach(r => {
      console.log(`  ${r.status} - ${r.name} (${r.method} ${r.endpoint})`);
    });
  }
  
  // Exit with error code if there are any 500 errors
  const has500Errors = [...frontendErrors, ...apiErrors].some(r => r.status >= 500);
  process.exit(has500Errors ? 1 : 0);
}

// Run the tests
runTests().catch(console.error); 