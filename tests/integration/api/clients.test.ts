import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { testDbConnection } from '../../setup/integration.setup'

const app = express()
const API_BASE_URL = 'http://localhost:5001'

describe('Clients API Integration Tests', () => {
  let testClientId: number
  let authCookie: string

  beforeAll(async () => {
    // Login to get authentication cookie
    const loginResponse = await request(API_BASE_URL)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      })
      .expect(200)

    authCookie = loginResponse.headers['set-cookie']?.[0] || ''
  })

  beforeEach(async () => {
    // Clean up any existing test data
    if (testDbConnection) {
      await testDbConnection.query('DELETE FROM clients WHERE name LIKE $1', ['Test%'])
    }
  })

  describe('POST /api/clients', () => {
    it('should create a new client successfully', async () => {
      const newClient = {
        name: 'Test Client Integration',
        industry: 'technology',
        companySize: 'medium',
        status: 'active',
        source: 'direct',
        address: '123 Integration Test St',
        website: 'https://testintegration.com',
        notes: 'Integration test client'
      }

      const response = await request(API_BASE_URL)
        .post('/api/clients')
        .set('Cookie', authCookie)
        .send(newClient)
        .expect(201)

      expect(response.body).toMatchObject({
        name: newClient.name,
        industry: newClient.industry,
        status: newClient.status
      })
      expect(response.body.id).toBeDefined()
      
      testClientId = response.body.id
    })

    it('should return 400 for invalid client data', async () => {
      const invalidClient = {
        // Missing required name field
        industry: 'technology',
        status: 'active'
      }

      await request(API_BASE_URL)
        .post('/api/clients')
        .set('Cookie', authCookie)
        .send(invalidClient)
        .expect(400)
    })

    it('should return 401 for unauthenticated requests', async () => {
      const newClient = {
        name: 'Test Client',
        status: 'active'
      }

      await request(API_BASE_URL)
        .post('/api/clients')
        .send(newClient)
        .expect(401)
    })
  })

  describe('GET /api/clients', () => {
    beforeEach(async () => {
      // Create test client for GET tests
      const response = await request(API_BASE_URL)
        .post('/api/clients')
        .set('Cookie', authCookie)
        .send({
          name: 'Test Client for GET',
          status: 'active',
          industry: 'technology'
        })
        .expect(201)
      
      testClientId = response.body.id
    })

    it('should retrieve all clients', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/clients')
        .set('Cookie', authCookie)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      
      const testClient = response.body.find((client: any) => client.id === testClientId)
      expect(testClient).toBeDefined()
      expect(testClient.name).toBe('Test Client for GET')
    })

    it('should support pagination', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/clients?page=1&limit=5')
        .set('Cookie', authCookie)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeLessThanOrEqual(5)
    })

    it('should support filtering by status', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/clients?status=active')
        .set('Cookie', authCookie)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((client: any) => {
        expect(client.status).toBe('active')
      })
    })
  })

  describe('GET /api/clients/:id', () => {
    beforeEach(async () => {
      // Create test client
      const response = await request(API_BASE_URL)
        .post('/api/clients')
        .set('Cookie', authCookie)
        .send({
          name: 'Test Client for GET by ID',
          status: 'active',
          industry: 'finance'
        })
        .expect(201)
      
      testClientId = response.body.id
    })

    it('should retrieve a specific client by ID', async () => {
      const response = await request(API_BASE_URL)
        .get(`/api/clients/${testClientId}`)
        .set('Cookie', authCookie)
        .expect(200)

      expect(response.body.id).toBe(testClientId)
      expect(response.body.name).toBe('Test Client for GET by ID')
      expect(response.body.industry).toBe('finance')
    })

    it('should return 404 for non-existent client', async () => {
      await request(API_BASE_URL)
        .get('/api/clients/99999')
        .set('Cookie', authCookie)
        .expect(404)
    })
  })

  describe('PUT /api/clients/:id', () => {
    beforeEach(async () => {
      // Create test client
      const response = await request(API_BASE_URL)
        .post('/api/clients')
        .set('Cookie', authCookie)
        .send({
          name: 'Test Client for UPDATE',
          status: 'active',
          industry: 'healthcare'
        })
        .expect(201)
      
      testClientId = response.body.id
    })

    it('should update an existing client', async () => {
      const updatedData = {
        name: 'Updated Test Client',
        status: 'inactive',
        industry: 'manufacturing',
        notes: 'Updated notes'
      }

      const response = await request(API_BASE_URL)
        .put(`/api/clients/${testClientId}`)
        .set('Cookie', authCookie)
        .send(updatedData)
        .expect(200)

      expect(response.body.name).toBe(updatedData.name)
      expect(response.body.status).toBe(updatedData.status)
      expect(response.body.industry).toBe(updatedData.industry)
      expect(response.body.notes).toBe(updatedData.notes)
    })

    it('should return 404 for non-existent client', async () => {
      await request(API_BASE_URL)
        .put('/api/clients/99999')
        .set('Cookie', authCookie)
        .send({ name: 'Updated Name' })
        .expect(404)
    })
  })

  describe('DELETE /api/clients/:id', () => {
    beforeEach(async () => {
      // Create test client
      const response = await request(API_BASE_URL)
        .post('/api/clients')
        .set('Cookie', authCookie)
        .send({
          name: 'Test Client for DELETE',
          status: 'active'
        })
        .expect(201)
      
      testClientId = response.body.id
    })

    it('should delete an existing client', async () => {
      await request(API_BASE_URL)
        .delete(`/api/clients/${testClientId}`)
        .set('Cookie', authCookie)
        .expect(200)

      // Verify client is deleted
      await request(API_BASE_URL)
        .get(`/api/clients/${testClientId}`)
        .set('Cookie', authCookie)
        .expect(404)
    })

    it('should return 404 for non-existent client', async () => {
      await request(API_BASE_URL)
        .delete('/api/clients/99999')
        .set('Cookie', authCookie)
        .expect(404)
    })
  })

  describe('GET /api/clients/:id/aggregated-data', () => {
    beforeEach(async () => {
      // Create test client
      const response = await request(API_BASE_URL)
        .post('/api/clients')
        .set('Cookie', authCookie)
        .send({
          name: 'Test Client for Aggregated Data',
          status: 'active'
        })
        .expect(201)
      
      testClientId = response.body.id
    })

    it('should retrieve aggregated data for a client', async () => {
      const response = await request(API_BASE_URL)
        .get(`/api/clients/${testClientId}/aggregated-data`)
        .set('Cookie', authCookie)
        .expect(200)

      expect(response.body).toHaveProperty('client')
      expect(response.body).toHaveProperty('contracts')
      expect(response.body).toHaveProperty('services')
      expect(response.body).toHaveProperty('safs')
      expect(response.body).toHaveProperty('cocs')
      expect(response.body).toHaveProperty('externalMappings')
      
      expect(response.body.client.id).toBe(testClientId)
    })
  })

  describe('POST /api/clients/bulk-import', () => {
    it('should import clients from CSV data', async () => {
      const csvData = `name,email,phone,address,status
Test Bulk Client 1,bulk1@test.com,+1-555-1001,100 Bulk Street,active
Test Bulk Client 2,bulk2@test.com,+1-555-1002,200 Bulk Avenue,inactive`

      const response = await request(API_BASE_URL)
        .post('/api/clients/bulk-import')
        .set('Cookie', authCookie)
        .attach('file', Buffer.from(csvData), 'test-clients.csv')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.imported).toBe(2)
      expect(response.body.failed).toBe(0)
    })

    it('should handle invalid CSV data gracefully', async () => {
      const invalidCsvData = `name,email,phone,address,status
,invalid@test.com,+1-555-1001,100 Invalid Street,active
Test Valid Client,valid@test.com,+1-555-1002,200 Valid Avenue,active`

      const response = await request(API_BASE_URL)
        .post('/api/clients/bulk-import')
        .set('Cookie', authCookie)
        .attach('file', Buffer.from(invalidCsvData), 'test-clients.csv')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.imported).toBe(1) // Only valid client imported
      expect(response.body.failed).toBe(1)   // Invalid client failed
      expect(response.body.errors).toBeDefined()
    })
  })
}) 