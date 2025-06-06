#!/bin/bash

echo "==================================================="
echo "🚀 MSSP Client Manager - Database Setup Script"
echo "==================================================="
echo ""

# Set database connection parameters
DB_NAME="mssp_database"
DB_USER="mssp_user"
DB_PASSWORD="12345678"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first."
    exit 1
fi

echo "📦 Creating new database: $DB_NAME"
echo ""

# Create database and user
echo "🔧 Setting up PostgreSQL database..."
createdb -h $DB_HOST -p $DB_PORT $DB_NAME 2>/dev/null || echo "ℹ️  Database $DB_NAME might already exist"

# Create user and grant permissions (using psql)
psql -h $DB_HOST -p $DB_PORT -d postgres <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF

echo "✅ Database setup complete!"
echo ""
echo "📝 Database Details:"
echo "   Name: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo ""
echo "🔗 Connection String:"
echo "   DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Create .env file
echo "📄 Creating .env file..."
cat > .env <<EOL
# Database Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Server Configuration
NODE_ENV=development
PORT=5001
HOST=localhost

# Security Configuration
SESSION_SECRET=dev-secret-change-in-production-$(openssl rand -hex 32)

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4173

# Authentication Settings
ENABLE_TESTING=true
TEST_PASSWORD=SecureTestPass123!
TEST_EMAIL_DOMAIN=test.mssp.local
TEST_ADMIN_EMAIL=admin@mssp.local
TEST_ADMIN_PASSWORD=SecureTestPass123!
EOL

echo "✅ Environment file created!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm install"
echo "   2. Run: npm run db:migrate"
echo "   3. Run: npm run dev"
echo ""
echo "===================================================" 