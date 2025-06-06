#!/bin/bash

echo "🔥 COMPLETE PRODUCTION DATABASE REBUILD"
echo "========================================"
echo "This will COMPLETELY DROP and REBUILD your production database"
echo "All existing data will be LOST and replaced with fresh schema + sample data"
echo ""

# Production database configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mssp_production"
DB_USER="mssp_user"
DB_PASSWORD="12345678"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

echo "🚨 WARNING: This will PERMANENTLY DELETE all data in $DB_NAME"
echo "📊 Current database will be completely wiped and rebuilt from scratch"
echo ""

# Prompt for confirmation
read -p "⚠️  Are you ABSOLUTELY SURE you want to proceed? Type 'REBUILD' to confirm: " confirm
if [ "$confirm" != "REBUILD" ]; then
    error "Operation cancelled for safety"
fi

echo ""
log "Starting complete database rebuild..."

# Step 1: Create backup of current database (just in case)
echo ""
log "1. 💾 Creating emergency backup..."
BACKUP_FILE="emergency_backup_before_rebuild_$(date +%Y%m%d_%H%M%S).sql"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_FILE 2>/dev/null || true

if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    success "Emergency backup created: $BACKUP_FILE"
else
    warning "Could not create backup (database might not exist yet)"
    rm -f "$BACKUP_FILE" 2>/dev/null
fi

# Step 2: Drop all connections to the database
echo ""
log "2. 🔌 Terminating all database connections..."
psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
" 2>/dev/null || warning "Could not terminate connections (database might not exist)"

# Step 3: Drop the entire database
echo ""
log "3. 🗑️  Dropping database $DB_NAME..."
psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" || error "Failed to drop database"
success "Database $DB_NAME dropped successfully"

# Step 4: Create fresh database
echo ""
log "4. 🏗️  Creating fresh database $DB_NAME..."
psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || error "Failed to create database"
success "Fresh database $DB_NAME created"

# Step 5: Grant all privileges
echo ""
log "5. 🔑 Setting up database permissions..."
psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || warning "Could not grant privileges"
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;" || warning "Could not grant schema privileges"
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;" || warning "Could not grant table privileges"
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;" || warning "Could not grant sequence privileges"
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;" || warning "Could not set default table privileges"
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;" || warning "Could not set default sequence privileges"
success "Database permissions configured"

# Step 6: Apply fresh schema using Drizzle
echo ""
log "6. 📋 Applying latest schema using Drizzle..."

# Set DATABASE_URL for Drizzle
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

# Check if we have node_modules
if [ ! -d "node_modules" ]; then
    log "Installing dependencies..."
    npm install || error "Failed to install dependencies"
fi

# Apply schema using Drizzle
log "Running Drizzle schema push..."
npx drizzle-kit push --force || error "Failed to apply schema with Drizzle"
success "Latest schema applied successfully"

# Step 7: Verify schema was applied
echo ""
log "7. ✅ Verifying schema..."
TABLE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLE_COUNT" -gt 40 ]; then
    success "Schema verification passed ($TABLE_COUNT tables created)"
else
    error "Schema verification failed (only $TABLE_COUNT tables found, expected 40+)"
fi

# Check if specific critical tables exist
CRITICAL_TABLES=("users" "clients" "contracts" "services" "audit_logs" "company_settings")
for table in "${CRITICAL_TABLES[@]}"; do
    TABLE_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_name = '$table';" | tr -d ' ')
    if [ "$TABLE_EXISTS" -eq "1" ]; then
        success "✓ $table table created"
    else
        error "✗ $table table missing"
    fi
done

# Step 8: Import sample data
echo ""
log "8. 📊 Importing sample data..."

# Create admin user
log "Creating admin user..."
node create-admin-user.cjs || error "Failed to create admin user"
success "Admin user created"

# Import clients if bulk data exists
if [ -f "bulk-insert-clients.cjs" ]; then
    log "Importing client data..."
    node bulk-insert-clients.cjs || warning "Could not import client data"
else
    warning "No bulk client data file found"
fi

# Insert essential company settings
log "Setting up company settings..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
INSERT INTO company_settings (
    id, company_name, currency, timezone, primary_color, secondary_color
) VALUES (
    1, 'MSSP Client Manager', 'USD', 'America/New_York', '#3b82f6', '#64748b'
) ON CONFLICT (id) DO NOTHING;" || warning "Could not insert company settings"

# Insert schema version
log "Recording schema version..."
APP_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.6.0")
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
INSERT INTO schema_versions (
    version, description, environment, script_version, app_version, schema_version
) VALUES (
    '$APP_VERSION', 
    'Fresh database rebuild', 
    'production',
    '$APP_VERSION',
    '$APP_VERSION', 
    '$APP_VERSION'
);" || warning "Could not record schema version"

success "Sample data imported"

# Step 9: Final verification
echo ""
log "9. 🔍 Final verification..."

# Count records in key tables
USERS_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM users;" | tr -d ' ')
CLIENTS_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM clients;" | tr -d ' ')
SETTINGS_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM company_settings;" | tr -d ' ')

log "Database statistics:"
log "   Tables: $TABLE_COUNT"
log "   Users: $USERS_COUNT"
log "   Clients: $CLIENTS_COUNT"  
log "   Settings: $SETTINGS_COUNT"

# Test short_name column specifically
SHORT_NAME_TEST=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'short_name';" | tr -d ' ')

if [ "$SHORT_NAME_TEST" -eq "1" ]; then
    success "✓ short_name column exists in clients table"
else
    error "✗ short_name column missing from clients table"
fi

# Test a query that was failing before
log "Testing application queries..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT id, name, short_name, industry, status FROM clients LIMIT 3;" >/dev/null 2>&1 && success "✓ Client queries working" || error "✗ Client queries failing"

# Step 10: Cleanup and summary
echo ""
log "10. 🧹 Cleanup and summary..."

# Build application to ensure everything works
if [ -f "package.json" ]; then
    log "Building application..."
    npm run build || warning "Application build had issues"
fi

echo ""
echo "🎉 DATABASE REBUILD COMPLETED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "📊 Summary:"
echo "   • Database: $DB_NAME (completely rebuilt)"
echo "   • Tables: $TABLE_COUNT (fresh schema)"
echo "   • Users: $USERS_COUNT"
echo "   • Clients: $CLIENTS_COUNT"
if [ -f "$BACKUP_FILE" ]; then
echo "   • Backup: $BACKUP_FILE"
fi
echo ""
echo "🔐 Login Credentials:"
echo "   • Username: admin"
echo "   • Password: admin123"
echo "   • Email: admin@mssp.local"
echo ""
echo "🚀 Next Steps:"
echo "   1. Restart your application: npm run start:production"
echo "   2. Test login at: http://localhost:5001"
echo "   3. Verify all features work correctly"
echo "   4. Change admin password immediately"
echo ""
echo "✅ Your production database is now completely fresh and up-to-date!"

# Display connection string
echo ""
echo "🔗 Database Connection:"
echo "   postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" 