import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { spawn, ChildProcess } from 'child_process'
import { createConnection } from '@neondatabase/serverless'

let serverProcess: ChildProcess | null = null
let testDbConnection: any = null

// Test database configuration
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'

beforeAll(async () => {
  // Start test server
  console.log('Starting test server...')
  serverProcess = spawn('npm', ['run', 'dev'], {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '5001',
      DATABASE_URL: TEST_DB_URL
    },
    stdio: 'pipe'
  })

  // Wait for server to start
  await new Promise((resolve) => {
    setTimeout(resolve, 5000)
  })

  // Setup test database connection
  testDbConnection = createConnection({
    connectionString: TEST_DB_URL
  })
}, 30000)

afterAll(async () => {
  // Close database connection
  if (testDbConnection) {
    await testDbConnection.end()
  }

  // Kill test server
  if (serverProcess) {
    serverProcess.kill('SIGTERM')
    await new Promise((resolve) => {
      serverProcess!.on('exit', resolve)
    })
  }
}, 10000)

beforeEach(async () => {
  // Clean up test data before each test
  if (testDbConnection) {
    await testDbConnection.query('BEGIN')
  }
})

afterEach(async () => {
  // Rollback test data after each test
  if (testDbConnection) {
    await testDbConnection.query('ROLLBACK')
  }
})

export { testDbConnection } 