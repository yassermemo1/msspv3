#!/bin/bash

# ===============================
# MSSP Client Manager - Production Startup Script
# Post-Migration Configuration - CORRECTED PASSWORD: 12345678
# ===============================

echo "🚀 Starting MSSP Client Manager in PRODUCTION mode"
echo "📊 Using migrated database with 66 clients + 1 admin user"
echo "💾 Backup available at: backups/migration-20250603_152943/"
echo "🔧 Database Password: CORRECTED to '12345678' (confirmed working)"
echo ""

# Set production environment variables
export NODE_ENV=production
export PORT=5001
export HOST=0.0.0.0

# Database Configuration (CORRECTED PASSWORD)
export DATABASE_URL="postgresql://mssp_user:12345678@localhost:5432/mssp_production"

# Security Configuration
export SESSION_SECRET="YourProductionSessionSecretShouldBeVeryLongAndSecure64CharactersPlus"
export JWT_SECRET="YourProductionJWTSecretShouldAlsoBeVerySecure"
export SESSION_TIMEOUT=86400
export MAX_LOGIN_ATTEMPTS=5
export ACCOUNT_LOCKOUT_TIME=900

# LDAP Configuration
export LDAP_ENABLED=true
export LDAP_URL="ldap://ldap.forumsys.com:389"
export LDAP_BIND_DN="cn=read-only-admin,dc=example,dc=com"
export LDAP_BIND_PASSWORD="password"
export LDAP_SEARCH_BASE="dc=example,dc=com"
export LDAP_SEARCH_FILTER="(uid={{username}})"
export LDAP_USERNAME_FIELD="uid"
export LDAP_EMAIL_FIELD="mail"
export LDAP_FIRSTNAME_FIELD="givenName"
export LDAP_LASTNAME_FIELD="sn"
export LDAP_DEFAULT_ROLE="engineer"

# Logging Configuration
export LOG_LEVEL=info
export ENABLE_REQUEST_LOGGING=true
export AUDIT_LOG_RETENTION_DAYS=365

# Performance Configuration
export RATE_LIMIT_WINDOW_MS=900000
export RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (disable for testing)
export EMAIL_ENABLED=false

# Verify database connection before starting
echo "🔍 Verifying database connection..."
if PGPASSWORD=12345678 psql -U mssp_user -h localhost -d mssp_production -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    echo "📊 Starting application with 66 clients + 1 user..."
    echo ""
    echo "🔧 Running in TRUE PRODUCTION MODE..."
    npm start
else
    echo "❌ Database connection failed"
    echo "🔧 Please check your database configuration"
    exit 1
fi 