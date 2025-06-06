# Test info

- Name: Client Management E2E Tests >> should navigate to clients page and display client list
- Location: /Users/yasseralmohammed/Documents/MsspClientManager/tests/e2e/client-management.spec.ts:23:3

# Error details

```
Error: page.fill: Target page, context or browser has been closed
Call log:
  - waiting for locator('[data-testid="username"]')

    at /Users/yasseralmohammed/Documents/MsspClientManager/tests/e2e/client-management.spec.ts:11:16
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test'
   2 |
   3 | test.describe('Client Management E2E Tests', () => {
   4 |   let page: Page
   5 |
   6 |   test.beforeEach(async ({ browser }) => {
   7 |     page = await browser.newPage()
   8 |     
   9 |     // Login before each test
   10 |     await page.goto('/')
>  11 |     await page.fill('[data-testid="username"]', 'admin')
      |                ^ Error: page.fill: Target page, context or browser has been closed
   12 |     await page.fill('[data-testid="password"]', 'admin123')
   13 |     await page.click('[data-testid="login-button"]')
   14 |     
   15 |     // Wait for dashboard to load
   16 |     await page.waitForSelector('[data-testid="dashboard"]')
   17 |   })
   18 |
   19 |   test.afterEach(async () => {
   20 |     await page.close()
   21 |   })
   22 |
   23 |   test('should navigate to clients page and display client list', async () => {
   24 |     // Navigate to clients page
   25 |     await page.click('[data-testid="nav-clients"]')
   26 |     await page.waitForURL('**/clients')
   27 |     
   28 |     // Check if clients table is visible
   29 |     await expect(page.locator('[data-testid="clients-table"]')).toBeVisible()
   30 |     
   31 |     // Check if "Add Client" button is visible
   32 |     await expect(page.locator('[data-testid="add-client-button"]')).toBeVisible()
   33 |   })
   34 |
   35 |   test('should create a new client successfully', async () => {
   36 |     // Navigate to clients page
   37 |     await page.click('[data-testid="nav-clients"]')
   38 |     await page.waitForURL('**/clients')
   39 |     
   40 |     // Click "Add Client" button
   41 |     await page.click('[data-testid="add-client-button"]')
   42 |     
   43 |     // Fill out the client form
   44 |     await page.fill('[data-testid="client-name"]', 'E2E Test Client')
   45 |     await page.selectOption('[data-testid="client-industry"]', 'technology')
   46 |     await page.selectOption('[data-testid="client-status"]', 'active')
   47 |     await page.selectOption('[data-testid="client-source"]', 'direct')
   48 |     await page.fill('[data-testid="client-address"]', '123 E2E Test Street')
   49 |     await page.fill('[data-testid="client-website"]', 'https://e2etest.com')
   50 |     await page.fill('[data-testid="client-notes"]', 'This is an E2E test client')
   51 |     
   52 |     // Submit the form
   53 |     await page.click('[data-testid="submit-client-form"]')
   54 |     
   55 |     // Wait for success message or redirect
   56 |     await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 })
   57 |     
   58 |     // Verify client appears in the list
   59 |     await expect(page.locator('text=E2E Test Client')).toBeVisible()
   60 |   })
   61 |
   62 |   test('should edit an existing client', async () => {
   63 |     // First create a client to edit
   64 |     await page.click('[data-testid="nav-clients"]')
   65 |     await page.click('[data-testid="add-client-button"]')
   66 |     
   67 |     await page.fill('[data-testid="client-name"]', 'Client to Edit')
   68 |     await page.selectOption('[data-testid="client-status"]', 'active')
   69 |     await page.click('[data-testid="submit-client-form"]')
   70 |     
   71 |     await page.waitForSelector('[data-testid="success-message"]')
   72 |     
   73 |     // Find and click edit button for the client
   74 |     await page.click('[data-testid="edit-client-Client to Edit"]')
   75 |     
   76 |     // Update client information
   77 |     await page.fill('[data-testid="client-name"]', 'Updated Client Name')
   78 |     await page.selectOption('[data-testid="client-status"]', 'inactive')
   79 |     await page.fill('[data-testid="client-notes"]', 'Updated notes')
   80 |     
   81 |     // Submit the form
   82 |     await page.click('[data-testid="submit-client-form"]')
   83 |     
   84 |     // Wait for success message
   85 |     await page.waitForSelector('[data-testid="success-message"]')
   86 |     
   87 |     // Verify updated information
   88 |     await expect(page.locator('text=Updated Client Name')).toBeVisible()
   89 |   })
   90 |
   91 |   test('should delete a client', async () => {
   92 |     // First create a client to delete
   93 |     await page.click('[data-testid="nav-clients"]')
   94 |     await page.click('[data-testid="add-client-button"]')
   95 |     
   96 |     await page.fill('[data-testid="client-name"]', 'Client to Delete')
   97 |     await page.selectOption('[data-testid="client-status"]', 'active')
   98 |     await page.click('[data-testid="submit-client-form"]')
   99 |     
  100 |     await page.waitForSelector('[data-testid="success-message"]')
  101 |     
  102 |     // Find and click delete button for the client
  103 |     await page.click('[data-testid="delete-client-Client to Delete"]')
  104 |     
  105 |     // Confirm deletion in modal
  106 |     await page.click('[data-testid="confirm-delete"]')
  107 |     
  108 |     // Wait for success message
  109 |     await page.waitForSelector('[data-testid="success-message"]')
  110 |     
  111 |     // Verify client is no longer in the list
```