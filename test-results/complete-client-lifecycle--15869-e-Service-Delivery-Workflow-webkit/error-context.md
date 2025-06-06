# Test info

- Name: Complete Client Lifecycle >> Service Delivery Workflow
- Location: /Users/yasseralmohammed/Documents/MsspClientManager/tests/e2e/complete-client-lifecycle.spec.ts:187:3

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[name="username"]')

    at login (/Users/yasseralmohammed/Documents/MsspClientManager/tests/e2e/complete-client-lifecycle.spec.ts:48:14)
    at /Users/yasseralmohammed/Documents/MsspClientManager/tests/e2e/complete-client-lifecycle.spec.ts:130:5
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test'
   2 |
   3 | // Test data
   4 | const testClient = {
   5 |   name: 'TechCorp Solutions Inc.',
   6 |   industry: 'technology',
   7 |   companySize: 'medium',
   8 |   status: 'prospect',
   9 |   source: 'direct',
   10 |   address: '123 Innovation Drive, Tech City, TC 12345',
   11 |   website: 'https://techcorp-solutions.com',
   12 |   notes: 'High-value prospect interested in comprehensive security services'
   13 | }
   14 |
   15 | const testContract = {
   16 |   title: 'Security Services Agreement 2024',
   17 |   startDate: '2024-01-01',
   18 |   endDate: '2024-12-31',
   19 |   totalValue: '150000',
   20 |   status: 'draft',
   21 |   billingCycle: 'monthly',
   22 |   description: 'Comprehensive managed security services package'
   23 | }
   24 |
   25 | const testService = {
   26 |   name: 'SOC Monitoring Pro',
   27 |   description: '24/7 security operations center monitoring with threat detection',
   28 |   category: 'monitoring',
   29 |   deliveryModel: 'managed',
   30 |   basePrice: '5000',
   31 |   pricingUnit: 'monthly'
   32 | }
   33 |
   34 | const testAsset = {
   35 |   name: 'Dell Security Appliance SA-2024',
   36 |   category: 'security',
   37 |   manufacturer: 'Dell',
   38 |   model: 'SA-2024',
   39 |   serialNumber: 'DSA2024001',
   40 |   purchaseCost: '15000',
   41 |   location: 'Client Datacenter Rack 1',
   42 |   status: 'available'
   43 | }
   44 |
   45 | // Helper functions
   46 | async function login(page: Page) {
   47 |   await page.goto('/login')
>  48 |   await page.fill('[name="username"]', 'admin')
      |              ^ Error: page.fill: Test timeout of 30000ms exceeded.
   49 |   await page.fill('[name="password"]', 'admin123')
   50 |   await page.click('button[type="submit"]')
   51 |   await expect(page).toHaveURL('/dashboard')
   52 | }
   53 |
   54 | async function createClient(page: Page, clientData: typeof testClient) {
   55 |   await page.goto('/clients')
   56 |   await page.click('button:has-text("Add Client")')
   57 |   
   58 |   await page.fill('[name="name"]', clientData.name)
   59 |   await page.selectOption('[name="industry"]', clientData.industry)
   60 |   await page.selectOption('[name="companySize"]', clientData.companySize)
   61 |   await page.selectOption('[name="status"]', clientData.status)
   62 |   await page.selectOption('[name="source"]', clientData.source)
   63 |   await page.fill('[name="address"]', clientData.address)
   64 |   await page.fill('[name="website"]', clientData.website)
   65 |   await page.fill('[name="notes"]', clientData.notes)
   66 |   
   67 |   await page.click('button[type="submit"]')
   68 |   await expect(page.locator('.toast')).toContainText('Client created successfully')
   69 |   
   70 |   // Return client ID from URL or response
   71 |   await page.waitForURL(/\/clients\/\d+/)
   72 |   const url = page.url()
   73 |   return url.split('/').pop()
   74 | }
   75 |
   76 | async function createContract(page: Page, clientId: string, contractData: typeof testContract) {
   77 |   await page.goto(`/clients/${clientId}`)
   78 |   await page.click('[data-testid="contracts-tab"]')
   79 |   await page.click('button:has-text("Add Contract")')
   80 |   
   81 |   await page.fill('[name="title"]', contractData.title)
   82 |   await page.fill('[name="startDate"]', contractData.startDate)
   83 |   await page.fill('[name="endDate"]', contractData.endDate)
   84 |   await page.fill('[name="totalValue"]', contractData.totalValue)
   85 |   await page.selectOption('[name="status"]', contractData.status)
   86 |   await page.selectOption('[name="billingCycle"]', contractData.billingCycle)
   87 |   await page.fill('[name="description"]', contractData.description)
   88 |   
   89 |   await page.click('button[type="submit"]')
   90 |   await expect(page.locator('.toast')).toContainText('Contract created successfully')
   91 | }
   92 |
   93 | async function addServiceToContract(page: Page, clientId: string, serviceData: typeof testService) {
   94 |   await page.goto(`/clients/${clientId}`)
   95 |   await page.click('[data-testid="services-tab"]')
   96 |   await page.click('button:has-text("Add Service")')
   97 |   
   98 |   await page.fill('[name="name"]', serviceData.name)
   99 |   await page.fill('[name="description"]', serviceData.description)
  100 |   await page.selectOption('[name="category"]', serviceData.category)
  101 |   await page.selectOption('[name="deliveryModel"]', serviceData.deliveryModel)
  102 |   await page.fill('[name="basePrice"]', serviceData.basePrice)
  103 |   await page.fill('[name="pricingUnit"]', serviceData.pricingUnit)
  104 |   
  105 |   await page.click('button[type="submit"]')
  106 |   await expect(page.locator('.toast')).toContainText('Service added successfully')
  107 | }
  108 |
  109 | async function deployAsset(page: Page, clientId: string, assetData: typeof testAsset) {
  110 |   await page.goto(`/clients/${clientId}`)
  111 |   await page.click('[data-testid="assets-tab"]')
  112 |   await page.click('button:has-text("Deploy Asset")')
  113 |   
  114 |   await page.fill('[name="name"]', assetData.name)
  115 |   await page.selectOption('[name="category"]', assetData.category)
  116 |   await page.fill('[name="manufacturer"]', assetData.manufacturer)
  117 |   await page.fill('[name="model"]', assetData.model)
  118 |   await page.fill('[name="serialNumber"]', assetData.serialNumber)
  119 |   await page.fill('[name="purchaseCost"]', assetData.purchaseCost)
  120 |   await page.fill('[name="location"]', assetData.location)
  121 |   await page.selectOption('[name="status"]', 'assigned')
  122 |   
  123 |   await page.click('button[type="submit"]')
  124 |   await expect(page.locator('.toast')).toContainText('Asset deployed successfully')
  125 | }
  126 |
  127 | // Main test suites
  128 | test.describe('Complete Client Lifecycle', () => {
  129 |   test.beforeEach(async ({ page }) => {
  130 |     await login(page)
  131 |   })
  132 |
  133 |   test('Full Client Onboarding Workflow', async ({ page }) => {
  134 |     // Step 1: Create prospect client
  135 |     const clientId = await createClient(page, testClient)
  136 |     expect(clientId).toBeTruthy()
  137 |     
  138 |     // Verify client appears in clients list
  139 |     await page.goto('/clients')
  140 |     await expect(page.locator(`text=${testClient.name}`)).toBeVisible()
  141 |     await expect(page.locator('[data-status="prospect"]')).toBeVisible()
  142 |     
  143 |     // Step 2: Create draft contract
  144 |     await createContract(page, clientId!, testContract)
  145 |     
  146 |     // Verify contract appears in client view
  147 |     await page.goto(`/clients/${clientId}`)
  148 |     await page.click('[data-testid="contracts-tab"]')
```