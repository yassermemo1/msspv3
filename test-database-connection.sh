#!/bin/bash

# Test database connection with comprehensive diagnostics
# Updated to use mssp_production as the default database name

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Database configuration with defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-mssp_production}
DB_USER=${DB_USER:-mssp_user}
DB_PASSWORD=${DB_PASSWORD:-12345678}

# Try to find psql
PSQL_CMD=""
for cmd in psql /usr/bin/psql /usr/local/bin/psql /opt/homebrew/bin/psql; do
    if command -v "$cmd" >/dev/null 2>&1; then
        PSQL_CMD="$cmd"
        break
    fi
done

if [ -z "$PSQL_CMD" ]; then
    error "PostgreSQL client (psql) not found!"
    exit 1
fi

log "Testing Database Connection"
echo "================================"
echo "Host: ${DB_HOST}"
echo "Port: ${DB_PORT}"
echo "User: ${DB_USER}"
echo "- Database: ${DB_NAME:-mssp_production}"
echo "PostgreSQL client: ${PSQL_CMD}"
echo "================================"

# Test 1: Check if PostgreSQL is running
info "Test 1: Checking if PostgreSQL is running..."
if ! command -v pg_isready >/dev/null 2>&1; then
    warn "pg_isready not found, skipping service check"
else
    if pg_isready -h "${DB_HOST}" -p "${DB_PORT}" >/dev/null 2>&1; then
        log "✓ PostgreSQL is running on ${DB_HOST}:${DB_PORT}"
    else
        error "✗ PostgreSQL is not running on ${DB_HOST}:${DB_PORT}"
        exit 1
    fi
fi

# Test 2: Test authentication and database connection
info "Test 2: Testing database authentication and connection..."
if PGPASSWORD="${DB_PASSWORD:-12345678}" "$PSQL_CMD" -h "${DB_HOST:-localhost}" -U "${DB_USER:-mssp_user}" -d "${DB_NAME:-mssp_production}" -c "SELECT version();" 2>/dev/null >/dev/null; then
    log "✓ Successfully connected to database"
    
    # Get PostgreSQL version
    PG_VERSION=$(PGPASSWORD="${DB_PASSWORD:-12345678}" "$PSQL_CMD" -h "${DB_HOST:-localhost}" -U "${DB_USER:-mssp_user}" -d "${DB_NAME:-mssp_production}" -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)
    info "PostgreSQL version: ${PG_VERSION}"
else
    error "✗ Failed to connect to database"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check if database exists: sudo -u postgres $PSQL_CMD -l | grep mssp_production"
    echo "2. Check if user exists: sudo -u postgres $PSQL_CMD -c \"\\du\" | grep ${DB_USER}"
    echo "3. Test connection as postgres: sudo -u postgres $PSQL_CMD -d mssp_production"
    echo ""
    exit 1
fi

# Test 3: Test table creation permissions
info "Test 3: Testing table creation permissions..."
if PGPASSWORD="${DB_PASSWORD:-12345678}" "$PSQL_CMD" -h "${DB_HOST:-localhost}" -U "${DB_USER:-mssp_user}" -d "${DB_NAME:-mssp_production}" -c "CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW());" 2>/dev/null >/dev/null; then
    log "✓ Successfully created test table"
    
    # Clean up test table
    PGPASSWORD="${DB_PASSWORD:-12345678}" "$PSQL_CMD" -h "${DB_HOST:-localhost}" -U "${DB_USER:-mssp_user}" -d "${DB_NAME:-mssp_production}" -c "DROP TABLE IF EXISTS test_connection;" 2>/dev/null
    log "✓ Successfully cleaned up test table"
else
    error "✗ Failed to create table - insufficient permissions"
fi

# Test 4: Check schema permissions
info "Test 4: Checking schema permissions..."
SCHEMA_PERMS=$(PGPASSWORD="${DB_PASSWORD:-12345678}" "$PSQL_CMD" -h "${DB_HOST:-localhost}" -U "${DB_USER:-mssp_user}" -d "${DB_NAME:-mssp_production}" -t -c "SELECT has_schema_privilege('${DB_USER:-mssp_user}', 'public', 'CREATE');" 2>/dev/null | xargs)

if [ "$SCHEMA_PERMS" = "t" ]; then
    log "✓ User has CREATE privileges on public schema"
else
    warn "✗ User lacks CREATE privileges on public schema"
    echo "Run: sudo -u postgres $PSQL_CMD -d ${DB_NAME:-mssp_production} -c \"GRANT ALL ON SCHEMA public TO ${DB_USER:-mssp_user};\""
fi

# Summary
echo ""
log "Database Connection Test Complete"
echo "================================"
echo "- Host: ${DB_HOST}:${DB_PORT}"
echo "- User: ${DB_USER}"
echo "- Database: ${DB_NAME:-mssp_production}"
echo "- Status: ✓ CONNECTED"
echo "================================" 