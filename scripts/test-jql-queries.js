#!/usr/bin/env node

/**
 * JQL Query Testing Utility
 * 
 * This script allows you to test JQL queries against the JIRA system
 * and see the mapped results.
 */

import https from 'https';
import { URL } from 'url';
import readline from 'readline';

// JIRA Configuration
const JIRA_CONFIG = {
  baseUrl: 'https://sd.sic.sitco.sa',
  apiPath: '/rest/api/3',
  auth: {
    username: 'svc-scriptrunner',
    password: 'YOUR_PASSWORD_HERE',
    token: 'YOUR_TOKEN_HERE'
  }
};

// Sample JQL queries to test
const SAMPLE_QUERIES = {
  'all-open': 'status != Closed AND status != Resolved',
  'recent': 'created >= -30d',
  'high-priority': 'priority = High',
  'today': 'created >= startOfDay()',
  'this-week': 'created >= startOfWeek()',
  'unresolved': 'status in (Open, "In Progress", "To Do")',
  'by-project': 'project = "MSSP"'
};

// Field mapping configuration
const FIELD_MAPPINGS = {
  priority: {
    'Highest': 'Critical',
    'High': 'High',
    'Medium': 'Medium',
    'Low': 'Low',
    'Lowest': 'Informational'
  },
  issueType: {
    'Incident': 'Incident Response',
    'Service Request': 'Service Delivery',
    'Problem': 'Problem Management',
    'Change': 'Change Management',
    'Bug': 'Defect',
    'Task': 'Task',
    'Story': 'Enhancement'
  },
  status: {
    'Open': 'New',
    'In Progress': 'In Progress',
    'Resolved': 'Resolved',
    'Closed': 'Closed',
    'To Do': 'Pending'
  }
};

/**
 * Make HTTP request to JIRA API
 */
function makeJiraRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, JIRA_CONFIG.baseUrl + JIRA_CONFIG.apiPath);
    
    // Add query parameters
    if (options.params) {
      Object.keys(options.params).forEach(key => {
        url.searchParams.append(key, options.params[key]);
      });
    }

    const auth = Buffer.from(`${JIRA_CONFIG.auth.username}:${JIRA_CONFIG.auth.password}`).toString('base64');
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MSSP-Client-Manager/1.0'
      }
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${jsonData.errorMessages || jsonData.message || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error(`JSON parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test JIRA connection
 */
async function testConnection() {
  console.log('🔌 Testing JIRA connection...');
  
  try {
    const serverInfo = await makeJiraRequest('/serverInfo');
    console.log('✅ Connection successful!');
    console.log(`   Server: ${serverInfo.serverTitle}`);
    console.log(`   Version: ${serverInfo.version}`);
    console.log(`   URL: ${JIRA_CONFIG.baseUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

/**
 * Execute JQL query
 */
async function executeJQL(jql, options = {}) {
  console.log(`\n🔍 Executing JQL: ${jql}`);
  
  const params = {
    jql: jql,
    maxResults: options.maxResults || 10,
    startAt: options.startAt || 0,
    fields: options.fields || 'summary,status,priority,assignee,reporter,created,updated,issuetype,project'
  };

  try {
    const result = await makeJiraRequest('/search', { params });
    
    console.log(`📊 Results: ${result.total} total, showing ${result.issues.length}`);
    
    if (result.issues.length === 0) {
      console.log('   No issues found for this query');
      return result;
    }

    // Display results
    result.issues.forEach((issue, index) => {
      console.log(`\n   ${index + 1}. ${issue.key}: ${issue.fields.summary}`);
      console.log(`      Status: ${issue.fields.status.name}`);
      console.log(`      Priority: ${issue.fields.priority?.name || 'None'}`);
      console.log(`      Assignee: ${issue.fields.assignee?.displayName || 'Unassigned'}`);
      console.log(`      Created: ${new Date(issue.fields.created).toLocaleDateString()}`);
    });

    return result;
  } catch (error) {
    console.error(`❌ JQL execution failed: ${error.message}`);
    return null;
  }
}

/**
 * Map JIRA issue to MSSP format
 */
function mapJiraIssue(jiraIssue) {
  const fields = jiraIssue.fields;
  
  return {
    id: jiraIssue.key,
    title: fields.summary,
    description: fields.description || '',
    status: FIELD_MAPPINGS.status[fields.status.name] || fields.status.name,
    priority: FIELD_MAPPINGS.priority[fields.priority?.name] || fields.priority?.name || 'Unknown',
    issueType: FIELD_MAPPINGS.issueType[fields.issuetype.name] || fields.issuetype.name,
    assignee: fields.assignee?.displayName || null,
    assigneeEmail: fields.assignee?.emailAddress || null,
    reporter: fields.reporter?.displayName || null,
    reporterEmail: fields.reporter?.emailAddress || null,
    created: new Date(fields.created),
    updated: new Date(fields.updated),
    resolved: fields.resolutiondate ? new Date(fields.resolutiondate) : null,
    project: {
      key: fields.project.key,
      name: fields.project.name
    },
    labels: fields.labels || [],
    components: fields.components?.map(c => c.name) || [],
    // Extract client info from project key or custom field
    clientCode: extractClientCode(fields.project.key),
    // Calculate metrics
    ageInDays: Math.floor((new Date() - new Date(fields.created)) / (1000 * 60 * 60 * 24)),
    isOverdue: isIssueOverdue(fields),
    // Original JIRA data for reference
    originalData: jiraIssue
  };
}

/**
 * Extract client code from project key
 */
function extractClientCode(projectKey) {
  // Example: "MSSP-CLIENT-001" -> "CLIENT-001"
  const match = projectKey.match(/MSSP-(.+)/);
  return match ? match[1] : projectKey;
}

/**
 * Check if issue is overdue based on priority and age
 */
function isIssueOverdue(fields) {
  if (fields.status.name === 'Closed' || fields.status.name === 'Resolved') {
    return false;
  }

  const createdDate = new Date(fields.created);
  const ageInHours = (new Date() - createdDate) / (1000 * 60 * 60);
  const priority = fields.priority?.name;

  // SLA thresholds by priority (in hours)
  const slaThresholds = {
    'Highest': 4,
    'High': 8,
    'Medium': 24,
    'Low': 72,
    'Lowest': 168
  };

  return ageInHours > (slaThresholds[priority] || 24);
}

/**
 * Test JQL query and show mapped results
 */
async function testJQLWithMapping(jql, options = {}) {
  const result = await executeJQL(jql, options);
  
  if (!result || result.issues.length === 0) {
    return;
  }

  console.log('\n📋 Mapped Results:');
  
  result.issues.forEach((issue, index) => {
    const mapped = mapJiraIssue(issue);
    
    console.log(`\n   ${index + 1}. ${mapped.id}: ${mapped.title}`);
    console.log(`      Client: ${mapped.clientCode}`);
    console.log(`      Type: ${mapped.issueType}`);
    console.log(`      Status: ${mapped.status}`);
    console.log(`      Priority: ${mapped.priority}`);
    console.log(`      Age: ${mapped.ageInDays} days`);
    console.log(`      Overdue: ${mapped.isOverdue ? '⚠️  Yes' : '✅ No'}`);
    
    if (mapped.assignee) {
      console.log(`      Assignee: ${mapped.assignee}`);
    }
  });

  // Summary statistics
  const mappedIssues = result.issues.map(mapJiraIssue);
  const overdue = mappedIssues.filter(i => i.isOverdue).length;
  const byPriority = mappedIssues.reduce((acc, issue) => {
    acc[issue.priority] = (acc[issue.priority] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📈 Summary:');
  console.log(`   Total issues: ${mappedIssues.length}`);
  console.log(`   Overdue: ${overdue}`);
  console.log('   By priority:', byPriority);
}

/**
 * Run sample queries
 */
async function runSampleQueries() {
  console.log('\n🎯 Running sample JQL queries...\n');
  
  for (const [name, jql] of Object.entries(SAMPLE_QUERIES)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 Query: ${name}`);
    console.log(`${'='.repeat(60)}`);
    
    await testJQLWithMapping(jql, { maxResults: 5 });
    
    // Wait a bit between queries to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Get field information
 */
async function getFieldInfo() {
  console.log('\n📋 Available JIRA fields:');
  
  try {
    const fields = await makeJiraRequest('/field');
    
    console.log(`\n   Found ${fields.length} fields:`);
    
    // Show commonly used fields
    const commonFields = fields.filter(f => 
      ['summary', 'description', 'status', 'priority', 'assignee', 'reporter', 
       'created', 'updated', 'issuetype', 'project', 'labels', 'components'].includes(f.id)
    );
    
    commonFields.forEach(field => {
      console.log(`   - ${field.id}: ${field.name}`);
    });
    
    return fields;
  } catch (error) {
    console.error(`❌ Failed to get field info: ${error.message}`);
    return [];
  }
}

/**
 * Interactive mode
 */
async function interactiveMode() {
  console.log('\n🎮 Interactive JQL Testing Mode');
  console.log('Enter JQL queries to test (or "exit" to quit):');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuery = () => {
    rl.question('\nJQL> ', async (jql) => {
      if (jql.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      
      if (jql.trim() === '') {
        askQuery();
        return;
      }
      
      await testJQLWithMapping(jql, { maxResults: 10 });
      askQuery();
    });
  };

  askQuery();
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🎯 JIRA JQL Testing Utility');
  console.log('============================');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  switch (command) {
    case 'fields':
      await getFieldInfo();
      break;
      
    case 'samples':
      await runSampleQueries();
      break;
      
    case 'query':
      const jql = args.slice(1).join(' ');
      if (!jql) {
        console.error('❌ Please provide a JQL query');
        process.exit(1);
      }
      await testJQLWithMapping(jql);
      break;
      
    case 'interactive':
      await interactiveMode();
      break;
      
    default:
      console.log('\n📖 Usage:');
      console.log('  node test-jql-queries.js fields                    # List available fields');
      console.log('  node test-jql-queries.js samples                   # Run sample queries');
      console.log('  node test-jql-queries.js query "your JQL here"     # Test specific query');
      console.log('  node test-jql-queries.js interactive               # Interactive mode');
      console.log('\n📚 Examples:');
      console.log('  node test-jql-queries.js query "status != Closed"');
      console.log('  node test-jql-queries.js query "created >= -7d AND priority = High"');
      break;
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export {
  testConnection,
  executeJQL,
  mapJiraIssue,
  testJQLWithMapping,
  SAMPLE_QUERIES,
  FIELD_MAPPINGS
}; 