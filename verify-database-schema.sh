#!/bin/bash

# MSSP Client Manager - Database Schema Verification Script
# Verifies that all required tables and migrations are in place

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Load database configuration
load_config() {
    if [ ! -f ~/.mssp_db_config ]; then
        error "Database configuration not found!"
        echo "Please run ./setup-database.sh first."
        exit 1
    fi
    
    source ~/.mssp_db_config
    log "Loaded database configuration"
    info "Database: $DB_NAME"
    info "User: $DB_USER"
}

# Find PostgreSQL command
find_psql() {
    PSQL_CMD=""
    
    # Check for PostgreSQL 16 first (user's version)
    if [ -f "/usr/pgsql-16/bin/psql" ]; then
        PSQL_CMD="/usr/pgsql-16/bin/psql"
        PG_VERSION="16"
        info "Found PostgreSQL 16 at: /usr/pgsql-16/bin"
    elif [ -f "/opt/postgresql/16/bin/psql" ]; then
        PSQL_CMD="/opt/postgresql/16/bin/psql"
        PG_VERSION="16"
        info "Found PostgreSQL 16 at: /opt/postgresql/16/bin"
    fi
    
    # Try other PostgreSQL versions as fallback
    if [ -z "$PSQL_CMD" ]; then
        for version in 15 14 13 12 11 10; do
            if command -v /usr/pgsql-${version}/bin/psql >/dev/null 2>&1; then
                PSQL_CMD="/usr/pgsql-${version}/bin/psql"
                PG_VERSION=$version
                break
            fi
        done
    fi
    
    if [ -z "$PSQL_CMD" ]; then
        error "PostgreSQL client not found!"
        exit 1
    fi
    
    info "Using PostgreSQL client: $PSQL_CMD"
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    
    if PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" >/dev/null 2>&1; then
        log "✅ Database connection successful"
    else
        error "❌ Database connection failed!"
        echo "Please check your database configuration and ensure PostgreSQL is running."
        exit 1
    fi
}

# Check essential tables
check_essential_tables() {
    log "Checking essential database tables..."
    
    ESSENTIAL_TABLES=(
        "users"
        "clients"
        "client_contacts"
        "contracts"
        "services"
        "service_scopes"
        "proposals"
        "hardware_assets"
        "financial_transactions"
        "audit_logs"
        "change_history"
        "documents"
        "document_versions"
        "company_settings"
        "user_settings"
        "certificates_of_compliance"
        "service_authorization_forms"
        "external_systems"
        "client_external_mappings"
        "data_sources"
        "data_source_mappings"
        "search_history"
        "saved_searches"
        "security_events"
        "data_access_logs"
    )
    
    MISSING_TABLES=()
    EXISTING_TABLES=()
    
    for table in "${ESSENTIAL_TABLES[@]}"; do
        table_exists=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$table'" 2>/dev/null || echo "0")
        
        if [ "$table_exists" -eq 0 ]; then
            MISSING_TABLES+=("$table")
        else
            EXISTING_TABLES+=("$table")
        fi
    done
    
    info "Found ${#EXISTING_TABLES[@]} essential tables"
    
    if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
        log "✅ All essential tables are present"
    else
        warning "❌ Missing tables: ${MISSING_TABLES[*]}"
        echo ""
        echo "Missing tables indicate incomplete migrations."
        echo "Run the following to fix:"
        echo "  ./setup-database.sh"
        return 1
    fi
}

# Check table relationships and constraints
check_relationships() {
    log "Checking foreign key relationships..."
    
    CONSTRAINT_COUNT=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_schema = 'public'
    " 2>/dev/null || echo "0")
    
    if [ "$CONSTRAINT_COUNT" -gt 20 ]; then
        log "✅ Foreign key constraints look good ($CONSTRAINT_COUNT constraints)"
    else
        warning "⚠️  Only $CONSTRAINT_COUNT foreign key constraints found"
        info "This might indicate incomplete schema setup"
    fi
}

# Check indexes
check_indexes() {
    log "Checking database indexes..."
    
    INDEX_COUNT=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM pg_indexes 
        WHERE schemaname = 'public'
    " 2>/dev/null || echo "0")
    
    if [ "$INDEX_COUNT" -gt 15 ]; then
        log "✅ Database indexes look good ($INDEX_COUNT indexes)"
    else
        warning "⚠️  Only $INDEX_COUNT indexes found"
        info "Performance might be impacted with missing indexes"
    fi
}

# Check if drizzle migrations table exists
check_drizzle_migration_table() {
    log "Checking Drizzle migration tracking..."
    
    DRIZZLE_TABLE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_name = '__drizzle_migrations'
    " 2>/dev/null || echo "0")
    
    if [ "$DRIZZLE_TABLE_EXISTS" -eq 1 ]; then
        MIGRATION_COUNT=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
            SELECT COUNT(*) 
            FROM __drizzle_migrations
        " 2>/dev/null || echo "0")
        
        log "✅ Drizzle migrations table found ($MIGRATION_COUNT migrations applied)"
    else
        info "Drizzle migrations table not found (manual SQL migrations used)"
    fi
}

# Verify sample data or default records
check_default_data() {
    log "Checking for essential default data..."
    
    # Check for admin user
    ADMIN_USER_EXISTS=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM users 
        WHERE role = 'admin'
    " 2>/dev/null || echo "0")
    
    if [ "$ADMIN_USER_EXISTS" -gt 0 ]; then
        log "✅ Admin user found"
    else
        warning "⚠️  No admin user found"
        info "You may need to create an admin user for first login"
    fi
    
    # Check for company settings
    COMPANY_SETTINGS_EXISTS=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM company_settings
    " 2>/dev/null || echo "0")
    
    if [ "$COMPANY_SETTINGS_EXISTS" -gt 0 ]; then
        log "✅ Company settings found"
    else
        info "No company settings found (will be created on first app start)"
    fi
}

# Database size and performance info
show_database_info() {
    log "Database information summary..."
    
    # Total tables
    TOTAL_TABLES=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    " 2>/dev/null || echo "0")
    
    # Database size
    DB_SIZE=$(PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -tAc "
        SELECT pg_size_pretty(pg_database_size('$DB_NAME'))
    " 2>/dev/null || echo "Unknown")
    
    echo ""
    echo "📊 Database Summary:"
    echo "  Total Tables: $TOTAL_TABLES"
    echo "  Database Size: $DB_SIZE"
    echo "  Indexes: $INDEX_COUNT"
    echo "  Foreign Keys: $CONSTRAINT_COUNT"
    echo ""
}

# Test basic CRUD operations
test_basic_operations() {
    log "Testing basic database operations..."
    
    # Try to insert and delete a test record
    if PGPASSWORD="$DB_PASSWORD" $PSQL_CMD -h localhost -U $DB_USER -d $DB_NAME -c "
        INSERT INTO audit_logs (action, entity_type, description, category) 
        VALUES ('test', 'verification', 'Database verification test', 'system');
        DELETE FROM audit_logs WHERE action = 'test' AND entity_type = 'verification';
    " >/dev/null 2>&1; then
        log "✅ Basic CRUD operations working"
    else
        warning "⚠️  Basic CRUD operations failed"
        info "Database might have permission issues"
    fi
}

# Main verification function
main() {
    echo "=============================================="
    echo "🔍 MSSP Client Manager - Schema Verification"
    echo "=============================================="
    echo ""
    
    load_config
    find_psql
    test_connection
    
    echo ""
    log "Running comprehensive schema verification..."
    echo ""
    
    VERIFICATION_PASSED=true
    
    # Run all checks
    if ! check_essential_tables; then
        VERIFICATION_PASSED=false
    fi
    
    check_relationships
    check_indexes
    check_drizzle_migration_table
    check_default_data
    test_basic_operations
    
    show_database_info
    
    if [ "$VERIFICATION_PASSED" = true ]; then
        echo "🎉 DATABASE SCHEMA VERIFICATION PASSED!"
        echo ""
        echo "✅ Your database is properly configured and ready for use."
        echo ""
        echo "Connection string:"
        echo "  postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
    else
        echo ""
        echo "❌ DATABASE SCHEMA VERIFICATION FAILED!"
        echo ""
        echo "Some issues were found with your database schema."
        echo "Please run ./setup-database.sh to fix the issues."
        exit 1
    fi
}

# Run main function
main "$@" 