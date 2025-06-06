#!/bin/bash

# 🔄 Reset Production Schema Script
# This script resets the production database schema on RedHat server

echo "🔄 MSSP Production Schema Reset"
echo "================================="
echo "⚠️  WARNING: This will completely delete the existing production database!"
echo "📍 Server: RedHat Production"
echo "🗄️  Database: mssp_production"
echo ""

# Ask for confirmation
read -p "❓ Are you sure you want to reset the production schema? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting production schema reset..."

# Set production environment
export NODE_ENV=production

# Step 1: Stop any running production server
echo "🛑 Stopping any running production server..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "node server/index.js" 2>/dev/null || true
echo "✅ Server stopped"

# Step 2: Reset database using full PostgreSQL 16 path
echo "🗄️  Resetting database..."
sudo -u postgres /usr/pgsql-16/bin/psql -c "DROP DATABASE IF EXISTS mssp_production;"
sudo -u postgres /usr/pgsql-16/bin/psql -c "CREATE DATABASE mssp_production OWNER mssp_user;"
echo "✅ Database reset complete"

# Step 3: Apply schema
echo "📋 Applying fresh schema..."
if command -v npm &> /dev/null; then
    npm run db:push
elif command -v yarn &> /dev/null; then
    yarn db:push
else
    echo "❌ Neither npm nor yarn found"
    exit 1
fi
echo "✅ Schema applied"

# Step 4: Create admin user
echo "👤 Creating admin user..."
if command -v node &> /dev/null; then
    node create-admin-user.cjs
elif command -v tsx &> /dev/null; then
    tsx create-admin-user.cjs
else
    echo "❌ Neither node nor tsx found"
    exit 1
fi
echo "✅ Admin user created"

echo ""
echo "🎉 Production schema reset complete!"
echo "📊 Summary:"
echo "   ✅ Database: mssp_production (fresh)"
echo "   ✅ Schema: Latest version applied"
echo "   ✅ Admin user: Created"
echo ""
echo "🔐 Default admin login:"
echo "   📧 Email: admin@mssp.local"
echo "   🔑 Password: admin123"
echo "   👤 Username: admin"
echo ""
echo "🚀 You can now start the production server!"
echo "💡 Run: ./start-production.sh" 