import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

const TEST_DB_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'

async function setupTestData() {
  console.log('Setting up test data...')
  
  const sql = neon(TEST_DB_URL)

  try {
    // Create test clients
    const testClients = [
      {
        name: 'Test Corp',
        email: 'test@testcorp.com',
        phone: '+1-555-0123',
        address: '123 Test Street, Test City, TC 12345',
        status: 'active'
      },
      {
        name: 'Demo Industries',
        email: 'demo@demoindustries.com',
        phone: '+1-555-0456',
        address: '456 Demo Avenue, Demo City, DC 67890',
        status: 'active'
      },
      {
        name: 'Sample Solutions',
        email: 'info@samplesolutions.com',
        phone: '+1-555-0789',
        address: '789 Sample Road, Sample Town, ST 11111',
        status: 'inactive'
      }
    ]

    for (const client of testClients) {
      try {
        await sql`
          INSERT INTO clients (name, short_name, domain, industry, company_size, status, source, address, website, notes, created_at, updated_at)
          VALUES (${client.name}, ${client.email}, ${client.phone}, ${client.address}, ${client.status}, NOW(), NOW())
          ON CONFLICT (email) DO NOTHING
        `
      } catch (error) {
        console.log(`Client ${client.name} may already exist or table doesn't exist yet`)
      }
    }

    // Create test external systems
    const testSystems = [
      {
        name: 'Test Jira',
        type: 'jira',
        base_url: 'https://test.atlassian.net',
        auth_type: 'basic',
        credentials: JSON.stringify({ username: 'test@test.com', token: 'test-token' }),
        is_active: true
      },
      {
        name: 'Test ServiceNow',
        type: 'servicenow',
        base_url: 'https://test.service-now.com',
        auth_type: 'oauth',
        credentials: JSON.stringify({ client_id: 'test-id', client_secret: 'test-secret' }),
        is_active: true
      }
    ]

    for (const system of testSystems) {
      try {
        await sql`
          INSERT INTO external_systems (name, type, base_url, auth_type, credentials, is_active, created_at, updated_at)
          VALUES (${system.name}, ${system.type}, ${system.base_url}, ${system.auth_type}, ${system.credentials}, ${system.is_active}, NOW(), NOW())
          ON CONFLICT (name) DO NOTHING
        `
      } catch (error) {
        console.log(`External system ${system.name} may already exist or table doesn't exist yet`)
      }
    }

    // Create test dashboard widgets
    const testWidgets = [
      {
        title: 'Total Clients',
        type: 'kpi',
        config: JSON.stringify({
          query: 'SELECT COUNT(*) as value FROM clients WHERE status = \'active\'',
          format: 'number'
        }),
        position: JSON.stringify({ x: 0, y: 0, w: 3, h: 2 }),
        is_active: true
      },
      {
        title: 'Client Status Distribution',
        type: 'chart',
        config: JSON.stringify({
          query: 'SELECT status, COUNT(*) as count FROM clients GROUP BY status',
          chart_type: 'pie'
        }),
        position: JSON.stringify({ x: 3, y: 0, w: 6, h: 4 }),
        is_active: true
      }
    ]

    for (const widget of testWidgets) {
      try {
        await sql`
          INSERT INTO dashboard_widgets (title, type, config, position, is_active, created_at, updated_at)
          VALUES (${widget.title}, ${widget.type}, ${widget.config}, ${widget.position}, ${widget.is_active}, NOW(), NOW())
          ON CONFLICT (title) DO NOTHING
        `
      } catch (error) {
        console.log(`Widget ${widget.title} may already exist or table doesn't exist yet`)
      }
    }

    // Create test CSV file for bulk import testing
    const csvContent = `name,email,phone,address,status
Bulk Test Client 1,bulk1@test.com,+1-555-1001,100 Bulk Street,active
Bulk Test Client 2,bulk2@test.com,+1-555-1002,200 Bulk Avenue,active
Bulk Test Client 3,bulk3@test.com,+1-555-1003,300 Bulk Road,inactive`

    const testFilesDir = path.join(process.cwd(), 'test-files')
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true })
    }
    
    fs.writeFileSync(path.join(testFilesDir, 'test-clients.csv'), csvContent)

    console.log('Test data setup completed successfully!')
    
  } catch (error) {
    console.error('Error setting up test data:', error)
    // Don't exit with error as this might be expected in some environments
  }
}

setupTestData() 