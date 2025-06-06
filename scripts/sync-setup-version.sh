#!/bin/bash

# MSSP Client Manager - Version Sync Script for Database Setup
# This script ensures setup-database.sh version stays in sync with package.json

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
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

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Define file paths
PACKAGE_JSON="$PROJECT_ROOT/package.json"
SETUP_DATABASE="$PROJECT_ROOT/setup-database.sh"

log "🔄 Syncing setup-database.sh version with package.json..."

# Check if files exist
if [ ! -f "$PACKAGE_JSON" ]; then
    error "package.json not found at: $PACKAGE_JSON"
    exit 1
fi

if [ ! -f "$SETUP_DATABASE" ]; then
    error "setup-database.sh not found at: $SETUP_DATABASE"
    exit 1
fi

# Extract version from package.json
APP_VERSION=$(grep '"version":' "$PACKAGE_JSON" | sed 's/.*"version": *"\([^"]*\)".*/\1/')

if [ -z "$APP_VERSION" ]; then
    error "Could not extract version from package.json"
    exit 1
fi

info "Current app version: $APP_VERSION"

# Extract current setup script version
SETUP_VERSION=$(grep 'SCRIPT_VERSION=' "$SETUP_DATABASE" | head -1 | sed 's/.*SCRIPT_VERSION="\([^"]*\)".*/\1/')

if [ -z "$SETUP_VERSION" ]; then
    error "Could not extract SCRIPT_VERSION from setup-database.sh"
    exit 1
fi

info "Current setup script version: $SETUP_VERSION"

# Check if versions match
if [ "$APP_VERSION" = "$SETUP_VERSION" ]; then
    info "✅ Versions already match ($APP_VERSION)"
    exit 0
fi

warning "Version mismatch detected!"
warning "  App version: $APP_VERSION"
warning "  Setup script version: $SETUP_VERSION"

log "Updating setup-database.sh versions..."

# Create backup
cp "$SETUP_DATABASE" "$SETUP_DATABASE.backup.$(date +%Y%m%d_%H%M%S)"
info "Backup created: $SETUP_DATABASE.backup.$(date +%Y%m%d_%H%M%S)"

# Update versions in setup-database.sh
sed -i.tmp "s/SCRIPT_VERSION=\"[^\"]*\"/SCRIPT_VERSION=\"$APP_VERSION\"/" "$SETUP_DATABASE"
sed -i.tmp "s/REQUIRED_APP_VERSION=\"[^\"]*\"/REQUIRED_APP_VERSION=\"$APP_VERSION\"/" "$SETUP_DATABASE"
sed -i.tmp "s/DB_SCHEMA_VERSION=\"[^\"]*\"/DB_SCHEMA_VERSION=\"$APP_VERSION\"/" "$SETUP_DATABASE"

# Remove temporary file
rm -f "$SETUP_DATABASE.tmp"

# Verify changes
NEW_SCRIPT_VERSION=$(grep 'SCRIPT_VERSION=' "$SETUP_DATABASE" | head -1 | sed 's/.*SCRIPT_VERSION="\([^"]*\)".*/\1/')
NEW_REQUIRED_VERSION=$(grep 'REQUIRED_APP_VERSION=' "$SETUP_DATABASE" | head -1 | sed 's/.*REQUIRED_APP_VERSION="\([^"]*\)".*/\1/')
NEW_SCHEMA_VERSION=$(grep 'DB_SCHEMA_VERSION=' "$SETUP_DATABASE" | head -1 | sed 's/.*DB_SCHEMA_VERSION="\([^"]*\)".*/\1/')

if [ "$NEW_SCRIPT_VERSION" = "$APP_VERSION" ] && [ "$NEW_REQUIRED_VERSION" = "$APP_VERSION" ] && [ "$NEW_SCHEMA_VERSION" = "$APP_VERSION" ]; then
    log "✅ Successfully updated setup-database.sh versions to $APP_VERSION"
    info "Updated versions:"
    info "  SCRIPT_VERSION: $NEW_SCRIPT_VERSION"
    info "  REQUIRED_APP_VERSION: $NEW_REQUIRED_VERSION"
    info "  DB_SCHEMA_VERSION: $NEW_SCHEMA_VERSION"
else
    error "❌ Failed to update versions correctly"
    error "Expected: $APP_VERSION"
    error "Got SCRIPT_VERSION: $NEW_SCRIPT_VERSION"
    error "Got REQUIRED_APP_VERSION: $NEW_REQUIRED_VERSION"
    error "Got DB_SCHEMA_VERSION: $NEW_SCHEMA_VERSION"
    exit 1
fi

log "🎉 Version sync completed successfully!" 