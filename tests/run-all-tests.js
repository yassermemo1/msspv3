#!/usr/bin/env node

import { spawn, exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

class TestRunner {
  constructor() {
    this.results = {
      startTime: new Date(),
      endTime: null,
      duration: 0,
      tests: {
        unit: { status: 'pending', duration: 0, coverage: null },
        integration: { status: 'pending', duration: 0, coverage: null },
        e2e: { status: 'pending', duration: 0, coverage: null },
        api: { status: 'pending', duration: 0, coverage: null },
        load: { status: 'pending', duration: 0, coverage: null },
        ai: { status: 'pending', duration: 0, coverage: null }
      },
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    }
    
    this.config = {
      skipOnFailure: process.argv.includes('--skip-on-failure'),
      runAI: process.argv.includes('--include-ai'),
      runLoad: process.argv.includes('--include-load'),
      verbose: process.argv.includes('--verbose'),
      coverage: process.argv.includes('--coverage'),
      parallel: process.argv.includes('--parallel')
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      debug: '🔍'
    }[type] || '📋'
    
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      if (this.config.verbose) {
        this.log(`Running: ${command}`, 'debug')
      }
      
      const child = spawn('sh', ['-c', command], {
        stdio: options.silent ? 'pipe' : 'inherit',
        cwd: process.cwd(),
        ...options
      })
      
      let stdout = ''
      let stderr = ''
      
      if (options.silent) {
        child.stdout.on('data', (data) => {
          stdout += data.toString()
        })
        
        child.stderr.on('data', (data) => {
          stderr += data.toString()
        })
      }
      
      child.on('close', (code) => {
        const duration = Date.now() - startTime
        
        if (code === 0) {
          resolve({ code, stdout, stderr, duration })
        } else {
          reject({ code, stdout, stderr, duration, command })
        }
      })
      
      child.on('error', (error) => {
        reject({ error, command })
      })
    })
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...', 'info')
    
    const checks = [
      { command: 'node --version', name: 'Node.js' },
      { command: 'npm --version', name: 'npm' },
      { command: 'npx playwright --version', name: 'Playwright' },
    ]
    
    for (const check of checks) {
      try {
        await this.runCommand(check.command, { silent: true })
        this.log(`${check.name} is available`, 'success')
      } catch (error) {
        this.log(`${check.name} is not available`, 'error')
        throw new Error(`Missing prerequisite: ${check.name}`)
      }
    }
  }

  async setupTestEnvironment() {
    this.log('Setting up test environment...', 'info')
    
    // Create test results directory
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true })
    }
    
    // Install dependencies if needed
    try {
      await this.runCommand('npm ci', { silent: true })
      this.log('Dependencies installed', 'success')
    } catch (error) {
      this.log('Failed to install dependencies', 'error')
      throw error
    }
    
    // Setup test data
    try {
      await this.runCommand('npm run test:setup', { silent: true })
      this.log('Test data setup completed', 'success')
    } catch (error) {
      this.log('Test data setup failed', 'warning')
      // Continue anyway as this might not be critical
    }
  }

  async runUnitTests() {
    this.log('Running unit tests...', 'info')
    const startTime = Date.now()
    
    try {
      const command = this.config.coverage 
        ? 'npm run test:coverage' 
        : 'npm run test:unit'
        
      const result = await this.runCommand(command)
      
      this.results.tests.unit = {
        status: 'passed',
        duration: Date.now() - startTime,
        coverage: this.config.coverage ? await this.extractCoverage() : null
      }
      
      this.log('Unit tests passed', 'success')
      return true
      
    } catch (error) {
      this.results.tests.unit = {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.stderr || error.message
      }
      
      this.log('Unit tests failed', 'error')
      if (this.config.verbose) {
        console.log(error.stderr)
      }
      
      return false
    }
  }

  async runIntegrationTests() {
    this.log('Running integration tests...', 'info')
    const startTime = Date.now()
    
    try {
      const result = await this.runCommand('npm run test:integration')
      
      this.results.tests.integration = {
        status: 'passed',
        duration: Date.now() - startTime
      }
      
      this.log('Integration tests passed', 'success')
      return true
      
    } catch (error) {
      this.results.tests.integration = {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.stderr || error.message
      }
      
      this.log('Integration tests failed', 'error')
      return false
    }
  }

  async runE2ETests() {
    this.log('Running E2E tests...', 'info')
    const startTime = Date.now()
    
    try {
      const result = await this.runCommand('npm run test:e2e')
      
      this.results.tests.e2e = {
        status: 'passed',
        duration: Date.now() - startTime
      }
      
      this.log('E2E tests passed', 'success')
      return true
      
    } catch (error) {
      this.results.tests.e2e = {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.stderr || error.message
      }
      
      this.log('E2E tests failed', 'error')
      return false
    }
  }

  async runAPITests() {
    this.log('Running API tests...', 'info')
    const startTime = Date.now()
    
    try {
      const result = await this.runCommand('npm run test:api')
      
      this.results.tests.api = {
        status: 'passed',
        duration: Date.now() - startTime
      }
      
      this.log('API tests passed', 'success')
      return true
      
    } catch (error) {
      this.results.tests.api = {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.stderr || error.message
      }
      
      this.log('API tests failed', 'error')
      return false
    }
  }

  async runLoadTests() {
    if (!this.config.runLoad) {
      this.log('Load tests skipped (use --include-load to run)', 'warning')
      this.results.tests.load.status = 'skipped'
      return true
    }
    
    this.log('Running load tests...', 'info')
    const startTime = Date.now()
    
    try {
      const result = await this.runCommand('npm run test:load')
      
      this.results.tests.load = {
        status: 'passed',
        duration: Date.now() - startTime
      }
      
      this.log('Load tests passed', 'success')
      return true
      
    } catch (error) {
      this.results.tests.load = {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.stderr || error.message
      }
      
      this.log('Load tests failed', 'error')
      return false
    }
  }

  async runAITests() {
    if (!this.config.runAI) {
      this.log('AI tests skipped (use --include-ai to run)', 'warning')
      this.results.tests.ai.status = 'skipped'
      return true
    }
    
    this.log('Running AI autonomous tests...', 'info')
    const startTime = Date.now()
    
    try {
      const result = await this.runCommand('npm run test:ai')
      
      this.results.tests.ai = {
        status: 'passed',
        duration: Date.now() - startTime
      }
      
      this.log('AI tests passed', 'success')
      return true
      
    } catch (error) {
      this.results.tests.ai = {
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.stderr || error.message
      }
      
      this.log('AI tests failed', 'error')
      return false
    }
  }

  async extractCoverage() {
    try {
      const coveragePath = 'coverage/coverage-summary.json'
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
        return coverage.total
      }
    } catch (error) {
      this.log('Could not extract coverage data', 'warning')
    }
    return null
  }

  async generateReport() {
    this.log('Generating test report...', 'info')
    
    this.results.endTime = new Date()
    this.results.duration = this.results.endTime - this.results.startTime
    
    // Calculate summary
    Object.values(this.results.tests).forEach(test => {
      this.results.summary.total++
      if (test.status === 'passed') this.results.summary.passed++
      else if (test.status === 'failed') this.results.summary.failed++
      else if (test.status === 'skipped') this.results.summary.skipped++
    })
    
    // Save detailed report
    const reportPath = `test-results/test-report-${Date.now()}.json`
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
    
    // Generate summary
    const summary = this.generateSummary()
    const summaryPath = `test-results/test-summary-${Date.now()}.txt`
    fs.writeFileSync(summaryPath, summary)
    
    console.log('\n' + summary)
    
    this.log(`Detailed report saved to: ${reportPath}`, 'info')
    this.log(`Summary saved to: ${summaryPath}`, 'info')
    
    return this.results
  }

  generateSummary() {
    const formatDuration = (ms) => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
    }
    
    const formatStatus = (status) => {
      const icons = { passed: '✅', failed: '❌', skipped: '⏭️', pending: '⏳' }
      return `${icons[status] || '❓'} ${status.toUpperCase()}`
    }
    
    return `
🧪 MSSP Client Manager - Test Results Summary
============================================

⏱️  Total Duration: ${formatDuration(this.results.duration)}
📊 Overall Results: ${this.results.summary.passed}/${this.results.summary.total} tests passed

📋 Test Breakdown:
${Object.entries(this.results.tests).map(([name, result]) => 
  `  ${formatStatus(result.status)} ${name.padEnd(12)} (${formatDuration(result.duration)})`
).join('\n')}

${this.results.tests.unit.coverage ? `
📈 Code Coverage:
  Lines:      ${this.results.tests.unit.coverage.lines.pct}%
  Functions:  ${this.results.tests.unit.coverage.functions.pct}%
  Branches:   ${this.results.tests.unit.coverage.branches.pct}%
  Statements: ${this.results.tests.unit.coverage.statements.pct}%
` : ''}

${this.results.summary.failed > 0 ? `
❌ Failed Tests:
${Object.entries(this.results.tests)
  .filter(([_, result]) => result.status === 'failed')
  .map(([name, result]) => `  - ${name}: ${result.error?.split('\n')[0] || 'Unknown error'}`)
  .join('\n')}
` : ''}

🎯 Recommendations:
${this.generateRecommendations()}

Generated at: ${this.results.endTime.toISOString()}
`
  }

  generateRecommendations() {
    const recommendations = []
    
    if (this.results.summary.failed > 0) {
      recommendations.push('- Fix failing tests before deploying to production')
    }
    
    if (this.results.tests.unit.coverage && this.results.tests.unit.coverage.lines.pct < 80) {
      recommendations.push('- Increase unit test coverage to at least 80%')
    }
    
    if (!this.config.runLoad) {
      recommendations.push('- Run load tests with --include-load for performance validation')
    }
    
    if (!this.config.runAI) {
      recommendations.push('- Run AI tests with --include-ai for comprehensive exploration')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- All tests are passing! Consider adding more edge case tests')
    }
    
    return recommendations.join('\n')
  }

  async run() {
    try {
      this.log('Starting comprehensive test suite...', 'info')
      
      await this.checkPrerequisites()
      await this.setupTestEnvironment()
      
      const testSequence = [
        { name: 'unit', fn: () => this.runUnitTests() },
        { name: 'integration', fn: () => this.runIntegrationTests() },
        { name: 'api', fn: () => this.runAPITests() },
        { name: 'e2e', fn: () => this.runE2ETests() },
        { name: 'load', fn: () => this.runLoadTests() },
        { name: 'ai', fn: () => this.runAITests() }
      ]
      
      for (const test of testSequence) {
        const success = await test.fn()
        
        if (!success && this.config.skipOnFailure) {
          this.log(`Skipping remaining tests due to ${test.name} failure`, 'warning')
          break
        }
      }
      
      const report = await this.generateReport()
      
      // Exit with appropriate code
      const exitCode = this.results.summary.failed > 0 ? 1 : 0
      
      if (exitCode === 0) {
        this.log('All tests completed successfully! 🎉', 'success')
      } else {
        this.log(`Tests completed with ${this.results.summary.failed} failures`, 'error')
      }
      
      process.exit(exitCode)
      
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error')
      if (this.config.verbose) {
        console.error(error)
      }
      process.exit(1)
    }
  }
}

// Show usage if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🧪 MSSP Client Manager Test Runner

Usage: node tests/run-all-tests.js [options]

Options:
  --skip-on-failure    Stop running tests after first failure
  --include-ai         Include AI autonomous testing (requires OpenAI API key)
  --include-load       Include load testing
  --coverage           Generate code coverage report
  --parallel           Run tests in parallel where possible
  --verbose            Show detailed output
  --help, -h           Show this help message

Examples:
  node tests/run-all-tests.js                    # Run basic test suite
  node tests/run-all-tests.js --coverage         # Run with coverage
  node tests/run-all-tests.js --include-ai       # Include AI testing
  node tests/run-all-tests.js --include-load     # Include load testing
  node tests/run-all-tests.js --verbose          # Detailed output
`)
  process.exit(0)
}

// Run the test suite
const runner = new TestRunner()
runner.run() 