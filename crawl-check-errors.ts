import { chromium } from 'playwright';
import type { Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface CrawlResult {
  url: string;
  status: number;
  statusText: string;
  timestamp: string;
  error?: string;
  jsErrors: string[];
  httpErrors: { url: string; status: number; statusText: string }[];
  hasContent: boolean;
  contentLength: number;
  buttons: { text: string; hasHandler: boolean; type: string }[];
  forms: { action: string; method: string; inputs: number }[];
}

class WebCrawler {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  page: Page | null = null;  // Made public for access in main
  private visitedUrls: Set<string> = new Set();
  private results: CrawlResult[] = [];

  async init(headless: boolean = true) {
    console.log('🚀 Launching browser...');
    this.browser = await chromium.launch({
      headless,
      // Uncomment the following line to see browser actions
      // slowMo: 50,
    });
    this.context = await this.browser.newContext({
      // Accept insecure certificates if needed
      ignoreHTTPSErrors: true,
    });
    this.page = await this.context.newPage();
  }

  async login(loginUrl: string, email: string, password: string) {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`🔐 Navigating to login page: ${loginUrl}`);
    
    try {
      await this.page.goto(loginUrl, { waitUntil: 'networkidle' });
      
      // Wait for email input to be visible
      await this.page.waitForSelector('input[type="email"], input[name="email"], input[placeholder*="email" i]', { timeout: 10000 });
      
      // Fill in email - try multiple selectors
      const emailFilled = await this.fillInput(
        ['input[type="email"]', 'input[name="email"]', 'input[placeholder*="email" i]', '#email'],
        email
      );
      
      if (!emailFilled) {
        throw new Error('Could not find email input field');
      }

      // Fill in password - try multiple selectors
      const passwordFilled = await this.fillInput(
        ['input[type="password"]', 'input[name="password"]', 'input[placeholder*="password" i]', '#password'],
        password
      );
      
      if (!passwordFilled) {
        throw new Error('Could not find password input field');
      }

      // Click submit button
      console.log('📝 Submitting login form...');
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {}),
        this.page.click('button[type="submit"]'),
      ]);

      // Check if login was successful by looking for common indicators
      await this.page.waitForTimeout(2000); // Give the page time to redirect
      
      const currentUrl = this.page.url();
      console.log(`✅ Login completed. Current URL: ${currentUrl}`);
      
      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'login-result.png' });
      console.log(`📸 Screenshot saved as login-result.png`);
      
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error);
      return false;
    }
  }

  private async fillInput(selectors: string[], value: string): Promise<boolean> {
    if (!this.page) return false;
    
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          await element.fill(value);
          console.log(`✅ Filled input with selector: ${selector}`);
          return true;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    return false;
  }



  async crawlPage(url: string) {
    if (!this.page) return;
    
    // Normalize URL
    const normalizedUrl = this.normalizeUrl(url);
    
    // Skip if already visited
    if (this.visitedUrls.has(normalizedUrl)) {
      return;
    }
    
    // Mark as visited
    this.visitedUrls.add(normalizedUrl);
    
    console.log(`\n🔍 Crawling: ${normalizedUrl}`);
    
    // Track JS errors and HTTP errors for this page
    const jsErrors: string[] = [];
    const httpErrors: { url: string; status: number; statusText: string }[] = [];
    
    // Set up listeners for this page load
    const consoleHandler = (msg: any) => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        jsErrors.push(errorText);
        console.log(`   🧨 JS Error: ${errorText}`);
      }
    };
    
    const responseHandler = (response: any) => {
      const status = response.status();
      const url = response.url();
      
      // Track all failed requests
      if (status >= 400) {
        httpErrors.push({
          url,
          status,
          statusText: response.statusText()
        });
        
        // Log significant errors
        if (status === 404) {
          console.log(`   ❌ 404 Not Found: ${url}`);
        } else if (status >= 500) {
          console.log(`   🔥 ${status} Server Error: ${url}`);
        }
      }
    };
    
    // Attach listeners
    this.page.on('console', consoleHandler);
    this.page.on('response', responseHandler);
    
    try {
      // Navigate to the page
      const response = await this.page.goto(normalizedUrl, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      
      // Wait a bit for any dynamic content to load
      await this.page.waitForTimeout(2000);
      
      let status = 0;
      let statusText = 'No Response';
      let hasContent = false;
      let contentLength = 0;
      let buttons: { text: string; hasHandler: boolean; type: string }[] = [];
      let forms: { action: string; method: string; inputs: number }[] = [];
      
      if (response) {
        status = response.status();
        statusText = response.statusText();
        
        // Analyze page content
        const pageAnalysis = await this.page.evaluate(() => {
          // Check if page has actual content
          const bodyText = document.body.innerText || '';
          const hasContent = bodyText.trim().length > 50; // More than 50 chars
          const contentLength = bodyText.length;
          
          // Analyze buttons
          const buttons = Array.from(document.querySelectorAll('button')).map(btn => {
            const hasOnClick = !!btn.onclick || btn.hasAttribute('onclick');
            const hasEventListeners = !!(btn as any)._reactInternalFiber || 
                                    !!(btn as any).__reactInternalInstance ||
                                    !!(btn as any).__vue__ ||
                                    hasOnClick;
            
            return {
              text: btn.innerText.trim().substring(0, 50),
              hasHandler: hasEventListeners,
              type: btn.type || 'button'
            };
          });
          
          // Analyze forms
          const forms = Array.from(document.querySelectorAll('form')).map(form => ({
            action: form.action || 'none',
            method: form.method || 'GET',
            inputs: form.querySelectorAll('input, textarea, select').length
          }));
          
          return { hasContent, contentLength, buttons, forms, bodyText };
        });
        
        hasContent = pageAnalysis.hasContent;
        contentLength = pageAnalysis.contentLength;
        buttons = pageAnalysis.buttons;
        forms = pageAnalysis.forms;
        
        // Log analysis results
        if (!hasContent) {
          console.log(`   ⚠️ Page appears empty or has minimal content (${contentLength} chars)`);
        } else {
          console.log(`   📄 Page has content (${contentLength} chars)`);
        }
        
        if (buttons.length > 0) {
          console.log(`   🔘 Found ${buttons.length} buttons:`);
          buttons.forEach(btn => {
            console.log(`      - "${btn.text}" (type: ${btn.type}, handler: ${btn.hasHandler ? '✅' : '❌'})`);
          });
        }
        
        if (forms.length > 0) {
          console.log(`   📝 Found ${forms.length} forms:`);
          forms.forEach(form => {
            console.log(`      - ${form.method} to ${form.action} (${form.inputs} inputs)`);
          });
        }
        
        // Get actual page content for debugging
        if (!hasContent || contentLength < 100) {
          console.log(`   📋 Page content: "${pageAnalysis.bodyText.substring(0, 200)}..."`);
        }
        
        // Log final status
        if (status === 200 && hasContent && jsErrors.length === 0 && httpErrors.length === 0) {
          console.log(`   ✅ OK - Page loaded successfully with content`);
        } else if (status === 200 && !hasContent) {
          console.log(`   ⚠️ 200 OK but page appears empty`);
        } else if (status === 404) {
          console.log(`   ❌ 404 Not Found`);
        } else if (status >= 500) {
          console.log(`   🔥 ${status} Internal Server Error`);
        } else if (jsErrors.length > 0) {
          console.log(`   🧨 Page has ${jsErrors.length} JS errors`);
        }
        
        // Take a screenshot for debugging
        const screenshotName = `screenshot-${normalizedUrl.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        await this.page.screenshot({ path: screenshotName, fullPage: true });
        console.log(`   📸 Screenshot saved as ${screenshotName}`);
      }
      
      // Record comprehensive result
      this.results.push({
        url: normalizedUrl,
        status,
        statusText,
        timestamp: new Date().toISOString(),
        jsErrors,
        httpErrors,
        hasContent,
        contentLength,
        buttons,
        forms
      });
      

    } catch (error) {
      console.error(`   ❌ Error crawling ${normalizedUrl}:`, (error as Error).message);
      this.results.push({
        url: normalizedUrl,
        status: 0,
        statusText: 'Error',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
        jsErrors,
        httpErrors,
        hasContent: false,
        contentLength: 0,
        buttons: [],
        forms: []
      });
    } finally {
      // Clean up listeners
      this.page.off('console', consoleHandler);
      this.page.off('response', responseHandler);
    }
  }



  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove trailing slash
      let normalized = urlObj.href;
      if (normalized.endsWith('/') && urlObj.pathname !== '/') {
        normalized = normalized.slice(0, -1);
      }
      // Remove hash
      normalized = normalized.split('#')[0];
      // Remove common tracking parameters
      urlObj.searchParams.delete('utm_source');
      urlObj.searchParams.delete('utm_medium');
      urlObj.searchParams.delete('utm_campaign');
      return urlObj.href;
    } catch {
      return url;
    }
  }

  private logStatus(url: string, status: number) {
    switch (status) {
      case 200:
        console.log(`   ✅ 200 OK`);
        break;
      case 404:
        console.log(`   ❌ 404 Not Found`);
        break;
      case 500:
        console.log(`   🔥 500 Internal Server Error`);
        break;
      default:
        if (status >= 200 && status < 300) {
          console.log(`   ✅ ${status} Success`);
        } else if (status >= 300 && status < 400) {
          console.log(`   ↩️ ${status} Redirect`);
        } else if (status >= 400 && status < 500) {
          console.log(`   ⚠️ ${status} Client Error`);
        } else if (status >= 500) {
          console.log(`   🔥 ${status} Server Error`);
        } else {
          console.log(`   ❓ ${status} Unknown`);
        }
    }
  }

  async saveReport(filename: string = 'crawl-report.json') {
    const report = {
      crawlDate: new Date().toISOString(),
      totalUrls: this.visitedUrls.size,
      summary: {
        success: this.results.filter(r => r.status >= 200 && r.status < 300).length,
        clientErrors: this.results.filter(r => r.status >= 400 && r.status < 500).length,
        serverErrors: this.results.filter(r => r.status >= 500).length,
        noResponse: this.results.filter(r => r.status === 0).length,
        pagesWithContent: this.results.filter(r => r.hasContent).length,
        pagesWithoutContent: this.results.filter(r => !r.hasContent).length,
        pagesWithJsErrors: this.results.filter(r => r.jsErrors.length > 0).length,
        pagesWithHttpErrors: this.results.filter(r => r.httpErrors.length > 0).length,
        totalButtons: this.results.reduce((acc, r) => acc + r.buttons.length, 0),
        buttonsWithHandlers: this.results.reduce((acc, r) => acc + r.buttons.filter(b => b.hasHandler).length, 0),
        totalForms: this.results.reduce((acc, r) => acc + r.forms.length, 0),
      },
      results: this.results.sort((a, b) => a.url.localeCompare(b.url)),
    };
    
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${filename}`);
    
    // Print detailed summary
    console.log('\n📊 Summary:');
    console.log(`   Total URLs crawled: ${report.totalUrls}`);
    console.log(`   ✅ Success (2xx): ${report.summary.success}`);
    console.log(`   ⚠️ Client Errors (4xx): ${report.summary.clientErrors}`);
    console.log(`   🔥 Server Errors (5xx): ${report.summary.serverErrors}`);
    console.log(`   ❌ No Response: ${report.summary.noResponse}`);
    console.log('\n📋 Content Analysis:');
    console.log(`   📄 Pages with content: ${report.summary.pagesWithContent}`);
    console.log(`   ⚠️ Empty pages: ${report.summary.pagesWithoutContent}`);
    console.log(`   🧨 Pages with JS errors: ${report.summary.pagesWithJsErrors}`);
    console.log(`   ❌ Pages with HTTP errors: ${report.summary.pagesWithHttpErrors}`);
    console.log('\n🔘 Interactive Elements:');
    console.log(`   Total buttons found: ${report.summary.totalButtons}`);
    console.log(`   Buttons with handlers: ${report.summary.buttonsWithHandlers}`);
    console.log(`   Total forms found: ${report.summary.totalForms}`);
    
    // List problematic pages
    const problematicPages = this.results.filter(r => 
      !r.hasContent || r.jsErrors.length > 0 || r.httpErrors.length > 0 || r.status >= 400
    );
    
    if (problematicPages.length > 0) {
      console.log('\n⚠️ Problematic Pages:');
      problematicPages.forEach(page => {
        console.log(`\n   ${page.url}:`);
        if (!page.hasContent) console.log(`      - Empty or minimal content (${page.contentLength} chars)`);
        if (page.jsErrors.length > 0) console.log(`      - JS Errors: ${page.jsErrors.join('; ')}`);
        if (page.httpErrors.length > 0) {
          page.httpErrors.forEach(err => {
            console.log(`      - HTTP Error: ${err.status} ${err.statusText} for ${err.url}`);
          });
        }
        if (page.status >= 400) console.log(`      - Page Status: ${page.status} ${page.statusText}`);
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n👋 Browser closed');
    }
  }
}

// Main execution
async function main() {
  const crawler = new WebCrawler();
  
  try {
    // Initialize browser in headless mode
    await crawler.init(true);
    
    // Login credentials
    const loginUrl = 'http://localhost:5001/login';
    const email = 'admin@mssp.local';
    const password = 'SecureTestPass123!';
    
    // Attempt login
    const loginSuccess = await crawler.login(loginUrl, email, password);
    
    if (!loginSuccess) {
      console.error('❌ Login failed. Exiting...');
      return;
    }
    
    // Check if we're actually logged in by looking at the page
    const pageTitle = await crawler.page!.title();
    const pageUrl = crawler.page!.url();
    console.log(`📍 Current page title: ${pageTitle}`);
    console.log(`📍 Current page URL: ${pageUrl}`);
    
    // Try to find common logged-in indicators
    const isLoggedIn = await crawler.page!.evaluate(() => {
      const bodyText = document.body.innerText;
      return bodyText.includes('Dashboard') || 
             bodyText.includes('Welcome') || 
             bodyText.includes('Logout') ||
             bodyText.includes('Sign out') ||
             bodyText.includes('@mssp.local');
    });
    
    console.log(`🔐 Appears to be logged in: ${isLoggedIn}`);
    
    // Define all routes to check
    const routesToCheck = [
      '/',
      '/dashboard',
      '/clients',
      '/clients/new',
      '/clients/1',
      '/clients/2',
      '/clients/3',
      '/services',
      '/services/new',
      '/contracts',
      '/licenses',
      '/hardware',
      '/saf',
      '/coc',
      '/users',
      '/users/new',
      '/settings',
      '/admin',
      '/admin/services',
      '/admin/users',
      '/admin/roles',
      '/reports',
      '/reports/clients',
      '/reports/services',
      '/reports/financial',
      '/assets',
      '/integrations',
      '/external-systems',
      '/audit-logs',
      '/profile',
      '/settings/company',
      '/settings/security',
      '/settings/notifications'
    ];
    
    console.log(`\n🔍 Checking ${routesToCheck.length} routes directly...`);
    console.log('═'.repeat(60));
    
    const baseUrl = 'http://localhost:5001';
    
    for (const route of routesToCheck) {
      const fullUrl = baseUrl + route;
      await crawler.crawlPage(fullUrl);
    }
    
    // Save report
    await crawler.saveReport();
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    // Always close the browser
    await crawler.close();
  }
}

// Run the crawler
main().catch(console.error); 