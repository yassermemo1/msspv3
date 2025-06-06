# JQL Testing Commands for Production Environment

## Prerequisites
- Must be in RedHat production environment where `sd.sic.sitco.sa` is accessible
- Navigate to the project directory: `cd /path/to/MsspClientManager`

## Basic Commands

### Test JIRA Connection
```bash
node scripts/test-jql-queries.js
```

### List Available JIRA Fields
```bash
node scripts/test-jql-queries.js fields
```

### Run Sample Queries
```bash
node scripts/test-jql-queries.js samples
```

### Test Specific Query
```bash
node scripts/test-jql-queries.js query "status != Closed"
node scripts/test-jql-queries.js query "created >= -7d AND priority = High"
node scripts/test-jql-queries.js query "project = MSSP"
```

### Interactive Mode
```bash
node scripts/test-jql-queries.js interactive
```

## Useful JQL Queries for MSSP

### By Priority
```jql
# Critical issues
priority = Highest

# High priority issues created this week
priority = High AND created >= startOfWeek()
```

### By Date Range
```jql
# Recent issues (last 30 days)
created >= -30d

# Issues created today
created >= startOfDay()

# Issues updated recently
updated >= -7d
```

### By Status
```jql
# All open issues
status != Closed AND status != Resolved

# In progress work
status in (Open, "In Progress", "To Do")

# Recently resolved
resolved >= -7d
```

### By Issue Type
```jql
# Security incidents
issuetype = Incident AND labels in (security, incident)

# Service requests
issuetype = "Service Request"

# Changes and maintenance
issuetype in (Change, Task)
```

### Client-Specific Queries
```jql
# Issues for specific client project
project = "MSSP-CLIENT-001"

# Multiple client projects
project in ("MSSP-CLIENT-001", "MSSP-CLIENT-002")

# Client impact issues
labels in (client-impact, critical)
```

### SLA and Overdue Tracking
```jql
# Potentially overdue critical issues (4+ hours old)
priority = Highest AND created <= -4h AND status != Closed

# Overdue high priority (8+ hours old)
priority = High AND created <= -8h AND status != Closed

# Old medium priority issues (24+ hours)
priority = Medium AND created <= -24h AND status != Closed
```

### Advanced Queries
```jql
# Unassigned critical issues
priority = Highest AND assignee is EMPTY

# Issues with components
component in ("Network Security", "Endpoint Protection")

# Issues without resolution in timeframe
created >= -30d AND resolved is EMPTY AND status != Closed

# Recent changes by specific user
updated >= -7d AND reporter = "username"
```

## Testing and Mapping Workflow

1. **Start with connection test:**
   ```bash
   node scripts/test-jql-queries.js
   ```

2. **Explore available fields:**
   ```bash
   node scripts/test-jql-queries.js fields
   ```

3. **Test basic queries:**
   ```bash
   node scripts/test-jql-queries.js samples
   ```

4. **Develop custom queries:**
   ```bash
   node scripts/test-jql-queries.js interactive
   ```

5. **Test specific business logic:**
   ```bash
   node scripts/test-jql-queries.js query "your custom JQL here"
   ```

## Data Mapping Notes

The testing utility automatically maps JIRA fields to MSSP format:

- **Priority:** Highest → Critical, High → High, etc.
- **Issue Type:** Incident → Incident Response, Task → Task, etc.
- **Status:** Open → New, "In Progress" → In Progress, etc.
- **Client Code:** Extracted from project key (MSSP-CLIENT-001 → CLIENT-001)
- **Metrics:** Age in days, overdue status based on SLA

## Troubleshooting

### Connection Issues
- Ensure you're in the production environment
- Check network connectivity to `sd.sic.sitco.sa`
- Verify credentials are correct

### Query Issues
- Test queries in JIRA web interface first
- Check field names with `node scripts/test-jql-queries.js fields`
- Use quotes for multi-word values: `status = "In Progress"`

### Permission Issues
- Ensure service account has proper permissions
- Check project access rights
- Verify field visibility settings 