import { execSync } from 'child_process';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Test database URL - use a separate test database
const TEST_DATABASE_URL = process.env.DATABASE_URL?.replace(/\/[^\/]+$/, '/mssp_test') || 
  'postgresql://postgres:postgres@localhost:5432/mssp_test';

export async function setupTestDatabase() {
  console.log('Setting up test database...');
  
  try {
    // Create test database if it doesn't exist
    const dbName = TEST_DATABASE_URL.split('/').pop()?.split('?')[0];
    const baseUrl = TEST_DATABASE_URL.split('/').slice(0, -1).join('/');
    
    try {
      // Connect to postgres database to create test database
      execSync(`psql "${baseUrl}/postgres" -c "CREATE DATABASE ${dbName};"`, { stdio: 'ignore' });
      console.log(`Created test database: ${dbName}`);
    } catch (error) {
      // Database might already exist, which is fine
      console.log(`Test database ${dbName} already exists`);
    }
    
    // Run migrations on test database
    console.log('Running migrations on test database...');
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    execSync('npm run db:migrate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }
    });
    
    console.log('Test database setup complete!');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

export async function cleanupTestDatabase() {
  console.log('Cleaning up test database...');
  
  try {
    // Get all table names
    const tables = await db.execute(sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);
    
    // Disable foreign key checks and truncate all tables
    await db.execute(sql`SET session_replication_role = 'replica'`);
    
    for (const table of tables.rows) {
      if (table.tablename) {
        await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table.tablename)} CASCADE`);
        console.log(`Truncated table: ${table.tablename}`);
      }
    }
    
    await db.execute(sql`SET session_replication_role = 'origin'`);
    
    console.log('Test database cleanup complete!');
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
    throw error;
  }
}

export async function seedTestData() {
  console.log('Seeding test data...');
  
  try {
    // Insert test users
    await db.execute(sql`
      INSERT INTO users (id, email, password, first_name, last_name, role, status)
      VALUES 
        ('test-admin', 'admin@test.com', '$2a$10$K3I9XKPG8DxNOCDdxk5hAeZrZQOFBVDfKXqJZYEHXPLKJKJLM0mXG', 'Test', 'Admin', 'admin', 'active'),
        ('test-manager', 'manager@test.com', '$2a$10$K3I9XKPG8DxNOCDdxk5hAeZrZQOFBVDfKXqJZYEHXPLKJKJLM0mXG', 'Test', 'Manager', 'manager', 'active'),
        ('test-user', 'user@test.com', '$2a$10$K3I9XKPG8DxNOCDdxk5hAeZrZQOFBVDfKXqJZYEHXPLKJKJLM0mXG', 'Test', 'User', 'user', 'active')
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Insert test clients
    await db.execute(sql`
      INSERT INTO clients (id, name, short_name, domain, industry, company_size, status, source, address, website, notes)
      VALUES 
        (1, 'Test Client 1', 'TC1', 'testclient1.com', 'Technology', 'Large', 'active', 'direct', '123 Test St', 'https://testclient1.com', 'Test client for integration tests'),
        (2, 'Test Client 2', 'TC2', 'testclient2.com', 'Finance', 'Medium', 'active', 'referral', '456 Test Ave', 'https://testclient2.com', 'Another test client for integration tests')
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Insert test services
    await db.execute(sql`
      INSERT INTO services (id, name, description, category, type, status, base_price)
      VALUES 
        (1, 'Test Service 1', 'Test service description 1', 'security', 'managed', 'active', 1000),
        (2, 'Test Service 2', 'Test service description 2', 'compliance', 'professional', 'active', 2000)
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Insert test contracts
    await db.execute(sql`
      INSERT INTO contracts (id, client_id, name, start_date, end_date, total_value, status)
      VALUES 
        (1, 1, 'Test Contract 1', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 12000, 'active'),
        (2, 2, 'Test Contract 2', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 years', 24000, 'active')
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('Test data seeding complete!');
  } catch (error) {
    console.error('Failed to seed test data:', error);
    throw error;
  }
}

// Global setup for integration tests
export async function globalSetup() {
  await setupTestDatabase();
  await seedTestData();
}

// Global teardown for integration tests
export async function globalTeardown() {
  await cleanupTestDatabase();
}

// Before each test
export async function beforeEachTest() {
  // Start a transaction
  await db.execute(sql`BEGIN`);
}

// After each test
export async function afterEachTest() {
  // Rollback the transaction
  await db.execute(sql`ROLLBACK`);
}

// Helper to get test authentication token
export async function getTestAuthToken(role: 'admin' | 'manager' | 'user' = 'admin') {
  const users = {
    admin: { email: 'admin@test.com', password: 'password' },
    manager: { email: 'manager@test.com', password: 'password' },
    user: { email: 'user@test.com', password: 'password' }
  };
  
  const response = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(users[role])
  });
  
  const data = await response.json();
  return data.token;
} 