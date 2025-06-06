#!/bin/bash

# MSSP Client Manager - Version Verification Script
# Checks if all versions are synchronized across project files

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[VERIFY] $1${NC}"
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

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Define file paths
PACKAGE_JSON="$PROJECT_ROOT/package.json"
SETUP_DATABASE="$PROJECT_ROOT/setup-database.sh"

log "🔍 Verifying version synchronization across project files..."

# Check if files exist
if [ ! -f "$PACKAGE_JSON" ]; then
    error "package.json not found at: $PACKAGE_JSON"
    exit 1
fi

if [ ! -f "$SETUP_DATABASE" ]; then
    error "setup-database.sh not found at: $SETUP_DATABASE"
    exit 1
fi

# Extract versions
APP_VERSION=$(grep '"version":' "$PACKAGE_JSON" | sed 's/.*"version": *"\([^"]*\)".*/\1/')
SCRIPT_VERSION=$(grep 'SCRIPT_VERSION=' "$SETUP_DATABASE" | head -1 | sed 's/.*SCRIPT_VERSION="\([^"]*\)".*/\1/')
REQUIRED_VERSION=$(grep 'REQUIRED_APP_VERSION=' "$SETUP_DATABASE" | head -1 | sed 's/.*REQUIRED_APP_VERSION="\([^"]*\)".*/\1/')
SCHEMA_VERSION=$(grep 'DB_SCHEMA_VERSION=' "$SETUP_DATABASE" | head -1 | sed 's/.*DB_SCHEMA_VERSION="\([^"]*\)".*/\1/')

# Display current versions
echo ""
info "📦 Current Versions:"
info "  package.json:           $APP_VERSION"
info "  setup-database.sh:"
info "    SCRIPT_VERSION:       $SCRIPT_VERSION"
info "    REQUIRED_APP_VERSION: $REQUIRED_VERSION"
info "    DB_SCHEMA_VERSION:    $SCHEMA_VERSION"
echo ""

# Check for version mismatches
VERSIONS_MATCH=true

if [ "$APP_VERSION" != "$SCRIPT_VERSION" ]; then
    error "❌ Version mismatch: package.json ($APP_VERSION) != SCRIPT_VERSION ($SCRIPT_VERSION)"
    VERSIONS_MATCH=false
fi

if [ "$APP_VERSION" != "$REQUIRED_VERSION" ]; then
    error "❌ Version mismatch: package.json ($APP_VERSION) != REQUIRED_APP_VERSION ($REQUIRED_VERSION)"
    VERSIONS_MATCH=false
fi

if [ "$APP_VERSION" != "$SCHEMA_VERSION" ]; then
    error "❌ Version mismatch: package.json ($APP_VERSION) != DB_SCHEMA_VERSION ($SCHEMA_VERSION)"
    VERSIONS_MATCH=false
fi

# Display results
echo ""
if [ "$VERSIONS_MATCH" = true ]; then
    success "✅ All versions are synchronized ($APP_VERSION)"
    log "🎯 Version tracking is properly configured"
    
    # Additional checks
    if grep -q "check_app_version" "$SETUP_DATABASE"; then
        info "✅ Version checking functions are present"
    else
        warning "⚠️  Version checking functions may be missing"
    fi
    
    if grep -q "save_version_info" "$SETUP_DATABASE"; then
        info "✅ Version saving functions are present"
    else
        warning "⚠️  Version saving functions may be missing"
    fi
    
    echo ""
    log "📋 Database setup script is ready for version v$APP_VERSION"
    
    exit 0
else
    error "❌ Version synchronization failed!"
    echo ""
    log "🔧 To fix this, run: npm run sync-setup-version"
    echo ""
    exit 1
fi 