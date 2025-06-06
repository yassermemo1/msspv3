#!/bin/bash

echo "📦 BACKING UP CURRENT CLIENT DATA"
echo "=================================="

# Database configuration
DB_NAME="mssp_production"
DB_USER="mssp_user"
DB_PASSWORD="12345678"
PSQL_PATH="/usr/pgsql-16/bin/psql"

# Create backup filename with timestamp
BACKUP_FILE="client-backup-$(date +%Y%m%d_%H%M%S).sql"

echo "🔍 Checking current clients..."
CLIENT_COUNT=$(sudo -u postgres $PSQL_PATH -d $DB_NAME -t -c "SELECT count(*) FROM clients;" | tr -d ' ')
echo "Found $CLIENT_COUNT clients in database"

if [ "$CLIENT_COUNT" -eq "0" ]; then
    echo "❌ No clients found to backup"
    exit 1
fi

echo "💾 Backing up clients to $BACKUP_FILE..."

# Export client data
sudo -u postgres $PSQL_PATH -d $DB_NAME -c "
COPY (
    SELECT 
        name,
        short_name,
        domain,
        industry,
        company_size,
        status,
        source,
        address,
        website,
        notes,
        created_at,
        updated_at
    FROM clients 
    ORDER BY id
) TO STDOUT WITH CSV HEADER
" > "$BACKUP_FILE.csv"

# Also create SQL insert format
echo "-- Client backup created $(date)" > "$BACKUP_FILE"
echo "-- Original client count: $CLIENT_COUNT" >> "$BACKUP_FILE"
echo "" >> "$BACKUP_FILE"

sudo -u postgres $PSQL_PATH -d $DB_NAME -c "
SELECT 
    'INSERT INTO clients (name, short_name, domain, industry, company_size, status, source, address, website, notes, created_at, updated_at) VALUES (' ||
    COALESCE('''' || replace(name, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || replace(short_name, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || replace(domain, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || replace(industry, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || replace(company_size, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || replace(status, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || replace(source, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || replace(address, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || replace(website, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || replace(notes, '''', '''''') || '''', 'NULL') || ', ' ||
    '''' || created_at || ''', ' ||
    '''' || updated_at || '''
);'
FROM clients ORDER BY id;
" -t >> "$BACKUP_FILE"

echo "✅ Backup completed!"
echo "📄 CSV file: $BACKUP_FILE.csv"
echo "📄 SQL file: $BACKUP_FILE"
echo ""
echo "To restore after rebuild, run:"
echo "sudo -u postgres $PSQL_PATH -d $DB_NAME -f $BACKUP_FILE" 