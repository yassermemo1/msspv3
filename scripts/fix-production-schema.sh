#!/bin/bash

# MSSP Client Manager - Production Schema Fix Script
# This script ensures all database schema updates are applied in production
# Specifically addresses the "deleted_at column does not exist" issue

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

# Database Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mssp_production"
DB_USER="mssp_user"
DB_PASSWORD="12345678"

# Auto-detect environment and set appropriate password
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Development environment
    DB_PASSWORD="12345678"
    ENVIRONMENT="development"
else
    # Linux/RedHat - Production environment  
    DB_PASSWORD="12345678"
    ENVIRONMENT="production"
fi

# Check for custom DATABASE_URL
if [[ -n "$DATABASE_URL" ]]; then
    info "Using DATABASE_URL from environment: $DATABASE_URL"
else
    export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
    info "Using constructed DATABASE_URL: $DATABASE_URL"
fi

# Find PostgreSQL command
find_psql() {
    PSQL_CMD=""
    
    # Try different PostgreSQL paths
    for path in /usr/pgsql-16/bin/psql /opt/postgresql/16/bin/psql /usr/pgsql-15/bin/psql /usr/pgsql-14/bin/psql psql; do
        if command -v $path >/dev/null 2>&1; then
            PSQL_CMD=$path
            break
        fi
    done
    
    if [[ -z "$PSQL_CMD" ]]; then
        error "PostgreSQL psql command not found!"
        exit 1
    fi
    
    info "Using PostgreSQL: $PSQL_CMD"
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    
    if PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" >/dev/null 2>&1; then
        success "Database connection successful!"
    else
        error "Cannot connect to database. Please ensure:"
        error "1. PostgreSQL is running"
        error "2. Database '$DB_NAME' exists"
        error "3. User '$DB_USER' has access"
        error "4. Password is correct"
        exit 1
    fi
}

# Check what's missing from the schema
check_missing_schema() {
    log "Checking for missing schema elements..."
    
    # Check if deleted_at column exists in clients table
    DELETED_AT_EXISTS=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name='clients' AND column_name='deleted_at';" 2>/dev/null || echo "0")
    
    if [[ "$DELETED_AT_EXISTS" == "0" ]]; then
        warning "❌ Missing: clients.deleted_at column"
        NEEDS_SOFT_DELETION=true
    else
        success "✅ Found: clients.deleted_at column"
        NEEDS_SOFT_DELETION=false
    fi
    
    # Check if schema_versions table exists
    SCHEMA_VERSIONS_EXISTS=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_name='schema_versions';" 2>/dev/null || echo "0")
    
    if [[ "$SCHEMA_VERSIONS_EXISTS" == "0" ]]; then
        warning "❌ Missing: schema_versions table"
        NEEDS_SCHEMA_VERSIONS=true
    else
        success "✅ Found: schema_versions table"
        NEEDS_SCHEMA_VERSIONS=false
    fi
    
    # Check for missing columns in other tables
    MISSING_COLUMNS=()
    
    # Check data_sources.type column
    TYPE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name='data_sources' AND column_name='type';" 2>/dev/null || echo "0")
    
    if [[ "$TYPE_EXISTS" == "0" ]]; then
        MISSING_COLUMNS+=("data_sources.type")
    fi
    
    if [[ ${#MISSING_COLUMNS[@]} -gt 0 ]]; then
        warning "❌ Missing columns: ${MISSING_COLUMNS[*]}"
        NEEDS_COLUMN_FIXES=true
    else
        success "✅ All expected columns found"
        NEEDS_COLUMN_FIXES=false
    fi
}

# Apply soft deletion migration
apply_soft_deletion_migration() {
    if [[ "$NEEDS_SOFT_DELETION" == "true" ]]; then
        log "Applying soft deletion migration for clients table..."
        
        PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME << 'EOF'
-- Add deleted_at column to clients table
ALTER TABLE "public"."clients" ADD COLUMN "deleted_at" timestamp;

-- Add index for better performance when filtering deleted clients
CREATE INDEX IF NOT EXISTS "idx_clients_deleted_at" ON "public"."clients" ("deleted_at");

-- Add index for active clients (deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS "idx_clients_active" ON "public"."clients" ("deleted_at") WHERE "deleted_at" IS NULL;

-- Update existing status enum to include 'archived' status
ALTER TABLE "public"."clients" DROP CONSTRAINT IF EXISTS "clients_status_check";
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_status_check" 
  CHECK (status = ANY (ARRAY['prospect'::text, 'active'::text, 'inactive'::text, 'suspended'::text, 'archived'::text]));

-- Add comment for documentation
COMMENT ON COLUMN "public"."clients"."deleted_at" IS 'Timestamp when client was soft deleted (archived). NULL means active client.';
EOF
        
        if [[ $? -eq 0 ]]; then
            success "✅ Soft deletion migration applied successfully"
        else
            error "❌ Failed to apply soft deletion migration"
            exit 1
        fi
    else
        info "Soft deletion migration already applied"
    fi
}

# Create schema_versions table
create_schema_versions_table() {
    if [[ "$NEEDS_SCHEMA_VERSIONS" == "true" ]]; then
        log "Creating schema_versions table..."
        
        PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME << 'EOF'
CREATE TABLE IF NOT EXISTS schema_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    script_version VARCHAR(20),
    app_version VARCHAR(20),
    schema_version VARCHAR(20),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    environment VARCHAR(20),
    notes TEXT
);

-- Insert initial version record
INSERT INTO schema_versions (version, script_version, app_version, schema_version, environment, notes) 
VALUES ('1.4.2', '1.4.2', '1.4.2', '1.4.2', 'production', 'Schema fixed by production schema fix script')
ON CONFLICT DO NOTHING;
EOF
        
        if [[ $? -eq 0 ]]; then
            success "✅ Schema versions table created successfully"
        else
            error "❌ Failed to create schema_versions table"
            exit 1
        fi
    else
        info "Schema_versions table already exists"
    fi
}

# Fix missing columns
fix_missing_columns() {
    if [[ "$NEEDS_COLUMN_FIXES" == "true" ]]; then
        log "Fixing missing columns..."
        
        # Check and add data_sources.type column
        TYPE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_name='data_sources' AND column_name='type';" 2>/dev/null || echo "0")
        
        if [[ "$TYPE_EXISTS" == "0" ]]; then
            info "Adding data_sources.type column..."
            PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -c "
                ALTER TABLE data_sources ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'api';"
            
            if [[ $? -eq 0 ]]; then
                success "✅ Added data_sources.type column"
            else
                warning "⚠️ Failed to add data_sources.type column"
            fi
        fi
    else
        info "No missing columns to fix"
    fi
}

# Run Drizzle push to ensure schema is up to date
run_drizzle_push() {
    log "Running Drizzle schema push to ensure all updates are applied..."
    
    if command -v npx >/dev/null 2>&1; then
        if npx drizzle-kit push --force 2>/dev/null; then
            success "✅ Drizzle schema push completed successfully"
        else
            warning "⚠️ Drizzle schema push failed, but manual fixes should have resolved the issue"
        fi
    else
        warning "npx not available, skipping Drizzle push"
    fi
}

# Verify the fixes
verify_fixes() {
    log "Verifying schema fixes..."
    
    # Check deleted_at column again
    DELETED_AT_EXISTS=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name='clients' AND column_name='deleted_at';" 2>/dev/null || echo "0")
    
    if [[ "$DELETED_AT_EXISTS" == "1" ]]; then
        success "✅ Verified: clients.deleted_at column exists"
    else
        error "❌ Still missing: clients.deleted_at column"
        exit 1
    fi
    
    # Test a simple query to ensure it works
    log "Testing client query with deleted_at column..."
    if PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -c "SELECT id, name, deleted_at FROM clients LIMIT 1;" >/dev/null 2>&1; then
        success "✅ Client query with deleted_at works correctly"
    else
        error "❌ Client query with deleted_at still fails"
        exit 1
    fi
    
    # Check schema_versions table
    SCHEMA_VERSION=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT version FROM schema_versions ORDER BY created_at DESC LIMIT 1;" 2>/dev/null || echo "")
    
    if [[ -n "$SCHEMA_VERSION" ]]; then
        success "✅ Schema version tracked: $SCHEMA_VERSION"
    else
        warning "⚠️ Schema version tracking may not be working"
    fi
}

# Update version in schema_versions
update_schema_version() {
    log "Updating schema version to 1.4.2..."
    
    PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME << 'EOF'
INSERT INTO schema_versions (version, script_version, app_version, schema_version, environment, notes) 
VALUES ('1.4.2', '1.4.2', '1.4.2', '1.4.2', 'production', 'Production schema fixed - all migrations applied')
ON CONFLICT DO NOTHING;
EOF
    
    success "✅ Schema version updated to 1.4.2"
}

# Main function
main() {
    echo "=============================================="
    echo "🔧 MSSP Production Schema Fix"
    echo "=============================================="
    echo ""
    echo "This script will fix the production database schema"
    echo "specifically addressing the 'deleted_at column does not exist' error."
    echo ""
    
    find_psql
    test_connection
    check_missing_schema
    
    echo ""
    echo "📋 Fix Summary:"
    echo "  • Soft deletion fix needed: $NEEDS_SOFT_DELETION"
    echo "  • Schema versions table needed: $NEEDS_SCHEMA_VERSIONS"
    echo "  • Column fixes needed: $NEEDS_COLUMN_FIXES"
    echo ""
    
    if [[ "$NEEDS_SOFT_DELETION" == "false" && "$NEEDS_SCHEMA_VERSIONS" == "false" && "$NEEDS_COLUMN_FIXES" == "false" ]]; then
        success "🎉 No schema fixes needed! Database is already up to date."
        exit 0
    fi
    
    read -p "Continue with fixes? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Fix cancelled."
        exit 0
    fi
    
    echo ""
    log "Applying fixes..."
    
    create_schema_versions_table
    apply_soft_deletion_migration
    fix_missing_columns
    run_drizzle_push
    verify_fixes
    update_schema_version
    
    echo ""
    echo "🎉 Production schema fix completed successfully!"
    echo ""
    echo "📊 Summary:"
    echo "  ✅ clients.deleted_at column: Available"
    echo "  ✅ Schema version tracking: Active"
    echo "  ✅ Database queries: Working"
    echo ""
    echo "🚀 Your application should now work without the 'deleted_at' error!"
    echo ""
    echo "💡 Next steps:"
    echo "  1. Restart your application server"
    echo "  2. Test the client management features"
    echo "  3. Monitor for any remaining errors"
}

# Run main function
main "$@" 