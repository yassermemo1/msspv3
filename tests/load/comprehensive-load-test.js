import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

// Custom metrics
const loginRate = new Rate('login_success_rate')
const dashboardLoadTime = new Trend('dashboard_load_time')
const bulkImportTime = new Trend('bulk_import_time')
const apiErrors = new Counter('api_errors')
const clientCreationRate = new Rate('client_creation_success_rate')

// Test configuration
export const options = {
  scenarios: {
    // Scenario 1: Basic load test - Normal user activity
    basic_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },   // Ramp up to 10 users
        { duration: '5m', target: 10 },   // Stay at 10 users
        { duration: '2m', target: 20 },   // Ramp up to 20 users
        { duration: '5m', target: 20 },   // Stay at 20 users
        { duration: '2m', target: 0 },    // Ramp down
      ],
      gracefulRampDown: '30s',
    },
    
    // Scenario 2: Stress test - Push system to limits
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up quickly
        { duration: '5m', target: 50 },   // Stay at stress level
        { duration: '2m', target: 100 },  // Push further
        { duration: '3m', target: 100 },  // Maximum stress
        { duration: '3m', target: 0 },    // Ramp down
      ],
      startTime: '15m', // Start after basic load test
    },
    
    // Scenario 3: Spike test - Sudden traffic increases
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 10 },   // Normal load
        { duration: '30s', target: 200 }, // Sudden spike
        { duration: '1m', target: 200 },  // Maintain spike
        { duration: '30s', target: 10 },  // Back to normal
        { duration: '1m', target: 10 },   // Stabilize
      ],
      startTime: '30m', // Start after stress test
    },
    
    // Scenario 4: Bulk operations test
    bulk_operations: {
      executor: 'shared-iterations',
      vus: 5,
      iterations: 20,
      maxDuration: '10m',
      startTime: '45m',
    },
    
    // Scenario 5: Dashboard-specific load test
    dashboard_load: {
      executor: 'constant-vus',
      vus: 30,
      duration: '10m',
      startTime: '60m',
    }
  },
  
  thresholds: {
    // Response time thresholds
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    'http_req_duration{name:login}': ['p(95)<1000'], // Login under 1s
    'http_req_duration{name:dashboard}': ['p(95)<3000'], // Dashboard under 3s
    'http_req_duration{name:bulk_import}': ['p(95)<30000'], // Bulk import under 30s
    
    // Success rate thresholds
    http_req_failed: ['rate<0.1'], // Error rate under 10%
    login_success_rate: ['rate>0.95'], // Login success over 95%
    client_creation_success_rate: ['rate>0.90'], // Client creation over 90%
    
    // Custom metric thresholds
    dashboard_load_time: ['p(95)<3000'],
    bulk_import_time: ['p(95)<30000'],
    api_errors: ['count<100'], // Less than 100 total API errors
  }
}

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000'

// Test data generators
function generateClient(index) {
  return {
    name: `Load Test Client ${index}-${Date.now()}`,
    industry: ['technology', 'finance', 'healthcare', 'manufacturing'][index % 4],
    companySize: ['small', 'medium', 'large'][index % 3],
    status: 'prospect',
    source: ['nca', 'direct', 'both'][index % 3],
    address: `${100 + index} Test Street, City ${index}`,
    website: `https://client${index}.test.com`,
    notes: `Generated for load testing - iteration ${index}`
  }
}

function generateContract(clientId, index) {
  return {
    clientId: clientId,
    title: `Contract ${index} - Load Test`,
    description: `Performance testing contract ${index}`,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    totalValue: Math.floor(Math.random() * 500000) + 50000, // $50k-$550k
    status: 'draft',
    billingCycle: ['monthly', 'quarterly', 'annually'][index % 3]
  }
}

function generateAsset(index) {
  return {
    name: `Load Test Asset ${index}`,
    category: ['desktop', 'laptop', 'server', 'network'][index % 4],
    manufacturer: ['Dell', 'HP', 'Cisco', 'Fortinet'][index % 4],
    model: `Model-${index}`,
    serialNumber: `LT${String(index).padStart(6, '0')}`,
    purchaseCost: Math.floor(Math.random() * 10000) + 1000,
    location: `Rack ${(index % 10) + 1}`,
    status: 'available'
  }
}

// Authentication helper
function login() {
  const loginData = {
    username: 'admin',
    password: 'admin123'
  }
  
  const response = http.post(`${BASE_URL}/api/login`, JSON.stringify(loginData), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' }
  })
  
  const success = check(response, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('token') !== undefined
  })
  
  loginRate.add(success)
  
  if (success) {
    return response.json('token')
  } else {
    apiErrors.add(1)
    return null
  }
}

// Main test function for basic scenarios
export default function() {
  // Login
  const token = login()
  if (!token) {
    sleep(1)
    return
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  
  // Test different user journeys based on VU ID
  const userType = __VU % 4
  
  switch (userType) {
    case 0:
      // Dashboard-heavy user
      dashboardUserJourney(headers)
      break
    case 1:
      // Client management user
      clientManagementJourney(headers)
      break
    case 2:
      // Contract management user
      contractManagementJourney(headers)
      break
    case 3:
      // Asset management user
      assetManagementJourney(headers)
      break
  }
  
  sleep(Math.random() * 5 + 1) // Random sleep 1-6 seconds
}

function dashboardUserJourney(headers) {
  group('Dashboard Journey', () => {
    // Load main dashboard
    const dashboardStart = Date.now()
    const dashboardResponse = http.get(`${BASE_URL}/dashboard`, {
      headers,
      tags: { name: 'dashboard' }
    })
    const dashboardTime = Date.now() - dashboardStart
    dashboardLoadTime.add(dashboardTime)
    
    check(dashboardResponse, {
      'dashboard loads': (r) => r.status === 200,
      'dashboard load time acceptable': () => dashboardTime < 5000
    })
    
    // Load dashboard widgets
    const widgetsResponse = http.get(`${BASE_URL}/api/dashboard-widgets`, {
      headers,
      tags: { name: 'dashboard_widgets' }
    })
    
    check(widgetsResponse, {
      'widgets load': (r) => r.status === 200,
      'widgets data valid': (r) => Array.isArray(r.json())
    })
    
    // Load dashboard metrics
    const metricsResponse = http.get(`${BASE_URL}/api/dashboard/metrics?timeRange=30d`, {
      headers,
      tags: { name: 'dashboard_metrics' }
    })
    
    check(metricsResponse, {
      'metrics load': (r) => r.status === 200
    })
    
    sleep(2)
    
    // Refresh dashboard data
    const refreshResponse = http.get(`${BASE_URL}/api/dashboard/refresh`, {
      headers,
      tags: { name: 'dashboard_refresh' }
    })
    
    check(refreshResponse, {
      'dashboard refresh successful': (r) => r.status === 200
    })
  })
}

function clientManagementJourney(headers) {
  group('Client Management Journey', () => {
    // List clients
    const clientsResponse = http.get(`${BASE_URL}/api/clients?page=1&limit=20`, {
      headers,
      tags: { name: 'list_clients' }
    })
    
    check(clientsResponse, {
      'clients list loads': (r) => r.status === 200,
      'clients data valid': (r) => Array.isArray(r.json())
    })
    
    // Create new client
    const clientData = generateClient(__ITER)
    const createResponse = http.post(`${BASE_URL}/api/clients`, JSON.stringify(clientData), {
      headers,
      tags: { name: 'create_client' }
    })
    
    const clientCreated = check(createResponse, {
      'client created': (r) => r.status === 201,
      'client data returned': (r) => r.json('id') !== undefined
    })
    
    clientCreationRate.add(clientCreated)
    
    if (clientCreated) {
      const clientId = createResponse.json('id')
      
      // Get client details
      const detailResponse = http.get(`${BASE_URL}/api/clients/${clientId}`, {
        headers,
        tags: { name: 'get_client' }
      })
      
      check(detailResponse, {
        'client details load': (r) => r.status === 200
      })
      
      // Update client
      const updateData = { notes: 'Updated during load test' }
      const updateResponse = http.put(`${BASE_URL}/api/clients/${clientId}`, JSON.stringify(updateData), {
        headers,
        tags: { name: 'update_client' }
      })
      
      check(updateResponse, {
        'client updated': (r) => r.status === 200
      })
    } else {
      apiErrors.add(1)
    }
    
    sleep(1)
  })
}

function contractManagementJourney(headers) {
  group('Contract Management Journey', () => {
    // Get list of clients first
    const clientsResponse = http.get(`${BASE_URL}/api/clients?limit=5`, { headers })
    
    if (clientsResponse.status === 200 && clientsResponse.json().length > 0) {
      const clients = clientsResponse.json()
      const randomClient = clients[Math.floor(Math.random() * clients.length)]
      
      // Create contract
      const contractData = generateContract(randomClient.id, __ITER)
      const createResponse = http.post(`${BASE_URL}/api/contracts`, JSON.stringify(contractData), {
        headers,
        tags: { name: 'create_contract' }
      })
      
      check(createResponse, {
        'contract created': (r) => r.status === 201
      })
      
      if (createResponse.status === 201) {
        const contractId = createResponse.json('id')
        
        // Get contract details
        const detailResponse = http.get(`${BASE_URL}/api/contracts/${contractId}`, {
          headers,
          tags: { name: 'get_contract' }
        })
        
        check(detailResponse, {
          'contract details load': (r) => r.status === 200
        })
      }
    }
    
    // List all contracts
    const contractsResponse = http.get(`${BASE_URL}/api/contracts`, {
      headers,
      tags: { name: 'list_contracts' }
    })
    
    check(contractsResponse, {
      'contracts list loads': (r) => r.status === 200
    })
    
    sleep(1)
  })
}

function assetManagementJourney(headers) {
  group('Asset Management Journey', () => {
    // List hardware assets
    const assetsResponse = http.get(`${BASE_URL}/api/hardware-assets?page=1&limit=20`, {
      headers,
      tags: { name: 'list_assets' }
    })
    
    check(assetsResponse, {
      'assets list loads': (r) => r.status === 200
    })
    
    // Create new asset
    const assetData = generateAsset(__ITER)
    const createResponse = http.post(`${BASE_URL}/api/hardware-assets`, JSON.stringify(assetData), {
      headers,
      tags: { name: 'create_asset' }
    })
    
    check(createResponse, {
      'asset created': (r) => r.status === 201
    })
    
    if (createResponse.status === 201) {
      const assetId = createResponse.json('id')
      
      // Update asset status
      const updateData = { status: 'assigned', notes: 'Assigned during load test' }
      const updateResponse = http.put(`${BASE_URL}/api/hardware-assets/${assetId}`, JSON.stringify(updateData), {
        headers,
        tags: { name: 'update_asset' }
      })
      
      check(updateResponse, {
        'asset updated': (r) => r.status === 200
      })
    }
    
    sleep(1)
  })
}

// Bulk operations test function
export function bulkOperations() {
  const token = login()
  if (!token) return
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  
  group('Bulk Operations', () => {
    // Bulk client import
    const bulkStart = Date.now()
    
    // Generate CSV data for bulk import
    const clientsData = []
    for (let i = 0; i < 100; i++) {
      const client = generateClient(i + __ITER * 100)
      clientsData.push(client)
    }
    
    const csvData = [
      'name,industry,companySize,status,source,address,website,notes',
      ...clientsData.map(c => 
        `"${c.name}","${c.industry}","${c.companySize}","${c.status}","${c.source}","${c.address}","${c.website}","${c.notes}"`
      )
    ].join('\n')
    
    const formData = {
      file: http.file(csvData, 'bulk_clients.csv', 'text/csv')
    }
    
    const bulkResponse = http.post(`${BASE_URL}/api/bulk-import/clients`, formData, {
      headers: { 'Authorization': `Bearer ${token}` },
      tags: { name: 'bulk_import' }
    })
    
    const bulkTime = Date.now() - bulkStart
    bulkImportTime.add(bulkTime)
    
    check(bulkResponse, {
      'bulk import successful': (r) => r.status === 200,
      'bulk import time acceptable': () => bulkTime < 60000, // Under 1 minute
      'clients imported': (r) => {
        const result = r.json()
        return result.imported && result.imported >= 90 // At least 90% success
      }
    })
    
    // Bulk client update
    const bulkUpdateData = {
      ids: [], // Would be populated with actual client IDs
      updates: { status: 'active' }
    }
    
    const bulkUpdateResponse = http.put(`${BASE_URL}/api/bulk-update/clients`, JSON.stringify(bulkUpdateData), {
      headers,
      tags: { name: 'bulk_update' }
    })
    
    check(bulkUpdateResponse, {
      'bulk update successful': (r) => r.status === 200
    })
  })
}

// Dashboard-specific load test
export function dashboardLoad() {
  const token = login()
  if (!token) return
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  
  group('Dashboard Load Test', () => {
    // Concurrent dashboard requests
    const requests = [
      ['GET', `${BASE_URL}/api/dashboard/kpi`, 'dashboard_kpi'],
      ['GET', `${BASE_URL}/api/dashboard/revenue-chart?timeRange=12m`, 'revenue_chart'],
      ['GET', `${BASE_URL}/api/dashboard/client-distribution`, 'client_distribution'],
      ['GET', `${BASE_URL}/api/dashboard/asset-utilization`, 'asset_utilization'],
      ['GET', `${BASE_URL}/api/dashboard/contract-status`, 'contract_status'],
      ['GET', `${BASE_URL}/api/dashboard/financial-summary`, 'financial_summary']
    ]
    
    const responses = http.batch(requests.map(([method, url, name]) => ({
      method,
      url,
      headers,
      tags: { name }
    })))
    
    responses.forEach((response, index) => {
      check(response, {
        [`${requests[index][2]} loads successfully`]: (r) => r.status === 200,
        [`${requests[index][2]} responds quickly`]: (r) => r.timings.duration < 2000
      })
    })
    
    sleep(5) // Wait 5 seconds before next iteration
  })
}

// Custom summary function
export function handleSummary(data) {
  const summary = textSummary(data, { indent: ' ', enableColors: true })
  
  console.log('\n' + '='.repeat(80))
  console.log('MSSP CLIENT MANAGER - LOAD TEST SUMMARY')
  console.log('='.repeat(80))
  console.log(summary)
  
  // Custom metrics summary
  console.log('\nCUSTOM METRICS:')
  console.log('---------------')
  if (data.metrics.login_success_rate) {
    console.log(`Login Success Rate: ${(data.metrics.login_success_rate.values.rate * 100).toFixed(2)}%`)
  }
  if (data.metrics.client_creation_success_rate) {
    console.log(`Client Creation Success Rate: ${(data.metrics.client_creation_success_rate.values.rate * 100).toFixed(2)}%`)
  }
  if (data.metrics.dashboard_load_time) {
    console.log(`Dashboard Load Time (p95): ${data.metrics.dashboard_load_time.values['p(95)']}ms`)
  }
  if (data.metrics.bulk_import_time) {
    console.log(`Bulk Import Time (p95): ${data.metrics.bulk_import_time.values['p(95)']}ms`)
  }
  if (data.metrics.api_errors) {
    console.log(`Total API Errors: ${data.metrics.api_errors.values.count}`)
  }
  
  // Performance recommendations
  console.log('\nPERFORMANCE RECOMMENDATIONS:')
  console.log('----------------------------')
  
  if (data.metrics.http_req_duration && data.metrics.http_req_duration.values['p(95)'] > 2000) {
    console.log('⚠️  Response times are high. Consider optimizing database queries and caching.')
  }
  
  if (data.metrics.http_req_failed && data.metrics.http_req_failed.values.rate > 0.05) {
    console.log('⚠️  Error rate is elevated. Check server logs for issues.')
  }
  
  if (data.metrics.dashboard_load_time && data.metrics.dashboard_load_time.values['p(95)'] > 3000) {
    console.log('⚠️  Dashboard loading slowly. Consider optimizing widget queries.')
  }
  
  if (data.metrics.bulk_import_time && data.metrics.bulk_import_time.values['p(95)'] > 30000) {
    console.log('⚠️  Bulk imports taking too long. Consider batch processing improvements.')
  }
  
  console.log('='.repeat(80))
  
  return {
    'stdout': summary,
    'load-test-results.json': JSON.stringify(data, null, 2),
    'load-test-summary.html': generateHTMLReport(data)
  }
}

function generateHTMLReport(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>MSSP Load Test Results</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            .pass { border-left: 5px solid #4CAF50; }
            .fail { border-left: 5px solid #f44336; }
            .warn { border-left: 5px solid #ff9800; }
        </style>
    </head>
    <body>
        <h1>MSSP Client Manager - Load Test Results</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        
        <h2>Key Metrics</h2>
        <div class="metric ${data.metrics.http_req_duration?.values['p(95)'] < 2000 ? 'pass' : 'fail'}">
            <strong>Response Time (p95):</strong> ${data.metrics.http_req_duration?.values['p(95)']}ms
        </div>
        
        <div class="metric ${data.metrics.http_req_failed?.values.rate < 0.1 ? 'pass' : 'fail'}">
            <strong>Error Rate:</strong> ${(data.metrics.http_req_failed?.values.rate * 100 || 0).toFixed(2)}%
        </div>
        
        <div class="metric ${data.metrics.login_success_rate?.values.rate > 0.95 ? 'pass' : 'fail'}">
            <strong>Login Success Rate:</strong> ${(data.metrics.login_success_rate?.values.rate * 100 || 0).toFixed(2)}%
        </div>
        
        <h2>Performance Summary</h2>
        <pre>${JSON.stringify(data.metrics, null, 2)}</pre>
    </body>
    </html>
  `
} 