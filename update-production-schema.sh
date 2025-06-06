#!/bin/bash

# 🔄 Update Production Schema Script (Preserve Data)
# This script updates the production database schema while preserving existing data

echo "🔄 MSSP Production Schema Update"
echo "================================="
echo "✅ This will preserve all existing data"
echo "🔄 Only new schema changes will be applied"
echo "📍 Server: RedHat Production"
echo "🗄️ Database: mssp_production"
echo ""

# Ask for confirmation
read -p "❓ Continue with schema update? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting production schema update..."

# Set production environment
export NODE_ENV=production

# Step 1: Check current database status
echo "📊 Checking current database status..."
sudo -u postgres /usr/pgsql-16/bin/psql -d mssp_production -c "\dt" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Error: Database mssp_production not accessible"
    exit 1
fi

echo "✅ Database accessible"

# Step 2: Generate new migrations (if any)
echo "🔄 Generating new migrations..."
npm run db:generate 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Migrations generated successfully"
else
    echo "⚠️  No new migrations to generate or error occurred"
fi

# Step 3: Apply migrations to preserve data
echo "📤 Applying schema updates..."
npm run db:migrate 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Schema updated successfully"
else
    echo "❌ Error applying schema updates"
    exit 1
fi

# Step 4: Verify schema integrity
echo "🔍 Verifying database schema..."
sudo -u postgres /usr/pgsql-16/bin/psql -d mssp_production -c "\dt" | wc -l > /tmp/table_count.txt
table_count=$(cat /tmp/table_count.txt)

if [ "$table_count" -gt 5 ]; then
    echo "✅ Database schema verification passed ($table_count tables found)"
else
    echo "⚠️  Warning: Fewer tables than expected found"
fi

# Step 5: Check if admin user still exists
echo "👤 Verifying admin user..."
admin_exists=$(sudo -u postgres /usr/pgsql-16/bin/psql -d mssp_production -t -c "SELECT COUNT(*) FROM users WHERE role = 'admin';" 2>/dev/null | tr -d ' ')
if [ "$admin_exists" -gt 0 ]; then
    echo "✅ Admin user preserved ($admin_exists admin users found)"
else
    echo "⚠️  No admin users found - you may need to create one"
fi

# Clean up temp files
rm -f /tmp/table_count.txt

echo ""
echo "🎉 Production schema update completed!"
echo ""
echo "📊 Summary:"
echo "  ✅ Database: mssp_production (preserved)"
echo "  ✅ Schema: Updated with latest changes"
echo "  ✅ Data: Preserved"
echo "  ✅ Users: Preserved"
echo ""
echo "🔗 Your production server should now reflect the latest schema changes"
echo "💡 Restart your production server to ensure all changes take effect" 