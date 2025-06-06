import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@server/index'
import { setupTestDatabase, cleanupTestDatabase, createTestUser, createTestClient } from '../../setup/test-helpers'

const app = createApp()

describe('Contracts API Integration Tests', () => {
  let authToken: string
  let testUserId: number
  let testClientId: number

  beforeAll(async () => {
    await setupTestDatabase()
    
    // Create test user and get auth token
    const user = await createTestUser({
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
      role: 'admin'
    })
    testUserId = user.id

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'testuser',
        password: 'password123'
      })
      .expect(200)

    authToken = loginResponse.body.token

    // Create test client
    const client = await createTestClient({
      name: 'Test Corp',
      industry: 'technology',
      status: 'active'
    })
    testClientId = client.id
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  beforeEach(async () => {
    // Clean up contracts before each test
    await cleanupTestDatabase('contracts')
  })

  describe('POST /api/contracts', () => {
    it('creates a new contract with valid data', async () => {
      const contractData = {
        clientId: testClientId,
        title: 'Security Services Agreement',
        description: 'Comprehensive security services contract',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalValue: 150000.00,
        status: 'draft',
        billingCycle: 'monthly',
        autoRenewal: false,
        terms: 'Standard terms and conditions apply'
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractData)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        clientId: testClientId,
        title: 'Security Services Agreement',
        totalValue: '150000.00',
        status: 'draft',
        billingCycle: 'monthly'
      })

      expect(response.body.createdAt).toBeDefined()
      expect(response.body.updatedAt).toBeDefined()
    })

    it('validates required fields', async () => {
      const invalidData = {
        clientId: testClientId,
        // Missing required title
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'title',
            message: expect.stringContaining('required')
          })
        ])
      })
    })

    it('validates date range (end date after start date)', async () => {
      const invalidData = {
        clientId: testClientId,
        title: 'Invalid Date Contract',
        startDate: '2024-12-31',
        endDate: '2024-01-01', // End before start
        totalValue: 100000,
        status: 'draft'
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.error).toContain('End date must be after start date')
    })

    it('validates client exists', async () => {
      const invalidData = {
        clientId: 99999, // Non-existent client
        title: 'Invalid Client Contract',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalValue: 100000,
        status: 'draft'
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(404)

      expect(response.body.error).toContain('Client not found')
    })

    it('requires authentication', async () => {
      const contractData = {
        clientId: testClientId,
        title: 'Unauthorized Contract',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalValue: 100000,
        status: 'draft'
      }

      await request(app)
        .post('/api/contracts')
        .send(contractData)
        .expect(401)
    })

    it('handles database transaction rollback on error', async () => {
      // Create a scenario that will cause a database error
      const contractData = {
        clientId: testClientId,
        title: 'Transaction Test Contract',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalValue: 'invalid_number', // This should cause a type error
        status: 'draft'
      }

      await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractData)
        .expect(400)

      // Verify no partial data was saved
      const contractsResponse = await request(app)
        .get('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(contractsResponse.body).toHaveLength(0)
    })
  })

  describe('GET /api/contracts', () => {
    beforeEach(async () => {
      // Create test contracts
      await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Contract 1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalValue: 100000,
          status: 'active'
        })

      await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Contract 2',
          startDate: '2024-02-01',
          endDate: '2024-12-31',
          totalValue: 150000,
          status: 'draft'
        })
    })

    it('returns all contracts', async () => {
      const response = await request(app)
        .get('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        status: expect.any(String),
        totalValue: expect.any(String)
      })
    })

    it('filters contracts by status', async () => {
      const response = await request(app)
        .get('/api/contracts?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].status).toBe('active')
    })

    it('filters contracts by client ID', async () => {
      const response = await request(app)
        .get(`/api/contracts?clientId=${testClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      response.body.forEach(contract => {
        expect(contract.clientId).toBe(testClientId)
      })
    })

    it('supports pagination', async () => {
      const response = await request(app)
        .get('/api/contracts?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.headers['x-total-count']).toBe('2')
      expect(response.headers['x-page']).toBe('1')
    })

    it('supports sorting', async () => {
      const response = await request(app)
        .get('/api/contracts?sortBy=totalValue&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(parseFloat(response.body[0].totalValue)).toBeGreaterThan(
        parseFloat(response.body[1].totalValue)
      )
    })

    it('includes related client data when requested', async () => {
      const response = await request(app)
        .get('/api/contracts?include=client')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body[0]).toHaveProperty('client')
      expect(response.body[0].client).toMatchObject({
        id: testClientId,
        name: expect.any(String)
      })
    })
  })

  describe('GET /api/contracts/:id', () => {
    let contractId: number

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Test Contract',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalValue: 100000,
          status: 'active'
        })

      contractId = response.body.id
    })

    it('returns contract by ID', async () => {
      const response = await request(app)
        .get(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: contractId,
        title: 'Test Contract',
        status: 'active'
      })
    })

    it('returns 404 for non-existent contract', async () => {
      await request(app)
        .get('/api/contracts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('includes related data when requested', async () => {
      const response = await request(app)
        .get(`/api/contracts/${contractId}?include=client,services`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('client')
      expect(response.body).toHaveProperty('services')
    })
  })

  describe('PUT /api/contracts/:id', () => {
    let contractId: number

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Original Contract',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalValue: 100000,
          status: 'draft'
        })

      contractId = response.body.id
    })

    it('updates contract with valid data', async () => {
      const updateData = {
        title: 'Updated Contract Title',
        totalValue: 150000,
        status: 'active'
      }

      const response = await request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toMatchObject({
        id: contractId,
        title: 'Updated Contract Title',
        totalValue: '150000.00',
        status: 'active'
      })
    })

    it('validates status transitions', async () => {
      // First activate the contract
      await request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'active' })
        .expect(200)

      // Try to change back to draft (should fail)
      const response = await request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'draft' })
        .expect(400)

      expect(response.body.error).toContain('Invalid status transition')
    })

    it('prevents modification of active contract critical fields', async () => {
      // Activate contract first
      await request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'active' })
        .expect(200)

      // Try to change start date (should fail)
      const response = await request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ startDate: '2024-02-01' })
        .expect(400)

      expect(response.body.error).toContain('Cannot modify critical fields of active contract')
    })

    it('updates updatedAt timestamp', async () => {
      const originalResponse = await request(app)
        .get(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)

      const originalUpdatedAt = originalResponse.body.updatedAt

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1000))

      await request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(200)

      const updatedResponse = await request(app)
        .get(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(new Date(updatedResponse.body.updatedAt)).toBeAfter(
        new Date(originalUpdatedAt)
      )
    })
  })

  describe('DELETE /api/contracts/:id', () => {
    let contractId: number

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Contract to Delete',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalValue: 100000,
          status: 'draft'
        })

      contractId = response.body.id
    })

    it('deletes draft contract', async () => {
      await request(app)
        .delete(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify contract is deleted
      await request(app)
        .get(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('prevents deletion of active contracts', async () => {
      // Activate contract first
      await request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'active' })
        .expect(200)

      // Try to delete (should fail)
      const response = await request(app)
        .delete(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body.error).toContain('Cannot delete active contract')
    })

    it('cascades deletion to related records', async () => {
      // Create related service scope
      await request(app)
        .post('/api/service-scopes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contractId: contractId,
          name: 'Test Scope',
          description: 'Test scope description'
        })

      // Delete contract
      await request(app)
        .delete(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify related records are also deleted
      const scopesResponse = await request(app)
        .get(`/api/service-scopes?contractId=${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(scopesResponse.body).toHaveLength(0)
    })
  })

  describe('Business Logic Integration', () => {
    it('calculates contract metrics correctly', async () => {
      // Create multiple contracts with different values
      await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Contract 1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalValue: 100000,
          status: 'active'
        })

      await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Contract 2',
          startDate: '2024-06-01',
          endDate: '2024-12-31',
          totalValue: 50000,
          status: 'active'
        })

      const response = await request(app)
        .get('/api/contracts/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        totalValue: '150000.00',
        activeContracts: 2,
        averageValue: '75000.00',
        monthlyRecurring: expect.any(String)
      })
    })

    it('triggers contract renewal workflow', async () => {
      // Create contract with auto-renewal
      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Auto-Renewal Contract',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalValue: 100000,
          status: 'active',
          autoRenewal: true
        })

      const contractId = response.body.id

      // Trigger renewal check
      await request(app)
        .post(`/api/contracts/${contractId}/check-renewal`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify renewal notification was created
      const notificationsResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(notificationsResponse.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'contract_renewal',
            contractId: contractId
          })
        ])
      )
    })

    it('validates overlapping contracts for same client', async () => {
      // Create first contract
      await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Contract 1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalValue: 100000,
          status: 'active'
        })

      // Try to create overlapping contract
      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Overlapping Contract',
          startDate: '2024-06-01',
          endDate: '2025-05-31',
          totalValue: 150000,
          status: 'active'
        })
        .expect(400)

      expect(response.body.error).toContain('Contract dates overlap with existing active contract')
    })
  })

  describe('Database Transaction Integrity', () => {
    it('maintains referential integrity on cascade operations', async () => {
      // Create contract with related data
      const contractResponse = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Integrity Test Contract',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalValue: 100000,
          status: 'draft'
        })

      const contractId = contractResponse.body.id

      // Create service scope
      await request(app)
        .post('/api/service-scopes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contractId: contractId,
          name: 'Test Scope',
          description: 'Test scope'
        })

      // Create financial transaction
      await request(app)
        .post('/api/financial-transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contractId: contractId,
          amount: 10000,
          type: 'payment',
          description: 'Initial payment'
        })

      // Delete contract should cascade
      await request(app)
        .delete(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify all related data is cleaned up
      const scopesResponse = await request(app)
        .get(`/api/service-scopes?contractId=${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)

      const transactionsResponse = await request(app)
        .get(`/api/financial-transactions?contractId=${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(scopesResponse.body).toHaveLength(0)
      expect(transactionsResponse.body).toHaveLength(0)
    })

    it('handles concurrent contract updates safely', async () => {
      const contractResponse = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: testClientId,
          title: 'Concurrent Test Contract',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalValue: 100000,
          status: 'draft'
        })

      const contractId = contractResponse.body.id

      // Simulate concurrent updates
      const update1 = request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated by User 1' })

      const update2 = request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated by User 2' })

      const [response1, response2] = await Promise.all([update1, update2])

      // One should succeed, the other should handle optimistic locking
      expect([response1.status, response2.status]).toContain(200)
      expect([response1.status, response2.status]).toContain(409) // Conflict
    })
  })
}) 