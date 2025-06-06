import { test, expect, Page } from '@playwright/test'

test.describe('Client Management E2E Tests', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    
    // Login before each test
    await page.goto('/')
    await page.fill('[data-testid="username"]', 'admin')
    await page.fill('[data-testid="password"]', 'admin123')
    await page.click('[data-testid="login-button"]')
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]')
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('should navigate to clients page and display client list', async () => {
    // Navigate to clients page
    await page.click('[data-testid="nav-clients"]')
    await page.waitForURL('**/clients')
    
    // Check if clients table is visible
    await expect(page.locator('[data-testid="clients-table"]')).toBeVisible()
    
    // Check if "Add Client" button is visible
    await expect(page.locator('[data-testid="add-client-button"]')).toBeVisible()
  })

  test('should create a new client successfully', async () => {
    // Navigate to clients page
    await page.click('[data-testid="nav-clients"]')
    await page.waitForURL('**/clients')
    
    // Click "Add Client" button
    await page.click('[data-testid="add-client-button"]')
    
    // Fill out the client form
    await page.fill('[data-testid="client-name"]', 'E2E Test Client')
    await page.selectOption('[data-testid="client-industry"]', 'technology')
    await page.selectOption('[data-testid="client-status"]', 'active')
    await page.selectOption('[data-testid="client-source"]', 'direct')
    await page.fill('[data-testid="client-address"]', '123 E2E Test Street')
    await page.fill('[data-testid="client-website"]', 'https://e2etest.com')
    await page.fill('[data-testid="client-notes"]', 'This is an E2E test client')
    
    // Submit the form
    await page.click('[data-testid="submit-client-form"]')
    
    // Wait for success message or redirect
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 })
    
    // Verify client appears in the list
    await expect(page.locator('text=E2E Test Client')).toBeVisible()
  })

  test('should edit an existing client', async () => {
    // First create a client to edit
    await page.click('[data-testid="nav-clients"]')
    await page.click('[data-testid="add-client-button"]')
    
    await page.fill('[data-testid="client-name"]', 'Client to Edit')
    await page.selectOption('[data-testid="client-status"]', 'active')
    await page.click('[data-testid="submit-client-form"]')
    
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Find and click edit button for the client
    await page.click('[data-testid="edit-client-Client to Edit"]')
    
    // Update client information
    await page.fill('[data-testid="client-name"]', 'Updated Client Name')
    await page.selectOption('[data-testid="client-status"]', 'inactive')
    await page.fill('[data-testid="client-notes"]', 'Updated notes')
    
    // Submit the form
    await page.click('[data-testid="submit-client-form"]')
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Verify updated information
    await expect(page.locator('text=Updated Client Name')).toBeVisible()
  })

  test('should delete a client', async () => {
    // First create a client to delete
    await page.click('[data-testid="nav-clients"]')
    await page.click('[data-testid="add-client-button"]')
    
    await page.fill('[data-testid="client-name"]', 'Client to Delete')
    await page.selectOption('[data-testid="client-status"]', 'active')
    await page.click('[data-testid="submit-client-form"]')
    
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Find and click delete button for the client
    await page.click('[data-testid="delete-client-Client to Delete"]')
    
    // Confirm deletion in modal
    await page.click('[data-testid="confirm-delete"]')
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Verify client is no longer in the list
    await expect(page.locator('text=Client to Delete')).not.toBeVisible()
  })

  test('should search and filter clients', async () => {
    // Navigate to clients page
    await page.click('[data-testid="nav-clients"]')
    
    // Create multiple test clients with different statuses
    const clients = [
      { name: 'Active Client 1', status: 'active' },
      { name: 'Active Client 2', status: 'active' },
      { name: 'Inactive Client 1', status: 'inactive' }
    ]
    
    for (const client of clients) {
      await page.click('[data-testid="add-client-button"]')
      await page.fill('[data-testid="client-name"]', client.name)
      await page.selectOption('[data-testid="client-status"]', client.status)
      await page.click('[data-testid="submit-client-form"]')
      await page.waitForSelector('[data-testid="success-message"]')
    }
    
    // Test search functionality
    await page.fill('[data-testid="search-clients"]', 'Active Client')
    await page.waitForTimeout(1000) // Wait for search to filter
    
    await expect(page.locator('text=Active Client 1')).toBeVisible()
    await expect(page.locator('text=Active Client 2')).toBeVisible()
    await expect(page.locator('text=Inactive Client 1')).not.toBeVisible()
    
    // Clear search
    await page.fill('[data-testid="search-clients"]', '')
    
    // Test status filter
    await page.selectOption('[data-testid="filter-status"]', 'active')
    await page.waitForTimeout(1000)
    
    await expect(page.locator('text=Active Client 1')).toBeVisible()
    await expect(page.locator('text=Active Client 2')).toBeVisible()
    await expect(page.locator('text=Inactive Client 1')).not.toBeVisible()
  })

  test('should view client details and aggregated data', async () => {
    // Create a test client
    await page.click('[data-testid="nav-clients"]')
    await page.click('[data-testid="add-client-button"]')
    
    await page.fill('[data-testid="client-name"]', 'Detail View Client')
    await page.selectOption('[data-testid="client-status"]', 'active')
    await page.selectOption('[data-testid="client-industry"]', 'technology')
    await page.click('[data-testid="submit-client-form"]')
    
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Click on client to view details
    await page.click('[data-testid="view-client-Detail View Client"]')
    
    // Wait for client detail page to load
    await page.waitForURL('**/clients/*')
    
    // Verify client information is displayed
    await expect(page.locator('text=Detail View Client')).toBeVisible()
    await expect(page.locator('text=technology')).toBeVisible()
    await expect(page.locator('text=active')).toBeVisible()
    
    // Check for aggregated data sections
    await expect(page.locator('[data-testid="contracts-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="services-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="safs-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="cocs-section"]')).toBeVisible()
  })

  test('should handle bulk import functionality', async () => {
    // Navigate to clients page
    await page.click('[data-testid="nav-clients"]')
    
    // Click bulk import button
    await page.click('[data-testid="bulk-import-button"]')
    
    // Wait for bulk import modal/page
    await page.waitForSelector('[data-testid="bulk-import-form"]')
    
    // Create test CSV content
    const csvContent = `name,email,phone,address,status
Bulk Client 1,bulk1@test.com,+1-555-0001,100 Bulk St,active
Bulk Client 2,bulk2@test.com,+1-555-0002,200 Bulk Ave,inactive`
    
    // Create a temporary file and upload it
    const fileInput = page.locator('[data-testid="csv-file-input"]')
    await fileInput.setInputFiles({
      name: 'test-clients.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Submit the import
    await page.click('[data-testid="submit-bulk-import"]')
    
    // Wait for import to complete
    await page.waitForSelector('[data-testid="import-success"]', { timeout: 15000 })
    
    // Verify imported clients appear in the list
    await page.goto('/clients')
    await expect(page.locator('text=Bulk Client 1')).toBeVisible()
    await expect(page.locator('text=Bulk Client 2')).toBeVisible()
  })

  test('should validate form fields and show error messages', async () => {
    // Navigate to clients page
    await page.click('[data-testid="nav-clients"]')
    await page.click('[data-testid="add-client-button"]')
    
    // Try to submit form without required fields
    await page.click('[data-testid="submit-client-form"]')
    
    // Check for validation error messages
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
    
    // Fill in name but with invalid data
    await page.fill('[data-testid="client-name"]', '') // Empty name
    await page.click('[data-testid="submit-client-form"]')
    
    // Should still show error
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
    
    // Fill in valid name
    await page.fill('[data-testid="client-name"]', 'Valid Client Name')
    
    // Error should disappear
    await expect(page.locator('[data-testid="name-error"]')).not.toBeVisible()
  })

  test('should handle external system mappings', async () => {
    // Create a test client first
    await page.click('[data-testid="nav-clients"]')
    await page.click('[data-testid="add-client-button"]')
    
    await page.fill('[data-testid="client-name"]', 'Mapping Test Client')
    await page.selectOption('[data-testid="client-status"]', 'active')
    await page.click('[data-testid="submit-client-form"]')
    
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Navigate to client details
    await page.click('[data-testid="view-client-Mapping Test Client"]')
    
    // Go to external mappings section
    await page.click('[data-testid="external-mappings-tab"]')
    
    // Add a new mapping
    await page.click('[data-testid="add-mapping-button"]')
    
    // Fill mapping form
    await page.selectOption('[data-testid="external-system"]', 'Test Jira')
    await page.fill('[data-testid="external-id"]', 'TCLIENT-001')
    await page.fill('[data-testid="mapping-notes"]', 'Test mapping for Jira')
    
    // Submit mapping
    await page.click('[data-testid="submit-mapping"]')
    
    // Verify mapping appears
    await page.waitForSelector('[data-testid="success-message"]')
    await expect(page.locator('text=TCLIENT-001')).toBeVisible()
    await expect(page.locator('text=Test Jira')).toBeVisible()
  })
}) 