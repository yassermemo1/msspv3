# JQL Query Creation and Testing Guide

## Overview
This guide explains how to create, test, and map JQL (JIRA Query Language) queries in the MSSP Client Manager system.

## Current JIRA Configuration
- **System**: SiTCO Service Desk
- **URL**: https://sd.sic.sitco.sa/
- **REST API**: https://sd.sic.sitco.sa/rest/api/3/
- **Authentication**: Basic Auth + Token
  - Username: `svc-scriptrunner`
  - Password: `YOUR_PASSWORD_HERE`
  - Token: `YOUR_TOKEN_HERE`

## JQL Query Basics

### 1. Common JQL Operators
```jql
= (equals)
!= (not equals)
> (greater than)
< (less than)
>= (greater than or equal)
<= (less than or equal)
~ (contains)
!~ (does not contain)
IN (in list)
NOT IN (not in list)
IS EMPTY
IS NOT EMPTY
```

### 2. Common Fields
```jql
project         # Project key or name
issueType       # Issue type (Bug, Task, Story, etc.)
status          # Issue status
assignee        # Assigned user
reporter        # Reporter
created         # Creation date
updated         # Last update date
resolved        # Resolution date
priority        # Priority level
component       # Project component
fixVersion      # Fix version
labels          # Issue labels
summary         # Issue title
description     # Issue description
```

### 3. Example JQL Queries

#### Basic Queries
```jql
# All open issues
status != Closed AND status != Resolved

# Issues created in last 30 days
created >= -30d

# High priority issues
priority = High

# Issues assigned to current user
assignee = currentUser()

# Issues in specific project
project = "MSSP"
```

#### Advanced Queries
```jql
# Critical issues created this week
priority = "Highest" AND created >= startOfWeek()

# Unresolved issues updated recently
status in (Open, "In Progress", "To Do") AND updated >= -7d

# Issues with specific components
component in ("Network Security", "Endpoint Protection")

# Issues by label
labels in ("client-impact", "security-incident")
```

#### Date-based Queries
```jql
# Issues created today
created >= startOfDay()

# Issues resolved this month
resolved >= startOfMonth() AND resolved <= endOfMonth()

# Issues updated in date range
updated >= "2024-01-01" AND updated <= "2024-12-31"
```

## Testing JQL Queries

### 1. JIRA Web Interface
1. Navigate to https://sd.sic.sitco.sa/
2. Go to Issues → Search for Issues
3. Switch to Advanced search
4. Enter your JQL query
5. Click Search to test

### 2. REST API Testing
```bash
# Test via curl
curl -u "svc-scriptrunner:YOUR_PASSWORD_HERE" \
  -H "Content-Type: application/json" \
  "https://sd.sic.sitco.sa/rest/api/3/search?jql=project=MSSP"

# With token authentication
curl -H "Authorization: Basic YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  "https://sd.sic.sitco.sa/rest/api/3/search?jql=status!=Closed"
```

### 3. Application Testing
Use the built-in test utilities (see scripts below).

## Mapping JIRA Data to MSSP Clients

### 1. Common Mapping Scenarios
```javascript
// Map JIRA project to MSSP client
const clientMapping = {
  'MSSP-CLIENT-001': 'ABC Corp',
  'MSSP-CLIENT-002': 'XYZ Ltd',
  // ...
};

// Map issue types to service categories
const serviceMapping = {
  'Incident': 'Incident Response',
  'Service Request': 'Service Delivery',
  'Problem': 'Problem Management',
  'Change': 'Change Management'
};

// Map priority to severity
const priorityMapping = {
  'Highest': 'Critical',
  'High': 'High',
  'Medium': 'Medium',
  'Low': 'Low',
  'Lowest': 'Informational'
};
```

### 2. Field Mapping Examples
```javascript
// Transform JIRA issue to MSSP format
function mapJiraIssue(jiraIssue) {
  return {
    id: jiraIssue.key,
    title: jiraIssue.fields.summary,
    description: jiraIssue.fields.description,
    status: jiraIssue.fields.status.name,
    priority: priorityMapping[jiraIssue.fields.priority.name],
    assignee: jiraIssue.fields.assignee?.displayName,
    reporter: jiraIssue.fields.reporter.displayName,
    created: new Date(jiraIssue.fields.created),
    updated: new Date(jiraIssue.fields.updated),
    resolved: jiraIssue.fields.resolutiondate ? 
      new Date(jiraIssue.fields.resolutiondate) : null,
    client: extractClientFromProject(jiraIssue.fields.project.key),
    serviceType: serviceMapping[jiraIssue.fields.issuetype.name],
    labels: jiraIssue.fields.labels,
    components: jiraIssue.fields.components.map(c => c.name)
  };
}
```

## Performance Optimization

### 1. Efficient JQL Queries
```jql
# Use specific projects instead of searching all
project in ("MSSP-001", "MSSP-002") AND status != Closed

# Limit date ranges
created >= -90d AND updated >= -30d

# Use ORDER BY for consistent results
project = MSSP ORDER BY created DESC

# Limit results for pagination
project = MSSP ORDER BY key LIMIT 100
```

### 2. API Optimization
- Use field selection: `?fields=summary,status,assignee`
- Implement pagination: `?startAt=0&maxResults=50`
- Cache results when appropriate
- Use bulk operations for multiple queries

## Error Handling

### 1. Common JQL Errors
```
Query syntax error: Check operators and parentheses
Field not found: Verify field names are correct
Permission denied: User lacks access to project/fields
Timeout: Query too complex or large dataset
```

### 2. API Error Handling
```javascript
try {
  const response = await fetch(jiraUrl, {
    headers: { 'Authorization': `Basic ${token}` }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed');
    } else if (response.status === 400) {
      throw new Error('Invalid JQL query');
    } else {
      throw new Error(`JIRA API error: ${response.status}`);
    }
  }
  
  const data = await response.json();
  return data.issues;
} catch (error) {
  console.error('JIRA query failed:', error);
  throw error;
}
```

## Best Practices

### 1. Query Design
- Start simple and add complexity gradually
- Test queries in JIRA web interface first
- Use parentheses for complex logic
- Document query purpose and expected results

### 2. Data Mapping
- Define clear mapping rules
- Handle missing or null values
- Validate mapped data
- Log mapping errors for debugging

### 3. Integration
- Implement retry logic for API calls
- Use appropriate timeouts
- Cache frequently accessed data
- Monitor API rate limits

## Next Steps
1. Use the testing utilities in `scripts/test-jql-queries.js`
2. Test your queries with the JIRA system
3. Implement data mapping for your specific use case
4. Set up monitoring and error handling 