#!/bin/bash

# MSSP Client Manager - Schema Change Detection Script
# Automatically detects if database schema changes require setup-database.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[SCHEMA-CHECK] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

schema_change() {
    echo -e "${PURPLE}[SCHEMA CHANGE] $1${NC}"
}

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Define file paths
PACKAGE_JSON="$PROJECT_ROOT/package.json"
SETUP_DATABASE="$PROJECT_ROOT/setup-database.sh"
CHANGELOG="$PROJECT_ROOT/SCHEMA_CHANGELOG.md"
MIGRATIONS_DIR="$PROJECT_ROOT/migrations"

# Function to get current app version
get_app_version() {
    if [[ -f "$PACKAGE_JSON" ]]; then
        node -p "require('$PACKAGE_JSON').version" 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

# Function to get database schema version from setup script
get_setup_script_version() {
    if [[ -f "$SETUP_DATABASE" ]]; then
        grep "^DB_SCHEMA_VERSION=" "$SETUP_DATABASE" | cut -d'"' -f2 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

# Function to check if database exists and get its version
check_database_version() {
    local db_url="${DATABASE_URL:-postgresql://mssp_user:devpass123@localhost:5432/mssp_production}"
    
    # Try to connect and get schema version using correct column name
    local db_version=$(PGPASSWORD="${POSTGRES_PASSWORD:-devpass123}" psql "$db_url" -t -c "SELECT version FROM schema_versions ORDER BY created_at DESC LIMIT 1;" 2>/dev/null | xargs || echo "")
    
    if [[ -z "$db_version" ]]; then
        warning "Cannot determine database schema version (database may not exist or schema_versions table missing)"
        return 1
    fi
    
    echo "$db_version"
    return 0
}

# Function to check for recent schema changes in git history
check_recent_schema_changes() {
    local days="${1:-14}"
    local db_version="${2:-}"
    local app_version="${3:-}"
    
    # If database version matches app version, then all historical changes have been applied
    if [[ -n "$db_version" && "$db_version" == "$app_version" ]]; then
        info "Database version ($db_version) matches app version ($app_version) - all changes applied"
        return 0
    fi
    
    # Get commits from the last N days that might affect database schema
    local schema_commits=$(git log --oneline --since="$days days ago" --grep="\[DB REQUIRED\]" 2>/dev/null || echo "")
    
    # Get files changed in recent commits (excluding documentation-only commits)
    local file_changes=$(git log --name-only --pretty=format: --since="$days days ago" 2>/dev/null | grep -E "(migrations/.*\.(sql|ts|js)$|shared/schema\.ts$|drizzle\.config\.ts$)" | grep -v "^migrations/meta/" || echo "")
    
    # Filter out commits that are only documentation, version syncs, or fixes without actual schema changes
    if [[ -n "$schema_commits" ]]; then
        # Check if any commits actually require database changes (have [DB REQUIRED] tag)
        local actual_db_commits=$(echo "$schema_commits" | grep -E "\[DB REQUIRED\]" || echo "")
        
        if [[ -n "$actual_db_commits" ]]; then
            schema_change "Recent database-required changes detected!"
            echo ""
            echo "📝 Commits requiring database setup:"
            echo "$actual_db_commits" | sed 's/^/  • /'
            return 1
        fi
    fi
    
    # Check for actual schema file changes (not just documentation)
    if [[ -n "$file_changes" ]]; then
        # Check if these are new migration files or actual schema changes
        local significant_changes=$(echo "$file_changes" | grep -E "(migrations/[0-9]+.*\.(sql|ts|js)$|shared/schema\.ts$)" || echo "")
        
        if [[ -n "$significant_changes" ]]; then
            schema_change "Recent schema file changes detected!"
            echo ""
            echo "📁 Schema files modified:"
            echo "$significant_changes" | sed 's/^/  • /'
            return 1
        fi
    fi
    
    return 0  # No significant schema changes
}

# Function to analyze migration files
check_migration_files() {
    local db_version="${1:-}"
    local app_version="${2:-}"
    
    if [[ -d "$MIGRATIONS_DIR" ]]; then
        local migration_count=$(find "$MIGRATIONS_DIR" -name "*.sql" -o -name "*.ts" -o -name "*.js" | wc -l)
        info "Found $migration_count migration files"
        
        # If database version matches app version, then all migrations have been applied
        if [[ -n "$db_version" && "$db_version" == "$app_version" ]]; then
            info "Database version ($db_version) matches app version - all migrations applied"
            return 0
        fi
        
        # Check for recent migration files (modified in last 30 days)
        local recent_migrations=$(find "$MIGRATIONS_DIR" -name "*.sql" -o -name "*.ts" -o -name "*.js" -mtime -30 2>/dev/null || echo "")
        
        if [[ -n "$recent_migrations" ]]; then
            schema_change "Recent migration files detected:"
            echo "$recent_migrations" | sed 's/^/  • /'
            return 1
        fi
    else
        info "No migrations directory found"
    fi
    
    return 0
}

# Main detection logic
main() {
    if [[ "$QUIET" != true ]]; then
        echo "========================================"
        echo "🔍 MSSP Schema Change Detection"
        echo "========================================"
        echo ""
        log "Starting schema change detection..."
        echo ""
    fi
    
    # Get versions
    local app_version=$(get_app_version)
    local setup_version=$(get_setup_script_version)
    
    if [[ "$QUIET" != true ]]; then
        info "Application version: $app_version"
        info "Setup script version: $setup_version"
    fi
    
    # Check version synchronization
    if [[ "$app_version" != "$setup_version" ]]; then
        schema_change "Version mismatch detected!"
        echo "  App: $app_version"
        echo "  Setup: $setup_version"
        echo ""
        echo "🚨 DATABASE SETUP REQUIRED!"
        echo "Run: ./setup-database.sh"
        return 1
    fi
    
    # Try to get database version
    if [[ "$QUIET" != true ]]; then
        echo ""
        info "Checking database schema version..."
    fi
    local db_version=""
    if db_version=$(check_database_version); then
        if [[ "$QUIET" != true ]]; then
            info "Database schema version: $db_version"
        fi
        
        if [[ "$app_version" != "$db_version" ]]; then
            schema_change "Database schema version mismatch!"
            echo "  App: $app_version"
            echo "  Database: $db_version"
            echo ""
            echo "🚨 DATABASE SETUP REQUIRED!"
            echo "Run: ./setup-database.sh"
            return 1
        fi
    else
        if [[ "$QUIET" != true ]]; then
            warning "Could not determine database version"
        fi
    fi
    
    # Check for recent schema changes in git
    if [[ "$QUIET" != true ]]; then
        echo ""
        info "Checking recent commits for schema changes..."
    fi
    if check_recent_schema_changes 14 "$db_version" "$app_version"; then
        if [[ "$QUIET" != true ]]; then
            info "No recent schema-related commits found"
        fi
    else
        echo ""
        echo "🚨 DATABASE SETUP MAY BE REQUIRED!"
        echo "Run: ./setup-database.sh"
        return 1
    fi
    
    # Check migration files
    if [[ "$QUIET" != true ]]; then
        echo ""
        info "Checking migration files..."
    fi
    if check_migration_files "$db_version" "$app_version"; then
        if [[ "$QUIET" != true ]]; then
            info "No recent migration files found"
        fi
    else
        echo ""
        echo "🚨 DATABASE SETUP MAY BE REQUIRED!"
        echo "Run: ./setup-database.sh"
        return 1
    fi
    
    # All checks passed
    if [[ "$QUIET" != true ]]; then
        echo ""
        success "✅ No database setup required!"
        success "All versions are synchronized ($app_version)"
        echo ""
        echo "📋 Summary:"
        echo "  • Application version: $app_version"
        echo "  • Database setup version: $setup_version"
        if [[ -n "$db_version" ]]; then
            echo "  • Database schema version: $db_version"
        fi
        echo "  • No recent schema changes detected"
        echo ""
        echo "You can proceed with standard deployment:"
        echo "  npm run build && npm run start"
    fi
    
    return 0
}

# Show usage help
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -q, --quiet         Minimal output (exit code only)"
    echo "  -v, --verbose       Detailed output"
    echo "  --days N            Check last N days for changes (default: 14)"
    echo ""
    echo "Exit codes:"
    echo "  0 - No database setup required"
    echo "  1 - Database setup required"
    echo "  2 - Error in detection"
}

# Parse command line options
QUIET=false
VERBOSE=false
DAYS=14

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --days)
            DAYS="$2"
            shift 2
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 2
            ;;
    esac
done

# Run main function
if [[ "$QUIET" == true ]]; then
    main >/dev/null 2>&1
    exit $?
else
    main
    exit $?
fi 