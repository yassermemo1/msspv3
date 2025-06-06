#!/bin/bash

echo "🔥 SIMPLE PRODUCTION DATABASE REBUILD"
echo "====================================="
echo "Dropping and rebuilding mssp_production database"
echo ""

# Database configuration
DB_NAME="mssp_production"
DB_USER="mssp_user"
DB_PASSWORD="12345678"

# PostgreSQL paths
PSQL_PATH="/usr/pgsql-16/bin/psql"
PG_DUMP_PATH="/usr/pgsql-16/bin/pg_dump"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# Confirm rebuild
read -p "Type 'YES' to rebuild $DB_NAME completely: " confirm
if [ "$confirm" != "YES" ]; then
    error "Cancelled"
fi

echo ""
log "Starting rebuild..."

# Step 1: Terminate all connections to the database
log "1. Terminating active connections to $DB_NAME..."
sudo -u postgres $PSQL_PATH -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
" || log "No active connections to terminate"
success "Connections terminated"

# Step 2: Drop database
log "2. Dropping database $DB_NAME..."
sudo -u postgres $PSQL_PATH -c "DROP DATABASE IF EXISTS $DB_NAME;" || error "Failed to drop database"
success "Database dropped"

# Step 3: Create fresh database
log "3. Creating fresh database..."
sudo -u postgres $PSQL_PATH -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || error "Failed to create database"
success "Database created"

# Step 4: Grant permissions
log "4. Setting permissions..."
sudo -u postgres $PSQL_PATH -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres $PSQL_PATH -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
sudo -u postgres $PSQL_PATH -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
success "Permissions set"

# Step 5: Apply schema with Drizzle
log "5. Applying schema..."
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

if [ ! -d "node_modules" ]; then
    log "Installing dependencies..."
    npm install || error "Failed to install dependencies"
fi

log "Running Drizzle schema push..."
npx drizzle-kit push --force || error "Schema push failed"
success "Schema applied"

# Step 6: Setup page permissions (RBAC)
log "6. Setting up page permissions..."
node setup-page-permissions.cjs || log "Page permissions setup had issues (continuing...)"
success "Page permissions configured"

# Step 7: Create admin user
log "7. Creating admin user..."
node create-admin-user.cjs admin@mssp.local admin123 admin System Administrator || error "Failed to create admin user"
success "Admin user created"

# Step 8: Import client data
log "8. Importing client data..."
if [ -f "bulk-insert-clients.cjs" ]; then
    node bulk-insert-clients.cjs || log "Client import had issues (continuing...)"
else
    log "No client data file found"
fi

# Step 9: Insert essential settings
log "9. Setting up essentials..."
sudo -u postgres $PSQL_PATH -d $DB_NAME -c "
INSERT INTO company_settings (id, company_name) VALUES (1, 'MSSP Client Manager') ON CONFLICT (id) DO NOTHING;
" || log "Settings insert had issues (continuing...)"

# Step 10: Final report
log "10. Generating report..."

# Get counts
TABLE_COUNT=$(sudo -u postgres $PSQL_PATH -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
USERS_COUNT=$(sudo -u postgres $PSQL_PATH -d $DB_NAME -t -c "SELECT count(*) FROM users;" | tr -d ' ')
CLIENTS_COUNT=$(sudo -u postgres $PSQL_PATH -d $DB_NAME -t -c "SELECT count(*) FROM clients;" | tr -d ' ')

# Test short_name column
SHORT_NAME_OK=$(sudo -u postgres $PSQL_PATH -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'short_name';" | tr -d ' ')

echo ""
echo "🎉 REBUILD COMPLETED!"
echo "===================="
echo "Database: $DB_NAME"
echo "Tables: $TABLE_COUNT"
echo "Users: $USERS_COUNT" 
echo "Clients: $CLIENTS_COUNT"
echo ""

if [ "$SHORT_NAME_OK" -eq "1" ]; then
    success "short_name column: EXISTS ✓"
else
    error "short_name column: MISSING ✗"
fi

# Test query
log "Testing query..."
if sudo -u postgres $PSQL_PATH -d $DB_NAME -c "SELECT id, name, short_name FROM clients LIMIT 3;" >/dev/null 2>&1; then
    success "Client queries: WORKING ✓"
else
    error "Client queries: FAILED ✗"
fi

echo ""
echo "🔐 Login: admin / admin123"
echo "🔗 Database: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
success "DONE! Restart your app and test." 