import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const loginDuration = new Trend('login_duration')
const apiResponseTime = new Trend('api_response_time')

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    errors: ['rate<0.1'],              // Custom error rate below 10%
  },
}

const BASE_URL = 'http://localhost:5000'

// Test data
const testUsers = [
  { username: 'admin', password: 'admin123' },
  { username: 'user1', password: 'password123' },
  { username: 'user2', password: 'password123' },
]

const testClients = [
  {
    name: 'Load Test Client 1',
    industry: 'technology',
    status: 'active',
    source: 'direct'
  },
  {
    name: 'Load Test Client 2',
    industry: 'finance',
    status: 'active',
    source: 'nca'
  },
  {
    name: 'Load Test Client 3',
    industry: 'healthcare',
    status: 'inactive',
    source: 'both'
  }
]

export function setup() {
  console.log('Setting up load test...')
  
  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`)
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 1000ms': (r) => r.timings.duration < 1000,
  })
  
  if (healthResponse.status !== 200) {
    throw new Error('Application is not healthy, aborting load test')
  }
  
  console.log('Application is healthy, starting load test...')
  return { baseUrl: BASE_URL }
}

export default function (data) {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)]
  
  // Test scenario: Login -> Browse -> CRUD operations -> Logout
  const sessionCookie = login(user)
  if (sessionCookie) {
    browseDashboard(sessionCookie)
    testClientOperations(sessionCookie)
    testExternalSystems(sessionCookie)
    logout(sessionCookie)
  }
  
  sleep(1) // Think time between iterations
}

function login(user) {
  const loginStart = Date.now()
  
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    username: user.username,
    password: user.password
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response has user data': (r) => r.json('user') !== undefined,
    'login response time < 2000ms': (r) => r.timings.duration < 2000,
  })
  
  loginDuration.add(Date.now() - loginStart)
  
  if (!loginSuccess) {
    errorRate.add(1)
    console.error(`Login failed for user ${user.username}`)
    return null
  }
  
  // Extract session cookie
  const cookies = loginResponse.headers['Set-Cookie']
  return cookies ? cookies[0] : null
}

function browseDashboard(sessionCookie) {
  const headers = {
    'Cookie': sessionCookie,
    'Content-Type': 'application/json',
  }
  
  // Get dashboard widgets
  const widgetsStart = Date.now()
  const widgetsResponse = http.get(`${BASE_URL}/api/dashboard/widgets`, { headers })
  
  check(widgetsResponse, {
    'widgets status is 200': (r) => r.status === 200,
    'widgets response is array': (r) => Array.isArray(r.json()),
    'widgets response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1)
  
  apiResponseTime.add(Date.now() - widgetsStart)
  
  // Get dashboard data
  const dashboardStart = Date.now()
  const dashboardResponse = http.get(`${BASE_URL}/api/dashboard/data`, { headers })
  
  check(dashboardResponse, {
    'dashboard data status is 200': (r) => r.status === 200,
    'dashboard response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1)
  
  apiResponseTime.add(Date.now() - dashboardStart)
  
  sleep(0.5) // Simulate user reading dashboard
}

function testClientOperations(sessionCookie) {
  const headers = {
    'Cookie': sessionCookie,
    'Content-Type': 'application/json',
  }
  
  // Get all clients
  const clientsStart = Date.now()
  const clientsResponse = http.get(`${BASE_URL}/api/clients`, { headers })
  
  check(clientsResponse, {
    'get clients status is 200': (r) => r.status === 200,
    'get clients response is array': (r) => Array.isArray(r.json()),
    'get clients response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1)
  
  apiResponseTime.add(Date.now() - clientsStart)
  
  // Create a new client
  const testClient = testClients[Math.floor(Math.random() * testClients.length)]
  testClient.name = `${testClient.name} ${Date.now()}` // Make name unique
  
  const createStart = Date.now()
  const createResponse = http.post(`${BASE_URL}/api/clients`, JSON.stringify(testClient), { headers })
  
  const createSuccess = check(createResponse, {
    'create client status is 201': (r) => r.status === 201,
    'create client response has id': (r) => r.json('id') !== undefined,
    'create client response time < 2000ms': (r) => r.timings.duration < 2000,
  })
  
  apiResponseTime.add(Date.now() - createStart)
  
  if (!createSuccess) {
    errorRate.add(1)
    return
  }
  
  const clientId = createResponse.json('id')
  
  // Get the created client
  const getStart = Date.now()
  const getResponse = http.get(`${BASE_URL}/api/clients/${clientId}`, { headers })
  
  check(getResponse, {
    'get client status is 200': (r) => r.status === 200,
    'get client response has correct id': (r) => r.json('id') === clientId,
    'get client response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1)
  
  apiResponseTime.add(Date.now() - getStart)
  
  // Update the client
  const updateData = { name: `Updated ${testClient.name}`, status: 'inactive' }
  const updateStart = Date.now()
  const updateResponse = http.put(`${BASE_URL}/api/clients/${clientId}`, JSON.stringify(updateData), { headers })
  
  check(updateResponse, {
    'update client status is 200': (r) => r.status === 200,
    'update client response has updated name': (r) => r.json('name').includes('Updated'),
    'update client response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1)
  
  apiResponseTime.add(Date.now() - updateStart)
  
  // Get aggregated data
  const aggregatedStart = Date.now()
  const aggregatedResponse = http.get(`${BASE_URL}/api/clients/${clientId}/aggregated-data`, { headers })
  
  check(aggregatedResponse, {
    'aggregated data status is 200': (r) => r.status === 200,
    'aggregated data has client': (r) => r.json('client') !== undefined,
    'aggregated data response time < 2500ms': (r) => r.timings.duration < 2500,
  }) || errorRate.add(1)
  
  apiResponseTime.add(Date.now() - aggregatedStart)
  
  // Delete the client (cleanup)
  const deleteStart = Date.now()
  const deleteResponse = http.del(`${BASE_URL}/api/clients/${clientId}`, null, { headers })
  
  check(deleteResponse, {
    'delete client status is 200': (r) => r.status === 200,
    'delete client response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1)
  
  apiResponseTime.add(Date.now() - deleteStart)
  
  sleep(0.3) // Simulate user processing time
}

function testExternalSystems(sessionCookie) {
  const headers = {
    'Cookie': sessionCookie,
    'Content-Type': 'application/json',
  }
  
  // Get external systems
  const systemsStart = Date.now()
  const systemsResponse = http.get(`${BASE_URL}/api/external-systems`, { headers })
  
  check(systemsResponse, {
    'external systems status is 200': (r) => r.status === 200,
    'external systems response is array': (r) => Array.isArray(r.json()),
    'external systems response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1)
  
  apiResponseTime.add(Date.now() - systemsStart)
  
  sleep(0.2)
}

function logout(sessionCookie) {
  const headers = {
    'Cookie': sessionCookie,
  }
  
  const logoutResponse = http.post(`${BASE_URL}/api/auth/logout`, null, { headers })
  
  check(logoutResponse, {
    'logout status is 200': (r) => r.status === 200,
    'logout response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1)
}

export function teardown(data) {
  console.log('Load test completed')
  
  // Optional: Clean up any test data
  // This could include removing any test clients that weren't cleaned up
}

// Stress test scenario
export function stressTest() {
  const stressOptions = {
    stages: [
      { duration: '1m', target: 50 },  // Ramp up to 50 users
      { duration: '3m', target: 50 },  // Stay at 50 users
      { duration: '1m', target: 100 }, // Ramp up to 100 users
      { duration: '3m', target: 100 }, // Stay at 100 users
      { duration: '2m', target: 0 },   // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<5000'], // More lenient for stress test
      http_req_failed: ['rate<0.2'],     // Allow higher error rate
    },
  }
  
  return stressOptions
}

// Spike test scenario
export function spikeTest() {
  const spikeOptions = {
    stages: [
      { duration: '30s', target: 10 },  // Normal load
      { duration: '30s', target: 200 }, // Sudden spike
      { duration: '1m', target: 200 },  // Maintain spike
      { duration: '30s', target: 10 },  // Return to normal
      { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<10000'], // Very lenient for spike test
      http_req_failed: ['rate<0.3'],      // Allow high error rate during spike
    },
  }
  
  return spikeOptions
} 