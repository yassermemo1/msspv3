import axios from 'axios';
import * as fs from 'fs';

interface RouteCheckResult {
  route: string;
  status: number;
  statusText: string;
  contentType: string;
  contentLength: number;
  hasHtml: boolean;
  htmlSnippet: string;
  apiCalls: string[];
  errors: string[];
}

class BackendChecker {
  private client: any;
  private sessionCookie: string = '';
  private results: RouteCheckResult[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: 'http://localhost:5001',
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
      maxRedirects: 0, // Don't follow redirects
    });
  }

  async login(): Promise<boolean> {
    try {
      console.log('🔐 Attempting login...');
      
      const response = await this.client.post('/api/login', {
        email: 'admin@mssp.local',
        password: 'SecureTestPass123!'
      });

      if (response.status === 200) {
        // Extract session cookie
        const setCookies = response.headers['set-cookie'];
        if (setCookies) {
          const sessionCookie = setCookies.find((cookie: string) => 
            cookie.includes('session=') || cookie.includes('mssp.sid=')
          );
          if (sessionCookie) {
            this.sessionCookie = sessionCookie.split(';')[0];
            console.log('✅ Login successful');
            return true;
          }
        }
      }
      
      console.error('❌ Login failed:', response.status, response.data);
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  }

  async checkRoute(route: string): Promise<RouteCheckResult> {
    console.log(`\n🔍 Checking route: ${route}`);
    
    const result: RouteCheckResult = {
      route,
      status: 0,
      statusText: '',
      contentType: '',
      contentLength: 0,
      hasHtml: false,
      htmlSnippet: '',
      apiCalls: [],
      errors: []
    };

    try {
      // First, make the request to the route
      const response = await this.client.get(route, {
        headers: {
          'Cookie': this.sessionCookie,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      result.status = response.status;
      result.statusText = response.statusText;
      result.contentType = response.headers['content-type'] || 'unknown';
      
      const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      result.contentLength = content.length;
      
      // Check if it's HTML
      result.hasHtml = content.includes('<html') || content.includes('<!DOCTYPE');
      
      // Get a snippet of the content
      if (result.hasHtml) {
        // Extract body content if possible
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          const bodyContent = bodyMatch[1].replace(/<[^>]+>/g, '').trim();
          result.htmlSnippet = bodyContent.substring(0, 200);
        } else {
          result.htmlSnippet = content.substring(0, 200);
        }
      } else {
        result.htmlSnippet = content.substring(0, 200);
      }

      // Log results
      console.log(`   Status: ${result.status} ${result.statusText}`);
      console.log(`   Content-Type: ${result.contentType}`);
      console.log(`   Content Length: ${result.contentLength} chars`);
      console.log(`   Has HTML: ${result.hasHtml}`);
      
      if (result.contentLength === 0) {
        console.log(`   ⚠️ EMPTY RESPONSE`);
      } else if (result.contentLength < 100) {
        console.log(`   ⚠️ MINIMAL CONTENT: "${result.htmlSnippet}"`);
      } else {
        console.log(`   ✅ Content preview: "${result.htmlSnippet.substring(0, 100)}..."`);
      }

      // Check common API endpoints that might be called
      if (route === '/dashboard') {
        await this.checkApi('/api/dashboard/stats', result);
        await this.checkApi('/api/dashboard/widgets', result);
      } else if (route === '/clients') {
        await this.checkApi('/api/clients', result);
      } else if (route === '/services') {
        await this.checkApi('/api/services', result);
      } else if (route === '/licenses') {
        await this.checkApi('/api/licenses', result);
        await this.checkApi('/api/license-pools', result);
      } else if (route === '/users') {
        await this.checkApi('/api/users', result);
      } else if (route === '/audit-logs') {
        await this.checkApi('/api/audit-logs', result);
      }

    } catch (error: any) {
      result.errors.push(error.message);
      console.error(`   ❌ Error: ${error.message}`);
    }

    return result;
  }

  async checkApi(endpoint: string, result: RouteCheckResult): Promise<void> {
    try {
      console.log(`   📡 Checking API: ${endpoint}`);
      
      const response = await this.client.get(endpoint, {
        headers: {
          'Cookie': this.sessionCookie,
          'Accept': 'application/json'
        }
      });

      const apiResult = {
        endpoint,
        status: response.status,
        contentLength: JSON.stringify(response.data).length
      };

      result.apiCalls.push(`${endpoint}: ${apiResult.status} (${apiResult.contentLength} chars)`);

      if (response.status >= 400) {
        console.log(`      ❌ API Error: ${response.status} ${response.statusText}`);
        console.log(`      Response: ${JSON.stringify(response.data).substring(0, 200)}`);
      } else {
        console.log(`      ✅ API OK: ${response.status} (${apiResult.contentLength} chars)`);
      }
    } catch (error: any) {
      console.log(`      ❌ API Error: ${error.message}`);
      result.apiCalls.push(`${endpoint}: ERROR - ${error.message}`);
    }
  }

  async checkAllRoutes(): Promise<void> {
    const routes = [
      '/',
      '/dashboard',
      '/clients',
      '/services',
      '/contracts',
      '/licenses',
      '/hardware',
      '/saf',
      '/coc',
      '/users',
      '/admin',
      '/reports',
      '/external-systems',
      '/audit-logs',
      '/profile',
    ];

    for (const route of routes) {
      const result = await this.checkRoute(route);
      this.results.push(result);
    }
  }

  saveReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        empty: this.results.filter(r => r.contentLength === 0).length,
        minimal: this.results.filter(r => r.contentLength > 0 && r.contentLength < 100).length,
        hasContent: this.results.filter(r => r.contentLength >= 100).length,
        errors: this.results.filter(r => r.errors.length > 0).length,
        apiErrors: this.results.filter(r => r.apiCalls.some(call => call.includes('ERROR'))).length
      },
      results: this.results
    };

    fs.writeFileSync('backend-check-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 Summary:');
    console.log(`   Total routes: ${report.summary.total}`);
    console.log(`   Empty responses: ${report.summary.empty}`);
    console.log(`   Minimal content: ${report.summary.minimal}`);
    console.log(`   Has content: ${report.summary.hasContent}`);
    console.log(`   Routes with errors: ${report.summary.errors}`);
    console.log(`   Routes with API errors: ${report.summary.apiErrors}`);
    
    console.log('\n⚠️ Empty/Minimal Routes:');
    this.results
      .filter(r => r.contentLength < 100)
      .forEach(r => {
        console.log(`   ${r.route}: ${r.contentLength} chars`);
        if (r.apiCalls.length > 0) {
          r.apiCalls.forEach(api => console.log(`      - ${api}`));
        }
      });
  }
}

// Main execution
async function main() {
  const checker = new BackendChecker();
  
  // Login first
  const loginSuccess = await checker.login();
  if (!loginSuccess) {
    console.error('Failed to login. Exiting...');
    return;
  }

  // Check all routes
  await checker.checkAllRoutes();
  
  // Save report
  checker.saveReport();
}

main().catch(console.error); 