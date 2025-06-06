import { test, expect, Page } from '@playwright/test'

// Test data
const testClient = {
  name: 'TechCorp Solutions Inc.',
  industry: 'technology',
  companySize: 'medium',
  status: 'prospect',
  source: 'direct',
  address: '123 Innovation Drive, Tech City, TC 12345',
  website: 'https://techcorp-solutions.com',
  notes: 'High-value prospect interested in comprehensive security services'
}

const testContract = {
  title: 'Security Services Agreement 2024',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  totalValue: '150000',
  status: 'draft',
  billingCycle: 'monthly',
  description: 'Comprehensive managed security services package'
}

const testService = {
  name: 'SOC Monitoring Pro',
  description: '24/7 security operations center monitoring with threat detection',
  category: 'monitoring',
  deliveryModel: 'managed',
  basePrice: '5000',
  pricingUnit: 'monthly'
}

const testAsset = {
  name: 'Dell Security Appliance SA-2024',
  category: 'security',
  manufacturer: 'Dell',
  model: 'SA-2024',
  serialNumber: 'DSA2024001',
  purchaseCost: '15000',
  location: 'Client Datacenter Rack 1',
  status: 'available'
}

// Helper functions
async function login(page: Page) {
  await page.goto('/login')
  await page.fill('[name="username"]', 'admin')
  await page.fill('[name="password"]', 'admin123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
}

async function createClient(page: Page, clientData: typeof testClient) {
  await page.goto('/clients')
  await page.click('button:has-text("Add Client")')
  
  await page.fill('[name="name"]', clientData.name)
  await page.selectOption('[name="industry"]', clientData.industry)
  await page.selectOption('[name="companySize"]', clientData.companySize)
  await page.selectOption('[name="status"]', clientData.status)
  await page.selectOption('[name="source"]', clientData.source)
  await page.fill('[name="address"]', clientData.address)
  await page.fill('[name="website"]', clientData.website)
  await page.fill('[name="notes"]', clientData.notes)
  
  await page.click('button[type="submit"]')
  await expect(page.locator('.toast')).toContainText('Client created successfully')
  
  // Return client ID from URL or response
  await page.waitForURL(/\/clients\/\d+/)
  const url = page.url()
  return url.split('/').pop()
}

async function createContract(page: Page, clientId: string, contractData: typeof testContract) {
  await page.goto(`/clients/${clientId}`)
  await page.click('[data-testid="contracts-tab"]')
  await page.click('button:has-text("Add Contract")')
  
  await page.fill('[name="title"]', contractData.title)
  await page.fill('[name="startDate"]', contractData.startDate)
  await page.fill('[name="endDate"]', contractData.endDate)
  await page.fill('[name="totalValue"]', contractData.totalValue)
  await page.selectOption('[name="status"]', contractData.status)
  await page.selectOption('[name="billingCycle"]', contractData.billingCycle)
  await page.fill('[name="description"]', contractData.description)
  
  await page.click('button[type="submit"]')
  await expect(page.locator('.toast')).toContainText('Contract created successfully')
}

async function addServiceToContract(page: Page, clientId: string, serviceData: typeof testService) {
  await page.goto(`/clients/${clientId}`)
  await page.click('[data-testid="services-tab"]')
  await page.click('button:has-text("Add Service")')
  
  await page.fill('[name="name"]', serviceData.name)
  await page.fill('[name="description"]', serviceData.description)
  await page.selectOption('[name="category"]', serviceData.category)
  await page.selectOption('[name="deliveryModel"]', serviceData.deliveryModel)
  await page.fill('[name="basePrice"]', serviceData.basePrice)
  await page.fill('[name="pricingUnit"]', serviceData.pricingUnit)
  
  await page.click('button[type="submit"]')
  await expect(page.locator('.toast')).toContainText('Service added successfully')
}

async function deployAsset(page: Page, clientId: string, assetData: typeof testAsset) {
  await page.goto(`/clients/${clientId}`)
  await page.click('[data-testid="assets-tab"]')
  await page.click('button:has-text("Deploy Asset")')
  
  await page.fill('[name="name"]', assetData.name)
  await page.selectOption('[name="category"]', assetData.category)
  await page.fill('[name="manufacturer"]', assetData.manufacturer)
  await page.fill('[name="model"]', assetData.model)
  await page.fill('[name="serialNumber"]', assetData.serialNumber)
  await page.fill('[name="purchaseCost"]', assetData.purchaseCost)
  await page.fill('[name="location"]', assetData.location)
  await page.selectOption('[name="status"]', 'assigned')
  
  await page.click('button[type="submit"]')
  await expect(page.locator('.toast')).toContainText('Asset deployed successfully')
}

// Main test suites
test.describe('Complete Client Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Full Client Onboarding Workflow', async ({ page }) => {
    // Step 1: Create prospect client
    const clientId = await createClient(page, testClient)
    expect(clientId).toBeTruthy()
    
    // Verify client appears in clients list
    await page.goto('/clients')
    await expect(page.locator(`text=${testClient.name}`)).toBeVisible()
    await expect(page.locator('[data-status="prospect"]')).toBeVisible()
    
    // Step 2: Create draft contract
    await createContract(page, clientId!, testContract)
    
    // Verify contract appears in client view
    await page.goto(`/clients/${clientId}`)
    await page.click('[data-testid="contracts-tab"]')
    await expect(page.locator(`text=${testContract.title}`)).toBeVisible()
    await expect(page.locator('[data-status="draft"]')).toBeVisible()
    
    // Step 3: Activate contract and convert to active client
    await page.click(`text=${testContract.title}`)
    await page.click('button:has-text("Activate Contract")')
    await page.click('button:has-text("Confirm")')
    await expect(page.locator('.toast')).toContainText('Contract activated successfully')
    
    // Verify client status changed to active
    await page.goto('/clients')
    await expect(page.locator(`text=${testClient.name}`)).toBeVisible()
    await expect(page.locator('[data-status="active"]')).toBeVisible()
    
    // Step 4: Add services to the contract
    await addServiceToContract(page, clientId!, testService)
    
    // Verify service appears in services tab
    await page.goto(`/clients/${clientId}`)
    await page.click('[data-testid="services-tab"]')
    await expect(page.locator(`text=${testService.name}`)).toBeVisible()
    
    // Step 5: Deploy security asset
    await deployAsset(page, clientId!, testAsset)
    
    // Verify asset appears in assets tab
    await page.goto(`/clients/${clientId}`)
    await page.click('[data-testid="assets-tab"]')
    await expect(page.locator(`text=${testAsset.name}`)).toBeVisible()
    await expect(page.locator('[data-status="assigned"]')).toBeVisible()
    
    // Step 6: Verify dashboard reflects new data
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="active-clients"]')).toContainText('1')
    await expect(page.locator('[data-testid="active-contracts"]')).toContainText('1')
    await expect(page.locator('[data-testid="total-revenue"]')).toContainText('150,000')
  })

  test('Service Delivery Workflow', async ({ page }) => {
    // Setup: Create client and contract first
    const clientId = await createClient(page, { ...testClient, status: 'active' })
    await createContract(page, clientId!, { ...testContract, status: 'active' })
    
    // Step 1: Create service scope
    await page.goto(`/clients/${clientId}`)
    await page.click('[data-testid="services-tab"]')
    await page.click('button:has-text("Define Service Scope")')
    
    await page.fill('[name="scopeName"]', 'Initial Security Assessment')
    await page.fill('[name="description"]', 'Comprehensive security posture assessment')
    await page.selectOption('[name="priority"]', 'high')
    await page.fill('[name="estimatedHours"]', '40')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('.toast')).toContainText('Service scope created successfully')
    
    // Step 2: Create Service Authorization Form (SAF)
    await page.click('button:has-text("Create SAF")')
    
    await page.fill('[name="safNumber"]', 'SAF-2024-001')
    await page.fill('[name="title"]', 'Security Assessment Authorization')
    await page.fill('[name="description"]', 'Authorization for initial security assessment')
    await page.fill('[name="startDate"]', '2024-02-01')
    await page.fill('[name="endDate"]', '2024-02-28')
    await page.fill('[name="value"]', '20000')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('.toast')).toContainText('SAF created successfully')
    
    // Step 3: Generate Certificate of Compliance (COC)
    await page.click('button:has-text("Generate COC")')
    
    await page.fill('[name="cocNumber"]', 'COC-2024-001')
    await page.fill('[name="title"]', 'Security Compliance Certificate')
    await page.fill('[name="description"]', 'Certification of security compliance standards')
    await page.selectOption('[name="complianceType"]', 'ISO27001')
    await page.fill('[name="issueDate"]', '2024-03-01')
    await page.fill('[name="expiryDate"]', '2025-03-01')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('.toast')).toContainText('COC generated successfully')
    
    // Step 4: Verify complete service delivery documentation
    await page.goto(`/clients/${clientId}`)
    await page.click('[data-testid="documents-tab"]')
    
    await expect(page.locator('text=SAF-2024-001')).toBeVisible()
    await expect(page.locator('text=COC-2024-001')).toBeVisible()
    await expect(page.locator('[data-type="saf"]')).toBeVisible()
    await expect(page.locator('[data-type="coc"]')).toBeVisible()
  })

  test('Asset Management Lifecycle', async ({ page }) => {
    // Setup: Create active client
    const clientId = await createClient(page, { ...testClient, status: 'active' })
    
    // Step 1: Deploy initial asset
    await deployAsset(page, clientId!, testAsset)
    
    // Step 2: Track asset maintenance
    await page.goto(`/clients/${clientId}`)
    await page.click('[data-testid="assets-tab"]')
    await page.click(`text=${testAsset.name}`)
    
    await page.click('button:has-text("Schedule Maintenance")')
    await page.fill('[name="maintenanceDate"]', '2024-06-15')
    await page.fill('[name="description"]', 'Quarterly security updates and health check')
    await page.selectOption('[name="type"]', 'preventive')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('.toast')).toContainText('Maintenance scheduled successfully')
    
    // Step 3: Update asset status to maintenance
    await page.click('button:has-text("Update Status")')
    await page.selectOption('[name="status"]', 'maintenance')
    await page.fill('[name="notes"]', 'In maintenance for security updates')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-status="maintenance"]')).toBeVisible()
    
    // Step 4: Complete maintenance and return to service
    await page.click('button:has-text("Complete Maintenance")')
    await page.selectOption('[name="status"]', 'assigned')
    await page.fill('[name="notes"]', 'Maintenance completed, all systems operational')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-status="assigned"]')).toBeVisible()
    
    // Step 5: Verify asset history tracking
    await page.click('button:has-text("View History")')
    
    await expect(page.locator('text=Asset deployed')).toBeVisible()
    await expect(page.locator('text=Maintenance scheduled')).toBeVisible()
    await expect(page.locator('text=Status changed to maintenance')).toBeVisible()
    await expect(page.locator('text=Maintenance completed')).toBeVisible()
  })

  test('Bulk Operations Workflow', async ({ page }) => {
    // Step 1: Bulk import clients
    await page.goto('/bulk-import')
    
    // Upload CSV file
    const csvContent = `name,industry,companySize,status,source,address,website
"Bulk Client 1","technology","small","prospect","nca","123 Tech St","https://bulkclient1.com"
"Bulk Client 2","finance","medium","prospect","direct","456 Finance Ave","https://bulkclient2.com"
"Bulk Client 3","healthcare","large","active","both","789 Health Blvd","https://bulkclient3.com"`
    
    await page.setInputFiles('[data-testid="file-upload"]', {
      name: 'clients.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    await page.click('button:has-text("Import Clients")')
    await expect(page.locator('.toast')).toContainText('3 clients imported successfully')
    
    // Step 2: Verify bulk imported clients
    await page.goto('/clients')
    await expect(page.locator('text=Bulk Client 1')).toBeVisible()
    await expect(page.locator('text=Bulk Client 2')).toBeVisible()
    await expect(page.locator('text=Bulk Client 3')).toBeVisible()
    
    // Step 3: Bulk update client statuses
    await page.click('[data-testid="select-all"]')
    await page.click('button:has-text("Bulk Actions")')
    await page.click('text=Update Status')
    await page.selectOption('[name="newStatus"]', 'active')
    await page.click('button:has-text("Apply to Selected")')
    
    await expect(page.locator('.toast')).toContainText('3 clients updated successfully')
    
    // Step 4: Verify bulk update results
    await page.reload()
    const activeStatuses = page.locator('[data-status="active"]')
    await expect(activeStatuses).toHaveCount(3)
  })

  test('Integration Engine Workflow', async ({ page }) => {
    // Step 1: Configure external system
    await page.goto('/external-systems')
    await page.click('button:has-text("Add System")')
    
    await page.fill('[name="name"]', 'Test Monitoring System')
    await page.selectOption('[name="type"]', 'grafana')
    await page.fill('[name="baseUrl"]', 'https://monitoring.test.com')
    await page.fill('[name="apiKey"]', 'test-api-key-12345')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('.toast')).toContainText('External system added successfully')
    
    // Step 2: Create data source
    await page.goto('/integration-engine')
    await page.click('button:has-text("Add Data Source")')
    
    await page.fill('[name="name"]', 'Client Metrics Feed')
    await page.selectOption('[name="type"]', 'api')
    await page.fill('[name="endpoint"]', '/api/client-metrics')
    await page.selectOption('[name="method"]', 'GET')
    await page.fill('[name="refreshInterval"]', '300')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('.toast')).toContainText('Data source created successfully')
    
    // Step 3: Configure field mappings
    await page.click('text=Client Metrics Feed')
    await page.click('button:has-text("Configure Mappings")')
    
    await page.fill('[name="sourceField"]', 'client_id')
    await page.selectOption('[name="targetField"]', 'id')
    await page.selectOption('[name="dataType"]', 'number')
    await page.click('button:has-text("Add Mapping")')
    
    await page.fill('[name="sourceField"]', 'client_name')
    await page.selectOption('[name="targetField"]', 'name')
    await page.selectOption('[name="dataType"]', 'string')
    await page.click('button:has-text("Add Mapping")')
    
    await page.click('button:has-text("Save Mappings")')
    await expect(page.locator('.toast')).toContainText('Field mappings saved successfully')
    
    // Step 4: Create dashboard widget
    await page.goto('/dashboards')
    await page.click('button:has-text("Add Widget")')
    
    await page.fill('[name="title"]', 'Client Health Metrics')
    await page.selectOption('[name="type"]', 'chart')
    await page.selectOption('[name="dataSource"]', 'Client Metrics Feed')
    await page.selectOption('[name="chartType"]', 'line')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('.toast')).toContainText('Widget created successfully')
    
    // Step 5: Verify widget appears on dashboard
    await page.goto('/dashboard')
    await expect(page.locator('text=Client Health Metrics')).toBeVisible()
    await expect(page.locator('[data-widget-type="chart"]')).toBeVisible()
  })
})

test.describe('Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Handles validation errors gracefully', async ({ page }) => {
    // Try to create client with missing required fields
    await page.goto('/clients')
    await page.click('button:has-text("Add Client")')
    
    // Submit without filling required fields
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('.error-message')).toContainText('Client name is required')
    await expect(page.locator('.error-message')).toContainText('Industry is required')
    
    // Form should not submit
    await expect(page.url()).toContain('/clients')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('Handles network errors with retry mechanism', async ({ page }) => {
    // Create client first
    const clientId = await createClient(page, testClient)
    
    // Simulate network error during contract creation
    await page.route('**/api/contracts', route => route.abort())
    
    await page.goto(`/clients/${clientId}`)
    await page.click('[data-testid="contracts-tab"]')
    await page.click('button:has-text("Add Contract")')
    
    await page.fill('[name="title"]', testContract.title)
    await page.fill('[name="startDate"]', testContract.startDate)
    await page.fill('[name="endDate"]', testContract.endDate)
    
    await page.click('button[type="submit"]')
    
    // Should show error message with retry option
    await expect(page.locator('.error-message')).toContainText('Network error')
    await expect(page.locator('button:has-text("Retry")')).toBeVisible()
    
    // Remove network error simulation
    await page.unroute('**/api/contracts')
    
    // Retry should work
    await page.click('button:has-text("Retry")')
    await expect(page.locator('.toast')).toContainText('Contract created successfully')
  })

  test('Handles concurrent user actions', async ({ page, context }) => {
    // Create client
    const clientId = await createClient(page, testClient)
    
    // Open same client in another tab (simulating concurrent user)
    const page2 = await context.newPage()
    await login(page2)
    await page2.goto(`/clients/${clientId}`)
    
    // Both users try to update client simultaneously
    await page.goto(`/clients/${clientId}`)
    await page.click('button:has-text("Edit Client")')
    await page.fill('[name="notes"]', 'Updated by user 1')
    
    await page2.click('button:has-text("Edit Client")')
    await page2.fill('[name="notes"]', 'Updated by user 2')
    
    // Submit both forms
    await page.click('button[type="submit"]')
    await page2.click('button[type="submit"]')
    
    // Should handle concurrent updates gracefully
    await expect(page.locator('.toast')).toContainText('Client updated successfully')
    await expect(page2.locator('.warning-message')).toContainText('Client was updated by another user')
  })
})

test.describe('Performance and Accessibility', () => {
  test('Dashboard loads within performance budget', async ({ page }) => {
    await login(page)
    
    const startTime = Date.now()
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // All widgets should be visible
    await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible()
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="client-distribution"]')).toBeVisible()
  })

  test('Application is accessible', async ({ page }) => {
    await login(page)
    
    // Check for proper heading structure
    await expect(page.locator('h1')).toHaveCount(1)
    
    // Check for proper form labels
    await page.goto('/clients')
    await page.click('button:has-text("Add Client")')
    
    await expect(page.locator('label[for="name"]')).toBeVisible()
    await expect(page.locator('label[for="industry"]')).toBeVisible()
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Check for ARIA labels
    await expect(page.locator('[aria-label]')).toHaveCount(0) // Should use proper labels instead
    await expect(page.locator('[role="button"]')).toHaveCount(0) // Should use proper button elements
  })
}) 