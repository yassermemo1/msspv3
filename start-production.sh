#!/bin/bash

# ===================================================================
# MSSP Client Manager - Production Startup Script
# ===================================================================

set -e

echo "🚀 Starting MSSP Client Manager in Production Mode..."
echo "=================================================="

# Production Environment Variables
export NODE_ENV=production
export DATABASE_URL="postgresql://mssp_user:12345678@localhost:5432/mssp_production"
export SESSION_SECRET="production-secret-key-minimum-64-characters-long-for-security-purposes"
export PORT=5001
export HOST=0.0.0.0

# Frontend URLs
export FRONTEND_URL="http://localhost:5001"
export BASE_URL="http://localhost:5001"
export CLIENT_URL="http://localhost:5001"
export CORS_ORIGINS="http://localhost:5001"

# Security Settings
export REQUIRE_2FA=false
export SESSION_TIMEOUT=28800
export MAX_LOGIN_ATTEMPTS=5

# LDAP Configuration (Using test server)
export LDAP_ENABLED=true
export LDAP_URL="ldap://ldap.forumsys.com:389"
export LDAP_SEARCH_BASE="dc=example,dc=com"
export LDAP_SEARCH_FILTER="(uid={{username}})"

# Email Configuration (Disabled for now)
export SMTP_HOST=""
export SMTP_USER=""
export SMTP_PASSWORD=""

# Testing & Debug (Disabled in production)
export ENABLE_TESTING=false
export ENABLE_TEST_DATA=false
export ENABLE_MOCK_DATA=false
export DEBUG_SQL=false

# Logging
export LOG_LEVEL=info
export LOG_FORMAT=json
export ENABLE_REQUEST_LOGGING=true

echo "✅ Environment configured for production"
echo "✅ Database: mssp_production"
echo "✅ Port: 5001"
echo "✅ LDAP: Enabled"
echo "✅ Security: Production settings"
echo ""

# Check if database is accessible
echo "🔍 Checking database connection..."
if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check if PostgreSQL is running."
    exit 1
fi

# Check if port is available
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5001 is already in use. Stopping existing processes..."
    pkill -f "tsx server/index.ts" || true
    sleep 2
fi

echo ""
echo "🚀 Starting production server..."
echo "=================================================="

# Start the application
npm run start 