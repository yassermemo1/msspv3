#!/bin/bash

echo "🔄 Syncing local development environment..."

# Choose database name - DEFAULT TO mssp_production
DB_NAME=${1:-mssp_production}  # Default to mssp_production, or pass custom name

# Stop any running servers
echo "🛑 Stopping existing servers..."
pkill -f "tsx server/index.ts" || true
pkill -f "node.*server" || true

# Wait a moment for processes to stop
sleep 2

# Create/recreate database
echo "🗄️ Setting up database: ${DB_NAME}"

# Set connection method based on environment
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Connect directly as mssp_user with password
    DB_USER="mssp_user"
    DB_PASSWORD="devpass123"
    echo "📝 Detected macOS environment - connecting as ${DB_USER}"
    
    # Try to connect directly as mssp_user
    if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Connected successfully as ${DB_USER}"
        
        # Drop and recreate database
        echo "🗑️ Dropping existing database..."
        PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
        
        echo "🏗️ Creating database..."
        PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d postgres -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || {
            echo "💡 Database ${DB_NAME} already exists or creation failed - continuing with migration..."
        }
        
        echo "✅ Database ${DB_NAME} created successfully"
        export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
        
    else
        echo "❌ Cannot connect as ${DB_USER} with password on macOS"
        echo "🔍 Please check:"
        echo "1. PostgreSQL is running"
        echo "2. User ${DB_USER} exists with password: ${DB_PASSWORD}"
        echo "3. PostgreSQL is accepting connections on localhost:5432"
        exit 1
    fi

else
    # Linux/RedHat - Use sudo -su postgres to switch to postgres user
    echo "📝 Detected Linux environment - using sudo -su postgres"
    
    # Try to connect as postgres user using sudo
    if sudo -u postgres psql -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Connected successfully as postgres user"
        
        # Drop and recreate database
        echo "🗑️ Dropping existing database..."
        sudo -u postgres psql -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
        
        echo "🏗️ Creating database..."
        sudo -u postgres psql -d postgres -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || {
            echo "💡 Database ${DB_NAME} already exists or creation failed - continuing with migration..."
        }
        
        # Grant privileges to mssp_user
        echo "🔑 Granting privileges to mssp_user..."
        sudo -u postgres psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO mssp_user;" || true
        
        echo "✅ Database ${DB_NAME} created successfully"
        export DATABASE_URL="postgresql://mssp_user:12345678@localhost:5432/${DB_NAME}"
        
    else
        echo "❌ Cannot connect as postgres user on Linux"
        echo "🔍 Please check:"
        echo "1. PostgreSQL is running"
        echo "2. You have sudo privileges to switch to postgres user"
        echo "3. PostgreSQL is properly configured"
        exit 1
    fi
fi

echo "🔧 Running database migrations..."
DATABASE_URL="$DATABASE_URL" npx drizzle-kit push || {
    echo "❌ Database migration failed"
    exit 1
}

echo "🌱 Creating admin user..."
DATABASE_URL="$DATABASE_URL" node create-admin-user.cjs || {
    echo "⚠️ Admin user creation failed - you may need to create one manually"
}

echo ""
echo "✅ Database ${DB_NAME} ready!"
echo "🌐 Server will be available at: http://localhost:5001"
echo "👤 Login with: admin@test.mssp.local / SecureTestPass123!"
echo "🗄️ Database: ${DB_NAME}"
echo "🔑 Connection: ${DATABASE_URL}"
echo ""

echo "📡 Starting development server..."
DATABASE_URL="$DATABASE_URL" npm run dev 