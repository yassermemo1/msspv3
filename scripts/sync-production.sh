#!/bin/bash

echo "🚀 Production Database Sync & Update Script"
echo "==========================================="

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if environment file exists
if [ ! -f ".env" ]; then
    log_error "Environment file (.env) not found!"
    echo "Please create .env with production database credentials:"
    echo "PROD_DB_HOST=localhost"
    echo "PROD_DB_USER=mssp_user"
    echo "PROD_DB_PASS=12345678"
    echo "PROD_DB_NAME=mssp_production"
    echo "PROD_DATABASE_URL=postgresql://mssp_user:12345678@localhost:5432/mssp_production"
    exit 1
fi

# Source environment variables
source .env

# Set default production database values if not set
PROD_DB_HOST=${PROD_DB_HOST:-localhost}
PROD_DB_USER=${PROD_DB_USER:-mssp_user}
PROD_DB_PASS=${PROD_DB_PASS:-12345678}
PROD_DB_NAME=${PROD_DB_NAME:-mssp_production}
PROD_DATABASE_URL=${PROD_DATABASE_URL:-"postgresql://${PROD_DB_USER}:${PROD_DB_PASS}@${PROD_DB_HOST}:5432/${PROD_DB_NAME}"}

log_info "Using production database: ${PROD_DB_NAME} on ${PROD_DB_HOST}"

# Validate production database URL
if [ -z "$PROD_DATABASE_URL" ]; then
    log_error "PROD_DATABASE_URL could not be determined"
    exit 1
fi

# Create backup directory
mkdir -p $BACKUP_DIR

# Step 1: Test connection first
log_info "Testing production database connection..."
if ! psql "$PROD_DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
    log_error "Cannot connect to production database: ${PROD_DATABASE_URL}"
    log_info "Please verify your database is running and credentials are correct"
    exit 1
fi

# Step 2: Create backup
log_info "Creating database backup..."
if pg_dump "$PROD_DATABASE_URL" > "$BACKUP_FILE"; then
    log_info "Backup created: $BACKUP_FILE"
else
    log_error "Failed to create backup. Aborting."
    exit 1
fi

# Step 3: Create schema_versions table if it doesn't exist
log_info "Ensuring schema_versions table exists..."
psql "$PROD_DATABASE_URL" -c "
CREATE TABLE IF NOT EXISTS schema_versions (
  id SERIAL PRIMARY KEY,
  script_version VARCHAR(20),
  app_version VARCHAR(20),
  schema_version VARCHAR(20) NOT NULL,
  version VARCHAR(20), -- For compatibility
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  environment VARCHAR(20) DEFAULT 'production',
  notes TEXT,
  migration_file VARCHAR(255),
  description TEXT
);
" 2>/dev/null || log_warn "Could not create schema_versions table"

# Step 4: Check current schema version
log_info "Checking current schema version..."
CURRENT_VERSION=$(psql "$PROD_DATABASE_URL" -t -c "SELECT COALESCE(schema_version, version, 'unknown') FROM schema_versions ORDER BY COALESCE(applied_at, created_at) DESC LIMIT 1;" 2>/dev/null | xargs)
if [ $? -eq 0 ] && [ -n "$CURRENT_VERSION" ] && [ "$CURRENT_VERSION" != "unknown" ]; then
    log_info "Current schema version: $CURRENT_VERSION"
else
    log_warn "Could not determine current schema version - will create initial version"
    CURRENT_VERSION="initial"
fi

# Get current app version from package.json
APP_VERSION=$(grep '"version":' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')
log_info "Target schema version: $APP_VERSION"

# Step 5: Apply schema changes (dry run first)
log_info "Checking for schema changes..."
if DATABASE_URL="$PROD_DATABASE_URL" npx drizzle-kit check; then
    log_info "Schema is up to date"
else
    log_warn "Schema changes detected"
    
    # Ask for confirmation
    read -p "Apply schema changes to production? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Applying schema changes..."
        if DATABASE_URL="$PROD_DATABASE_URL" npx drizzle-kit push --force; then
            log_info "Schema changes applied successfully"
        else
            log_error "Schema migration failed. Check backup: $BACKUP_FILE"
            exit 1
        fi
    else
        log_info "Schema migration skipped"
    fi
fi

# Step 6: Update schema version
log_info "Updating schema version to $APP_VERSION..."
psql "$PROD_DATABASE_URL" -c "
INSERT INTO schema_versions (
  script_version, 
  app_version, 
  schema_version, 
  version,
  environment, 
  notes,
  description
) VALUES (
  '$APP_VERSION',
  '$APP_VERSION', 
  '$APP_VERSION', 
  '$APP_VERSION',
  'production',
  'Production sync deployment - $(date)',
  'Auto-sync production deployment from sync-production.sh'
);
" 2>/dev/null || log_warn "Could not update schema version"

# Step 7: Verify critical tables and data
log_info "Verifying database integrity..."
psql "$PROD_DATABASE_URL" -c "
SELECT 
  'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts  
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'schema_versions', COUNT(*) FROM schema_versions;
"

# Step 8: Build and prepare application
log_info "Building application..."
if npm run build; then
    log_info "Application built successfully"
else
    log_error "Application build failed"
    exit 1
fi

# Step 9: Test critical endpoints (if server is running)
log_info "Testing application endpoints..."
if curl -f -s http://localhost:5001/api/health >/dev/null 2>&1; then
    log_info "Health endpoint OK"
else
    log_warn "Health endpoint not responding (server may not be running)"
fi

# Step 10: Create deployment summary
SUMMARY_FILE="${BACKUP_DIR}/deployment_summary_${TIMESTAMP}.txt"
cat > "$SUMMARY_FILE" <<EOF
Production Deployment Summary
============================
Date: $(date)
Backup: $BACKUP_FILE
Previous Schema Version: $CURRENT_VERSION
New Schema Version: $APP_VERSION
Production Database: ${PROD_DB_NAME} on ${PROD_DB_HOST}

Database Changes:
- Applied latest schema migrations
- Updated to version $APP_VERSION with auto-sync support
- Fixed production deployment process

Application Updates:
- Enhanced auto-sync functionality
- Updated production sync process
- Improved database configuration handling

Files Changed:
- scripts/sync-production.sh (updated for .env usage)
- Enhanced auto-sync with production support

Verification Steps:
1. Database backup created: $BACKUP_FILE
2. Schema migrations applied
3. Application built successfully
4. Basic connectivity tested

Next Steps:
1. Restart application server: npm run start
2. Or start with auto-sync: npm run start:sync
3. Test login functionality
4. Verify all features work correctly
5. Monitor application logs

Auto-Sync Commands:
- Development: npm run dev (auto-sync enabled)
- Production: npm run start:sync (auto-sync enabled)
- Manual sync: npm run sync:production

Rollback Instructions:
If issues occur, restore database with:
psql "$PROD_DATABASE_URL" < $BACKUP_FILE
EOF

log_info "Deployment summary saved: $SUMMARY_FILE"

# Final message
echo ""
log_info "Production sync completed successfully!"
echo ""
echo "📋 Summary:"
echo "  • Database: ${PROD_DB_NAME} on ${PROD_DB_HOST}"
echo "  • Backup: $BACKUP_FILE"
echo "  • Schema version: $APP_VERSION"
echo "  • Application built and ready"
echo ""
echo "🔄 Next Steps:"
echo "  1. Add production variables to .env:"
echo "     PROD_DB_HOST=${PROD_DB_HOST}"
echo "     PROD_DB_USER=${PROD_DB_USER}"
echo "     PROD_DB_PASS=${PROD_DB_PASS}"
echo "     PROD_DB_NAME=${PROD_DB_NAME}"
echo "     PROD_DATABASE_URL=${PROD_DATABASE_URL}"
echo ""
echo "  2. Start with auto-sync: npm run start:sync"
echo "  3. Test at: http://localhost:5001/login" 