#!/bin/bash

# Fix RedHat Database Setup Script for PostgreSQL 16
# This script fixes database connection issues on RedHat systems with PostgreSQL 16

set -e

# PostgreSQL 16 specific paths for RedHat
export PATH=/opt/postgresql/16/bin:/usr/pgsql-16/bin:$PATH

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

log "🔧 Fixing RedHat Database Setup for PostgreSQL 16..."

# 1. Check PostgreSQL 16 status
log "1. Checking PostgreSQL 16 status..."

# Try different possible service names for PostgreSQL 16
PG_SERVICE=""
for service in postgresql-16 postgresql16 postgresql; do
    if systemctl list-units --type=service | grep -q "^  $service.service"; then
        PG_SERVICE="$service"
        break
    fi
done

if [ -z "$PG_SERVICE" ]; then
    error "PostgreSQL 16 service not found. Please check your installation."
    error "Try: sudo systemctl list-units --type=service | grep postgres"
    exit 1
fi

log "Found PostgreSQL service: $PG_SERVICE"

if ! systemctl is-active --quiet "$PG_SERVICE"; then
    error "PostgreSQL 16 is not running. Starting it..."
    sudo systemctl start "$PG_SERVICE"
    sudo systemctl enable "$PG_SERVICE"
else
    log "✅ PostgreSQL 16 is running"
fi

# 2. Set up PostgreSQL 16 commands
log "2. Setting up PostgreSQL 16 commands..."

# Find the correct psql and createdb commands
PSQL_CMD="/usr/pgsql-16/bin/psql"
CREATEDB_CMD="/usr/pgsql-16/bin/createdb"

# Try different possible paths as fallback
if [ ! -f "$PSQL_CMD" ]; then
    for path in /opt/postgresql/16/bin /usr/bin; do
        if [ -f "$path/psql" ]; then
            PSQL_CMD="$path/psql"
            CREATEDB_CMD="$path/createdb"
            break
        fi
    done
fi

if [ ! -f "$PSQL_CMD" ]; then
    error "PostgreSQL 16 psql command not found. Please check your installation."
    exit 1
fi

log "Using PostgreSQL commands from: $(dirname $PSQL_CMD)"

# 3. Create/verify database and user
log "3. Setting up database and user..."

# Database credentials from your .env
DB_NAME="mssp_production"
DB_USER="mssp_user"
DB_PASSWORD="12345678"

# Create database if it doesn't exist
sudo -u postgres "$PSQL_CMD" -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | grep -q 1 || {
    log "Creating database: $DB_NAME"
    sudo -u postgres "$CREATEDB_CMD" "$DB_NAME"
}

# Create user if it doesn't exist
sudo -u postgres "$PSQL_CMD" -c "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER';" | grep -q 1 || {
    log "Creating user: $DB_USER"
    sudo -u postgres "$PSQL_CMD" -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
}

# Grant permissions
log "Granting permissions..."
sudo -u postgres "$PSQL_CMD" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres "$PSQL_CMD" -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

# Grant schema permissions (PostgreSQL 15+ requirement)
log "Granting schema permissions..."
sudo -u postgres "$PSQL_CMD" -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres "$PSQL_CMD" -d "$DB_NAME" -c "GRANT CREATE ON SCHEMA public TO $DB_USER;"

# 4. Fix .env file
log "4. Fixing .env file..."

# Backup original .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Create new .env file
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://mssp_user:12345678@localhost:5432/mssp_production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mssp_production
DB_USER=mssp_user
DB_PASSWORD=12345678

# Application Configuration
NODE_ENV=production
PORT=5001
SESSION_SECRET=super-secure-session-secret-for-mssp-platform-development-12345

# LDAP Authentication Configuration
LDAP_ENABLED=true
LDAP_URL=ldap://ldap.forumsys.com:389
LDAP_BIND_DN=cn=read-only-admin,dc=example,dc=com
LDAP_BIND_PASSWORD=password
LDAP_SEARCH_BASE=dc=example,dc=com
LDAP_SEARCH_FILTER=(uid={{username}})
LDAP_USERNAME_FIELD=uid
LDAP_EMAIL_FIELD=mail
LDAP_FIRSTNAME_FIELD=givenName
LDAP_LASTNAME_FIELD=sn
LDAP_DEFAULT_ROLE=engineer

# Testing
TEST_PASSWORD=testpassword123
EOF

log "✅ .env file fixed"

# 5. Test database connection
log "5. Testing database connection..."
if PGPASSWORD="$DB_PASSWORD" "$PSQL_CMD" -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
    log "✅ Database connection successful!"
else
    warning "❌ Database connection failed. Checking PostgreSQL configuration..."
    
    # Check pg_hba.conf for authentication (PostgreSQL 16 path)
    PG_HBA_PATHS=(
        "/var/lib/pgsql/16/data/pg_hba.conf"
        "/var/lib/pgsql/data/pg_hba.conf"
        "/opt/postgresql/16/data/pg_hba.conf"
    )
    
    for PG_HBA in "${PG_HBA_PATHS[@]}"; do
        if [ -f "$PG_HBA" ]; then
            log "Found pg_hba.conf at: $PG_HBA"
            if ! grep -q "local.*$DB_NAME.*$DB_USER.*md5" "$PG_HBA"; then
                warning "May need to update pg_hba.conf for local connections"
                echo "Add this line to $PG_HBA:"
                echo "local   $DB_NAME   $DB_USER   md5"
            fi
            break
        fi
    done
fi

# 6. Apply database migrations
log "6. Applying database migrations..."
if [ -f "setup-database.sh" ]; then
    chmod +x setup-database.sh
    # Set PostgreSQL path for setup script
    export PATH=/usr/pgsql-16/bin:/opt/postgresql/16/bin:$PATH
    ./setup-database.sh
else
    warning "setup-database.sh not found. Running manual migration..."
    
    # Run migrations manually
    if [ -d "migrations" ]; then
        for migration in migrations/*.sql; do
            if [ -f "$migration" ]; then
                log "Applying migration: $(basename $migration)"
                PGPASSWORD="$DB_PASSWORD" "$PSQL_CMD" -h localhost -U "$DB_USER" -d "$DB_NAME" -f "$migration" || true
            fi
        done
    fi
fi

# 7. Create database configuration file
log "7. Creating database configuration cache..."
cat > ~/.mssp_db_config << EOF
DB_NAME=mssp_production
DB_USER=mssp_user
DB_HOST=localhost
DB_PORT=5432
PG_SERVICE=$PG_SERVICE
PSQL_CMD=$PSQL_CMD
EOF

log "🎉 PostgreSQL 16 database setup completed!"
log ""
log "PostgreSQL 16 Configuration:"
log "- Service: $PG_SERVICE"
log "- Commands: $(dirname $PSQL_CMD)"
log "- Database: $DB_NAME"
log "- User: $DB_USER"
log ""
log "Next steps:"
log "1. Test the application: ./manage-app.sh restart"
log "2. Check status: ./manage-app.sh status"
log "3. Access: http://your-server-ip:5001"
log ""
log "If you still have issues, check:"
log "- PostgreSQL logs: sudo journalctl -u $PG_SERVICE"
log "- Application logs: ./manage-app.sh logs" 