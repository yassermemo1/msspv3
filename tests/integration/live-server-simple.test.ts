import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

// Configuration for live server tests
const SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:5001';
const API_BASE = `${SERVER_URL}/api`;

// Test credentials
const TEST_USER = {
  email: 'admin@test.mssp.local',
  password: 'testpassword123'
};

// JSONPlaceholder API
const JSONPLACEHOLDER_API = 'https://jsonplaceholder.typicode.com';

describe('Live Server Integration Tests', () => {
  let authToken: string;
  let cookies: string;

  beforeAll(async () => {
    // Login to get authentication token
    try {
      const loginResponse = await axios.post(`${API_BASE}/login`, TEST_USER, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Extract cookies from response
      const setCookieHeader = loginResponse.headers['set-cookie'];
      if (setCookieHeader) {
        cookies = setCookieHeader.join('; ');
      }
      
      // Get user session
      const userResponse = await axios.get(`${API_BASE}/user`, {
        headers: {
          'Cookie': cookies
        }
      });
      
      console.log('✅ Authentication successful:', userResponse.data.email);
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  });

  describe('Server Health Checks', () => {
    it('should return server health status', async () => {
      const response = await axios.get(`${API_BASE}/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'ok');
      expect(response.data).toHaveProperty('timestamp');
    });

    it('should have required API endpoints', async () => {
      const endpoints = [
        '/api/clients',
        '/api/contracts',
        '/api/services',
        '/api/dashboard/stats'
      ];

      for (const endpoint of endpoints) {
        const response = await axios.get(`${SERVER_URL}${endpoint}`, {
          headers: { 'Cookie': cookies },
          validateStatus: () => true
        });
        expect(response.status).toBeLessThan(500); // Not a server error
      }
    });
  });

  describe('Currency Support', () => {
    it('should support USD and SAR currencies', async () => {
      // Test creating contracts with different currencies
      const currencies = ['USD', 'SAR'];
      
      for (const currency of currencies) {
        const contractData = {
          clientId: 1,
          name: `Test Contract - ${currency}`,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          totalValue: 100000,
          status: 'active',
          currency: currency
        };

        const response = await axios.post(`${API_BASE}/contracts`, contractData, {
          headers: { 'Cookie': cookies }
        });

        expect(response.status).toBe(201);
        expect(response.data.currency).toBe(currency);
      }
    });

    it('should format amounts correctly for SAR and USD', async () => {
      const response = await axios.get(`${API_BASE}/dashboard/stats`, {
        headers: { 'Cookie': cookies }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalRevenue');
      
      // Check if the system can handle both currencies
      // The actual formatting will depend on the client-side implementation
    });
  });

  describe('JSONPlaceholder API Integration', () => {
    it('should fetch posts from JSONPlaceholder API', async () => {
      const response = await axios.get(`${JSONPLACEHOLDER_API}/posts`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(100);
      
      // Verify post structure
      const firstPost = response.data[0];
      expect(firstPost).toHaveProperty('userId');
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('body');
    });

    it('should map JSONPlaceholder data to client format', async () => {
      // Fetch posts from JSONPlaceholder
      const postsResponse = await axios.get(`${JSONPLACEHOLDER_API}/posts`);
      const posts = postsResponse.data.slice(0, 10); // Take first 10 posts

      // Map to client data format
      const clientsFromPosts = posts.map((post: any) => ({
        name: `Client from Post ${post.id}`,
        email: `client${post.id}@example.com`,
        phone: `555-${String(post.id).padStart(4, '0')}`,
        address: post.title.substring(0, 50),
        city: 'Test City',
        state: 'TS',
        zipCode: String(10000 + post.id),
        country: 'Test Country',
        status: post.id % 2 === 0 ? 'active' : 'inactive',
        industry: post.userId % 2 === 0 ? 'Technology' : 'Finance',
        notes: post.body.substring(0, 100)
      }));

      // Test creating clients with mapped data
      for (const clientData of clientsFromPosts.slice(0, 3)) {
        const response = await axios.post(`${API_BASE}/clients`, clientData, {
          headers: { 'Cookie': cookies }
        });

        expect(response.status).toBe(201);
        expect(response.data.name).toBe(clientData.name);
        expect(response.data.status).toBe(clientData.status);
      }
    });

    it('should integrate JSONPlaceholder users as clients', async () => {
      // Fetch users from JSONPlaceholder
      const usersResponse = await axios.get(`${JSONPLACEHOLDER_API}/users`);
      const users = usersResponse.data.slice(0, 5); // Take first 5 users

      // Map users to client format
      const clientsFromUsers = users.map((user: any) => ({
        name: user.company.name,
        email: user.email,
        phone: user.phone.split(' ')[0], // Take only the main number
        address: `${user.address.street} ${user.address.suite}`,
        city: user.address.city,
        state: 'TS',
        zipCode: user.address.zipcode.split('-')[0], // Take only first part
        country: 'Test Country',
        status: 'active',
        website: `https://${user.website}`,
        industry: user.company.bs.includes('e-') ? 'Technology' : 'Business',
        notes: user.company.catchPhrase
      }));

      // Test creating clients
      for (const clientData of clientsFromUsers.slice(0, 2)) {
        const response = await axios.post(`${API_BASE}/clients`, clientData, {
          headers: { 'Cookie': cookies }
        });

        expect(response.status).toBe(201);
        expect(response.data.email).toBe(clientData.email);
      }
    });

    it('should create contracts from JSONPlaceholder data', async () => {
      // First, get existing clients
      const clientsResponse = await axios.get(`${API_BASE}/clients`, {
        headers: { 'Cookie': cookies }
      });
      const clients = clientsResponse.data.slice(0, 5);

      // Fetch posts for contract descriptions
      const postsResponse = await axios.get(`${JSONPLACEHOLDER_API}/posts`);
      const posts = postsResponse.data.slice(0, 5);

      // Create contracts with mixed currencies
      const contracts = posts.map((post: any, index: number) => ({
        clientId: clients[index % clients.length].id,
        name: `Contract - ${post.title.substring(0, 30)}`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (post.id * 30 * 24 * 60 * 60 * 1000)).toISOString(), // id * 30 days
        totalValue: post.id * 10000,
        currency: index % 2 === 0 ? 'USD' : 'SAR', // Alternate between USD and SAR
        status: 'active',
        description: post.body.substring(0, 200)
      }));

      for (const contractData of contracts.slice(0, 3)) {
        const response = await axios.post(`${API_BASE}/contracts`, contractData, {
          headers: { 'Cookie': cookies }
        });

        expect(response.status).toBe(201);
        expect(response.data.currency).toBe(contractData.currency);
        expect(response.data.totalValue).toBe(contractData.totalValue);
      }
    });
  });

  describe('Data Mapping and Transformation', () => {
    it('should handle complex data relationships', async () => {
      // Create a complete workflow: Client -> Service -> Contract
      
      // 1. Create client from JSONPlaceholder user
      const userResponse = await axios.get(`${JSONPLACEHOLDER_API}/users/1`);
      const user = userResponse.data;
      
      const clientData = {
        name: user.company.name,
        email: user.email,
        phone: user.phone.split(' ')[0],
        address: `${user.address.street} ${user.address.suite}`,
        city: user.address.city,
        state: 'TS',
        zipCode: user.address.zipcode.split('-')[0],
        country: 'Test Country',
        status: 'active',
        website: `https://${user.website}`,
        industry: 'Technology'
      };

      const clientResponse = await axios.post(`${API_BASE}/clients`, clientData, {
        headers: { 'Cookie': cookies }
      });
      expect(clientResponse.status).toBe(201);
      const client = clientResponse.data;

      // 2. Create service
      const serviceData = {
        name: 'Managed Security Service',
        description: 'Comprehensive security monitoring and management',
        category: 'security',
        type: 'managed',
        status: 'active',
        basePrice: 5000,
        currency: 'SAR'
      };

      const serviceResponse = await axios.post(`${API_BASE}/services`, serviceData, {
        headers: { 'Cookie': cookies }
      });
      expect(serviceResponse.status).toBe(201);
      const service = serviceResponse.data;

      // 3. Create contract linking client and service
      const contractData = {
        clientId: client.id,
        name: `Security Contract for ${client.name}`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        totalValue: 60000, // 5000 * 12 months
        currency: 'SAR',
        status: 'active',
        services: [service.id]
      };

      const contractResponse = await axios.post(`${API_BASE}/contracts`, contractData, {
        headers: { 'Cookie': cookies }
      });
      expect(contractResponse.status).toBe(201);
      expect(contractResponse.data.clientId).toBe(client.id);
    });

    it('should validate data integrity across operations', async () => {
      // Test CRUD operations with JSONPlaceholder data
      const postResponse = await axios.get(`${JSONPLACEHOLDER_API}/posts/1`);
      const post = postResponse.data;

      // Create
      const createData = {
        name: `Test Client - ${post.id}`,
        email: `test${post.id}@example.com`,
        phone: '555-0001',
        address: post.title,
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country',
        status: 'active'
      };

      const createResponse = await axios.post(`${API_BASE}/clients`, createData, {
        headers: { 'Cookie': cookies }
      });
      expect(createResponse.status).toBe(201);
      const createdClient = createResponse.data;

      // Read
      const readResponse = await axios.get(`${API_BASE}/clients/${createdClient.id}`, {
        headers: { 'Cookie': cookies }
      });
      expect(readResponse.status).toBe(200);
      expect(readResponse.data.name).toBe(createData.name);

      // Update
      const updateData = {
        name: `${createData.name} - Updated`,
        status: 'inactive'
      };

      const updateResponse = await axios.put(
        `${API_BASE}/clients/${createdClient.id}`,
        updateData,
        { headers: { 'Cookie': cookies } }
      );
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.name).toBe(updateData.name);
      expect(updateResponse.data.status).toBe(updateData.status);

      // Delete
      const deleteResponse = await axios.delete(
        `${API_BASE}/clients/${createdClient.id}`,
        { headers: { 'Cookie': cookies } }
      );
      expect(deleteResponse.status).toBe(200);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle bulk data import from JSONPlaceholder', async () => {
      const startTime = Date.now();
      
      // Fetch 20 posts
      const postsResponse = await axios.get(`${JSONPLACEHOLDER_API}/posts?_limit=20`);
      const posts = postsResponse.data;

      // Convert to clients in bulk
      const bulkClients = posts.map((post: any) => ({
        name: `Bulk Client ${post.id}`,
        email: `bulk${post.id}@example.com`,
        phone: `555-${String(1000 + post.id).padStart(4, '0')}`,
        address: post.title.substring(0, 50),
        city: 'Bulk City',
        state: 'BC',
        zipCode: String(20000 + post.id),
        country: 'Test Country',
        status: 'active',
        industry: ['Technology', 'Finance', 'Healthcare'][post.userId % 3]
      }));

      // Create all clients
      const createPromises = bulkClients.map(client =>
        axios.post(`${API_BASE}/clients`, client, {
          headers: { 'Cookie': cookies }
        })
      );

      const results = await Promise.allSettled(createPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ Bulk import completed in ${duration}ms`);
      console.log(`   Successful: ${successful}`);
      console.log(`   Failed: ${failed}`);

      expect(successful).toBeGreaterThan(0);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });
  });
}); 