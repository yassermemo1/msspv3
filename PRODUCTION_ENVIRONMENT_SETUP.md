# Production Environment Setup Guide

## Required Environment Variables

### Database Configuration
```bash
DATABASE_URL="postgresql://mssp_user:12345678@localhost:5432/mssp_production"
```

### Security Configuration
```bash
JWT_SECRET="your-super-secure-jwt-secret-key-here"
```

### Jira Integration
```bash
JIRA_USERNAME="your-working-jira-username"
JIRA_PASSWORD="your-jira-password"
JIRA_API_KEY="optional-api-key-if-available"
```

### LDAP/Active Directory Integration
```bash
LDAP_URL="ldap://your-domain-controller"
LDAP_BIND_DN="svc-account@your-domain.com"
LDAP_BIND_PASSWORD="your-ldap-service-account-password"
LDAP_SEARCH_BASE="OU=Users,DC=your-domain,DC=com"
```

### SSL Configuration (for internal systems with self-signed certificates)
```bash
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

## Secure Deployment Steps

1. **Create production environment file:**
   ```bash
   cp production.env.example production.env
   nano production.env
   ```

2. **Set environment variables securely:**
   ```bash
   # For systemd service
   sudo systemctl edit mssp-manager --full
   
   # Add Environment variables:
   Environment="JIRA_USERNAME=your-username"
   Environment="JIRA_PASSWORD=your-password"
   ```

3. **Test credentials without committing:**
   ```bash
   # Test Jira integration
   JIRA_USERNAME=your-username JIRA_PASSWORD=your-password node test-jira-integration-working.cjs
   
   # Test LDAP connection
   LDAP_BIND_DN=your-service-account LDAP_BIND_PASSWORD=your-password node test-ldap-connection-real.cjs
   ```

## Security Best Practices

- ✅ **NEVER** commit real credentials to version control
- ✅ **ALWAYS** use environment variables for sensitive data
- ✅ **ROTATE** credentials regularly
- ✅ **LIMIT** service account permissions to minimum required
- ✅ **MONITOR** authentication logs for suspicious activity
- ✅ **ENCRYPT** environment files on production servers

## Testing Integration with Real Credentials

```bash
# Jira Integration Test
JIRA_USERNAME=your-username JIRA_PASSWORD=your-password node test-jira-integration-working.cjs

# Expected Output:
# ✅ Server Info Retrieved: Jira 9.4.24
# ✅ DEP-9 Issue Retrieved: PR Request (Critical)
# ✅ DEP Project Retrieved: Department Roadmap (173 issues)
# ✅ JQL Query Successful: Recent issues found
# ✅ All Jira API calls successful (5/5)
```

## Environment File Template

Create a `production.env` file with these variables:

```bash
# Copy this template and fill in your actual values
DATABASE_URL="postgresql://mssp_user:12345678@localhost:5432/mssp_production"
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JIRA_USERNAME="your-working-jira-username"
JIRA_PASSWORD="your-jira-password"
LDAP_BIND_DN="your-service-account@domain.com"
LDAP_BIND_PASSWORD="your-ldap-password"
NODE_TLS_REJECT_UNAUTHORIZED="0"
NODE_ENV="production"
PORT="3000"
```

## Startup with Environment Variables

```bash
# Load environment and start application
source production.env && npm start

# Or use with node directly
JIRA_USERNAME=your-username JIRA_PASSWORD=your-password npm start
``` 