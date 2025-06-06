#!/bin/bash

# ===============================
# MSSP Client Manager - Development Startup Script
# Using Production Database (Migrated Data) - CORRECTED PASSWORD: 12345678
# ===============================

echo "🛠️  Starting MSSP Client Manager in DEVELOPMENT mode"
echo "📊 Using production database with migrated data (66 clients + 1 user)"
echo "⚠️  NOTE: This points to the same database as production"
echo "🔧 Database Password: 12345678 (confirmed working)"
echo ""

# Set development environment variables
export NODE_ENV=development
export PORT=5001
export HOST=localhost

# Database Configuration (CORRECTED PASSWORD - same as production)
export DATABASE_URL="postgresql://mssp_user:12345678@localhost:5432/mssp_production"

# Development-friendly settings
export SESSION_SECRET="dev-session-secret-not-for-production"
export JWT_SECRET="dev-jwt-secret-not-for-production"
export SESSION_TIMEOUT=86400
export MAX_LOGIN_ATTEMPTS=10
export ACCOUNT_LOCKOUT_TIME=300

# LDAP Configuration (Development)
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

# Testing Configuration
export TEST_PASSWORD="testpassword123"

# Frontend Configuration
export FRONTEND_URL="http://localhost:5001"
export CORS_ORIGINS="http://localhost:5001,http://127.0.0.1:5001"
export BASE_URL="http://localhost:5001"
export CLIENT_URL="http://localhost:5001"

# Enable development features
export ENABLE_TESTING=true
export ENABLE_TEST_DATA=false  # Don't add test data to production database
export ENABLE_MOCK_DATA=false
export MOCK_EXTERNAL_APIS=true
export DEBUG_SQL=false

# Development logging
export LOG_LEVEL=debug
export LOG_FORMAT=pretty
export ENABLE_REQUEST_LOGGING=true
export ENABLE_ERROR_TRACKING=true

echo "✅ Environment configured for development"
echo "🗄️  Database: mssp_production (shared with production)"
echo "👤 Admin User: admin@mssp.local"
echo ""

# Verify database connection before starting
echo "🔍 Verifying database connection..."
if PGPASSWORD=12345678 psql -U mssp_user -h localhost -d mssp_production -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    echo "📊 Starting development mode with 66 clients + 1 user..."
    echo "💡 Admin login: admin@mssp.local"
    echo ""
    npm run dev
else
    echo "❌ Database connection failed"
    echo "🔧 Please check your database configuration"
    exit 1
fi 