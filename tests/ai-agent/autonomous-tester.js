import OpenAI from 'openai'
import puppeteer from 'puppeteer'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
})

class AutonomousTestingAgent {
  constructor() {
    this.browser = null
    this.page = null
    this.testResults = []
    this.baseUrl = 'http://localhost:5000'
    this.testSession = {
      startTime: new Date(),
      goals: [],
      completedActions: [],
      discoveredIssues: [],
      coverage: {
        pages: new Set(),
        features: new Set(),
        apis: new Set()
      }
    }
  }

  async initialize() {
    console.log('🤖 Initializing Autonomous Testing Agent...')
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    this.page = await this.browser.newPage()
    
    // Enable request interception to monitor API calls
    await this.page.setRequestInterception(true)
    this.page.on('request', this.handleRequest.bind(this))
    this.page.on('response', this.handleResponse.bind(this))
    
    // Set viewport for consistent testing
    await this.page.setViewport({ width: 1920, height: 1080 })
    
    console.log('✅ Agent initialized successfully')
  }

  async handleRequest(request) {
    const url = request.url()
    if (url.includes('/api/')) {
      this.testSession.coverage.apis.add(url)
    }
    request.continue()
  }

  async handleResponse(response) {
    const url = response.url()
    if (url.includes('/api/')) {
      const status = response.status()
      if (status >= 400) {
        this.testSession.discoveredIssues.push({
          type: 'API Error',
          url,
          status,
          timestamp: new Date()
        })
      }
    }
  }

  async login() {
    console.log('🔐 Attempting to login...')
    
    try {
      await this.page.goto(this.baseUrl)
      this.testSession.coverage.pages.add('/')
      
      // Wait for login form
      await this.page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 10000 })
      
      // Find and fill login fields
      const usernameField = await this.page.$('input[type="text"], input[type="email"]')
      const passwordField = await this.page.$('input[type="password"]')
      
      if (usernameField && passwordField) {
        await usernameField.type('admin')
        await passwordField.type('admin123')
        
        // Find and click login button
        const loginButton = await this.page.$('button[type="submit"], button:contains("Login"), button:contains("Sign In")')
        if (loginButton) {
          await loginButton.click()
          await this.page.waitForNavigation({ waitUntil: 'networkidle0' })
          console.log('✅ Login successful')
          return true
        }
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message)
      this.testSession.discoveredIssues.push({
        type: 'Login Error',
        error: error.message,
        timestamp: new Date()
      })
      return false
    }
  }

  async exploreApplication() {
    console.log('🔍 Starting autonomous exploration...')
    
    const goals = [
      'Explore the dashboard and verify all widgets load correctly',
      'Navigate to clients page and test CRUD operations',
      'Test bulk import functionality with sample data',
      'Verify external system integrations work',
      'Test all form validations',
      'Check responsive design on different screen sizes',
      'Verify data relationships and aggregated views'
    ]

    for (const goal of goals) {
      console.log(`🎯 Working on goal: ${goal}`)
      await this.executeGoal(goal)
    }
  }

  async executeGoal(goal) {
    try {
      // Use AI to plan the steps for achieving this goal
      const plan = await this.planGoalExecution(goal)
      console.log(`📋 Plan: ${plan}`)
      
      // Execute the plan
      await this.executePlan(plan, goal)
      
      this.testSession.goals.push({
        goal,
        plan,
        status: 'completed',
        timestamp: new Date()
      })
      
    } catch (error) {
      console.error(`❌ Failed to execute goal "${goal}":`, error.message)
      this.testSession.discoveredIssues.push({
        type: 'Goal Execution Error',
        goal,
        error: error.message,
        timestamp: new Date()
      })
    }
  }

  async planGoalExecution(goal) {
    const currentUrl = this.page.url()
    const pageContent = await this.page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        visibleText: document.body.innerText.substring(0, 1000),
        buttons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(Boolean),
        links: Array.from(document.querySelectorAll('a')).map(link => ({ text: link.textContent?.trim(), href: link.href })).filter(item => item.text),
        forms: Array.from(document.querySelectorAll('form')).length
      }
    })

    const prompt = `
You are an autonomous testing agent for a MSSP Client Management application. 

Current context:
- URL: ${currentUrl}
- Page title: ${pageContent.title}
- Available buttons: ${pageContent.buttons.join(', ')}
- Available links: ${pageContent.links.map(l => l.text).join(', ')}
- Number of forms: ${pageContent.forms}

Goal: ${goal}

Based on the current page context, provide a step-by-step plan to achieve this goal. 
Be specific about which elements to interact with and what to verify.
Format your response as a JSON array of steps, where each step has:
- action: "click", "type", "navigate", "verify", "wait"
- target: CSS selector or description of element
- value: text to type (if applicable)
- expected: what should happen after this action

Example:
[
  {"action": "click", "target": "button:contains('Clients')", "expected": "Navigate to clients page"},
  {"action": "verify", "target": "table", "expected": "Clients table should be visible"}
]
`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })

      const planText = response.choices[0].message.content
      // Extract JSON from the response
      const jsonMatch = planText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback to simple plan
      return [{ action: "verify", target: "body", expected: "Page should be accessible" }]
      
    } catch (error) {
      console.error('Error generating plan:', error.message)
      return [{ action: "verify", target: "body", expected: "Page should be accessible" }]
    }
  }

  async executePlan(plan, goal) {
    for (const step of plan) {
      try {
        console.log(`  🔄 Executing: ${step.action} on ${step.target}`)
        
        switch (step.action) {
          case 'click':
            await this.clickElement(step.target)
            break
          case 'type':
            await this.typeText(step.target, step.value)
            break
          case 'navigate':
            await this.page.goto(step.target)
            this.testSession.coverage.pages.add(step.target)
            break
          case 'verify':
            await this.verifyElement(step.target, step.expected)
            break
          case 'wait':
            await this.page.waitForTimeout(parseInt(step.value) || 1000)
            break
        }
        
        // Wait a bit between actions
        await this.page.waitForTimeout(500)
        
        this.testSession.completedActions.push({
          goal,
          step,
          timestamp: new Date(),
          success: true
        })
        
      } catch (error) {
        console.error(`  ❌ Step failed: ${error.message}`)
        this.testSession.completedActions.push({
          goal,
          step,
          timestamp: new Date(),
          success: false,
          error: error.message
        })
      }
    }
  }

  async clickElement(selector) {
    // Try multiple strategies to find and click the element
    const strategies = [
      () => this.page.click(selector),
      () => this.page.evaluate((sel) => {
        const element = document.querySelector(sel)
        if (element) element.click()
      }, selector),
      () => this.page.evaluate((text) => {
        const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'))
        const element = elements.find(el => el.textContent?.includes(text))
        if (element) element.click()
      }, selector.replace(/.*:contains\(['"](.+)['"]\).*/, '$1'))
    ]

    for (const strategy of strategies) {
      try {
        await strategy()
        return
      } catch (error) {
        continue
      }
    }
    
    throw new Error(`Could not click element: ${selector}`)
  }

  async typeText(selector, text) {
    await this.page.waitForSelector(selector, { timeout: 5000 })
    await this.page.type(selector, text)
  }

  async verifyElement(selector, expected) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 })
      console.log(`  ✅ Verified: ${expected}`)
    } catch (error) {
      throw new Error(`Verification failed: ${expected}`)
    }
  }

  async testBulkImport() {
    console.log('📁 Testing bulk import functionality...')
    
    try {
      // Navigate to clients page
      await this.page.goto(`${this.baseUrl}/clients`)
      this.testSession.coverage.pages.add('/clients')
      
      // Look for bulk import button
      const bulkImportButton = await this.page.$('button:contains("Bulk Import"), button:contains("Import"), [data-testid*="bulk"], [data-testid*="import"]')
      
      if (bulkImportButton) {
        await bulkImportButton.click()
        
        // Create test CSV data
        const csvData = `name,email,phone,address,status
AI Test Client 1,ai1@test.com,+1-555-0001,100 AI Street,active
AI Test Client 2,ai2@test.com,+1-555-0002,200 AI Avenue,inactive`
        
        // Find file input and upload
        const fileInput = await this.page.$('input[type="file"]')
        if (fileInput) {
          // Create temporary file
          const tempFile = path.join(process.cwd(), 'temp-test-clients.csv')
          fs.writeFileSync(tempFile, csvData)
          
          await fileInput.uploadFile(tempFile)
          
          // Submit the form
          const submitButton = await this.page.$('button[type="submit"], button:contains("Import"), button:contains("Upload")')
          if (submitButton) {
            await submitButton.click()
            await this.page.waitForTimeout(3000)
            
            console.log('✅ Bulk import test completed')
            this.testSession.coverage.features.add('bulk-import')
          }
          
          // Clean up
          fs.unlinkSync(tempFile)
        }
      }
    } catch (error) {
      console.error('❌ Bulk import test failed:', error.message)
      this.testSession.discoveredIssues.push({
        type: 'Bulk Import Error',
        error: error.message,
        timestamp: new Date()
      })
    }
  }

  async performVisualRegression() {
    console.log('👁️ Performing visual regression testing...')
    
    const pages = [
      '/',
      '/clients',
      '/dashboard',
      '/external-systems'
    ]
    
    for (const pagePath of pages) {
      try {
        await this.page.goto(`${this.baseUrl}${pagePath}`)
        await this.page.waitForTimeout(2000)
        
        const screenshot = await this.page.screenshot({
          fullPage: true,
          path: `test-results/screenshots/${pagePath.replace('/', 'home')}.png`
        })
        
        console.log(`📸 Screenshot captured for ${pagePath}`)
        this.testSession.coverage.pages.add(pagePath)
        
      } catch (error) {
        console.error(`❌ Visual test failed for ${pagePath}:`, error.message)
      }
    }
  }

  async generateReport() {
    console.log('📊 Generating test report...')
    
    const report = {
      summary: {
        startTime: this.testSession.startTime,
        endTime: new Date(),
        duration: new Date() - this.testSession.startTime,
        totalGoals: this.testSession.goals.length,
        completedGoals: this.testSession.goals.filter(g => g.status === 'completed').length,
        totalIssues: this.testSession.discoveredIssues.length,
        coverage: {
          pages: Array.from(this.testSession.coverage.pages),
          features: Array.from(this.testSession.coverage.features),
          apis: Array.from(this.testSession.coverage.apis)
        }
      },
      goals: this.testSession.goals,
      issues: this.testSession.discoveredIssues,
      actions: this.testSession.completedActions
    }
    
    // Save report
    const reportPath = `test-results/ai-agent-report-${Date.now()}.json`
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    // Generate human-readable summary
    const summary = `
🤖 Autonomous Testing Agent Report
=================================

📊 Summary:
- Test Duration: ${Math.round(report.summary.duration / 1000)}s
- Goals Completed: ${report.summary.completedGoals}/${report.summary.totalGoals}
- Issues Found: ${report.summary.totalIssues}
- Pages Tested: ${report.summary.coverage.pages.length}
- APIs Tested: ${report.summary.coverage.apis.length}

🎯 Goals:
${report.goals.map(g => `  ${g.status === 'completed' ? '✅' : '❌'} ${g.goal}`).join('\n')}

🐛 Issues Found:
${report.issues.map(i => `  ❌ ${i.type}: ${i.error || i.url || 'Unknown'}`).join('\n')}

📄 Coverage:
  Pages: ${report.summary.coverage.pages.join(', ')}
  Features: ${report.summary.coverage.features.join(', ')}
  
Report saved to: ${reportPath}
`
    
    console.log(summary)
    fs.writeFileSync(`test-results/ai-agent-summary-${Date.now()}.txt`, summary)
    
    return report
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  async run() {
    try {
      await this.initialize()
      
      // Create results directory
      if (!fs.existsSync('test-results')) {
        fs.mkdirSync('test-results', { recursive: true })
      }
      if (!fs.existsSync('test-results/screenshots')) {
        fs.mkdirSync('test-results/screenshots', { recursive: true })
      }
      
      const loginSuccess = await this.login()
      if (!loginSuccess) {
        throw new Error('Could not login to application')
      }
      
      await this.exploreApplication()
      await this.testBulkImport()
      await this.performVisualRegression()
      
      const report = await this.generateReport()
      
      console.log('🎉 Autonomous testing completed!')
      return report
      
    } catch (error) {
      console.error('💥 Autonomous testing failed:', error.message)
      throw error
    } finally {
      await this.cleanup()
    }
  }
}

// Run the autonomous tester
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new AutonomousTestingAgent()
  agent.run().catch(console.error)
}

export default AutonomousTestingAgent 